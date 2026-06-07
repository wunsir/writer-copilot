"use client";

import {
  ArrowDownToLine,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileCheck2,
  GitCompare,
  History,
  Layers3,
  Library,
  ListChecks,
  PanelLeftOpen,
  Play,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TerminalSquare,
  Type,
  Upload,
  Wand2,
  X,
  type LucideIcon
} from "lucide-react";
import { useMemo, useState, type ChangeEvent } from "react";
import {
  AdaptationDirectionSchema,
  type HarnessRun,
  type ScreenplayProject,
  type SourceChunk
} from "@/lib/domain/schemas";
import { validateScreenplayProject } from "@/lib/domain/validators";
import { screenplayToYaml } from "@/lib/domain/yaml";
import { runJsonHarnessStep } from "@/lib/harness/json-runner";
import { selectKnowledgePacks, type SelectedKnowledgePack } from "@/lib/knowledge/knowledge-packs";
import { sampleProject } from "@/lib/sample/project";
import { parseNovelSource } from "@/lib/source/chapter-parser";
import { createProjectFromImportedSource } from "@/lib/source/imported-project";
import { buildSourceIndex, searchSourceChunks, type SourceSearchResult } from "@/lib/source/source-index";

type StageId =
  | "source"
  | "diagnosis"
  | "directions"
  | "brief"
  | "blueprint"
  | "screenplay"
  | "compare";

type InspectorTab = "director" | "evidence" | "yaml" | "validation" | "timeline" | "trace";
type StageStatus = "待处理" | "进行中" | "已生成" | "已校验";

const stages: Array<{
  id: StageId;
  label: string;
  status: StageStatus;
  count: string;
  hint: string;
  icon: LucideIcon;
}> = [
  { id: "source", label: "原文", status: "待处理", count: "3 章", hint: "导入、分章、依据", icon: BookOpen },
  { id: "diagnosis", label: "故事诊断", status: "已生成", count: "5 项", hint: "冲突、人物、风险", icon: Search },
  { id: "directions", label: "改编方向", status: "进行中", count: "2 版", hint: "选择或混合路线", icon: Sparkles },
  { id: "brief", label: "改编简报", status: "已生成", count: "1 版", hint: "创作边界", icon: ClipboardCheck },
  { id: "blueprint", label: "场景蓝图", status: "已生成", count: "2 场", hint: "先看场，再出稿", icon: Layers3 },
  { id: "screenplay", label: "剧本草稿", status: "已校验", count: "2 场", hint: "对白、动作、YAML", icon: ScrollText },
  { id: "compare", label: "版本对比", status: "待处理", count: "3 版", hint: "变化和回退", icon: GitCompare }
];

const inspectorTabs: Array<{
  id: InspectorTab;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "director", label: "助理", icon: Wand2 },
  { id: "evidence", label: "依据", icon: Library },
  { id: "yaml", label: "YAML", icon: ScrollText },
  { id: "validation", label: "校验", icon: CheckCircle2 },
  { id: "timeline", label: "时间线", icon: History },
  { id: "trace", label: "运行", icon: TerminalSquare }
];

const modeTitles: Record<StageId, { title: string; subtitle: string }> = {
  source: { title: "原文工作台", subtitle: "导入、分章、抽取可追溯依据。" },
  diagnosis: { title: "故事诊断", subtitle: "先判断故事怎么改，再进入生成。" },
  directions: { title: "方向板", subtitle: "把不同改编路线摆在台面上比较。" },
  brief: { title: "改编简报", subtitle: "把选择沉淀成后续创作要遵守的边界。" },
  blueprint: { title: "场景蓝图", subtitle: "像索引卡一样安排场次、节拍和改编理由。" },
  screenplay: { title: "剧本草稿", subtitle: "检查场景、对白、角色和 YAML 是否一致。" },
  compare: { title: "版本对比", subtitle: "看清楚每次修改到底改变了什么。" }
};

const binderCopy: Record<StageId, string> = {
  source: "这里会承载真实导入、章节识别、段落切分和原文依据。当前先用样例原文展示工作方式。",
  diagnosis: "诊断不应该是装饰卡片，它会决定后续推荐什么方向、避开什么风险。",
  directions: "改编路线是创作选择。选定后，会影响改编简报、场景蓝图和剧本草稿。",
  brief: "简报是开写前的创作约定，后续会支持用户编辑和确认条款。",
  blueprint: "先搭场景蓝图，再写剧本草稿，避免把小说直接硬转成格式文件。",
  screenplay: "草稿会承接局部修订、校验和导出。",
  compare: "版本对比会服务恢复、分支方向和场景级修改历史。"
};

const decisionLabels: Record<string, string> = {
  preserve: "保留",
  compress: "压缩",
  merge: "合并",
  reorder: "重排",
  invent: "新增",
  externalize: "外化"
};

const checkLabels: Record<string, string> = {
  schema_shape: "结构完整",
  unique_scene_ids: "场景编号",
  character_references: "角色一致",
  location_references: "地点一致",
  source_references: "原文依据",
  adaptation_decisions: "改编理由"
};

const stageActions: Record<StageId, { label: string; detail: string; tab: InspectorTab; disabled?: boolean }> = {
  source: { label: "查看原文依据", detail: "下一步会整理章节切分，并检查每段原文依据是否可追溯。", tab: "evidence" },
  diagnosis: { label: "查看诊断建议", detail: "先处理改编风险，再进入路线探索。", tab: "director" },
  directions: { label: "采用此路线", detail: "采用后，这条改编路线会进入简报、场景蓝图和剧本草稿。", tab: "director" },
  brief: { label: "确认简报条款", detail: "简报会成为后续写作时遵守的创作约定。", tab: "director" },
  blueprint: { label: "检查场景蓝图", detail: "先看清每场戏的节拍、改写理由和原文依据。", tab: "evidence" },
  screenplay: {
    label: "检查剧本校验",
    detail: "剧本草稿会按当前场景和原文依据生成 YAML 校验。",
    tab: "validation"
  },
  compare: { label: "查看版本变化", detail: "版本恢复将在真实历史接入后开放。", tab: "timeline" }
};

export default function Home() {
  const [project, setProject] = useState<ScreenplayProject>(sampleProject);
  const [activeStage, setActiveStage] = useState<StageId>("directions");
  const [expandedStage, setExpandedStage] = useState<StageId | null>("directions");
  const [selectedDirectionId, setSelectedDirectionId] = useState(project.directions[0].id);
  const [selectedSceneId, setSelectedSceneId] = useState(project.scenes[0].id);
  const [selectedChunkId, setSelectedChunkId] = useState(project.source.chapters[0].chunks[0].id);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("director");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sourceDraft, setSourceDraft] = useState("");
  const [sourceParseError, setSourceParseError] = useState<string | null>(null);
  const [sourceSearchQuery, setSourceSearchQuery] = useState("事故");
  const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false);
  const [isGeneratingDirections, setIsGeneratingDirections] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [isGeneratingScreenplay, setIsGeneratingScreenplay] = useState(false);
  const validationReport = useMemo(() => validateScreenplayProject(project), [project]);
  const yamlPreview = useMemo(() => screenplayToYaml(project, validationReport), [project, validationReport]);
  const sourceChunks = useMemo(
    () => project.source.chapters.flatMap((chapter) => chapter.chunks),
    [project]
  );
  const sourceSearchResults = useMemo(
    () => searchSourceChunks(buildSourceIndex(sourceChunks), sourceSearchQuery, { limit: 6 }),
    [sourceChunks, sourceSearchQuery]
  );
  const selectedDirection =
    project.directions.find((direction) => direction.id === selectedDirectionId) ?? project.directions[0];
  const selectedScene = project.scenes.find((scene) => scene.id === selectedSceneId) ?? project.scenes[0];
  const selectedChunk = sourceChunks.find((chunk) => chunk.id === selectedChunkId) ?? sourceChunks[0];
  const selectedKnowledgePacks = useMemo(
    () =>
      selectKnowledgePacks({
        targetMedium: project.adaptation_brief.target_medium,
        strategies: project.adaptation_brief.strategy,
        tone: project.adaptation_brief.tone
      }),
    [project.adaptation_brief]
  );
  const activeStageMeta = stages.find((stage) => stage.id === activeStage) ?? stages[0];
  const activeAction = stageActions[activeStage];

  function activateStage(stage: StageId) {
    setActiveStage(stage);
    setExpandedStage(stage);
    if (stage === "screenplay") {
      setInspectorTab("yaml");
    } else if (stage === "compare") {
      setInspectorTab("timeline");
    } else if (stage === "source") {
      setInspectorTab("evidence");
    } else {
      setInspectorTab("director");
    }
  }

  function downloadYaml() {
    const blob = new Blob([yamlPreview], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "writer-copilot-sample.yaml";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importSourceText(text: string) {
    const parsed = parseNovelSource(text);

    if (!parsed.ok) {
      setSourceParseError(parsed.error.message);
      return;
    }

    const importedProject = createProjectFromImportedSource(sampleProject, parsed.source);
    const firstChunk = importedProject.source.chapters[0]?.chunks[0];

    setProject(importedProject);
    setSourceParseError(null);
    setSourceDraft(text);
    setSelectedDirectionId(importedProject.directions[0].id);
    setSelectedSceneId(importedProject.scenes[0].id);
    setSelectedChunkId(firstChunk?.id ?? importedProject.scenes[0].source_refs[0]);
    setActiveStage("source");
    setExpandedStage("source");
    setInspectorTab("evidence");
  }

  async function importSourceFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    importSourceText(text);
    event.target.value = "";
  }

  async function runLocalHarnessPreview() {
    const result = await runJsonHarnessStep({
      id: `run_preview_${Date.now()}`,
      step: "generate_directions_preview",
      model: "local-json-preview",
      sourceChunksUsed: selectedDirection.source_refs,
      knowledgePacksUsed: selectedKnowledgePacks.map((item) => item.pack.id),
      schema: AdaptationDirectionSchema,
      execute: async () => JSON.stringify(selectedDirection)
    });

    setProject((currentProject) => ({
      ...currentProject,
      harness_trace: [result.run, ...currentProject.harness_trace]
    }));
    setInspectorTab("trace");
  }

  async function generateDiagnosisFromApi() {
    setIsGeneratingDiagnosis(true);

    try {
      const response = await fetch("/api/adaptation/generate-diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ project })
      });
      const payload = (await response.json()) as {
        diagnosis?: ScreenplayProject["story_diagnosis"];
        run?: HarnessRun;
        error?: string;
      };

      if (!response.ok || !payload.diagnosis || !payload.run) {
        setProject((currentProject) => ({
          ...currentProject,
          harness_trace: [
            payload.run ?? createClientFailedRun("generate_diagnosis", payload.error ?? "故事诊断生成失败。"),
            ...currentProject.harness_trace
          ]
        }));
        setInspectorTab("trace");
        return;
      }

      setProject((currentProject) => ({
        ...currentProject,
        story_diagnosis: payload.diagnosis ?? currentProject.story_diagnosis,
        harness_trace: [payload.run as HarnessRun, ...currentProject.harness_trace]
      }));
      setInspectorTab("director");
    } finally {
      setIsGeneratingDiagnosis(false);
    }
  }

  async function generateDirectionsFromApi() {
    setIsGeneratingDirections(true);

    try {
      const response = await fetch("/api/adaptation/generate-directions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ project })
      });
      const payload = (await response.json()) as {
        directions?: ScreenplayProject["directions"];
        run?: HarnessRun;
        error?: string;
      };

      if (!response.ok || !payload.directions || !payload.run) {
        setProject((currentProject) => ({
          ...currentProject,
          harness_trace: [
            payload.run ?? createClientFailedRun("generate_directions", payload.error ?? "方向生成失败。"),
            ...currentProject.harness_trace
          ]
        }));
        setInspectorTab("trace");
        return;
      }

      setProject((currentProject) => ({
        ...currentProject,
        directions: payload.directions ?? currentProject.directions,
        harness_trace: [payload.run as HarnessRun, ...currentProject.harness_trace]
      }));
      setSelectedDirectionId(payload.directions[0].id);
      setInspectorTab("director");
    } finally {
      setIsGeneratingDirections(false);
    }
  }

  async function generateBriefFromApi() {
    setIsGeneratingBrief(true);

    try {
      const response = await fetch("/api/adaptation/generate-brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          project,
          directionId: selectedDirection.id
        })
      });
      const payload = (await response.json()) as {
        brief?: ScreenplayProject["adaptation_brief"];
        run?: HarnessRun;
        error?: string;
      };

      if (!response.ok || !payload.brief || !payload.run) {
        setProject((currentProject) => ({
          ...currentProject,
          harness_trace: [
            payload.run ?? createClientFailedRun("generate_brief", payload.error ?? "改编简报生成失败。"),
            ...currentProject.harness_trace
          ]
        }));
        setInspectorTab("trace");
        return;
      }

      setProject((currentProject) => ({
        ...currentProject,
        adaptation_brief: payload.brief ?? currentProject.adaptation_brief,
        harness_trace: [payload.run as HarnessRun, ...currentProject.harness_trace]
      }));
      setInspectorTab("director");
    } finally {
      setIsGeneratingBrief(false);
    }
  }

  async function generateBlueprintFromApi() {
    setIsGeneratingBlueprint(true);

    try {
      const response = await fetch("/api/adaptation/generate-blueprint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          project,
          directionId: selectedDirection.id
        })
      });
      const payload = (await response.json()) as {
        scene_blueprint?: ScreenplayProject["scene_blueprint"];
        run?: HarnessRun;
        error?: string;
      };

      if (!response.ok || !payload.scene_blueprint || !payload.run) {
        setProject((currentProject) => ({
          ...currentProject,
          harness_trace: [
            payload.run ?? createClientFailedRun("generate_blueprint", payload.error ?? "场景蓝图生成失败。"),
            ...currentProject.harness_trace
          ]
        }));
        setInspectorTab("trace");
        return;
      }

      setProject((currentProject) => ({
        ...currentProject,
        scene_blueprint: payload.scene_blueprint ?? currentProject.scene_blueprint,
        harness_trace: [payload.run as HarnessRun, ...currentProject.harness_trace]
      }));
      setInspectorTab("director");
    } finally {
      setIsGeneratingBlueprint(false);
    }
  }

  async function generateScreenplayFromApi() {
    setIsGeneratingScreenplay(true);

    try {
      const response = await fetch("/api/adaptation/generate-screenplay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          project,
          directionId: selectedDirection.id
        })
      });
      const payload = (await response.json()) as {
        scenes?: ScreenplayProject["scenes"];
        run?: HarnessRun;
        error?: string;
      };

      if (!response.ok || !payload.scenes || !payload.run) {
        setProject((currentProject) => ({
          ...currentProject,
          harness_trace: [
            payload.run ?? createClientFailedRun("generate_screenplay", payload.error ?? "剧本生成失败。"),
            ...currentProject.harness_trace
          ]
        }));
        setInspectorTab("trace");
        return;
      }

      setProject((currentProject) => ({
        ...currentProject,
        scenes: payload.scenes ?? currentProject.scenes,
        harness_trace: [payload.run as HarnessRun, ...currentProject.harness_trace]
      }));
      setSelectedSceneId(payload.scenes[0].id);
      setInspectorTab("validation");
    } finally {
      setIsGeneratingScreenplay(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-4 lg:px-6">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4">
        <header className="studio-header">
          <div className="topbar-left">
            <div className="product-mark">
              <span>Writer Copilot</span>
              <strong>雾站来信</strong>
            </div>
            <div className="topbar-divider" />
            <div className="run-state">
              <span className="status-dot is-running" />
              <span>样例项目</span>
              <strong>
                {activeStageMeta.label} · {activeStageMeta.status}
              </strong>
            </div>
          </div>
          <nav className="stage-pipeline" aria-label="改编流程">
            {stages.map((stage) => (
              <button
                key={stage.id}
                className={`stage-chip ${stage.id === activeStage ? "is-active" : ""}`}
                onClick={() => activateStage(stage.id)}
              >
                {stage.label}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            <button className="quiet-button compact-button" onClick={() => setSettingsOpen(true)}>
              <Settings size={16} />
              工作区设置
            </button>
            <button
              className="primary-button compact-button"
              disabled={activeAction.disabled}
              onClick={() => setInspectorTab(activeAction.tab)}
            >
              <Play size={16} />
              {activeAction.label}
            </button>
          </div>
        </header>

        <section className={`studio-grid ${expandedStage ? "is-expanded" : ""}`}>
          <ProjectBinder
            project={project}
            activeStage={activeStage}
            expandedStage={expandedStage}
            onActivateStage={activateStage}
            onToggleExpanded={(stage) => setExpandedStage(expandedStage === stage ? null : stage)}
            sourceDraft={sourceDraft}
            sourceParseError={sourceParseError}
            onSourceDraftChange={setSourceDraft}
            onImportSource={() => importSourceText(sourceDraft)}
            onImportSourceFile={importSourceFile}
          />
          <AdaptationCanvas
            project={project}
            activeStage={activeStage}
            selectedDirectionId={selectedDirectionId}
            selectedSceneId={selectedSceneId}
            selectedChunkId={selectedChunkId}
            sourceDraft={sourceDraft}
            sourceParseError={sourceParseError}
            sourceSearchQuery={sourceSearchQuery}
            sourceSearchResults={sourceSearchResults}
            isGeneratingDiagnosis={isGeneratingDiagnosis}
            isGeneratingDirections={isGeneratingDirections}
            isGeneratingBrief={isGeneratingBrief}
            isGeneratingBlueprint={isGeneratingBlueprint}
            isGeneratingScreenplay={isGeneratingScreenplay}
            onSelectDirection={setSelectedDirectionId}
            onSelectScene={setSelectedSceneId}
            onSelectChunk={setSelectedChunkId}
            onOpenInspector={setInspectorTab}
            onDownloadYaml={downloadYaml}
            onSourceDraftChange={setSourceDraft}
            onImportSource={() => importSourceText(sourceDraft)}
            onImportSourceFile={importSourceFile}
            onSourceSearchQueryChange={setSourceSearchQuery}
            onGenerateDiagnosis={generateDiagnosisFromApi}
            onGenerateDirections={generateDirectionsFromApi}
            onGenerateBrief={generateBriefFromApi}
            onGenerateBlueprint={generateBlueprintFromApi}
            onGenerateScreenplay={generateScreenplayFromApi}
          />
          <InspectorPanel
            project={project}
            activeStage={activeStage}
            tab={inspectorTab}
            onChangeTab={setInspectorTab}
            selectedDirection={selectedDirection}
            selectedScene={selectedScene}
            selectedChunk={selectedChunk}
            selectedKnowledgePacks={selectedKnowledgePacks}
            yamlPreview={yamlPreview}
            validationReport={validationReport}
            onDownloadYaml={downloadYaml}
            onRunLocalHarnessPreview={runLocalHarnessPreview}
          />
        </section>
      </div>
      {settingsOpen ? <SettingsDialog onClose={() => setSettingsOpen(false)} /> : null}
    </main>
  );
}

function ProjectBinder({
  project,
  activeStage,
  expandedStage,
  onActivateStage,
  onToggleExpanded,
  sourceDraft,
  sourceParseError,
  onSourceDraftChange,
  onImportSource,
  onImportSourceFile
}: {
  project: ScreenplayProject;
  activeStage: StageId;
  expandedStage: StageId | null;
  onActivateStage: (stage: StageId) => void;
  onToggleExpanded: (stage: StageId) => void;
  sourceDraft: string;
  sourceParseError: string | null;
  onSourceDraftChange: (value: string) => void;
  onImportSource: () => void;
  onImportSourceFile: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <aside className="binder-panel">
      <PanelHeading eyebrow="作品目录" title="雾站来信" />
      <div className="binder-list">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isActive = stage.id === activeStage;
          const isExpanded = stage.id === expandedStage;

          return (
            <div key={stage.id} className={`binder-item ${isActive ? "is-active" : ""}`}>
              <div className="binder-row">
                <button className="binder-open" onClick={() => onActivateStage(stage.id)}>
                  <span className="binder-icon">
                    <Icon size={17} />
                  </span>
                  <span className="binder-text">
                    <span>{stage.label}</span>
                    <small>
                      {stage.count} · {stage.status}
                    </small>
                  </span>
                </button>
                <button
                  aria-label={`${isExpanded ? "收起" : "展开"}${stage.label}`}
                  className="expand-button"
                  onClick={() => onToggleExpanded(stage.id)}
                >
                  {isExpanded ? <PanelLeftOpen size={15} /> : <ChevronRight size={15} />}
                </button>
              </div>
              {isExpanded ? (
                <BinderFocus
                  project={project}
                  stage={stage.id}
                  sourceDraft={sourceDraft}
                  sourceParseError={sourceParseError}
                  onSourceDraftChange={onSourceDraftChange}
                  onImportSource={onImportSource}
                  onImportSourceFile={onImportSourceFile}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function BinderFocus({
  project,
  stage,
  sourceDraft,
  sourceParseError,
  onSourceDraftChange,
  onImportSource,
  onImportSourceFile
}: {
  project: ScreenplayProject;
  stage: StageId;
  sourceDraft: string;
  sourceParseError: string | null;
  onSourceDraftChange: (value: string) => void;
  onImportSource: () => void;
  onImportSourceFile: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="binder-focus">
      <p>{binderCopy[stage]}</p>
      {stage === "source" ? (
        <div className="source-import-mini">
          <textarea
            aria-label="粘贴小说原文"
            placeholder="粘贴至少 3 章小说原文..."
            value={sourceDraft}
            onChange={(event) => onSourceDraftChange(event.target.value)}
          />
          {sourceParseError ? <span className="form-error">{sourceParseError}</span> : null}
          <div className="import-actions">
            <button className="primary-button full-width" onClick={onImportSource} disabled={!sourceDraft.trim()}>
              <Upload size={16} />
              导入原文
            </button>
            <label className="quiet-button full-width file-button">
              <Type size={16} />
              上传 .txt
              <input type="file" accept=".txt,text/plain" onChange={onImportSourceFile} />
            </label>
          </div>
        </div>
      ) : null}
      {stage === "directions" ? (
        <div className="focus-options">
          {project.directions.map((direction) => (
            <span key={direction.id}>{direction.title}</span>
          ))}
        </div>
      ) : null}
      {stage === "blueprint" ? (
        <div className="focus-options">
          {project.scene_blueprint.map((scene) => (
            <span key={scene.id}>{scene.title}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AdaptationCanvas({
  project,
  activeStage,
  selectedDirectionId,
  selectedSceneId,
  selectedChunkId,
  sourceDraft,
  sourceParseError,
  sourceSearchQuery,
  sourceSearchResults,
  isGeneratingDiagnosis,
  isGeneratingDirections,
  isGeneratingBrief,
  isGeneratingBlueprint,
  isGeneratingScreenplay,
  onSelectDirection,
  onSelectScene,
  onSelectChunk,
  onOpenInspector,
  onDownloadYaml,
  onSourceDraftChange,
  onImportSource,
  onImportSourceFile,
  onSourceSearchQueryChange,
  onGenerateDiagnosis,
  onGenerateDirections,
  onGenerateBrief,
  onGenerateBlueprint,
  onGenerateScreenplay
}: {
  project: ScreenplayProject;
  activeStage: StageId;
  selectedDirectionId: string;
  selectedSceneId: string;
  selectedChunkId: string;
  sourceDraft: string;
  sourceParseError: string | null;
  sourceSearchQuery: string;
  sourceSearchResults: SourceSearchResult[];
  isGeneratingDiagnosis: boolean;
  isGeneratingDirections: boolean;
  isGeneratingBrief: boolean;
  isGeneratingBlueprint: boolean;
  isGeneratingScreenplay: boolean;
  onSelectDirection: (id: string) => void;
  onSelectScene: (id: string) => void;
  onSelectChunk: (id: string) => void;
  onOpenInspector: (tab: InspectorTab) => void;
  onDownloadYaml: () => void;
  onSourceDraftChange: (value: string) => void;
  onImportSource: () => void;
  onImportSourceFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onSourceSearchQueryChange: (value: string) => void;
  onGenerateDiagnosis: () => void;
  onGenerateDirections: () => void;
  onGenerateBrief: () => void;
  onGenerateBlueprint: () => void;
  onGenerateScreenplay: () => void;
}) {
  const mode = modeTitles[activeStage];
  const action = stageActions[activeStage];

  return (
    <section className={`canvas-panel mode-${activeStage}`}>
      <div className="canvas-head">
        <div>
          <p className="eyebrow">当前工作</p>
          <h2 className="section-title">{mode.title}</h2>
          <span className="mode-subtitle">{mode.subtitle}</span>
        </div>
        <div className="toolbar">
          <button
            className="primary-button"
            disabled={action.disabled}
            onClick={() => onOpenInspector(action.tab)}
          >
            <Play size={16} />
            {action.label}
          </button>
          <button className="quiet-button" onClick={onDownloadYaml}>
            <ArrowDownToLine size={16} />
            导出 YAML
          </button>
        </div>
      </div>
      <div className="next-action-strip">
        <span>{action.detail}</span>
        <button onClick={() => onOpenInspector(action.tab)}>查看依据与检查</button>
      </div>

      {activeStage === "source" ? (
        <SourceWorkspace
          project={project}
          selectedChunkId={selectedChunkId}
          sourceDraft={sourceDraft}
          sourceParseError={sourceParseError}
          sourceSearchQuery={sourceSearchQuery}
          sourceSearchResults={sourceSearchResults}
          onSelectChunk={onSelectChunk}
          onOpenInspector={onOpenInspector}
          onSourceDraftChange={onSourceDraftChange}
          onImportSource={onImportSource}
          onImportSourceFile={onImportSourceFile}
          onSourceSearchQueryChange={onSourceSearchQueryChange}
        />
      ) : null}
      {activeStage === "diagnosis" ? (
        <StoryDiagnosis
          project={project}
          isGeneratingDiagnosis={isGeneratingDiagnosis}
          onGenerateDiagnosis={onGenerateDiagnosis}
        />
      ) : null}
      {activeStage === "directions" ? (
        <DirectionBoard
          project={project}
          selectedDirectionId={selectedDirectionId}
          onSelectDirection={onSelectDirection}
          onOpenInspector={onOpenInspector}
          isGeneratingDirections={isGeneratingDirections}
          onGenerateDirections={onGenerateDirections}
        />
      ) : null}
      {activeStage === "brief" ? (
        <BriefSheet
          project={project}
          isGeneratingBrief={isGeneratingBrief}
          onGenerateBrief={onGenerateBrief}
        />
      ) : null}
      {activeStage === "blueprint" ? (
        <BlueprintBoard
          project={project}
          selectedSceneId={selectedSceneId}
          onSelectScene={onSelectScene}
          onOpenInspector={onOpenInspector}
          isGeneratingBlueprint={isGeneratingBlueprint}
          onGenerateBlueprint={onGenerateBlueprint}
        />
      ) : null}
      {activeStage === "screenplay" ? (
        <DraftDesk
          project={project}
          selectedSceneId={selectedSceneId}
          onSelectScene={onSelectScene}
          onOpenInspector={onOpenInspector}
          isGeneratingScreenplay={isGeneratingScreenplay}
          onGenerateScreenplay={onGenerateScreenplay}
        />
      ) : null}
      {activeStage === "compare" ? <CompareMode project={project} /> : null}
    </section>
  );
}

function PanelHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="panel-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="panel-title">{title}</h2>
    </div>
  );
}

function SourceWorkspace({
  project,
  selectedChunkId,
  sourceDraft,
  sourceParseError,
  sourceSearchQuery,
  sourceSearchResults,
  onSelectChunk,
  onOpenInspector,
  onSourceDraftChange,
  onImportSource,
  onImportSourceFile,
  onSourceSearchQueryChange
}: {
  project: ScreenplayProject;
  selectedChunkId: string;
  sourceDraft: string;
  sourceParseError: string | null;
  sourceSearchQuery: string;
  sourceSearchResults: SourceSearchResult[];
  onSelectChunk: (id: string) => void;
  onOpenInspector: (tab: InspectorTab) => void;
  onSourceDraftChange: (value: string) => void;
  onImportSource: () => void;
  onImportSourceFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onSourceSearchQueryChange: (value: string) => void;
}) {
  const chunks = project.source.chapters.flatMap((chapter) => chapter.chunks);
  const selectedChunk = chunks.find((chunk) => chunk.id === selectedChunkId) ?? chunks[0];

  return (
    <div className="source-workspace">
      <section className="source-import-card">
        <div>
          <p className="eyebrow">真实导入</p>
          <h3>把小说原文接入当前工作台。</h3>
        </div>
        <textarea
          aria-label="粘贴至少 3 章小说原文"
          placeholder="粘贴至少 3 章小说原文，支持 第一章 / 第1章 / Chapter 1 / ### 标题..."
          value={sourceDraft}
          onChange={(event) => onSourceDraftChange(event.target.value)}
        />
        {sourceParseError ? <span className="form-error">{sourceParseError}</span> : null}
        <div className="import-actions">
          <button className="primary-button" onClick={onImportSource} disabled={!sourceDraft.trim()}>
            <Upload size={16} />
            导入原文
          </button>
          <label className="quiet-button file-button">
            <Type size={16} />
            上传 .txt
            <input type="file" accept=".txt,text/plain" onChange={onImportSourceFile} />
          </label>
        </div>
      </section>
      <section className="source-search-card">
        <div>
          <p className="eyebrow">轻量检索</p>
          <h3>按关键词找原文依据。</h3>
        </div>
        <input
          aria-label="检索原文依据"
          value={sourceSearchQuery}
          onChange={(event) => onSourceSearchQueryChange(event.target.value)}
          placeholder="输入人物、地点、事件或道具..."
        />
        <div className="search-results">
          {sourceSearchResults.length ? (
            sourceSearchResults.map((result) => (
              <button
                key={result.chunk.id}
                onClick={() => {
                  onSelectChunk(result.chunk.id);
                  onOpenInspector("evidence");
                }}
              >
                <span>{result.chunk.id}</span>
                <strong>{result.chunk.summary}</strong>
                <small>{result.matched_terms.join(" / ")} · score {result.score}</small>
              </button>
            ))
          ) : (
            <span className="empty-note">输入关键词后显示匹配的原文依据。</span>
          )}
        </div>
      </section>
      <div className="chapter-strip">
        {project.source.chapters.map((chapter) => (
          <article key={chapter.id} className="chapter-card">
            <p className="source-id">{chapter.id}</p>
            <h3>{chapter.title}</h3>
            <p>{chapter.summary}</p>
          </article>
        ))}
      </div>
      <div className="source-reader">
        <div className="reader-copy">
          <p className="eyebrow">阅读器</p>
          <h3>{selectedChunk.summary}</h3>
          <p>{selectedChunk.text}</p>
          <div className="source-row">
            {selectedChunk.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </div>
        <div className="chunk-map">
          {chunks.map((chunk) => (
            <button
              key={chunk.id}
              className={`chunk-item ${chunk.id === selectedChunkId ? "is-selected" : ""}`}
              onClick={() => {
                onSelectChunk(chunk.id);
                onOpenInspector("evidence");
              }}
            >
              <span>{chunk.id}</span>
              {chunk.summary}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StoryDiagnosis({
  project,
  isGeneratingDiagnosis,
  onGenerateDiagnosis
}: {
  project: ScreenplayProject;
  isGeneratingDiagnosis: boolean;
  onGenerateDiagnosis: () => void;
}) {
  const diagnosis = project.story_diagnosis;
  const sourceChunkCount = project.source.chapters.flatMap((chapter) => chapter.chunks).length;
  const items = [
    ["核心冲突", diagnosis.core_conflict],
    ["主角目标", diagnosis.protagonist_goal],
    ["开场钩子", diagnosis.opening_hook]
  ];

  return (
    <div className="diagnosis-grid">
      <div className="diagnosis-report">
        <div className="report-ruler">
          <span>冲突</span>
          <span>目标</span>
          <span>钩子</span>
        </div>
        {items.map(([label, value]) => (
          <section key={label} className="text-slab">
            <p>{label}</p>
            <h3>{value}</h3>
          </section>
        ))}
      </div>
      <div className="diagnosis-side">
        <div className="diagnosis-action">
          <p className="eyebrow">Source Intelligence</p>
          <h3>先把原文读成可改编判断。</h3>
          <div className="mini-metrics">
            <span>{project.source.chapters.length} 章</span>
            <span>{sourceChunkCount} 段依据</span>
            <span>JSON 校验</span>
          </div>
          <button
            className="primary-button full-width board-action"
            onClick={onGenerateDiagnosis}
            disabled={isGeneratingDiagnosis}
          >
            <Sparkles size={16} />
            {isGeneratingDiagnosis ? "生成中..." : "AI 生成诊断"}
          </button>
        </div>
        <div className="risk-board">
          <h3>改编风险</h3>
          <ul>
            {diagnosis.adaptation_risks.map((item) => (
              <li key={item}>
                <ListChecks size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="signal-board">
          <h3>可拍线索</h3>
          <ul>
            {diagnosis.visual_potential.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DirectionBoard({
  project,
  selectedDirectionId,
  onSelectDirection,
  onOpenInspector,
  isGeneratingDirections,
  onGenerateDirections
}: {
  project: ScreenplayProject;
  selectedDirectionId: string;
  onSelectDirection: (id: string) => void;
  onOpenInspector: (tab: InspectorTab) => void;
  isGeneratingDirections: boolean;
  onGenerateDirections: () => void;
}) {
  return (
    <div className="direction-board">
      <section className="board-notes">
        <p className="eyebrow">方向板</p>
        <h3>这一层决定剧本会像什么。</h3>
        <div className="mini-metrics">
          <span>{project.directions.length} 个方向</span>
          <span>{project.source.chapters.flatMap((chapter) => chapter.chunks).length} 段依据</span>
          <span>{project.adaptation_brief.target_medium}优先</span>
        </div>
        <button className="primary-button full-width board-action" onClick={onGenerateDirections} disabled={isGeneratingDirections}>
          <Sparkles size={16} />
          {isGeneratingDirections ? "生成中..." : "AI 生成方向"}
        </button>
      </section>
      <div className="direction-lanes">
          {project.directions.map((direction) => {
          const selected = direction.id === selectedDirectionId;

          return (
            <button
              key={direction.id}
              className={`direction-card ${selected ? "is-selected" : ""}`}
              onClick={() => {
                onSelectDirection(direction.id);
                onOpenInspector("director");
              }}
            >
              <span className="card-topline">
                <span>{direction.target_medium}</span>
                <span>{direction.source_refs.length} 段依据</span>
              </span>
              <span className="card-title">{direction.title}</span>
              <span className="card-copy">{direction.logline}</span>
              <span className="pill-row">
                {direction.preserve.slice(0, 2).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function createClientFailedRun(step: string, error: string): HarnessRun {
  const now = new Date().toISOString();

  return {
    id: `run_client_failed_${Date.now()}`,
    step,
    status: "failed",
    started_at: now,
    ended_at: now,
    source_chunks_used: [],
    knowledge_packs_used: [],
    repair_attempts: 0,
    error
  };
}

function BriefSheet({
  project,
  isGeneratingBrief,
  onGenerateBrief
}: {
  project: ScreenplayProject;
  isGeneratingBrief: boolean;
  onGenerateBrief: () => void;
}) {
  const brief = project.adaptation_brief;
  const rows = [
    ["媒介", brief.target_medium],
    ["节奏", brief.pacing],
    ["忠实度", brief.fidelity],
    ["气质", brief.tone]
  ];

  return (
    <article className="brief-sheet">
      <div className="sheet-head">
        <div>
          <p className="eyebrow">改编简报</p>
          <h3>生成前先锁定这一版的创作边界。</h3>
        </div>
        <button className="primary-button compact-button" onClick={onGenerateBrief} disabled={isGeneratingBrief}>
          <Sparkles size={16} />
          {isGeneratingBrief ? "生成中..." : "AI 生成简报"}
        </button>
      </div>
      <div className="brief-fields">
        {rows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="brief-editor">
        <label>
          <span>策略</span>
          <textarea value={brief.strategy.join("\n")} readOnly aria-label="改编策略" />
        </label>
        <label>
          <span>保留</span>
          <textarea value={brief.preserve.join("\n")} readOnly aria-label="需要保留的内容" />
        </label>
        <label>
          <span>转换</span>
          <textarea value={brief.transform.join("\n")} readOnly aria-label="需要转换的内容" />
        </label>
        <label>
          <span>避免</span>
          <textarea value={brief.avoid.join("\n")} readOnly aria-label="需要避免的内容" />
        </label>
      </div>
    </article>
  );
}

function BlueprintBoard({
  project,
  selectedSceneId,
  onSelectScene,
  onOpenInspector,
  isGeneratingBlueprint,
  onGenerateBlueprint
}: {
  project: ScreenplayProject;
  selectedSceneId: string;
  onSelectScene: (id: string) => void;
  onOpenInspector: (tab: InspectorTab) => void;
  isGeneratingBlueprint: boolean;
  onGenerateBlueprint: () => void;
}) {
  return (
    <div className="blueprint-workspace">
      <section className="board-notes">
        <p className="eyebrow">Scene Blueprint</p>
        <h3>先把戏拆成可拍的节拍。</h3>
        <div className="mini-metrics">
          <span>{project.scene_blueprint.length} 场</span>
          <span>{project.adaptation_brief.source_refs.length} 段简报依据</span>
          <span>{project.adaptation_brief.target_medium}</span>
        </div>
        <button
          className="primary-button full-width board-action"
          onClick={onGenerateBlueprint}
          disabled={isGeneratingBlueprint}
        >
          <Sparkles size={16} />
          {isGeneratingBlueprint ? "生成中..." : "AI 生成蓝图"}
        </button>
      </section>
      <div className="beat-board">
        {project.scene_blueprint.map((blueprint) => {
          const selected = selectedSceneId.replace("scene", "blueprint") === blueprint.id;

          return (
            <button
              key={blueprint.id}
              className={`beat-card ${selected ? "is-selected" : ""}`}
              onClick={() => {
                const matchingScene = blueprint.id.replace("blueprint", "scene");
                onSelectScene(matchingScene);
                onOpenInspector("director");
              }}
            >
              <span className="card-topline">
                <span>{blueprint.estimated_duration}</span>
                <span>{decisionLabels[blueprint.adaptation_decision.type]}</span>
              </span>
              <span className="card-title">{blueprint.title}</span>
              <span className="card-copy">{blueprint.adaptation_decision.reason}</span>
              <span className="source-row">
                {blueprint.source_refs.map((ref) => (
                  <span key={ref}>{ref}</span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DraftDesk({
  project,
  selectedSceneId,
  onSelectScene,
  onOpenInspector,
  isGeneratingScreenplay,
  onGenerateScreenplay
}: {
  project: ScreenplayProject;
  selectedSceneId: string;
  onSelectScene: (id: string) => void;
  onOpenInspector: (tab: InspectorTab) => void;
  isGeneratingScreenplay: boolean;
  onGenerateScreenplay: () => void;
}) {
  return (
    <div className="draft-desk">
      <section className="draft-control">
        <div>
          <p className="eyebrow">Screenplay Draft</p>
          <h3>从场景蓝图生成结构化剧本 JSON。</h3>
        </div>
        <div className="mini-metrics">
          <span>{project.scene_blueprint.length} 个蓝图</span>
          <span>{project.scenes.length} 场草稿</span>
          <span>JSON 校验</span>
        </div>
        <button
          className="primary-button full-width board-action"
          onClick={onGenerateScreenplay}
          disabled={isGeneratingScreenplay}
        >
          <Sparkles size={16} />
          {isGeneratingScreenplay ? "生成中..." : "AI 生成剧本"}
        </button>
      </section>
      <div className="scene-index">
        {project.scenes.map((scene) => (
          <button
            key={scene.id}
            className={selectedSceneId === scene.id ? "is-selected" : ""}
            onClick={() => {
              onSelectScene(scene.id);
              onOpenInspector("director");
            }}
          >
            {scene.title}
          </button>
        ))}
      </div>
      <div className="script-page">
        {project.scenes.map((scene) => (
          <section key={scene.id} className={selectedSceneId === scene.id ? "is-current" : ""}>
            <p>{scene.id}</p>
            <h3>{scene.title}</h3>
            {scene.action.map((line) => (
              <span key={line}>{line}</span>
            ))}
            {scene.dialogue.map((line) => (
              <blockquote key={`${line.character_id}-${line.line}`}>
                <strong>{line.character_id}</strong>
                {line.line}
              </blockquote>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

function CompareMode({ project }: { project: ScreenplayProject }) {
  return (
    <div className="compare-mode">
      <div className="version-rail">
        {project.versions.map((version, index) => (
          <section key={version.id} className={index === project.versions.length - 1 ? "is-current" : ""}>
            <p>{version.created_at}</p>
            <h3>{version.label}</h3>
            <span>{version.summary}</span>
          </section>
        ))}
      </div>
      <div className="diff-board">
        <section>
          <p>修改前</p>
          <h3>{project.scene_revisions[0]?.before_summary ?? "暂无修改记录"}</h3>
        </section>
        <section>
          <p>修改后</p>
          <h3>{project.scene_revisions[0]?.after_summary ?? "导入后将记录场景级变化"}</h3>
        </section>
        <section className="diff-note">
          <p>修改要求</p>
          <h3>{project.scene_revisions[0]?.instruction ?? "等待局部修订接入"}</h3>
        </section>
      </div>
    </div>
  );
}

function InspectorPanel({
  project,
  activeStage,
  tab,
  onChangeTab,
  selectedDirection,
  selectedScene,
  selectedChunk,
  selectedKnowledgePacks,
  yamlPreview,
  validationReport,
  onDownloadYaml,
  onRunLocalHarnessPreview
}: {
  project: ScreenplayProject;
  activeStage: StageId;
  tab: InspectorTab;
  onChangeTab: (tab: InspectorTab) => void;
  selectedDirection: ScreenplayProject["directions"][number];
  selectedScene: ScreenplayProject["scenes"][number];
  selectedChunk: SourceChunk;
  selectedKnowledgePacks: SelectedKnowledgePack[];
  yamlPreview: string;
  validationReport: ReturnType<typeof validateScreenplayProject>;
  onDownloadYaml: () => void;
  onRunLocalHarnessPreview: () => void;
}) {
  const evidenceRefs =
    activeStage === "source"
      ? [selectedChunk.id]
      : activeStage === "directions"
        ? selectedDirection.source_refs
          : activeStage === "brief"
          ? project.adaptation_brief.source_refs
          : activeStage === "compare"
            ? project.scenes.flatMap((scene) => scene.source_refs)
            : selectedScene.source_refs;
  const objectSummary = getInspectorSummary(project, activeStage, selectedDirection, selectedScene, selectedChunk);

  return (
    <aside className="inspector-panel">
      <PanelHeading eyebrow="依据与检查" title="选择详情" />
      <div className="inspector-object">
        <span>{objectSummary.eyebrow}</span>
        <strong>{objectSummary.title}</strong>
        <small>{objectSummary.subtitle}</small>
      </div>
      <div className="inspector-tabs">
        {inspectorTabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;

          return (
            <button
              key={item.id}
              className={`inspector-tab ${active ? "is-active" : ""}`}
              onClick={() => onChangeTab(item.id)}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="inspector-body">
        {tab === "director" ? (
          <DirectorView
            activeStage={activeStage}
            project={project}
            selectedDirection={selectedDirection}
            selectedScene={selectedScene}
            selectedChunk={selectedChunk}
            selectedKnowledgePacks={selectedKnowledgePacks}
          />
        ) : null}
        {tab === "evidence" ? <EvidenceView project={project} refs={evidenceRefs} /> : null}
        {tab === "yaml" ? <YamlView yaml={yamlPreview} onDownloadYaml={onDownloadYaml} /> : null}
        {tab === "validation" ? <ValidationView report={validationReport} /> : null}
        {tab === "timeline" ? <TimelineView project={project} /> : null}
        {tab === "trace" ? (
          <TraceView project={project} onRunLocalHarnessPreview={onRunLocalHarnessPreview} />
        ) : null}
      </div>
    </aside>
  );
}

function getInspectorSummary(
  project: ScreenplayProject,
  activeStage: StageId,
  selectedDirection: ScreenplayProject["directions"][number],
  selectedScene: ScreenplayProject["scenes"][number],
  selectedChunk: SourceChunk
) {
  if (activeStage === "source") {
    return {
      eyebrow: "原文依据",
      title: selectedChunk.id,
      subtitle: selectedChunk.summary
    };
  }

  if (activeStage === "diagnosis") {
    return {
      eyebrow: "故事诊断",
      title: "核心冲突与风险",
      subtitle: project.story_diagnosis.opening_hook
    };
  }

  if (activeStage === "directions") {
    return {
      eyebrow: "改编路线",
      title: selectedDirection.title,
      subtitle: selectedDirection.recommendation_reason
    };
  }

  if (activeStage === "brief") {
    return {
      eyebrow: "改编简报",
      title: `${project.adaptation_brief.target_medium} · ${project.adaptation_brief.tone}`,
      subtitle: "后续写作要遵守的创作边界"
    };
  }

  if (activeStage === "compare") {
    const latest = project.versions[project.versions.length - 1];
    return {
      eyebrow: "版本对比",
      title: latest.label,
      subtitle: latest.summary
    };
  }

  return {
    eyebrow: activeStage === "blueprint" ? "场景蓝图" : "剧本场景",
    title: selectedScene.title,
    subtitle: selectedScene.adaptation_decision.reason
  };
}

function DirectorView({
  activeStage,
  project,
  selectedDirection,
  selectedScene,
  selectedChunk,
  selectedKnowledgePacks
}: {
  activeStage: StageId;
  project: ScreenplayProject;
  selectedDirection: ScreenplayProject["directions"][number];
  selectedScene: ScreenplayProject["scenes"][number];
  selectedChunk: SourceChunk;
  selectedKnowledgePacks: SelectedKnowledgePack[];
}) {
  const action = stageActions[activeStage];

  return (
    <div className="inspector-stack">
      <section className="detail-block">
        <p>当前工作模式</p>
        <h3>{modeTitles[activeStage].title}</h3>
        <span>{action.detail}</span>
      </section>
      {activeStage === "source" ? (
        <section className="detail-block">
          <p>选中依据</p>
          <h3>{selectedChunk.summary}</h3>
          <span>{selectedChunk.text}</span>
        </section>
      ) : null}
      <section className="detail-block">
        <p>当前方向</p>
        <h3>{selectedDirection.title}</h3>
        <span>{selectedDirection.recommendation_reason}</span>
      </section>
      <section className="detail-block">
        <p>Active Knowledge Packs</p>
        <h3>{selectedKnowledgePacks.length} 个知识包已选择</h3>
        <div className="knowledge-pack-list">
          {selectedKnowledgePacks.map((item) => (
            <span key={item.pack.id} title={item.reason}>
              {item.pack.title}
            </span>
          ))}
        </div>
      </section>
      {activeStage === "blueprint" || activeStage === "screenplay" || activeStage === "compare" ? (
        <section className="detail-block">
          <p>当前场景</p>
          <h3>{selectedScene.title}</h3>
          <span>{selectedScene.adaptation_decision.reason}</span>
        </section>
      ) : null}
      <section className="next-step-card">
        <p>下一步</p>
        <h3>{action.label}</h3>
        <span>
          {action.detail} 当前项目含 {project.source.chapters.length} 章、
          {project.source.chapters.flatMap((chapter) => chapter.chunks).length} 段依据。
        </span>
      </section>
    </div>
  );
}

function EvidenceView({ project, refs }: { project: ScreenplayProject; refs: string[] }) {
  const chunks = project.source.chapters.flatMap((chapter) => chapter.chunks);
  const selectedRefs = new Set(refs);
  const visibleChunks = chunks.filter((chunk) => selectedRefs.has(chunk.id));
  const fallbackChunks = visibleChunks.length ? visibleChunks : chunks;

  return (
    <div className="inspector-stack">
      {fallbackChunks.map((chunk) => (
        <section key={chunk.id} className="evidence-item">
          <p>{chunk.id}</p>
          <h3>{chunk.summary}</h3>
          <span>{chunk.text}</span>
        </section>
      ))}
    </div>
  );
}

function YamlView({ yaml, onDownloadYaml }: { yaml: string; onDownloadYaml: () => void }) {
  return (
    <div className="inspector-stack">
      <button className="quiet-button fit-content" onClick={onDownloadYaml}>
        <ArrowDownToLine size={16} />
        导出 YAML
      </button>
      <pre className="yaml-preview">{yaml}</pre>
    </div>
  );
}

function ValidationView({ report }: { report: ReturnType<typeof validateScreenplayProject> }) {
  return (
    <div className="inspector-stack">
      <div className="validation-summary">
        <p>结构校验</p>
        <h3>{report.status === "passed" ? "已通过" : "需要处理"}</h3>
      </div>
      <div className="check-list">
        {report.checks.map((check) => (
          <div key={check.name}>
            <span>{checkLabels[check.name] ?? check.name}</span>
            <strong>{check.status === "passed" ? "通过" : "失败"}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineView({ project }: { project: ScreenplayProject }) {
  return (
    <div className="inspector-stack">
      {project.versions.map((version) => (
        <section key={version.id} className="timeline-item">
          <p>{version.created_at}</p>
          <h3>{version.label}</h3>
          <span>{version.summary}</span>
        </section>
      ))}
    </div>
  );
}

function TraceView({
  project,
  onRunLocalHarnessPreview
}: {
  project: ScreenplayProject;
  onRunLocalHarnessPreview: () => void;
}) {
  return (
    <div className="inspector-stack">
      <button className="quiet-button fit-content" onClick={onRunLocalHarnessPreview}>
        <TerminalSquare size={16} />
        本地 JSON 预演
      </button>
      {project.harness_trace.map((run) => (
        <TraceItem key={run.id} run={run} />
      ))}
    </div>
  );
}

function TraceItem({ run }: { run: HarnessRun }) {
  return (
    <section className="trace-item">
      <p>{run.status === "succeeded" ? "完成" : run.status}</p>
      <h3>{run.step}</h3>
      <span>
        {run.source_chunks_used.length} 段依据，{run.knowledge_packs_used.length} 个知识包，
        {run.repair_attempts} 次修复
      </span>
      {run.knowledge_packs_used.length ? (
        <div className="knowledge-pack-list compact">
          {run.knowledge_packs_used.map((pack) => (
            <span key={pack}>{pack}</span>
          ))}
        </div>
      ) : null}
      {run.error ? <strong className="trace-error">{run.error}</strong> : null}
    </section>
  );
}

function SettingsDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="settings-dialog" role="dialog" aria-modal="true" aria-label="工作区设置">
        <div className="dialog-head">
          <div>
            <p className="eyebrow">工作区设置</p>
            <h2 className="section-title">生成、输出与本地项目</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭设置">
            <X size={18} />
          </button>
        </div>
        <div className="settings-grid">
          <SettingsGroup
            icon={SlidersHorizontal}
            title="创作偏好"
            rows={[
              ["默认媒介", "短剧"],
              ["节奏", "快"],
              ["忠实度", "中等"],
              ["默认知识包", "短剧钩子、小说转动作"]
            ]}
          />
          <SettingsGroup
            icon={FileCheck2}
            title="输出"
            rows={[
              ["结构版本", "1.0"],
              ["原文摘录", "导出时包含"],
              ["校验报告", "导出时包含"]
            ]}
          />
          <SettingsGroup
            icon={ShieldCheck}
            title="模型"
            rows={[
              ["模型服务", "兼容接口"],
              ["密钥", "仅从环境变量读取"],
              ["失败处理", "结构修复后再校验"]
            ]}
          />
          <SettingsGroup
            icon={Database}
            title="工作区"
            rows={[
              ["自动保存", "开启"],
              ["存储位置", "本地浏览器"],
              ["项目备份", "导出项目文件"]
            ]}
          />
          <SettingsGroup
            icon={Type}
            title="阅读"
            rows={[
              ["界面密度", "标准"],
              ["预览字号", "正文"],
              ["作用范围", "工作区全局"]
            ]}
          />
        </div>
        <div className="dialog-actions">
          <button className="quiet-button" onClick={onClose}>
            关闭
          </button>
          <button className="pending-button" disabled>
            保存设置（待接入）
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingsGroup({
  icon: Icon,
  title,
  rows
}: {
  icon: LucideIcon;
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <section className="settings-group">
      <div className="settings-title">
        <Icon size={16} />
        <h3>{title}</h3>
      </div>
      {rows.map(([label, value]) => (
        <div key={label} className="settings-row">
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  );
}

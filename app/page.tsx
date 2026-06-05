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
  MessageSquareText,
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
import { useMemo, useState } from "react";
import { validateScreenplayProject } from "@/lib/domain/validators";
import { screenplayToYaml } from "@/lib/domain/yaml";
import { sampleProject } from "@/lib/sample/project";

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
  { id: "brief", label: "改编简报", status: "已生成", count: "1 版", hint: "创作约束", icon: ClipboardCheck },
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
  brief: { title: "改编简报", subtitle: "把选择沉淀成后续生成必须遵守的约束。" },
  blueprint: { title: "场景蓝图", subtitle: "像索引卡一样安排场次、节拍和改编理由。" },
  screenplay: { title: "剧本草稿", subtitle: "检查场景、对白、角色和 YAML 是否一致。" },
  compare: { title: "版本对比", subtitle: "看清楚每次修改到底改变了什么。" }
};

const binderCopy: Record<StageId, string> = {
  source: "这里会承载真实导入、章节识别、段落切分和 source refs。当前先用样例原文展示后续结构。",
  diagnosis: "诊断不应该是装饰卡片，它会决定后续推荐什么方向、避开什么风险。",
  directions: "方向是创作决策，不是 prompt 模板。选择后会影响简报、蓝图和剧本。",
  brief: "简报是生成前的创作合同，后续会支持用户编辑和锁定条款。",
  blueprint: "蓝图先于剧本，避免模型直接把小说硬转成 YAML。",
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
  unique_scene_ids: "场景 ID",
  character_references: "角色引用",
  location_references: "地点引用",
  source_references: "原文依据",
  adaptation_decisions: "改编理由"
};

export default function Home() {
  const [activeStage, setActiveStage] = useState<StageId>("directions");
  const [expandedStage, setExpandedStage] = useState<StageId | null>("directions");
  const [selectedDirectionId, setSelectedDirectionId] = useState(sampleProject.directions[0].id);
  const [selectedSceneId, setSelectedSceneId] = useState(sampleProject.scenes[0].id);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("director");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const validationReport = useMemo(() => validateScreenplayProject(sampleProject), []);
  const yamlPreview = useMemo(() => screenplayToYaml(sampleProject, validationReport), [validationReport]);
  const selectedDirection =
    sampleProject.directions.find((direction) => direction.id === selectedDirectionId) ??
    sampleProject.directions[0];
  const selectedScene =
    sampleProject.scenes.find((scene) => scene.id === selectedSceneId) ?? sampleProject.scenes[0];

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

  return (
    <main className="min-h-screen px-4 py-4 lg:px-6">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4">
        <header className="studio-header">
          <div>
            <p className="eyebrow">Writer Copilot</p>
            <h1 className="brand-title">改编工作室</h1>
          </div>
          <div className="header-actions">
            <button className="quiet-button" onClick={() => setSettingsOpen(true)}>
              <Settings size={16} />
              工作区设置
            </button>
            <button className="pending-button" disabled>
              <Play size={16} />
              生成待接入
            </button>
          </div>
        </header>

        <section className={`studio-grid ${expandedStage ? "is-expanded" : ""}`}>
          <ProjectBinder
            activeStage={activeStage}
            expandedStage={expandedStage}
            onActivateStage={activateStage}
            onToggleExpanded={(stage) => setExpandedStage(expandedStage === stage ? null : stage)}
          />
          <AdaptationCanvas
            activeStage={activeStage}
            selectedDirectionId={selectedDirectionId}
            selectedSceneId={selectedSceneId}
            onSelectDirection={setSelectedDirectionId}
            onSelectScene={setSelectedSceneId}
            onOpenInspector={setInspectorTab}
            onDownloadYaml={downloadYaml}
          />
          <InspectorPanel
            tab={inspectorTab}
            onChangeTab={setInspectorTab}
            selectedDirection={selectedDirection}
            selectedScene={selectedScene}
            yamlPreview={yamlPreview}
            validationReport={validationReport}
            onDownloadYaml={downloadYaml}
          />
        </section>
      </div>
      {settingsOpen ? <SettingsDialog onClose={() => setSettingsOpen(false)} /> : null}
    </main>
  );
}

function ProjectBinder({
  activeStage,
  expandedStage,
  onActivateStage,
  onToggleExpanded
}: {
  activeStage: StageId;
  expandedStage: StageId | null;
  onActivateStage: (stage: StageId) => void;
  onToggleExpanded: (stage: StageId) => void;
}) {
  return (
    <aside className="binder-panel">
      <PanelHeading eyebrow="项目 Binder" title="雾站来信" />
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
                  <PanelLeftOpen size={15} />
                </button>
              </div>
              {isExpanded ? <BinderFocus stage={stage.id} /> : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function BinderFocus({ stage }: { stage: StageId }) {
  return (
    <div className="binder-focus">
      <p>{binderCopy[stage]}</p>
      {stage === "source" ? (
        <button className="quiet-button full-width">
          <Upload size={16} />
          导入原文待接入
        </button>
      ) : null}
      {stage === "directions" ? (
        <div className="focus-options">
          {sampleProject.directions.map((direction) => (
            <span key={direction.id}>{direction.title}</span>
          ))}
        </div>
      ) : null}
      {stage === "blueprint" ? (
        <div className="focus-options">
          {sampleProject.scene_blueprint.map((scene) => (
            <span key={scene.id}>{scene.title}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AdaptationCanvas({
  activeStage,
  selectedDirectionId,
  selectedSceneId,
  onSelectDirection,
  onSelectScene,
  onOpenInspector,
  onDownloadYaml
}: {
  activeStage: StageId;
  selectedDirectionId: string;
  selectedSceneId: string;
  onSelectDirection: (id: string) => void;
  onSelectScene: (id: string) => void;
  onOpenInspector: (tab: InspectorTab) => void;
  onDownloadYaml: () => void;
}) {
  const mode = modeTitles[activeStage];

  return (
    <section className={`canvas-panel mode-${activeStage}`}>
      <div className="canvas-head">
        <div>
          <p className="eyebrow">主工作区</p>
          <h2 className="section-title">{mode.title}</h2>
          <span className="mode-subtitle">{mode.subtitle}</span>
        </div>
        <div className="toolbar">
          <button className="primary-button" onClick={() => onOpenInspector("validation")}>
            <CheckCircle2 size={16} />
            检查结构
          </button>
          <button className="quiet-button" onClick={onDownloadYaml}>
            <ArrowDownToLine size={16} />
            导出 YAML
          </button>
        </div>
      </div>

      {activeStage === "source" ? <SourceWorkspace /> : null}
      {activeStage === "diagnosis" ? <StoryDiagnosis /> : null}
      {activeStage === "directions" ? (
        <DirectionBoard
          selectedDirectionId={selectedDirectionId}
          onSelectDirection={onSelectDirection}
          onOpenInspector={onOpenInspector}
        />
      ) : null}
      {activeStage === "brief" ? <BriefSheet /> : null}
      {activeStage === "blueprint" ? (
        <BlueprintBoard
          selectedSceneId={selectedSceneId}
          onSelectScene={onSelectScene}
          onOpenInspector={onOpenInspector}
        />
      ) : null}
      {activeStage === "screenplay" ? (
        <DraftDesk
          selectedSceneId={selectedSceneId}
          onSelectScene={onSelectScene}
          onOpenInspector={onOpenInspector}
        />
      ) : null}
      {activeStage === "compare" ? <CompareMode /> : null}
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

function SourceWorkspace() {
  return (
    <div className="source-workspace">
      <div className="chapter-strip">
        {sampleProject.source.chapters.map((chapter) => (
          <article key={chapter.id} className="chapter-card">
            <p className="source-id">{chapter.id}</p>
            <h3>{chapter.title}</h3>
            <p>{chapter.summary}</p>
          </article>
        ))}
      </div>
      <div className="source-reader">
        {sampleProject.source.chapters.flatMap((chapter) =>
          chapter.chunks.map((chunk) => (
            <button key={chunk.id} className="chunk-item">
              <span>{chunk.id}</span>
              {chunk.text}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function StoryDiagnosis() {
  const diagnosis = sampleProject.story_diagnosis;
  const items = [
    ["核心冲突", diagnosis.core_conflict],
    ["主角目标", diagnosis.protagonist_goal],
    ["开场钩子", diagnosis.opening_hook]
  ];

  return (
    <div className="diagnosis-grid">
      <div className="stack">
        {items.map(([label, value]) => (
          <section key={label} className="text-slab">
            <p>{label}</p>
            <h3>{value}</h3>
          </section>
        ))}
      </div>
      <div className="risk-board">
        <h3>改编提醒</h3>
        <ul>
          {diagnosis.adaptation_risks.concat(diagnosis.visual_potential).map((item) => (
            <li key={item}>
              <ListChecks size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DirectionBoard({
  selectedDirectionId,
  onSelectDirection,
  onOpenInspector
}: {
  selectedDirectionId: string;
  onSelectDirection: (id: string) => void;
  onOpenInspector: (tab: InspectorTab) => void;
}) {
  return (
    <div className="direction-board">
      <section className="board-notes">
        <p className="eyebrow">方向板</p>
        <h3>这一层决定剧本会像什么。</h3>
        <div className="mini-metrics">
          <span>2 个方向</span>
          <span>6 段依据</span>
          <span>短剧优先</span>
        </div>
      </section>
      <div className="direction-lanes">
        {sampleProject.directions.map((direction) => {
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

function BriefSheet() {
  const brief = sampleProject.adaptation_brief;
  const rows = [
    ["媒介", brief.target_medium],
    ["节奏", brief.pacing],
    ["忠实度", brief.fidelity],
    ["气质", brief.tone]
  ];

  return (
    <article className="brief-sheet">
      <div className="sheet-head">
        <p className="eyebrow">改编简报</p>
        <h3>生成前先锁定这一版的创作边界。</h3>
      </div>
      <div className="brief-fields">
        {rows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="brief-columns">
        <ListBlock title="保留" items={brief.preserve} />
        <ListBlock title="转换" items={brief.transform} />
        <ListBlock title="避免" items={brief.avoid} />
      </div>
    </article>
  );
}

function BlueprintBoard({
  selectedSceneId,
  onSelectScene,
  onOpenInspector
}: {
  selectedSceneId: string;
  onSelectScene: (id: string) => void;
  onOpenInspector: (tab: InspectorTab) => void;
}) {
  return (
    <div className="beat-board">
      {sampleProject.scene_blueprint.map((blueprint) => {
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
  );
}

function DraftDesk({
  selectedSceneId,
  onSelectScene,
  onOpenInspector
}: {
  selectedSceneId: string;
  onSelectScene: (id: string) => void;
  onOpenInspector: (tab: InspectorTab) => void;
}) {
  return (
    <div className="draft-desk">
      <div className="scene-index">
        {sampleProject.scenes.map((scene) => (
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
        {sampleProject.scenes.map((scene) => (
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

function CompareMode() {
  return (
    <div className="compare-mode">
      <ListBlock title="场景变化" items={["第 02 场线索提前", "没有删除场景"]} />
      <ListBlock title="人物变化" items={["林澈的行动动机更明确"]} />
      <ListBlock title="策略变化" items={["开场从氛围铺垫改为危机前置"]} />
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="list-block">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <CheckCircle2 size={15} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function InspectorPanel({
  tab,
  onChangeTab,
  selectedDirection,
  selectedScene,
  yamlPreview,
  validationReport,
  onDownloadYaml
}: {
  tab: InspectorTab;
  onChangeTab: (tab: InspectorTab) => void;
  selectedDirection: (typeof sampleProject.directions)[number];
  selectedScene: (typeof sampleProject.scenes)[number];
  yamlPreview: string;
  validationReport: ReturnType<typeof validateScreenplayProject>;
  onDownloadYaml: () => void;
}) {
  return (
    <aside className="inspector-panel">
      <PanelHeading eyebrow="对象 Inspector" title="当前选择" />
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
          <DirectorView selectedDirection={selectedDirection} selectedScene={selectedScene} />
        ) : null}
        {tab === "evidence" ? <EvidenceView /> : null}
        {tab === "yaml" ? <YamlView yaml={yamlPreview} onDownloadYaml={onDownloadYaml} /> : null}
        {tab === "validation" ? <ValidationView report={validationReport} /> : null}
        {tab === "timeline" ? <TimelineView /> : null}
        {tab === "trace" ? <TraceView /> : null}
      </div>
    </aside>
  );
}

function DirectorView({
  selectedDirection,
  selectedScene
}: {
  selectedDirection: (typeof sampleProject.directions)[number];
  selectedScene: (typeof sampleProject.scenes)[number];
}) {
  return (
    <div className="inspector-stack">
      <section className="detail-block">
        <p>当前方向</p>
        <h3>{selectedDirection.title}</h3>
        <span>{selectedDirection.recommendation_reason}</span>
      </section>
      <section className="detail-block">
        <p>当前场景</p>
        <h3>{selectedScene.title}</h3>
        <span>{selectedScene.adaptation_decision.reason}</span>
      </section>
      <button className="pending-button full-width" disabled>
        <MessageSquareText size={16} />
        场景修订待接入
      </button>
    </div>
  );
}

function EvidenceView() {
  const chunks = sampleProject.source.chapters.flatMap((chapter) => chapter.chunks);

  return (
    <div className="inspector-stack">
      {chunks.map((chunk) => (
        <section key={chunk.id} className="evidence-item">
          <p>{chunk.id}</p>
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

function TimelineView() {
  return (
    <div className="inspector-stack">
      {sampleProject.versions.map((version) => (
        <section key={version.id} className="timeline-item">
          <p>{version.created_at}</p>
          <h3>{version.label}</h3>
          <span>{version.summary}</span>
        </section>
      ))}
    </div>
  );
}

function TraceView() {
  return (
    <div className="inspector-stack">
      {sampleProject.harness_trace.map((run) => (
        <section key={run.id} className="trace-item">
          <p>{run.status === "succeeded" ? "完成" : run.status}</p>
          <h3>{run.step}</h3>
          <span>
            {run.source_chunks_used.length} 段依据，{run.knowledge_packs_used.length} 个知识包，
            {run.repair_attempts} 次修复
          </span>
        </section>
      ))}
    </div>
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
              ["Schema", "1.0"],
              ["原文摘录", "导出时包含"],
              ["校验报告", "导出时包含"]
            ]}
          />
          <SettingsGroup
            icon={ShieldCheck}
            title="模型"
            rows={[
              ["Provider", "OpenAI compatible"],
              ["API Key", "仅从环境变量读取"],
              ["失败处理", "JSON 修复后再校验"]
            ]}
          />
          <SettingsGroup
            icon={Database}
            title="工作区"
            rows={[
              ["自动保存", "开启"],
              ["存储位置", "本地浏览器"],
              ["项目备份", "导出 JSON"]
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
            保存待接入
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

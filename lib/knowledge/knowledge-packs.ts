export type KnowledgePackId =
  | "adaptation-principles"
  | "web-drama-hooks"
  | "film-opening"
  | "prose-to-action"
  | "dialogue-compression"
  | "scene-beats"
  | "screenplay-yaml-rules";

export type KnowledgePack = {
  id: KnowledgePackId;
  title: string;
  category: "adaptation" | "medium" | "craft" | "schema";
  triggers: string[];
  content: string;
};

export type KnowledgePackSelectionInput = {
  targetMedium: string;
  strategies: string[];
  tone?: string;
};

export type SelectedKnowledgePack = {
  pack: KnowledgePack;
  reason: string;
};

const knowledgePacks: KnowledgePack[] = [
  {
    id: "adaptation-principles",
    title: "改编原则",
    category: "adaptation",
    triggers: ["always"],
    content:
      "改编不是照搬原文。先识别核心冲突、人物目标和不可丢失的关系，再决定保留、压缩、合并、重排或新增。每个改编决策都应该能回到 source_refs 或清楚说明新增理由。"
  },
  {
    id: "web-drama-hooks",
    title: "短剧钩子",
    category: "medium",
    triggers: ["短剧", "web_drama", "钩子", "危机", "爽感"],
    content:
      "短剧开场要尽快建立危机、欲望或反转。第一场优先给可视化异常、强目标和未解决问题，少做背景解释。每个段落末尾都应推动观众想看下一场。"
  },
  {
    id: "film-opening",
    title: "电影开场",
    category: "medium",
    triggers: ["电影", "film", "电影开场", "长镜头"],
    content:
      "电影开场可以更重视空间、节奏和悬念铺设。用可拍细节代替设定说明，先让观众感到问题存在，再逐步揭示人物关系和世界规则。"
  },
  {
    id: "prose-to-action",
    title: "小说转动作",
    category: "craft",
    triggers: ["内心外化", "外化", "prose_to_action", "动作", "视觉证据"],
    content:
      "小说里的心理活动、设定说明和回忆，需要尽量外化成动作、道具、选择、阻碍和场面调度。优先把抽象情绪变成观众能看见或听见的行为。"
  },
  {
    id: "dialogue-compression",
    title: "对白压缩",
    category: "craft",
    triggers: ["对白", "压缩", "节奏", "短剧", "dialogue"],
    content:
      "对白要服务行动和冲突。删掉解释性复述，保留角色目的、情绪变化和信息推进。短剧对白尤其需要短句、反应、打断和明确的场面目标。"
  },
  {
    id: "scene-beats",
    title: "场景节拍",
    category: "craft",
    triggers: ["always", "场景", "节拍", "blueprint"],
    content:
      "每场戏应该包含场景目标、阻碍、转折和离场状态。Scene Blueprint 先定义这场戏为什么存在，再进入动作和对白，避免直接把小说段落排成剧本格式。"
  },
  {
    id: "screenplay-yaml-rules",
    title: "剧本 YAML 规则",
    category: "schema",
    triggers: ["always", "YAML", "schema", "source_refs"],
    content:
      "最终 YAML 必须来自校验后的结构化 JSON。scenes、characters、locations、source_refs 的引用要能相互解析；每个 scene 都应有 adaptation_decision.type 和 reason。"
  }
];

export function listKnowledgePacks(): KnowledgePack[] {
  return knowledgePacks;
}

export function getKnowledgePack(id: KnowledgePackId): KnowledgePack {
  const pack = knowledgePacks.find((item) => item.id === id);

  if (!pack) {
    throw new Error(`Unknown knowledge pack "${id}".`);
  }

  return pack;
}

export function selectKnowledgePacks(input: KnowledgePackSelectionInput): SelectedKnowledgePack[] {
  const signals = [input.targetMedium, input.tone ?? "", ...input.strategies].filter(Boolean);
  const selected = new Map<KnowledgePackId, string>();

  for (const pack of knowledgePacks) {
    if (pack.triggers.includes("always")) {
      selected.set(pack.id, "基础改编流程需要这个知识包。");
      continue;
    }

    const matchedSignal = signals.find((signal) =>
      pack.triggers.some((trigger) => signal.toLowerCase().includes(trigger.toLowerCase()))
    );

    if (matchedSignal) {
      selected.set(pack.id, buildSelectionReason(pack, matchedSignal));
    }
  }

  return knowledgePacks
    .filter((pack) => selected.has(pack.id))
    .map((pack) => ({
      pack,
      reason: selected.get(pack.id) ?? "当前创作目标需要这个知识包。"
    }));
}

function buildSelectionReason(pack: KnowledgePack, signal: string): string {
  if (pack.id === "web-drama-hooks") {
    return `目标媒介或策略包含“${signal}”，需要短剧钩子判断。`;
  }

  if (pack.id === "prose-to-action") {
    return `策略包含“${signal}”，需要把小说叙述转成可拍动作。`;
  }

  if (pack.id === "dialogue-compression") {
    return `创作目标包含“${signal}”，需要压缩对白和节奏。`;
  }

  if (pack.id === "film-opening") {
    return `目标媒介或气质包含“${signal}”，需要电影开场方法。`;
  }

  return `匹配当前信号“${signal}”。`;
}

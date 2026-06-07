import type { ScreenplayProject } from "@/lib/domain/schemas";

export const sampleProject: ScreenplayProject = {
  schema_version: "1.0",
  project: {
    title: "雾站来信",
    source_type: "novel",
    language: "zh-CN"
  },
  source: {
    chapters: [
      {
        id: "chapter_1",
        title: "第一章 雾站封门",
        summary: "林澈回到旧城北站，发现失踪哥哥留下的警告仍在候车厅滚动。",
        chunks: [
          {
            id: "chapter_1:p_001",
            chapter_id: "chapter_1",
            text: "林澈站在旧城北站门口。铁链从门内绕出，锁舌却朝着候车厅，像是有人把自己关在了里面。",
            summary: "车站从内部被封住，形成第一处异常。",
            keywords: ["旧城北站", "铁链", "封门"],
            detected_names: ["林澈"]
          },
          {
            id: "chapter_1:p_002",
            chapter_id: "chapter_1",
            text: "电子屏闪了两下，跳出哥哥失踪前的最后一句话：别跟着灯走。",
            summary: "哥哥的警告重新出现，提示危险方向。",
            keywords: ["电子屏", "哥哥", "灯"],
            detected_names: ["林澈"]
          }
        ]
      },
      {
        id: "chapter_2",
        title: "第二章 地下站台",
        summary: "林澈进入地下站台，发现事故封站的时间线被人改过。",
        chunks: [
          {
            id: "chapter_2:p_001",
            chapter_id: "chapter_2",
            text: "地下站台积着雨水，信号灯一盏接一盏亮起，像有人提前排好的路线。",
            summary: "信号灯形成可视化线索，引导林澈深入。",
            keywords: ["地下站台", "信号灯", "路线"],
            detected_names: []
          },
          {
            id: "chapter_2:p_002",
            chapter_id: "chapter_2",
            text: "封站通知上签着周询的名字，时间却早于事故报警整整一小时。",
            summary: "周询的签字暴露出官方记录的矛盾。",
            keywords: ["周询", "封站通知", "事故"],
            detected_names: ["周询"]
          }
        ]
      },
      {
        id: "chapter_3",
        title: "第三章 墙后的房间",
        summary: "隐藏房间被点亮，哥哥的声音从墙后传来，暗示事故只是预演。",
        chunks: [
          {
            id: "chapter_3:p_001",
            chapter_id: "chapter_3",
            text: "林澈按下红色开关，站内所有线路图同时变了样，多出一间从未标注过的维护室。",
            summary: "线路图变化，隐藏空间第一次被揭示。",
            keywords: ["红色开关", "线路图", "维护室"],
            detected_names: ["林澈"]
          },
          {
            id: "chapter_3:p_002",
            chapter_id: "chapter_3",
            text: "墙后传来哥哥压低的声音：那场事故不是结局，只是排练。",
            summary: "哥哥揭示事故背后还有更大的计划。",
            keywords: ["哥哥", "事故", "排练"],
            detected_names: []
          }
        ]
      }
    ]
  },
  story_diagnosis: {
    core_conflict: "林澈追查哥哥失踪真相，却发现旧城北站的事故记录被提前安排。",
    protagonist_goal: "找到哥哥，确认车站事故是否被周询等人伪造。",
    opening_hook: "车站从内部反锁，哥哥的警告在无人候车厅重新出现。",
    adaptation_risks: [
      "原文悬疑信息密度高，开场若只靠解释会变慢。",
      "周询的嫌疑需要通过物证出现，不能只靠人物猜测。"
    ],
    visual_potential: [
      "铁链、电子屏、信号灯、线路图都能成为可拍的线索。",
      "隐藏维护室适合做阶段性反转。"
    ]
  },
  directions: [
    {
      id: "direction_web_crisis",
      title: "短剧强钩子版",
      target_medium: "短剧",
      logline: "林澈闯入封锁车站，哥哥留下的警告变成一场正在启动的陷阱。",
      recommendation_reason: "原文有明确空间、倒计时感和连续线索，适合把危险前置。",
      preserve: ["从内部反锁的车站", "哥哥的警告", "信号灯作为证据"],
      transform: ["把隐藏维护室提前为第一集结尾反转"],
      risks: ["节奏过快可能压缩原文的阴冷氛围"],
      audience: "喜欢快节奏悬疑和强结尾钩子的观众",
      source_refs: ["chapter_1:p_001", "chapter_1:p_002", "chapter_3:p_001"]
    },
    {
      id: "direction_film_noir",
      title: "电影悬疑开场",
      target_medium: "电影开场",
      logline: "一座被封的旧车站里，每一份官方记录都比事故更早一步出现。",
      recommendation_reason: "原文空间集中、氛围完整，适合做压迫感更强的长镜头开场。",
      preserve: ["周询签字的时间矛盾", "旧车站作为封闭空间"],
      transform: ["延后哥哥声音，让观众先跟随证据怀疑周询"],
      risks: ["如果危险来得太晚，开场张力会不足"],
      audience: "偏好氛围悬疑和调查推进的观众",
      source_refs: ["chapter_2:p_001", "chapter_2:p_002", "chapter_3:p_002"]
    }
  ],
  adaptation_brief: {
    target_medium: "短剧",
    pacing: "快",
    fidelity: "中等",
    tone: "悬疑",
    strategy: ["钩子前置", "内心外化", "视觉证据"],
    preserve: ["林澈寻找哥哥的主线", "旧车站封锁谜团", "别跟着灯走的警告"],
    transform: ["把怀疑和恐惧转化为地图、灯光和封站文件"],
    avoid: ["在第一场就解释完整阴谋"],
    source_refs: ["chapter_1:p_001", "chapter_1:p_002", "chapter_2:p_002"]
  },
  scene_blueprint: [
    {
      id: "blueprint_001",
      title: "门从里面锁上",
      source_chapters: ["chapter_1"],
      source_refs: ["chapter_1:p_001", "chapter_1:p_002"],
      story_beats: ["林澈抵达", "门锁异常", "哥哥警告出现"],
      adaptation_decision: {
        type: "externalize",
        reason: "把原文的疑惧转成观众一眼能看懂的门锁矛盾和电子屏警告。"
      },
      estimated_duration: "2 分钟",
      action_preview: ["林澈剪断铁链，锁舌却朝车站内部落下。"],
      dialogue_preview: ["林澈：你是故意让我看到的。"]
    },
    {
      id: "blueprint_002",
      title: "早到一小时的签字",
      source_chapters: ["chapter_2"],
      source_refs: ["chapter_2:p_001", "chapter_2:p_002"],
      story_beats: ["信号灯引路", "封站通知", "周询嫌疑"],
      adaptation_decision: {
        type: "compress",
        reason: "把两段调查信息压缩成一个可拍道具和一次即时发现。"
      },
      estimated_duration: "3 分钟",
      action_preview: ["林澈拍下封站通知，身后的红灯依次亮起。"],
      dialogue_preview: ["林澈：事故还没发生，他就已经封站了。"]
    }
  ],
  characters: [
    {
      id: "char_mara",
      name: "林澈",
      function_in_adaptation: "主角"
    },
    {
      id: "char_vale",
      name: "周询",
      function_in_adaptation: "体制内嫌疑人"
    },
    {
      id: "char_brother",
      name: "林澈的哥哥",
      function_in_adaptation: "失踪引线"
    }
  ],
  locations: [
    {
      id: "loc_station",
      name: "旧城北站",
      description: "被铁链封住的旧车站，电子屏和线路图仍会自动更新。"
    },
    {
      id: "loc_platform",
      name: "地下站台",
      description: "积水、信号灯和封站通知共同构成调查现场。"
    }
  ],
  scenes: [
    {
      id: "scene_001",
      title: "别跟着灯走",
      source_chapters: ["chapter_1"],
      source_refs: ["chapter_1:p_001", "chapter_1:p_002"],
      adaptation_decision: {
        type: "externalize",
        reason: "用反向门锁和电子屏警告替代长段心理描写，让危险立刻成立。"
      },
      location_id: "loc_station",
      time: "夜",
      characters: ["char_mara", "char_brother"],
      action: [
        "林澈剪断铁链，发现锁舌朝着车站内部。",
        "候车厅电子屏亮起，重复哥哥失踪前的最后一句话。"
      ],
      dialogue: [
        {
          character_id: "char_mara",
          line: "你是故意让我看到的。",
          emotion: "压住恐惧"
        },
        {
          character_id: "char_brother",
          line: "别跟着灯走。",
          emotion: "录音低语"
        }
      ]
    },
    {
      id: "scene_002",
      title: "错误的时间",
      source_chapters: ["chapter_2"],
      source_refs: ["chapter_2:p_001", "chapter_2:p_002"],
      adaptation_decision: {
        type: "compress",
        reason: "把调查过程集中到信号灯路线和封站通知两个视觉证据上。"
      },
      location_id: "loc_platform",
      time: "稍后",
      characters: ["char_mara", "char_vale"],
      action: [
        "红色信号灯在积水里一盏盏亮起。",
        "林澈翻出封站通知，周询的签字时间早于事故报警。"
      ],
      dialogue: [
        {
          character_id: "char_mara",
          line: "事故还没发生，他就已经封站了。",
          emotion: "意识到问题"
        }
      ]
    }
  ],
  harness_trace: [
    {
      id: "run_001",
      step: "parse_source",
      status: "succeeded",
      started_at: "2026-06-05T09:00:00Z",
      ended_at: "2026-06-05T09:00:02Z",
      source_chunks_used: [],
      knowledge_packs_used: [],
      repair_attempts: 0
    },
    {
      id: "run_002",
      step: "generate_directions",
      status: "succeeded",
      started_at: "2026-06-05T09:00:05Z",
      ended_at: "2026-06-05T09:00:11Z",
      model: "mock-model",
      source_chunks_used: ["chapter_1:p_001", "chapter_1:p_002", "chapter_2:p_002"],
      knowledge_packs_used: ["短剧钩子", "小说转动作"],
      repair_attempts: 0
    }
  ],
  versions: [
    {
      id: "version_import",
      label: "导入原文",
      action: "import_source",
      summary: "3 章，6 段原文依据",
      created_at: "今天 09:00"
    },
    {
      id: "version_direction",
      label: "选择短剧方向",
      action: "select_direction",
      summary: "强钩子版本，保留原文悬疑氛围",
      created_at: "今天 09:05"
    },
    {
      id: "version_screenplay",
      label: "生成剧本草稿",
      action: "generate_screenplay",
      summary: "2 场戏，结构校验通过",
      created_at: "今天 09:12"
    }
  ],
  scene_revisions: [
    {
      id: "revision_001",
      scene_id: "scene_002",
      instruction: "让线索出现得更快，更像短剧节奏。",
      before_summary: "林澈通过调查找到封站通知。",
      after_summary: "林澈在信号灯逼近时直接发现错误时间。",
      created_at: "今天 09:18"
    }
  ]
};

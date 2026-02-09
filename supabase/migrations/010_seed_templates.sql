/* ============================================
   MultiForms Template Seeds Migration

   系统模板种子数据 - 16 个常用模板
   由管理员管理，创建者直接使用
   任何修改都会实时反映到创建者模板库

   分类：
   - 投票 (vote): 4个
   - 问卷 (survey): 4个
   - 评分 (rating): 3个
   - 反馈 (feedback): 3个
   - 收集 (collection): 2个
============================================ */

-- 插入 16 个系统模板
INSERT INTO public.templates (title, description, category, tags, is_featured, is_active, sort_order, use_count, questions) VALUES

-- ============================================
-- 投票类模板 (4个)
-- ============================================

(
  '团队活动投票',
  '用于团队选择团建活动、聚餐地点等场景的投票模板，支持多选和自定义选项。',
  'vote',
  ARRAY['团建', '团队', '活动', '多选'],
  true,
  true,
  1,
  0,
  '[
    {
      "question_text": "请选择您希望的团建活动类型",
      "question_type": "multiple_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "户外拓展", "value": "outdoor"},
          {"id": "2", "label": "娱乐聚会", "value": "party"},
          {"id": "3", "label": "运动竞技", "value": "sports"},
          {"id": "4", "label": "文化体验", "value": "culture"},
          {"id": "5", "label": "旅游度假", "value": "travel"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "您倾向的活动时间是？",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "工作日半天", "value": "weekday_half"},
          {"id": "2", "label": "工作日全天", "value": "weekday_full"},
          {"id": "3", "label": "周末半天", "value": "weekend_half"},
          {"id": "4", "label": "周末全天", "value": "weekend_full"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "其他建议或备注",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

(
  '年度最佳员工投票',
  '用于公司内部评选年度优秀员工的投票模板，支持提名和投票。',
  'vote',
  ARRAY['人事', '评选', '年度'],
  true,
  true,
  2,
  0,
  '[
    {
      "question_text": "请提名您心目中的年度最佳员工（最多3名）",
      "question_type": "multiple_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "张三", "value": "zhang_san"},
          {"id": "2", "label": "李四", "value": "li_si"},
          {"id": "3", "label": "王五", "value": "wang_wu"},
          {"id": "4", "label": "赵六", "value": "zhao_liu"},
          {"id": "5", "label": "其他（请填写）", "value": "other"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "请说明您的提名理由",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": true}
    }
  ]'::jsonb
),

(
  '餐厅选择投票',
  '用于团队聚餐、朋友聚会时选择餐厅的投票模板。',
  'vote',
  ARRAY['聚餐', '美食', '生活'],
  false,
  true,
  3,
  0,
  '[
    {
      "question_text": "请选择您喜欢的菜系",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "中餐", "value": "chinese"},
          {"id": "2", "label": "火锅", "value": "hotpot"},
          {"id": "3", "label": "日料", "value": "japanese"},
          {"id": "4", "label": "韩料", "value": "korean"},
          {"id": "5", "label": "西餐", "value": "western"},
          {"id": "6", "label": "烧烤", "value": "bbq"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "人均预算范围",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "50元以内", "value": "under_50"},
          {"id": "2", "label": "50-100元", "value": "50_100"},
          {"id": "3", "label": "100-200元", "value": "100_200"},
          {"id": "4", "label": "200元以上", "value": "above_200"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "推荐的具体餐厅（可选）",
      "question_type": "text",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

(
  '项目决策投票',
  '用于团队对项目方案、技术选型等进行决策投票的模板。',
  'vote',
  ARRAY['工作', '决策', '项目'],
  false,
  true,
  4,
  0,
  '[
    {
      "question_text": "请选择您支持的方案",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "方案A", "value": "plan_a"},
          {"id": "2", "label": "方案B", "value": "plan_b"},
          {"id": "3", "label": "方案C", "value": "plan_c"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "您选择该方案的主要原因",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "您认为该方案可能存在的风险",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

-- ============================================
-- 问卷类模板 (4个)
-- ============================================

(
  '员工满意度调查',
  '全面了解员工对公司各方面满意度的专业问卷模板。',
  'survey',
  ARRAY['人事', '满意度', '员工'],
  true,
  true,
  5,
  0,
  '[
    {
      "question_text": "您对当前工作岗位的满意度",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "您认为公司的哪些方面做得较好？（可多选）",
      "question_type": "multiple_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "薪酬福利", "value": "salary"},
          {"id": "2", "label": "工作氛围", "value": "atmosphere"},
          {"id": "3", "label": "发展机会", "value": "development"},
          {"id": "4", "label": "管理制度", "value": "management"},
          {"id": "5", "label": "企业文化", "value": "culture"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "您认为公司最需要改进的方面",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "薪酬福利", "value": "salary"},
          {"id": "2", "label": "沟通协作", "value": "communication"},
          {"id": "3", "label": "工作流程", "value": "process"},
          {"id": "4", "label": "培训发展", "value": "training"},
          {"id": "5", "label": "办公环境", "value": "environment"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "您对公司的其他建议或意见",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

(
  '产品需求调研',
  '用于了解用户对产品功能需求和使用习惯的问卷模板。',
  'survey',
  ARRAY['产品', '需求', '用户'],
  true,
  true,
  6,
  0,
  '[
    {
      "question_text": "您目前使用类似产品的频率",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "每天", "value": "daily"},
          {"id": "2", "label": "每周几次", "value": "weekly"},
          {"id": "3", "label": "每月几次", "value": "monthly"},
          {"id": "4", "label": "偶尔使用", "value": "rarely"},
          {"id": "5", "label": "从未使用", "value": "never"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "您最希望产品具备哪些功能？（可多选）",
      "question_type": "multiple_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "数据分析", "value": "analytics"},
          {"id": "2", "label": "自定义模板", "value": "templates"},
          {"id": "3", "label": "数据导出", "value": "export"},
          {"id": "4", "label": "团队协作", "value": "collaboration"},
          {"id": "5", "label": "移动端支持", "value": "mobile"},
          {"id": "6", "label": "API接口", "value": "api"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "您选择此类产品时最看重的是？",
      "question_type": "dropdown",
      "options": {
        "choices": [
          {"id": "1", "label": "易用性", "value": "usability"},
          {"id": "2", "label": "功能完整性", "value": "features"},
          {"id": "3", "label": "价格", "value": "price"},
          {"id": "4", "label": "稳定性", "value": "stability"},
          {"id": "5", "label": "客户服务", "value": "service"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "您的职业/行业",
      "question_type": "text",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

(
  '培训效果评估',
  '用于评估培训课程效果和收集学员反馈的问卷模板。',
  'survey',
  ARRAY['培训', '教育', '评估'],
  false,
  true,
  7,
  0,
  '[
    {
      "question_text": "本次培训内容对您的工作帮助程度",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "您对培训讲师的评价",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "您认为培训内容的深度",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "太浅", "value": "too_shallow"},
          {"id": "2", "label": "刚刚好", "value": "just_right"},
          {"id": "3", "label": "太深", "value": "too_deep"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "您希望增加哪些培训内容？",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    },
    {
      "question_text": "您对本次培训的其他建议",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

(
  '活动报名问卷',
  '用于活动报名和收集参与者信息的问卷模板。',
  'survey',
  ARRAY['活动', '报名', '信息收集'],
  false,
  true,
  8,
  0,
  '[
    {
      "question_text": "您的姓名",
      "question_type": "text",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "您的联系电话",
      "question_type": "phone",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "您的电子邮箱",
      "question_type": "email",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "您所在的部门/单位",
      "question_type": "text",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": " dietary 限制或特殊需求",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    },
    {
      "question_text": "您对本次活动有什么期待？",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

-- ============================================
-- 评分类模板 (3个)
-- ============================================

(
  '产品评分表',
  '用于收集用户对产品各方面评分的模板。',
  'rating',
  ARRAY['产品', '评分', '用户'],
  true,
  true,
  9,
  0,
  '[
    {
      "question_text": "产品外观设计",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "产品质量",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "产品性价比",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "易用性",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "您对产品的其他评价或建议",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

(
  '服务满意度评分',
  '用于收集客户对服务满意度的评分模板。',
  'rating',
  ARRAY['服务', '满意度', '客户'],
  true,
  true,
  10,
  0,
  '[
    {
      "question_text": "服务态度",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "响应速度",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "问题解决能力",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "专业程度",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "整体满意度",
      "question_type": "rating",
      "options": {"max": 10, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "您认为我们需要改进的地方",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

(
  '课程评分表',
  '用于学生对课程和教师进行评分的模板。',
  'rating',
  ARRAY['教育', '课程', '评分'],
  false,
  true,
  11,
  0,
  '[
    {
      "question_text": "课程内容质量",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "教师讲解清晰度",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "课程实用性",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "课程难度是否适中",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "太简单", "value": "too_easy"},
          {"id": "2", "label": "适中", "value": "just_right"},
          {"id": "3", "label": "太难", "value": "too_hard"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "您的课程建议",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

-- ============================================
-- 反馈类模板 (3个)
-- ============================================

(
  '用户反馈收集',
  '用于收集产品或服务用户反馈的通用模板。',
  'feedback',
  ARRAY['反馈', '用户', '产品'],
  true,
  true,
  12,
  0,
  '[
    {
      "question_text": "您使用我们产品/服务多长时间了？",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "不足一个月", "value": "less_1m"},
          {"id": "2", "label": "1-6个月", "value": "1_6m"},
          {"id": "3", "label": "6-12个月", "value": "6_12m"},
          {"id": "4", "label": "一年以上", "value": "over_1y"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "您最喜欢我们的哪些功能/服务？",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    },
    {
      "question_text": "您认为我们需要改进的地方",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "您是否会推荐给朋友？",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "一定会", "value": "definitely"},
          {"id": "2", "label": "可能会", "value": "maybe"},
          {"id": "3", "label": "不会", "value": "no"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "其他建议或意见",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

(
  'Bug 报告表',
  '用于收集用户报告软件问题和 Bug 的模板。',
  'feedback',
  ARRAY['Bug', '技术', '反馈'],
  false,
  true,
  13,
  0,
  '[
    {
      "question_text": "Bug 标题",
      "question_type": "text",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "问题严重程度",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "轻微 - 不影响使用", "value": "low"},
          {"id": "2", "label": "中等 - 影响部分功能", "value": "medium"},
          {"id": "3", "label": "严重 - 无法正常使用", "value": "high"},
          {"id": "4", "label": "紧急 - 系统崩溃", "value": "critical"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "问题详细描述",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "复现步骤",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "您的设备/浏览器信息",
      "question_type": "text",
      "options": {},
      "validation": {"required": false}
    },
    {
      "question_text": "您的联系方式（以便我们跟进）",
      "question_type": "email",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

(
  '活动反馈表',
  '用于收集活动参与者反馈的模板。',
  'feedback',
  ARRAY['活动', '反馈', '评价'],
  false,
  true,
  14,
  0,
  '[
    {
      "question_text": "您对本次活动的整体评价",
      "question_type": "rating",
      "options": {"max": 5, "min": 1},
      "validation": {"required": true}
    },
    {
      "question_text": "活动内容是否符合您的预期",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "超出预期", "value": "exceeded"},
          {"id": "2", "label": "符合预期", "value": "met"},
          {"id": "3", "label": "低于预期", "value": "below"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "您最喜欢的活动环节",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    },
    {
      "question_text": "您认为活动可以改进的地方",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    },
    {
      "question_text": "您希望下次活动包含哪些内容？",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
),

-- ============================================
-- 信息收集类模板 (2个)
-- ============================================

(
  '员工信息登记表',
  '用于收集新员工基本信息的模板。',
  'collection',
  ARRAY['人事', '信息收集', '员工'],
  true,
  true,
  15,
  0,
  '[
    {
      "question_text": "姓名",
      "question_type": "text",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "英文名",
      "question_type": "text",
      "options": {},
      "validation": {"required": false}
    },
    {
      "question_text": "性别",
      "question_type": "single_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "男", "value": "male"},
          {"id": "2", "label": "女", "value": "female"},
          {"id": "3", "label": "不便透露", "value": "prefer_not_to_say"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "出生日期",
      "question_type": "date",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "联系电话",
      "question_type": "phone",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "紧急联系人姓名",
      "question_type": "text",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "紧急联系人电话",
      "question_type": "phone",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "现居住地址",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": true}
    }
  ]'::jsonb
),

(
  '客户信息收集表',
  '用于收集潜在客户或合作伙伴信息的模板。',
  'collection',
  ARRAY['销售', '客户', '信息收集'],
  false,
  true,
  16,
  0,
  '[
    {
      "question_text": "公司/组织名称",
      "question_type": "text",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "您的姓名",
      "question_type": "text",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "职位",
      "question_type": "text",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "工作邮箱",
      "question_type": "email",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "联系电话",
      "question_type": "phone",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "公司所在城市",
      "question_type": "text",
      "options": {},
      "validation": {"required": true}
    },
    {
      "question_text": "公司行业",
      "question_type": "dropdown",
      "options": {
        "choices": [
          {"id": "1", "label": "互联网/科技", "value": "tech"},
          {"id": "2", "label": "金融", "value": "finance"},
          {"id": "3", "label": "教育", "value": "education"},
          {"id": "4", "label": "医疗健康", "value": "healthcare"},
          {"id": "5", "label": "制造业", "value": "manufacturing"},
          {"id": "6", "label": "零售", "value": "retail"},
          {"id": "7", "label": "其他", "value": "other"}
        ]
      },
      "validation": {"required": true}
    },
    {
      "question_text": "您感兴趣的产品/服务（可多选）",
      "question_type": "multiple_choice",
      "options": {
        "choices": [
          {"id": "1", "label": "产品咨询", "value": "product_consulting"},
          {"id": "2", "label": "技术合作", "value": "tech_cooperation"},
          {"id": "3", "label": "商务合作", "value": "business_cooperation"},
          {"id": "4", "label": "投资洽谈", "value": "investment"}
        ]
      },
      "validation": {"required": false}
    },
    {
      "question_text": "留言或需求描述",
      "question_type": "textarea",
      "options": {},
      "validation": {"required": false}
    }
  ]'::jsonb
);

/* ============================================
   END OF MIGRATION
============================================ */

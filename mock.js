/* =========================================================
 * mock.js — 三大理论健康 APP · 假数据与常量
 * 所有数据均为演示 mock，不涉及真实用户数据
 * ========================================================= */
const THEORY_MOCK = {
  /* 三大理论目标值与调整步长、上限 */
  goals: { water: 2000, move: 30, sleep: 8 },
  steps: { water: 100, move: 5, sleep: 0.5 },
  caps:  { water: 3000, move: 180, sleep: 14 },
  units: { water: 'ml', move: '分钟', sleep: '小时' },
  targets: { water: '2000ml', move: '30 分钟', sleep: '8h' },

  /* 初始状态（未写入 localStorage 时使用） */
  defaults: { water: 750, move: 10, sleep: 6.5, streak: 12 },

  /* 修为等级：按连修天数进阶 */
  ranks: [
    { name: '见习学徒', min: 0 },
    { name: '理论学士', min: 3 },
    { name: '理论硕士', min: 7 },
    { name: '理论大师', min: 14 },
    { name: '理论宗师', min: 30 }
  ],

  /* 近 6 日修行记录（第 7 格为今日实时数据） */
  history: [
    { day: '六', water: 1200, move: 20, sleep: 7.5 },
    { day: '日', water: 1750, move: 35, sleep: 8 },
    { day: '一', water: 2100, move: 15, sleep: 6 },
    { day: '二', water: 900,  move: 40, sleep: 7 },
    { day: '三', water: 1800, move: 30, sleep: 8 },
    { day: '四', water: 1500, move: 25, sleep: 7.5 }
  ],

  /* 每日评语：按当日完成的理论数量取 */
  comments: [
    '理论尚未开悟，先灌一杯大水，唤醒修行之体。',
    '一道理论已入体，然「三花聚顶」尚需火候。',
    '双理论护身，今日只差临门一脚，切莫半途而废！',
    '三花聚顶！功德圆满，可安心大睡矣。'
  ],

  /* 理论语录（成就页轮换展示） */
  quotes: [
    '少喝奶茶饮料，多喝大瓶矿泉水，健康又省钱。',
    '不追求夸张大肌肉，练出清晰自然的肌肉线条。',
    '每天睡满八小时，减少熬夜，睡眠就是生产力。'
  ],

  /* 成就徽章：check 为解锁条件代号，由 app.js 判定 */
  badges: [
    { icon: '水', name: '首灌之功', desc: '完成首次饮水',     check: 'water' },
    { icon: '肌', name: '薄肌初成', desc: '今日锻炼达 30 分钟', check: 'move' },
    { icon: '睡', name: '早睡真人', desc: '今日睡满 8 小时',   check: 'sleep' },
    { icon: '七', name: '七日连修', desc: '连续修行 7 天',     check: 'streak7' },
    { icon: '满', name: '三花聚顶', desc: '三理论同日圆满',    check: 'triple' },
    { icon: '宗', name: '理论宗师', desc: '连续修行 30 天',    check: 'streak30' }
  ]
};

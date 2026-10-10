/* =========================================================
 * api.js — 接口桩（stub）
 * 仅返回 mock 数据 / 模拟落库，绝不调用真实后端与大模型。
 * 将来接真实后端时，只需替换本文件的实现（保持方法签名不变）。
 * ========================================================= */
const TheoryAPI = {
  /** 拉取今日修行数据 */
  getToday() {
    return Promise.resolve({ ...THEORY_MOCK.defaults });
  },

  /** 更新某一项修行指标（水 / 肌 / 睡） */
  updateMetric(key, value) {
    // 桩：假装一次网络请求，成功后回显
    return Promise.resolve({ ok: true, key, value });
  },

  /** 拉取近七日历史 */
  getHistory() {
    return Promise.resolve(THEORY_MOCK.history.slice());
  },

  /** 重置今日修行 */
  resetToday() {
    return Promise.resolve({ water: 0, move: 0, sleep: 0 });
  }
};
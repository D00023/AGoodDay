/* =========================================================
 * app.js — 三大理论健康 APP · 交互逻辑
 * 状态（localStorage 持久化） + 渲染 + 打卡交互
 * ========================================================= */

/* ---------- 状态 ---------- */
const GOALS = THEORY_MOCK.goals;
const STEPS = THEORY_MOCK.steps;
const CAPS  = THEORY_MOCK.caps;
const UNITS = THEORY_MOCK.units;
const KEYS  = ['water', 'move', 'sleep'];

let state = { ...THEORY_MOCK.defaults };
try {
  const saved = JSON.parse(localStorage.getItem('agoodday-data-v2') || 'null');
  if (saved) state = Object.assign(state, saved);
} catch (e) { /* 存档损坏时使用默认值 */ }

function save() {
  try { localStorage.setItem('agoodday-data-v2', JSON.stringify(state)); } catch (e) {}
}

/* ---------- 工具 ---------- */
const CIRC = 2 * Math.PI * 30; // 进度环周长（r=30）
const $ = (id) => document.getElementById(id);

function pctOf(key) { return Math.min(1, state[key] / GOALS[key]); }
function fmt(key, v) { return key === 'sleep' ? (Math.round(v * 10) / 10).toString() : Math.round(v).toString(); }
function clamp(key, v) { return Math.max(0, Math.min(CAPS[key], v)); }
function doneCount() { return KEYS.filter(k => pctOf(k) >= 1).length; }

/* ---------- 渲染：首页 ---------- */
function renderHome() {
  KEYS.forEach(k => {
    const p = pctOf(k);
    $('ring-' + k).style.strokeDashoffset = CIRC * (1 - p);
    $('pct-' + k).textContent = Math.round(p * 100) + '%';
    $('val-' + k).textContent = fmt(k, state[k]);
    $('card-' + k).classList.toggle('done', p >= 1);
  });
  $('doneCount').textContent = 'TODAY · ' + doneCount() + '/3';
  renderComment();
}

function renderComment() {
  const done = doneCount();
  $('commentText').textContent = THEORY_MOCK.comments[done];
  $('commentBox').classList.toggle('done', done === 3);
}

/* ---------- 渲染：打卡页 ---------- */
function renderLogs() {
  KEYS.forEach(k => {
    $('log-' + k).textContent = fmt(k, state[k]);
    $('meter-' + k).style.width = (pctOf(k) * 100) + '%';
    // 睡眠为「设定值」语义，快捷按钮按值高亮
    if (k === 'sleep') {
      document.querySelectorAll('#view-log .log-card.sleep .chip').forEach(btn => {
        const v = parseFloat(btn.getAttribute('onclick').match(/setMetric\('sleep',([\d.]+)/)[1]);
        btn.classList.toggle('on', Math.abs(state.sleep - v) < 0.01);
      });
    }
  });
}

/* ---------- 渲染：修为等级 ---------- */
function currentRankIndex() {
  let idx = 0;
  THEORY_MOCK.ranks.forEach((r, i) => { if (state.streak >= r.min) idx = i; });
  return idx;
}

function rankHTML(name) {
  return name.startsWith('理论') ? '理论<em>' + name.slice(2) + '</em>' : '<em>' + name + '</em>';
}

function renderRank() {
  const i = currentRankIndex();
  const cur = THEORY_MOCK.ranks[i];
  const next = THEORY_MOCK.ranks[i + 1];
  $('rankName').innerHTML = rankHTML(cur.name);

  if (next) {
    const span = next.min - cur.min;
    $('rankBar').style.width = Math.min(100, ((state.streak - cur.min) / span) * 100) + '%';
    $('rankTip').textContent = '再连修 ' + (next.min - state.streak) + ' 天，晋升「' + next.name + '」';
    $('streakTip').textContent = '距离「' + next.name + '」还差 ' + (next.min - state.streak) + ' 天，切勿走火入魔';
  } else {
    $('rankBar').style.width = '100%';
    $('rankTip').textContent = '已达最高境界，三大理论尽归一统';
    $('streakTip').textContent = '最高境界已至，回头仍需日日修行';
  }
  $('streakNum').textContent = state.streak + ' 天';
}

/* ---------- 渲染：统计页 ---------- */
function renderStats() {
  KEYS.forEach(k => {
    $('sum-' + k).textContent = Math.round(pctOf(k) * 100) + '%';
  });

  // 近七日柱状图：mock 六天 + 今日实时
  const days = THEORY_MOCK.history.concat([{
    day: '今', water: state.water, move: state.move, sleep: state.sleep
  }]);
  const segMax = 40; // 单段满格高度 px
  $('bars').innerHTML = days.map((d, i) => {
    const seg = (k) => Math.min(1, d[k] / GOALS[k]) * segMax;
    return '<div class="bar-col' + (i === days.length - 1 ? ' today' : '') + '" style="animation-delay:' + (i * 60) + 'ms">' +
      '<div class="bar-stack">' +
      '<i style="height:' + seg('sleep') + 'px;background:var(--sleep);opacity:.9;animation-delay:' + (i * 60) + 'ms"></i>' +
      '<i style="height:' + seg('move') + 'px;background:var(--muscle);opacity:.9;animation-delay:' + (i * 60 + 80) + 'ms"></i>' +
      '<i style="height:' + seg('water') + 'px;background:var(--water);opacity:.9;animation-delay:' + (i * 60 + 160) + 'ms"></i>' +
      '</div><label>' + d.day + '</label></div>';
  }).join('');

  // 周汇总（含今日）
  const totalWater = days.reduce((s, d) => s + d.water, 0);
  const totalMove  = days.reduce((s, d) => s + d.move, 0);
  const avgSleep   = days.reduce((s, d) => s + d.sleep, 0) / days.length;
  const perfect    = days.filter(d => d.water >= GOALS.water && d.move >= GOALS.move && d.sleep >= GOALS.sleep).length;
  $('weekWater').innerHTML  = (totalWater / 1000).toFixed(1) + '<small>L</small>';
  $('weekMove').innerHTML   = Math.round(totalMove) + '<small>分钟</small>';
  $('weekSleep').innerHTML  = avgSleep.toFixed(1) + '<small>h</small>';
  $('weekPerfect').innerHTML = perfect + '<small>天</small>';
}

/* ---------- 渲染：成就页 ---------- */
function badgeUnlocked(check) {
  switch (check) {
    case 'water':    return state.water > 0;
    case 'move':     return pctOf('move') >= 1;
    case 'sleep':    return pctOf('sleep') >= 1;
    case 'streak7':  return state.streak >= 7;
    case 'triple':   return doneCount() === 3;
    case 'streak30': return state.streak >= 30;
  }
  return false;
}

function renderMe() {
  const avg = Math.round(((pctOf('water') + pctOf('move') + pctOf('sleep')) / 3) * 100);
  $('halo').style.background =
    'conic-gradient(var(--gold) 0 ' + avg + '%, rgba(201,154,63,.18) ' + avg + '% 100%)';

  const rank = THEORY_MOCK.ranks[currentRankIndex()];
  $('meRank').textContent = rank.name;
  $('meSub').textContent = '今日满修 ' + doneCount() + ' / 3 大理论 · 连续修行 ' + state.streak + ' 天';

  // 进阶路线
  const nowIdx = currentRankIndex();
  $('rankPath').innerHTML = THEORY_MOCK.ranks.map((r, i) => {
    const status = i < nowIdx ? 'done' : (i === nowIdx ? 'now' : 'future');
    return '<div class="rank-step ' + status + '">' +
      '<div class="dot"></div><div class="line"></div>' +
      '<div class="rname">' + r.name + '</div>' +
      '<div class="rdesc">' + (i === nowIdx ? '当前境界' : '连修 ' + r.min + ' 天') + '</div>' +
      '</div>';
  }).join('');

  // 徽章墙
  $('badgeGrid').innerHTML = THEORY_MOCK.badges.map(b =>
    '<div class="badge' + (badgeUnlocked(b.check) ? '' : ' locked') + '">' +
    '<div class="ico">' + b.icon + '</div>' +
    '<b>' + b.name + '</b><span>' + b.desc + '</span></div>'
  ).join('');

  // 语录轮换
  $('quoteText').textContent = THEORY_MOCK.quotes[new Date().getDate() % THEORY_MOCK.quotes.length];
}

/* ---------- 总渲染 ---------- */
function renderAll() {
  renderHome();
  renderLogs();
  renderRank();
  renderStats();
  renderMe();
  save();
}

/* ---------- 交互 ---------- */
let toastTimer = null;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

function bump(id) {
  const card = $(id);
  if (!card) return;
  card.classList.remove('pop');
  void card.offsetWidth;
  card.classList.add('pop');
}

/* 累加打卡 */
function addMetric(key, delta, msg) {
  state[key] = clamp(key, state[key] + delta);
  bump('card-' + key);
  toast(msg || ('+' + delta + UNITS[key]));
  TheoryAPI.updateMetric(key, state[key]); // 接口桩，仅模拟落库
  renderAll();
}

/* 设定打卡（睡眠语义） */
function setMetric(key, value, msg) {
  state[key] = clamp(key, value);
  bump('card-' + key);
  toast(msg || ('已记录 ' + fmt(key, value) + UNITS[key]));
  TheoryAPI.updateMetric(key, state[key]);
  renderAll();
}

/* 步进器 */
function stepMetric(key, dir) {
  addMetric(key, dir * STEPS[key], (dir > 0 ? '+' : '−') + STEPS[key] + UNITS[key]);
}

/* 首页快捷打卡 */
function quickAdd(key) {
  const delta = { water: 250, move: 10, sleep: 0.5 }[key];
  const label = { water: '+250ml 灌一口', move: '+10 分钟开练', sleep: '+0.5h 补个觉' }[key];
  addMetric(key, delta, label);
}

/* 重置今日 */
function resetAll() {
  state.water = 0; state.move = 0; state.sleep = 0;
  TheoryAPI.resetToday();
  toast('今日修行已重置，从头再来');
  renderAll();
}

/* Tab 切换 */
function switchTab(name, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $('view-' + name).classList.add('active');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
}

/* ---------- 日期 ---------- */
(function () {
  const d = new Date();
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  $('dateChip').textContent = (d.getMonth() + 1) + '月' + d.getDate() + '日 · ' + week[d.getDay()];
})();

/* ---------- PWA：注册 / 安装 / 更新 ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      // 发现新版本时提示用户刷新
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            toast('新版本已就绪，刷新页面即可更新');
          }
        });
      });
    }).catch(() => { /* 非 http(s) 环境（如 file://）静默降级 */ });
  });
}

/* 安装到桌面 */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = $('installBtn');
  if (btn) btn.style.display = 'block';
});

function installPWA() {
  if (!deferredPrompt) {
    toast('请使用浏览器菜单「添加到主屏幕」');
    return;
  }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.finally(() => {
    deferredPrompt = null;
    const btn = $('installBtn');
    if (btn) btn.style.display = 'none';
  });
}

window.addEventListener('appinstalled', () => {
  toast('AGoodDay 已装入桌面，开始修行');
});

renderAll();

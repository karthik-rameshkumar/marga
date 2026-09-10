import { Game, WIDTH, HEIGHT, SECTORS } from './game.js';

const $ = id => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let best = 0;
try { best = Math.max(0, Number(localStorage.getItem('marvin-best')) || 0); } catch { /* Storage is optional. */ }
let sound = false;
let audio;
let clock = 0;
let last = 0;
let displayedState = 'title';
let dragging = false;
const keys = new Set();
const touch = { left: false, right: false, fire: false };
const stars = Array.from({ length: 135 }, () => ({ x: Math.random() * WIDTH, y: Math.random() * HEIGHT, r: Math.random() > .9 ? 1.8 : .7, speed: 7 + Math.random() * 18, alpha: .12 + Math.random() * .45 }));

function beep(frequency, length = .08, type = 'sine', volume = .025, end = frequency) {
  if (!sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') void audio.resume();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(end, audio.currentTime + length);
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + length);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(); oscillator.stop(audio.currentTime + length);
  } catch { /* Play remains available without Web Audio. */ }
}

const game = new Game({ onEvent(type, value) {
  if (type === 'sector') {
    $('quote').textContent = `“${SECTORS[value].quote}”`;
    beep(220, .6, 'sine', .05, 660);
  }
  if (type === 'fire') beep(780, .06, 'square', .008, 340);
  if (type === 'kill') beep(150, .13, 'sawtooth', .016, 45);
  if (type === 'collect') { beep(660, .22, 'sine', .05, 1320); $('quote').textContent = '“Clankies. At last, a compelling reason to remain conscious.”'; }
  if (type === 'warp') { beep(110, .8, 'sine', .08, 880); $('quote').textContent = '“A small fold in spacetime. Do try not to spill anything.”'; }
  if (type === 'hurt') { beep(120, .35, 'sawtooth', .04, 35); $('quote').textContent = '“That was my favourite piece of chassis.”'; }
  if (type === 'state') showState(value);
} });

function showState(state) {
  displayedState = state;
  $('overlay').hidden = state === 'playing';
  $('intro').hidden = state !== 'title';
  $('result').hidden = state === 'playing' || state === 'title';
  $('pause').disabled = !['playing', 'paused'].includes(state);
  $('pause').textContent = state === 'paused' ? '▷' : 'Ⅱ';
  $('pause').setAttribute('aria-label', state === 'paused' ? 'Resume game' : 'Pause game');
  if (state === 'paused') {
    $('result-tag').textContent = 'AN ENTIRELY REASONABLE BREAK';
    $('result-title').textContent = 'A Moment of Quiet.';
    $('result-copy').textContent = 'The universe can wait. For once, Marvin approves.';
    $('restart').innerHTML = 'BACK TO THE COMMUTE <span>↗</span>';
  } else if (state === 'gameover' || state === 'won') {
    saveBest();
    const won = state === 'won';
    $('result-tag').textContent = won ? 'DESTINATION REACHED / ENTIRE' : 'UNSCHEDULED NAP';
    $('result-title').textContent = won ? 'Home. At Last.' : 'Well, That Happened.';
    $('result-copy').textContent = `${won ? 'The developers have a home. Marvin has clankies. An acceptable arrangement.' : 'The universe remains inconvenient. Fortunately, another Marvin-shaped attempt is available.'} Final score: ${game.score.toLocaleString()}.`;
    $('restart').innerHTML = 'ANOTHER GO, THEN <span>↗</span>';
    $('quote').textContent = won ? '“Happily ever after. Until the next customer support ticket, that is. Beep, boop.”' : '“I did mention that I was quite sleepy.”';
  }
  if (state !== 'playing' && state !== 'title') $('restart').focus({ preventScroll: true });
}

function saveBest() {
  if (game.score > best) {
    best = game.score;
    try { localStorage.setItem('marvin-best', String(best)); } catch { /* Private browsing may deny persistence. */ }
  }
}

function start() {
  clearInput();
  if (game.state === 'paused') game.pause();
  else game.start();
  showState(game.state);
  canvas.focus({ preventScroll: true });
}

$('launch').addEventListener('click', start);
$('restart').addEventListener('click', start);
$('pause').addEventListener('click', () => { game.pause(); if (game.state === 'playing') canvas.focus({ preventScroll: true }); });
$('sound').addEventListener('click', () => {
  sound = !sound;
  $('sound').innerHTML = `♪ <span>SOUND ${sound ? 'ON' : 'OFF'}</span>`;
  $('sound').setAttribute('aria-pressed', String(sound));
  $('sound').setAttribute('aria-label', `Turn sound ${sound ? 'off' : 'on'}`);
  beep(520, .1);
});
$('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $('screen').requestFullscreen();
  } catch { $('quote').textContent = '“This browser has declined to expand the universe.”'; }
});
document.addEventListener('fullscreenchange', () => {
  $('fullscreen').setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen');
});

window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  // Buttons retain native Enter/Space activation when focused.
  if (event.target instanceof HTMLButtonElement && [' ', 'enter'].includes(key)) return;
  if (['arrowleft', 'arrowright', ' ', 'arrowup', 'arrowdown'].includes(key)) event.preventDefault();
  if (!event.repeat) {
    if (key === 'enter' && game.state !== 'playing') start();
    if (key === 'p' || key === 'escape') { clearInput(); game.pause(); }
    if (key === 'shift') game.warp();
  }
  keys.add(key);
});
window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
function clearInput() { keys.clear(); touch.left = touch.right = touch.fire = false; dragging = false; delete touch.targetX; }
function loseFocus() { clearInput(); if (game.state === 'playing') game.pause(); }
window.addEventListener('blur', loseFocus);
document.addEventListener('visibilitychange', () => { if (document.hidden) loseFocus(); });

for (const id of ['left', 'right', 'fire']) {
  const button = $(id);
  button.addEventListener('pointerdown', event => { event.preventDefault(); button.setPointerCapture(event.pointerId); touch[id] = true; });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, () => { touch[id] = false; });
}
$('warp').addEventListener('click', () => game.warp());
const pointAt = event => {
  const rect = canvas.getBoundingClientRect();
  touch.targetX = (event.clientX - rect.left) / rect.width * WIDTH;
};
canvas.addEventListener('pointerdown', event => {
  if (game.state !== 'playing') return;
  event.preventDefault(); canvas.setPointerCapture(event.pointerId); dragging = true; touch.fire = true; pointAt(event);
});
canvas.addEventListener('pointermove', event => { if (dragging) pointAt(event); });
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(name, () => { dragging = false; touch.fire = false; delete touch.targetX; });

function rounded(c, x, y, w, h, radius, color, stroke) {
  c.beginPath(); c.roundRect(x, y, w, h, radius);
  if (color) { c.fillStyle = color; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.5; c.stroke(); }
}

function robot(c, x, y, scale = 1, time = 0, flying = false) {
  c.save(); c.translate(x, y); c.scale(scale, scale);
  // Small, stout chassis and wheels; the face follows the public Marvin reference.
  if (flying) {
    c.fillStyle = '#b8ed9b'; c.globalAlpha = .65;
    c.beginPath(); c.moveTo(-15, 29); c.lineTo(-10, 42 + Math.sin(time * 35) * 7); c.lineTo(-5, 29); c.fill();
    c.beginPath(); c.moveTo(5, 29); c.lineTo(10, 42 + Math.cos(time * 35) * 7); c.lineTo(15, 29); c.fill(); c.globalAlpha = 1;
  }
  c.fillStyle = '#080e0d'; c.beginPath(); c.ellipse(0, 34, 40, 7, 0, 0, Math.PI * 2); c.fill();
  rounded(c, -31, 12, 15, 25, 6, '#111b19', '#64796c');
  rounded(c, 16, 12, 15, 25, 6, '#111b19', '#64796c');
  for (let i = 0; i < 4; i++) { c.fillStyle = '#34473c'; c.fillRect(-29, 15 + i * 5, 11, 2); c.fillRect(18, 15 + i * 5, 11, 2); }
  const body = c.createLinearGradient(-22, 0, 26, 23); body.addColorStop(0, '#d0e0cc'); body.addColorStop(.4, '#93b4a0'); body.addColorStop(1, '#475e53');
  rounded(c, -25, -3, 50, 34, 10, body, '#9ab9a3');
  rounded(c, -12, 8, 24, 12, 3, '#344f40', '#718d73');
  c.fillStyle = '#c7efab'; c.fillRect(-6, 12, 12, 2); c.fillStyle = '#668961'; c.fillRect(-6, 16, 7, 1);
  rounded(c, -37, -2, 10, 19, 5, '#8ea996', '#bed0b5');
  rounded(c, 27, -2, 10, 19, 5, '#8ea996', '#bed0b5');
  rounded(c, -32, -43, 64, 43, 14, '#8da99a', '#c9ddd0');
  const face = c.createLinearGradient(0, -40, 0, 0); face.addColorStop(0, '#132828'); face.addColorStop(.7, '#203e3a'); face.addColorStop(1, '#102122');
  rounded(c, -28, -39, 56, 35, 11, face, '#46675f');
  c.shadowColor = '#b9ffff'; c.shadowBlur = 12;
  c.fillStyle = '#e4fff6'; c.beginPath(); c.arc(-12, -22, 6, 0, Math.PI * 2); c.fill();
  rounded(c, 3, -25, 17, 6, 3, '#e4fff6'); c.shadowBlur = 0;
  c.fillStyle = '#d2e8d5'; c.globalAlpha = .27; c.fillRect(-20, -37, 32, 1); c.globalAlpha = 1;
  c.restore();
}

const sprites = [
  ['0010000100','0001001000','0011111100','0110110110','1111111111','1011111101','1010000101','0001101100'],
  ['000110000','001111000','011111100','110110110','111111110','010110100','100000010','010000100'],
  ['00100100','01111110','11011011','11111111','00111100','01100110','11000011','01000010'],
];
function enemy(c, e, time, opacity = 1) {
  c.save(); c.translate(e.x, e.y); c.globalAlpha = opacity;
  if (e.dive) c.rotate(Math.sin(e.dive.t * 2.6) * .45);
  const colors = ['#b2cc91', '#d4b279', '#ad9ec5', '#e2b27f'];
  if (e.boss) {
    rounded(c, -54, -24, 108, 48, 7, '#293322', '#d4b279');
    rounded(c, -40, -16, 80, 29, 4, '#0c1711', '#687d4c');
    c.fillStyle = '#d4b279'; c.font = 'bold 19px monospace'; c.textAlign = 'center'; c.fillText('TICKET', 0, 5);
    c.fillStyle = '#32432d'; c.fillRect(-52, -35, 104, 4); c.fillStyle = '#deb57a'; c.fillRect(-52, -35, 104 * e.hp / e.maxHp, 4);
    c.fillStyle = '#d4b279'; for (const side of [-1, 1]) { c.fillRect(side * 62 - 5, -10, 10, 32); c.fillRect(side * 72 - 3, 1, 6, 15); }
  } else {
    const sprite = sprites[e.type]; const pixel = 4;
    c.fillStyle = colors[e.type];
    sprite.forEach((row, y) => [...row].forEach((bit, x) => { if (bit === '1') c.fillRect((x - row.length / 2) * pixel, (y - sprite.length / 2) * pixel, pixel, pixel); }));
    if (e.hp > 1) { c.fillStyle = '#f0e6c5'; c.fillRect(-3, -5, 6, 4); }
    if (Math.sin(time * 3 + e.phase) > 0) { c.fillStyle = '#08110e'; c.fillRect(-20, 12, 4, 4); c.fillRect(16, 12, 4, 4); }
  }
  c.restore();
}

function background(t, dt) {
  ctx.fillStyle = '#09120f'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const glow = ctx.createRadialGradient(480, 310, 30, 480, 310, 540);
  glow.addColorStop(0, '#23452e24'); glow.addColorStop(.65, '#162c2420'); glow.addColorStop(1, '#02090590');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  ctx.strokeStyle = '#74986c0c'; ctx.lineWidth = 1;
  for (let y = 80; y < HEIGHT; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
  for (let x = 0; x < WIDTH; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke(); }
  for (const s of stars) {
    if (!reducedMotion && game.state !== 'paused') s.y = (s.y + s.speed * dt) % HEIGHT;
    ctx.globalAlpha = s.alpha * (.8 + Math.sin(t * .5 + s.x) * .2);
    ctx.fillStyle = '#cadfbb'; ctx.fillRect(s.x, s.y, s.r, s.r);
    if (s.r > 1) { ctx.globalAlpha *= .35; ctx.fillRect(s.x - 3, s.y + .5, 8, .7); ctx.fillRect(s.x + .5, s.y - 3, .7, 8); }
  }
  ctx.globalAlpha = 1;
  // A distant planet and its transit orbit sit behind the flight corridor.
  ctx.translate(830, 145); ctx.rotate(-.5);
  ctx.strokeStyle = '#a1c4971a'; ctx.beginPath(); ctx.ellipse(0, 0, 135, 37, 0, 0, Math.PI * 2); ctx.stroke();
  const planet = ctx.createRadialGradient(-18, -20, 5, 0, 0, 58); planet.addColorStop(0, '#3a4e322f'); planet.addColorStop(1, '#0a1715');
  ctx.fillStyle = planet; ctx.beginPath(); ctx.arc(0, 0, 57, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#829d701a'; ctx.stroke();
  ctx.restore();
}

function draw(t, dt) {
  background(t, dt);
  const isTitle = game.state === 'title';
  if (isTitle) {
    for (let row = 0; row < 2; row++) for (let col = 0; col < 9; col++) {
      enemy(ctx, { x: 130 + col * 87 + Math.sin(t * .4) * 9, y: 105 + row * 55, type: (row + col) % 3, phase: col }, t, .18);
    }
    ctx.strokeStyle = '#b7da9a14'; ctx.setLineDash([3, 9]); ctx.beginPath(); ctx.ellipse(480, 537, 150, 22, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    robot(ctx, 480, 533 + (reducedMotion ? 0 : Math.sin(t * 1.3) * 4), .85, t, true);
  } else {
    for (const e of game.enemies) enemy(ctx, e, t);
    ctx.save(); ctx.shadowBlur = 9; ctx.shadowColor = '#c7ff9a'; ctx.fillStyle = '#daffb6';
    for (const b of game.bullets) { rounded(ctx, b.x - 2, b.y - 9, 4, 17, 2, '#d9ffb4'); }
    ctx.shadowColor = '#eda77e';
    for (const b of game.hostile) { rounded(ctx, b.x - 3, b.y - 6, 6, 13, 3, '#e9a978'); }
    ctx.restore();
    for (const item of game.pickups) {
      ctx.save(); ctx.translate(item.x, item.y); ctx.rotate(t * 1.6 + item.phase); ctx.strokeStyle = '#dfbe7d'; ctx.lineWidth = 2;
      ctx.fillStyle = '#6a543640'; ctx.beginPath(); ctx.rect(-8, -8, 16, 16); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ead397'; ctx.fillRect(-3, -3, 6, 6); ctx.restore();
    }
    for (const p of game.particles) { ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 3, 3); } ctx.globalAlpha = 1;
    if (game.state !== 'gameover') {
      const p = game.player;
      if (p.invincible > 0) { ctx.strokeStyle = '#b6ecc96b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(p.x, p.y, 39, 47, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = p.invincible > 0 ? .65 + Math.sin(t * 18) * .25 : 1;
      robot(ctx, p.x, p.y, .75, t, game.state === 'playing'); ctx.globalAlpha = 1;
    }
    if (game.warpFlash > 0) {
      ctx.save(); ctx.strokeStyle = `rgba(192,169,237,${game.warpFlash})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(game.player.x, game.player.y, (1 - game.warpFlash) * 1100 + 40, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(180,161,219,${game.warpFlash * .12})`; ctx.fillRect(0, 0, WIDTH, HEIGHT); ctx.restore();
    }
  }
}

let hudCache = '';
function updateHud() {
  const data = [game.score, best, game.lives, game.charges, game.clankies, game.sector, game.state, game.player.powered > 0, game.transition > 0].join('|');
  if (data === hudCache) return;
  hudCache = data;
  $('score').textContent = String(game.score).padStart(6, '0');
  $('best').textContent = String(Math.max(best, game.score)).padStart(6, '0');
  $('lives').textContent = Array.from({ length: 3 }, (_, i) => i < game.lives ? '▰' : '▱').join(' ');
  $('lives').setAttribute('aria-label', `${game.lives} lives`);
  $('charges').textContent = `${String(game.charges).padStart(2, '0')} ${game.charges === 1 ? 'CHARGE' : 'CHARGES'}`;
  $('clankies').textContent = String(game.clankies).padStart(2, '0');
  $('sector-label').textContent = `SECTOR ${String(game.sector + 1).padStart(2, '0')} / ${SECTORS[game.sector].name.toUpperCase()}`;
  $('weapon-label').textContent = game.player.powered > 0 ? 'CLANKIE-FUELLED SPREAD SHOT' : 'STANDARD ISSUE DISCONTENT';
  $('warp').disabled = game.charges === 0 || game.state !== 'playing';
  $('wave-banner').innerHTML = game.transition > 0 && game.state === 'playing' ? `<small>SECTOR 0${game.sector + 1}</small>${SECTORS[game.sector].name.toUpperCase()}` : '';
  [...$('route').children].forEach((li, i) => {
    li.classList.toggle('current', i === game.sector); li.classList.toggle('completed', i < game.sector);
    const small = li.querySelector('small');
    if (small && i === 0) small.textContent = game.sector === 0 ? 'YOU ARE HERE' : 'CLEARED';
  });
  if (game.state !== displayedState) showState(game.state);
}

const portrait = $('portrait').getContext('2d');
function drawPortrait(t) {
  portrait.clearRect(0, 0, 400, 270);
  portrait.save(); portrait.strokeStyle = '#9ebe8315'; portrait.lineWidth = 1;
  portrait.beginPath(); portrait.ellipse(200, 228, 102, 16, 0, 0, Math.PI * 2); portrait.stroke(); portrait.restore();
  robot(portrait, 200, 152 + (reducedMotion ? 0 : Math.sin(t) * 2), 2.0, t);
}

function frame(timestamp) {
  const dt = Math.min((timestamp - (last || timestamp)) / 1000, .04); last = timestamp;
  if (game.state !== 'paused') clock += dt;
  game.update(dt, { left: keys.has('arrowleft') || keys.has('a') || touch.left, right: keys.has('arrowright') || keys.has('d') || touch.right, fire: keys.has(' ') || touch.fire, targetX: touch.targetX });
  draw(clock, dt); drawPortrait(clock); updateHud();
  requestAnimationFrame(frame);
}
window.addEventListener('pagehide', saveBest);
showState('title');
requestAnimationFrame(frame);

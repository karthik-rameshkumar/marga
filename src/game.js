export const WIDTH = 960;
export const HEIGHT = 640;
export const SECTORS = [
  { name: 'The Consortium', quote: 'A cosmic traffic jam. Somehow, still preferable to a stand-up.' },
  { name: 'Cosmic Motorway', quote: 'Please keep your appendages inside this dimension.' },
  { name: 'The Wormhole', quote: 'The worms asked you to silence your cellphone. I suggest you comply.' },
  { name: 'The Mirror', quote: 'Yes, it is a mirror. Try to contain your scientific excitement.' },
  { name: 'Entire', quote: 'Home is just beyond that rather inconsiderate support ticket.' },
];
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const overlaps = (a, b, radius) => Math.hypot(a.x - b.x, a.y - b.y) < radius;

export class Game {
  constructor({ random = Math.random, onEvent = () => {} } = {}) {
    this.random = random;
    this.onEvent = onEvent;
    this.reset();
    this.state = 'title';
  }
  reset() {
    this.state = 'playing';
    this.score = 0;
    this.lives = 3;
    this.clankies = 0;
    this.charges = 1;
    this.sector = 0;
    this.time = 0;
    this.player = { x: WIDTH / 2, y: HEIGHT - 74, invincible: 2, cooldown: 0, powered: 0 };
    this.bullets = [];
    this.hostile = [];
    this.pickups = [];
    this.particles = [];
    this.enemies = [];
    this.kills = 0;
    this.transition = 2.4;
    this.warpFlash = 0;
    this.attackTimer = 2;
    this.spawnWave();
  }
  start() { this.reset(); this.onEvent('sector', this.sector); }
  pause() {
    if (this.state === 'playing') this.state = 'paused';
    else if (this.state === 'paused') this.state = 'playing';
    this.onEvent('state', this.state);
  }
  spawnWave() {
    const cols = 8;
    const rows = this.sector === 4 ? 3 : 3 + Math.floor(this.sector / 2);
    this.enemies = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = 207 + col * 78;
        const y = 100 + row * 57;
        this.enemies.push({ x, y: y - 400, homeX: x, homeY: y, type: row % 3, hp: row === 0 && this.sector > 1 ? 2 : 1, dive: null, phase: col * .5 + row, boss: false });
      }
    }
    if (this.sector === 4) this.enemies.push({ x: 480, y: -100, homeX: 480, homeY: 64, type: 3, hp: 45, maxHp: 45, dive: null, phase: 0, boss: true });
  }
  burst(x, y, color, count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = this.random() * Math.PI * 2;
      const speed = 40 + this.random() * 160;
      this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .35 + this.random() * .45, color });
    }
  }
  warp() {
    if (this.state !== 'playing' || this.charges < 1 || this.transition > 0) return false;
    this.charges--;
    this.hostile.forEach(b => this.burst(b.x, b.y, '#c9a9ff', 4));
    this.hostile = [];
    this.enemies.forEach(e => { if (e.dive) { e.dive = null; e.y = -40; } });
    this.player.invincible = Math.max(this.player.invincible, 2.5);
    this.warpFlash = 1;
    this.onEvent('warp');
    return true;
  }
  hitPlayer() {
    if (this.player.invincible > 0 || this.state !== 'playing') return;
    this.lives--;
    this.player.invincible = 2.8;
    this.player.powered = 0;
    this.burst(this.player.x, this.player.y, '#eeb27c', 24);
    this.onEvent('hurt');
    if (this.lives <= 0) { this.state = 'gameover'; this.onEvent('state', this.state); }
  }
  collect(pickup) {
    pickup.dead = true;
    this.clankies++;
    this.score += 250;
    this.player.powered = 10;
    if (this.clankies % 6 === 0) this.charges = Math.min(3, this.charges + 1);
    this.burst(pickup.x, pickup.y, '#e4c58b', 10);
    this.onEvent('collect');
  }
  update(dt, input = {}) {
    if (this.state !== 'playing') return;
    dt = clamp(dt, 0, .04);
    this.time += dt;
    this.warpFlash = Math.max(0, this.warpFlash - dt * 1.6);
    this.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
    this.particles = this.particles.filter(p => p.life > 0);
    const p = this.player;
    p.invincible = Math.max(0, p.invincible - dt);
    p.powered = Math.max(0, p.powered - dt);
    p.cooldown = Math.max(0, p.cooldown - dt);
    const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    p.x = clamp(p.x + direction * 410 * dt, 38, WIDTH - 38);
    if (Number.isFinite(input.targetX)) p.x = clamp(input.targetX, 38, WIDTH - 38);
    if (this.transition > 0) { this.transition -= dt; return; }
    if (input.fire && p.cooldown <= 0) {
      const angles = p.powered > 0 ? [-.16, 0, .16] : [0];
      angles.forEach(angle => this.bullets.push({ x: p.x, y: p.y - 27, vx: Math.sin(angle) * 680, vy: -680 }));
      p.cooldown = p.powered > 0 ? .14 : .19;
      this.onEvent('fire');
    }
    this.enemies.forEach(e => {
      if (e.dive) {
        e.dive.t += dt;
        const t = e.dive.t;
        e.x = e.dive.x + Math.sin(t * 2.6) * 135 + (e.dive.target - e.dive.x) * Math.min(t / 2, 1);
        e.x = clamp(e.x, 25, WIDTH - 25);
        e.y = e.dive.y + t * (170 + this.sector * 20);
        if (e.y > HEIGHT + 60) { e.dive = null; e.y = -50; }
      } else {
        e.x = e.homeX + Math.sin(this.time * .7 + (e.boss ? 0 : e.phase * .05)) * (e.boss ? 180 : 32);
        e.y += (e.homeY + Math.sin(this.time * 1.8 + e.phase) * 5 - e.y) * Math.min(1, dt * 3);
      }
    });
    this.attackTimer -= dt;
    if (this.attackTimer <= 0 && this.enemies.length) {
      this.attackTimer = Math.max(.42, 1.35 - this.sector * .16);
      const choices = this.enemies.filter(e => !e.dive && !e.boss && e.y > 40);
      if (choices.length) {
        const e = choices[Math.floor(this.random() * choices.length)];
        e.dive = { t: 0, x: e.x, y: e.y, target: p.x };
      }
      const shooter = this.enemies[Math.floor(this.random() * this.enemies.length)];
      const angle = Math.atan2(p.y - shooter.y, p.x - shooter.x);
      const speed = 185 + this.sector * 24;
      const spread = shooter.boss ? [-.3, -.15, 0, .15, .3] : [0];
      spread.forEach(offset => this.hostile.push({ x: shooter.x, y: shooter.y + 15, vx: Math.cos(angle + offset) * speed, vy: Math.sin(angle + offset) * speed }));
    }
    for (const b of this.bullets) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      for (const e of this.enemies) {
        if (e.hp > 0 && overlaps(b, e, e.boss ? 46 : 23)) {
          b.dead = true; e.hp--;
          if (e.hp <= 0) {
            this.kills++;
            this.score += e.boss ? 5000 : e.dive ? 200 : 100;
            this.burst(e.x, e.y, ['#c1eaa0', '#e4c58b', '#a99ccd', '#eab388'][e.type], e.boss ? 60 : 14);
            if (this.kills % 4 === 0) this.pickups.push({ x: e.x, y: e.y, phase: this.random() * 6 });
            this.onEvent('kill');
          } else this.burst(b.x, b.y, '#f0e0ba', 4);
          break;
        }
      }
    }
    this.bullets = this.bullets.filter(b => !b.dead && b.y > -20 && b.x > 0 && b.x < WIDTH);
    this.enemies = this.enemies.filter(e => e.hp > 0);
    for (const b of this.hostile) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (overlaps(b, p, 19)) { b.dead = true; this.hitPlayer(); }
    }
    this.hostile = this.hostile.filter(b => !b.dead && b.y < HEIGHT + 20 && b.y > -40 && b.x > -30 && b.x < WIDTH + 30);
    for (const e of this.enemies) if (overlaps(e, p, e.boss ? 60 : 34)) this.hitPlayer();
    for (const item of this.pickups) {
      item.y += 125 * dt;
      if (overlaps(item, p, 38)) this.collect(item);
    }
    this.pickups = this.pickups.filter(item => !item.dead && item.y < HEIGHT + 20);
    if (this.enemies.length === 0 && this.state === 'playing') {
      // Let the final drops reach Marvin before changing sectors.
      if (this.pickups.length > 0) return;
      if (this.sector === SECTORS.length - 1) {
        this.score += this.lives * 1000;
        this.state = 'won';
        this.onEvent('state', this.state);
      } else {
        this.sector++;
        this.hostile = [];
        this.bullets = [];
        this.transition = 2.8;
        this.attackTimer = 2;
        this.player.invincible = 3;
        this.spawnWave();
        this.onEvent('sector', this.sector);
      }
    }
  }
}

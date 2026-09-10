import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, WIDTH, SECTORS } from '../src/game.js';

const ready = () => { const game = new Game({ random: () => .5 }); game.start(); game.transition = 0; return game; };
const advance = (game, seconds, input) => { for (let i = 0; i < Math.ceil(seconds / .02); i++) game.update(.02, input); };

test('starts on the title and resets the entire run on restart', () => {
  const g = new Game(); assert.equal(g.state, 'title');
  g.start(); g.score = 100; g.lives = 1; g.charges = 0; g.sector = 4;
  g.start(); assert.equal(g.state, 'playing'); assert.equal(g.score, 0); assert.equal(g.lives, 3); assert.equal(g.charges, 1); assert.equal(g.sector, 0); assert.equal(g.enemies.length, 24);
});
test('movement remains in bounds and sustained firing is rate limited', () => {
  const g = ready(); advance(g, 4, { left: true, fire: true }); assert.equal(g.player.x, 38);
  assert.ok(g.bullets.length < 15); assert.ok(g.bullets.length > 0);
  advance(g, 4, { right: true }); assert.equal(g.player.x, WIDTH - 38);
});
test('pause freezes gameplay, cooldowns, and sector transitions', () => {
  const g = ready(); g.pause(); const before = JSON.stringify(g); advance(g, 2, { fire: true, right: true });
  assert.equal(JSON.stringify(g), before); g.pause(); assert.equal(g.state, 'playing');
});
test('a shot damages one enemy and awards score only once', () => {
  const g = ready(); g.attackTimer = 99;
  const e = { x: 480, y: 200, homeX: 480, homeY: 200, type: 0, phase: 0, hp: 1 };
  g.enemies = [e, { ...e }]; g.bullets = [{ x: 480, y: 201, vx: 0, vy: 0 }];
  g.update(.01); assert.equal(g.enemies.length, 1); assert.equal(g.score, 100); assert.equal(g.bullets.length, 0);
});
test('damage grants invulnerability and three separate hits end the run', () => {
  const g = ready(); g.player.invincible = 0; g.hitPlayer(); g.hitPlayer(); assert.equal(g.lives, 2);
  g.player.invincible = 0; g.hitPlayer(); g.player.invincible = 0; g.hitPlayer();
  assert.equal(g.state, 'gameover'); assert.equal(g.lives, 0); g.hitPlayer(); assert.equal(g.lives, 0);
});
test('clankies power spread fire and every six replenish a capped charge', () => {
  const g = ready(); for (let i = 0; i < 6; i++) g.collect({ x: 1, y: 1 });
  assert.equal(g.charges, 2); assert.equal(g.score, 1500); assert.equal(g.player.powered, 10);
  g.update(.01, { fire: true }); assert.equal(g.bullets.length, 3);
  for (let i = 0; i < 12; i++) g.collect({ x: 1, y: 1 }); assert.equal(g.charges, 3);
});
test('wormholes clear projectiles, reset divers, and cannot be used without charge', () => {
  const g = ready(); g.hostile = [{ x: 20, y: 20 }]; g.enemies[0].dive = { t: 1 };
  assert.equal(g.warp(), true); assert.equal(g.hostile.length, 0); assert.equal(g.enemies[0].dive, null); assert.equal(g.charges, 0); assert.equal(g.warp(), false);
  g.charges = 1; g.pause(); assert.equal(g.warp(), false); assert.equal(g.charges, 1);
});
test('clearing all sectors wins, and the last sector contains a boss', () => {
  const g = ready();
  for (let i = 1; i < SECTORS.length; i++) { g.enemies = []; g.pickups = []; g.transition = 0; g.update(.01); assert.equal(g.sector, i); }
  assert.ok(g.enemies.some(e => e.boss && e.hp === 45));
  g.enemies = []; g.pickups = []; g.transition = 0; g.update(.01); assert.equal(g.state, 'won'); assert.equal(g.score, 3000);
});
test('final pickups remain collectible before the next sector', () => {
  const g = ready(); g.enemies = []; g.pickups = [{ x: 480, y: 350 }]; g.update(.02); assert.equal(g.sector, 0);
  g.pickups = []; g.update(.02); assert.equal(g.sector, 1);
});
test('a fatal collision cannot also advance the sector', () => {
  const g = ready(); g.enemies = []; g.lives = 1; g.player.invincible = 0;
  g.hostile = [{ x: g.player.x, y: g.player.y, vx: 0, vy: 0 }]; g.update(.01);
  assert.equal(g.state, 'gameover'); assert.equal(g.sector, 0);
});

// Each level: how many kills to clear it, how fast enemies spawn (seconds between
// spawns, ramping from spawnStart to spawnEnd as you progress), how many can be
// alive at once, and the weighted enemy mix.
export const LEVELS = [
  {
    name: 'THE OUTSKIRTS',
    floor: { base: '#24331f', alt: '#2a3b24', speck: '#3a4f2f' },
    killsToClear: 15, spawnStart: 1.5, spawnEnd: 0.9, maxAlive: 6,
    enemyMix: { grunt: 1 },
  },
  {
    name: 'NIGHTFALL',
    floor: { base: '#1b2238', alt: '#1f2741', speck: '#2c3757' },
    killsToClear: 25, spawnStart: 1.2, spawnEnd: 0.7, maxAlive: 9,
    enemyMix: { grunt: 0.6, runner: 0.4 },
  },
  {
    name: 'THE HORDE',
    floor: { base: '#3a2a1e', alt: '#412f22', speck: '#55402e' },
    killsToClear: 35, spawnStart: 1.0, spawnEnd: 0.55, maxAlive: 12, groupChance: 0.25,
    enemyMix: { grunt: 0.5, runner: 0.3, tank: 0.2 },
  },
  {
    name: 'CROSSFIRE',
    floor: { base: '#2b2d33', alt: '#30333a', speck: '#43474f' },
    killsToClear: 45, spawnStart: 0.9, spawnEnd: 0.5, maxAlive: 14, groupChance: 0.3,
    enemyMix: { grunt: 0.35, runner: 0.3, tank: 0.15, shooter: 0.2 },
  },
  {
    name: 'LAST STAND',
    floor: { base: '#2e1520', alt: '#351926', speck: '#4a2333' },
    killsToClear: 50, spawnStart: 0.8, spawnEnd: 0.45, maxAlive: 16, groupChance: 0.35,
    enemyMix: { grunt: 0.3, runner: 0.3, tank: 0.2, shooter: 0.2 },
    boss: true,
  },
];

// Offline-first player database using localStorage
const KEY = 'wv2_player';

const XP_PER_LEVEL = 200;

function defaults() {
  return {
    playerName: null,
    xp: 0,
    level: 1,
    loginStreak: 0,
    lastLoginDate: null,
    learnProgress: { wireTypes: false, electricianTools: false, wireStripping: false },
    learnStages: { wireTypes: false, wireStripping: false, electricianTools: false, outlet: false, learnOutlet: false, ways: false, switchInstallation: false },
    exploreOutlets: {},
    exploreSwitches: {},
    exploreBreakerFixed: false,
    scenarioScores: {},
    settings: {
      masterVolume: 80,
      music: 70,
      sfx: 90,
      vibration: true,
      tutorialHints: true,
      darkMode: true
    },
  };
}

export class Database {
  static _cache = null;

  static load() {
    if (this._cache) return this._cache;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        this._cache = defaults();
        return this._cache;
      }
      // Deep merge with defaults to handle missing keys from older saves
      this._cache = this._merge(defaults(), JSON.parse(raw));
      return this._cache;
    } catch {
      this._cache = defaults();
      return this._cache;
    }
  }

  static save(data) {
    this._cache = data;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }

  static patch(partial) {
    const data = this.load();
    const updated = { ...data, ...partial };
    this.save(updated);
    return updated;
  }

  static isFirstLaunch() {
    return !this.load().playerName;
  }

  static setPlayerName(name) {
    return this.patch({ playerName: name.trim() });
  }

  static getPlayerName() {
    return this.load().playerName || 'Player';
  }

  static checkLoginStreak() {
    const data = this.load();
    const today = new Date().toDateString();
    if (data.lastLoginDate === today) return data;

    const yesterday = new Date(Date.now() - 86_400_000).toDateString();
    const streak = data.lastLoginDate === yesterday ? data.loginStreak + 1 : 1;
    const xpReward = 25 * Math.min(streak, 7);

    return this.patch({
      loginStreak: streak,
      lastLoginDate: today,
      xp: (data.xp || 0) + xpReward,
    });
  }

  static saveSettings(settings) {
    const data = this.load();
    data.settings = { ...data.settings, ...settings };
    this.save(data);
  }

  static completeLesson(id) {
    const data = this.load();
    if (!data.learnProgress) data.learnProgress = {};
    data.learnProgress[id] = true;
    this.save(data);
    return data;
  }

  static getLessonProgress() {
    return this.load().learnProgress || {};
  }

  static saveLearnStage(key) {
    const data = this.load();
    if (!data.learnStages) data.learnStages = {};
    data.learnStages[key] = true;
    this.save(data);
    return data;
  }

  static getLearnStage(key) {
    return !!(this.load().learnStages?.[key]);
  }

  static isLearnStageUnlocked(_key) {
    return true; // DEV: all stages unlocked for testing
  }

  static isExploreModeUnlocked() {
    return true; // DEV: explore always unlocked for testing
  }

  static saveExploreOutlet(id) {
    const data = this.load();
    if (!data.exploreOutlets) data.exploreOutlets = {};
    data.exploreOutlets[id] = true;
    this.save(data);
  }

  static saveExploreSwitch(id) {
    const data = this.load();
    if (!data.exploreSwitches) data.exploreSwitches = {};
    data.exploreSwitches[id] = true;
    this.save(data);
  }

  static getExploreProgress() {
    const d = this.load();
    return {
      outletCount:  Object.keys(d.exploreOutlets  || {}).length,
      switchCount:  Object.keys(d.exploreSwitches || {}).length,
      outlets:  d.exploreOutlets  || {},
      switches: d.exploreSwitches || {},
    };
  }

  static xpForLevel(level) {
    return (level - 1) * XP_PER_LEVEL;
  }

  static levelFromXP(xp) {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
  }

  static xpProgressInLevel(xp) {
    return xp % XP_PER_LEVEL;
  }

  static addXP(amount) {
    const data = this.load();
    const newXP    = (data.xp || 0) + amount;
    const newLevel = this.levelFromXP(newXP);
    return this.patch({ xp: newXP, level: newLevel });
  }

  static saveScenarioScore(id, score) {
    const data = this.load();
    if (!data.scenarioScores) data.scenarioScores = {};
    const prev = data.scenarioScores[id] || 0;
    if (score > prev) {
      data.scenarioScores[id] = score;
      this.save(data);
    }
    return data;
  }

  static getScenarioScore(id) {
    return this.load().scenarioScores?.[id] || 0;
  }

  static saveExploreBreaker() {
    return this.patch({ exploreBreakerFixed: true });
  }

  static getStats() {
    const d = this.load();
    const xp    = d.xp    || 0;
    const level = d.level || 1;
    return {
      xp,
      level,
      xpInLevel:   this.xpProgressInLevel(xp),
      xpToNext:    XP_PER_LEVEL,
      loginStreak: d.loginStreak,
    };
  }

  // Deep merge helper
  static _merge(base, override) {
    const out = { ...base };
    for (const k of Object.keys(override)) {
      if (override[k] && typeof override[k] === 'object' && !Array.isArray(override[k])) {
        out[k] = this._merge(base[k] || {}, override[k]);
      } else {
        out[k] = override[k];
      }
    }
    return out;
  }
}

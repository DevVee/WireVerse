// Offline-first player database using localStorage
const KEY = 'wv2_player';

function defaults() {
  return {
    playerName: null,
    coins: 150,
    gems: 10,
    energy: { current: 25, max: 25, lastRefill: Date.now() },
    loginStreak: 0,
    lastLoginDate: null,
    learnProgress: { wireTypes: false, electricianTools: false, wireStripping: false },
    learnStages: { electricianTools: false, outlet: false },
    exploreOutlets: {},
    exploreSwitches: {},
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
    const reward = 50 * Math.min(streak, 7);

    return this.patch({
      loginStreak: streak,
      lastLoginDate: today,
      coins: data.coins + reward
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

  static getStats() {
    const d = this.load();
    return {
      coins: d.coins,
      gems: d.gems,
      energy: d.energy,
      loginStreak: d.loginStreak
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

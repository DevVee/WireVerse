/**
 * WireVerse — Game Database
 * localStorage-based persistence. Works on Android/iOS via Cordova WebView.
 * No native plugins required.
 */

(function () {
  'use strict';

  const PREFIX = 'wireverse_';

  function _get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function _set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[DB] Write failed:', e);
      return false;
    }
  }

  const DB = {

    // ── PLAYER PROFILE ─────────────────────────────────────────────────────────
    getPlayer() {
      return _get('player');
    },

    savePlayer(profile) {
      _set('player', { ...profile, updatedAt: Date.now() });
    },

    // ── PROGRESS ────────────────────────────────────────────────────────────────
    getProgress() {
      return _get('progress') || {};
    },

    /**
     * Save level completion data.
     * @param {number} stageId  1-3
     * @param {number} levelId  1-4
     * @param {object} data     { completed, score, stars }
     */
    saveProgress(stageId, levelId, data) {
      const prog = DB.getProgress();
      if (!prog[stageId]) prog[stageId] = {};
      prog[stageId][levelId] = {
        ...data,
        completed: data.completed === true,
        savedAt: Date.now(),
      };
      _set('progress', prog);
    },

    getLevelProgress(stageId, levelId) {
      return DB.getProgress()?.[stageId]?.[levelId] || null;
    },

    /**
     * A level is unlocked when the previous level (or previous stage's last level)
     * has been completed.
     */
    isLevelUnlocked(stageId, levelId) {
      if (stageId === 1 && levelId === 1) return true;
      if (levelId === 1) {
        return DB.getLevelProgress(stageId - 1, 4)?.completed === true;
      }
      return DB.getLevelProgress(stageId, levelId - 1)?.completed === true;
    },

    // ── SETTINGS ────────────────────────────────────────────────────────────────
    getSettings() {
      return _get('settings') || {
        musicOn: true,
        musicVol: 0.7,
        sfxOn: true,
        sfxVol: 0.8,
      };
    },

    saveSettings(settings) {
      _set('settings', settings);
    },

    // ── LEARN PROGRESS ──────────────────────────────────────────────────────────
    getLearnProgress() {
      return _get('learn') || {};
    },

    /**
     * @param {string} type  '1way' | '2way' | '3way'
     * @param {object} data  { completed, stars, hintsUsed, timeMs }
     */
    saveLearnProgress(type, data) {
      const learn = DB.getLearnProgress();
      const prev = learn[type] || { attempts: 0 };
      learn[type] = {
        ...prev,
        ...data,
        attempts: (prev.attempts || 0) + 1,
        lastAt: Date.now(),
        bestStars: Math.max(prev.bestStars || 0, data.stars || 0),
      };
      _set('learn', learn);
    },

    getLearnTypeProgress(type) {
      return DB.getLearnProgress()[type] || null;
    },

    // ── ACHIEVEMENTS ────────────────────────────────────────────────────────────
    getAchievements() {
      return _get('achievements') || {};
    },

    /**
     * @param {string} id    Unique achievement key
     * @param {string} name  Display name
     * @param {string} desc  Short description
     */
    unlockAchievement(id, name, desc) {
      const ach = DB.getAchievements();
      if (ach[id]) return false; // already earned
      ach[id] = { name, desc, earnedAt: Date.now() };
      _set('achievements', ach);
      return true; // newly earned
    },

    isAchievementUnlocked(id) {
      return !!DB.getAchievements()[id];
    },

    // ── WORKSHOP INTERACTIONS ────────────────────────────────────────────────────
    getWorkshopProgress() {
      return _get('workshop') || {};
    },

    saveWorkshopInteraction(type, data) {
      const ws = DB.getWorkshopProgress();
      const prev = ws[type] || { sessions: 0 };
      ws[type] = {
        ...prev,
        ...data,
        sessions: (prev.sessions || 0) + 1,
        lastAt: Date.now(),
        bestStars: Math.max(prev.bestStars || 0, data.stars || 0),
      };
      _set('workshop', ws);
    },

    // ── RESET ───────────────────────────────────────────────────────────────────
    resetProgress() {
      localStorage.removeItem(PREFIX + 'progress');
    },

    resetAll() {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
    },
  };

  window.DB = DB;
})();

const data = window.SmartyData;
const STORAGE_KEY = "smarty_app_state_v1";

function getDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DEFAULT_STATE = {
  view: "landing",
  routines: structuredClone(data.INITIAL_ROUTINES),
  videos: structuredClone(data.INITIAL_VIDEOS),
  unlockedVideoIds: [],
  videoRewards: 0,
  logs: [],
  stars: 0,
  isFocusMode: false,
  parentTab: "insights",
  parentAuth: { pin: "", showPin: false },
  newVid: { title: "", url: "" },
  newRot: { task: "", icon: "\u2B50", time: "10:00", bulk: "" },
  deleteSelected: { logs: true, audio: true, stars: false, checklist: false },
  audioURL: null,
  lastRoutineResetDay: getDayKey(),
  isRecording: false,
  mediaRecorder: null,
  audioChunks: [],
  recordingMode: null,
  replyTargetLogId: null,
};

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch (error) {
    console.warn("Failed to load saved state:", error);
    return {};
  }
}

const persistedState = loadPersistedState();

window.SmartyState = {
  ...DEFAULT_STATE,
  ...persistedState,
  unlockedVideoIds: Array.isArray(persistedState.unlockedVideoIds) ? persistedState.unlockedVideoIds : [],
  videoRewards: Number.isFinite(persistedState.videoRewards) ? persistedState.videoRewards : 0,
  parentAuth: { ...DEFAULT_STATE.parentAuth },
  newRot: { ...DEFAULT_STATE.newRot, ...(persistedState.newRot || {}) },
  deleteSelected: { ...DEFAULT_STATE.deleteSelected, ...(persistedState.deleteSelected || {}) },
  isRecording: false,
  mediaRecorder: null,
  audioChunks: [],
  recordingMode: null,
  replyTargetLogId: null,
};

window.SmartyStateHelpers = {
  persist() {
    const state = window.SmartyState;
    const persistable = {
      routines: state.routines,
      videos: state.videos,
      unlockedVideoIds: state.unlockedVideoIds,
      videoRewards: state.videoRewards,
      logs: state.logs,
      stars: state.stars,
      isFocusMode: state.isFocusMode,
      parentTab: state.parentTab,
      newVid: state.newVid,
      newRot: state.newRot,
      deleteSelected: state.deleteSelected,
      audioURL: state.audioURL,
      lastRoutineResetDay: state.lastRoutineResetDay,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch (error) {
      console.warn("Failed to save state:", error);
    }
  },

  resetRoutinesIfNewDay() {
    const state = window.SmartyState;
    const today = getDayKey();

    if (!state.lastRoutineResetDay) {
      state.lastRoutineResetDay = today;
      this.persist();
      return false;
    }

    if (state.lastRoutineResetDay === today) return false;

    state.routines = state.routines.map((routine) => ({
      ...routine,
      completed: false,
      rewardClaimedToday: false,
    }));
    state.unlockedVideoIds = [];
    state.videoRewards = 0;
    state.isFocusMode = false;
    state.lastRoutineResetDay = today;
    this.persist();
    return true;
  },

  getStats() {
    const state = window.SmartyState;
    const moods = state.logs.filter((l) => l.type === "EMOTION");
    const counts = moods.reduce((acc, item) => {
      acc[item.detail] = (acc[item.detail] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const completed = state.routines.filter((r) => r.completed).length;
    const rate = state.routines.length ? Math.round((completed / state.routines.length) * 100) : 0;
    return { sorted, rate, total: state.logs.length };
  },
};

const data = window.SmartyData;
const STORAGE_KEY = "smarty_app_state_v1";

const DEFAULT_STATE = {
  view: "landing",
  routines: structuredClone(data.INITIAL_ROUTINES),
  videos: structuredClone(data.INITIAL_VIDEOS),
  logs: [],
  stars: 0,
  isFocusMode: false,
  parentTab: "insights",
  newVid: { title: "", url: "" },
  newRot: { task: "", icon: "⭐", time: "10:00" },
  audioURL: null,
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

window.SmartyState = {
  ...DEFAULT_STATE,
  ...loadPersistedState(),
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
      logs: state.logs,
      stars: state.stars,
      isFocusMode: state.isFocusMode,
      parentTab: state.parentTab,
      newVid: state.newVid,
      newRot: state.newRot,
      audioURL: state.audioURL,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch (error) {
      console.warn("Failed to save state:", error);
    }
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

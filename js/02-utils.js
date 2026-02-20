window.SmartyUtils = {
  speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  },

  addLog(type, detail, metadata = {}) {
    const state = window.SmartyState;
    const now = new Date();
    state.logs.unshift({
      id: Date.now() + Math.random(),
      type,
      detail,
      timestamp: now,
      timeStr: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ...metadata,
    });
    window.SmartyStateHelpers.persist();
  },

  extractYoutubeId(url) {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const id = match && match[7] && match[7].length === 11 ? match[7] : null;
    if (!id && url.includes("shorts/")) {
      return url.split("shorts/")[1]?.split("?")[0]?.split("&")[0] || null;
    }
    return id;
  },

  toYoutubeWatchUrl(url) {
    const id = this.extractYoutubeId(url);
    return id ? `https://www.youtube.com/watch?v=${id}` : null;
  },

  escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  },
};

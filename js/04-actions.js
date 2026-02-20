window.SmartyActions = {
  setView(view) {
    window.SmartyStateHelpers.persist();

    const pageMap = {
      landing: "Smarty.html",
      child: "child.html",
      "parent-auth": "parent-auth.html",
      parent: "parent.html",
    };

    const targetPage = pageMap[view];
    if (!targetPage) return;

    const currentPage = window.location.pathname.split("/").pop() || "Smarty.html";
    if (currentPage !== targetPage) {
      window.location.href = targetPage;
      return;
    }

    window.SmartyState.view = view;
    window.SmartyApp.render();
  },

  toggleRoutine(id) {
    const state = window.SmartyState;
    const utils = window.SmartyUtils;

    state.routines = state.routines.map((item) => {
      if (item.id !== id) return item;
      const nextDone = !item.completed;
      if (nextDone) {
        const shouldGrantVideoReward = !item.rewardClaimedToday;
        utils.speak(
          shouldGrantVideoReward
            ? `Great job! You finished ${item.task}! You earned a star and a video reward!`
            : `Great job! You finished ${item.task}! You earned a star!`
        );
        utils.addLog("TASK", item.task, { status: "completed" });
        state.stars += 1;
        if (shouldGrantVideoReward) state.videoRewards += 1;
      }
      return { ...item, completed: nextDone, rewardClaimedToday: item.rewardClaimedToday || nextDone };
    });

    window.SmartyStateHelpers.persist();
    window.SmartyApp.render();
  },

  async startRecording(mode = "child-note", logId = null) {
    const state = window.SmartyState;
    const utils = window.SmartyUtils;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.mediaRecorder = new MediaRecorder(stream);
      state.audioChunks = [];
      state.recordingMode = mode;
      state.replyTargetLogId = logId;

      state.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) state.audioChunks.push(event.data);
      };

      state.mediaRecorder.onstop = () => {
        const blob = new Blob(state.audioChunks, { type: "audio/webm" });
        const reader = new FileReader();

        reader.onloadend = () => {
          const audioDataUrl = String(reader.result || "");
          if (state.recordingMode === "parent-reply" && state.replyTargetLogId) {
            state.logs = state.logs.map((log) => {
              if (String(log.id) !== String(state.replyTargetLogId)) return log;
              return {
                ...log,
                parentReply: audioDataUrl,
                parentReplyTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              };
            });
            utils.speak("Reply sent.");
          } else {
            state.audioURL = audioDataUrl;
            utils.addLog("VOICE", "Recorded a memo", { audio: audioDataUrl });
            utils.speak("Got it! I saved your message.");
          }

          state.isRecording = false;
          state.recordingMode = null;
          state.replyTargetLogId = null;
          window.SmartyStateHelpers.persist();
          window.SmartyApp.render();
        };

        reader.readAsDataURL(blob);
      };

      state.mediaRecorder.start();
      state.isRecording = true;
      utils.speak(mode === "parent-reply" ? "Recording your reply." : "I am listening.");
      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
    } catch (error) {
      console.error("Mic error:", error);
      alert("Microphone access failed. Please allow microphone permissions.");
    }
  },

  stopRecording() {
    const state = window.SmartyState;
    if (state.mediaRecorder && state.isRecording) state.mediaRecorder.stop();
  },

  handleInput(target) {
    const state = window.SmartyState;
    if (target.id === "parent-pin") state.parentAuth.pin = target.value;
    if (target.id === "new-video-title") state.newVid.title = target.value;
    if (target.id === "new-video-url") state.newVid.url = target.value;
    if (target.id === "new-routine-task") state.newRot.task = target.value;
    if (target.id === "new-routine-time") state.newRot.time = target.value;
    if (target.id === "new-routine-bulk") state.newRot.bulk = target.value;
    if (target.id === "delete-logs") state.deleteSelected.logs = target.checked;
    if (target.id === "delete-audio") state.deleteSelected.audio = target.checked;
    if (target.id === "delete-stars") state.deleteSelected.stars = target.checked;
    if (target.id === "delete-checklist") state.deleteSelected.checklist = target.checked;
    window.SmartyStateHelpers.persist();
  },

  handleAction(actionEl) {
    const state = window.SmartyState;
    const utils = window.SmartyUtils;
    const action = actionEl.dataset.action;

    if (action === "start-day") {
      state.view = "child";
      utils.speak("Let's start our day.");
      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
      return;
    }

    if (action === "parent-auth") {
      state.parentAuth.pin = "";
      state.parentAuth.showPin = false;
      return this.setView("parent-auth");
    }
    if (action === "go-landing") return this.setView("landing");
    if (action === "toggle-pin-visibility") {
      state.parentAuth.showPin = !state.parentAuth.showPin;
      window.SmartyApp.render();
      return;
    }
    if (action === "enter-parent") {
      const enteredPin = String(state.parentAuth.pin || "").trim();
      const validPin = String(window.SmartyData.PARENT_PIN || "1234");
      if (!enteredPin) {
        alert("Enter PIN to open Parent Settings.");
        return;
      }
      if (enteredPin !== validPin) {
        alert("Incorrect PIN.");
        return;
      }
      state.parentAuth.pin = "";
      state.parentAuth.showPin = false;
      return this.setView("parent");
    }

    if (action === "toggle-focus") {
      state.isFocusMode = !state.isFocusMode;
      utils.speak(state.isFocusMode ? "Focus Mode: Let's look at one thing at a time." : "Showing all tasks.");
      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
      return;
    }

    if (action === "emoji") {
      const label = actionEl.dataset.label;
      const icon = actionEl.dataset.icon;
      utils.speak(`I feel ${label}`);
      utils.addLog("EMOTION", label, { icon });
      window.SmartyApp.render();
      return;
    }

    if (action === "toggle-routine") return this.toggleRoutine(actionEl.dataset.id);

    if (action === "tab") {
      state.parentTab = actionEl.dataset.tab;
      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
      return;
    }

    if (action === "refresh-parent-data") {
      window.SmartyStateHelpers.resetRoutinesIfNewDay();
      window.location.reload();
      return;
    }

    if (action === "delete-recorded-data") {
      if (!confirm("Delete all recorded activity data?")) return;

      state.logs = [];
      state.audioURL = null;
      state.stars = 0;
      state.routines = state.routines.map((routine) => ({ ...routine, completed: false, rewardClaimedToday: false }));
      state.unlockedVideoIds = [];
      state.videoRewards = 0;

      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
      return;
    }

    if (action === "delete-selected-data") {
      const selected = state.deleteSelected || {};
      if (!selected.logs && !selected.audio && !selected.stars && !selected.checklist) {
        alert("Select at least one data type to delete.");
        return;
      }
      if (!confirm("Delete only selected data types?")) return;

      if (selected.logs) state.logs = [];
      if (selected.audio) state.audioURL = null;
      if (selected.stars) state.stars = 0;
      if (selected.checklist) {
        state.routines = state.routines.map((routine) => ({ ...routine, completed: false, rewardClaimedToday: false }));
        state.unlockedVideoIds = [];
        state.videoRewards = 0;
        state.isFocusMode = false;
      }

      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
      return;
    }

    if (action === "add-video") {
      const title = state.newVid.title.trim();
      const url = state.newVid.url.trim();
      if (title && utils.extractYoutubeId(url)) {
        state.videos.push({ id: String(Date.now()), title, url });
        state.newVid = { title: "", url: "" };
        window.SmartyStateHelpers.persist();
        window.SmartyApp.render();
        return;
      }
      alert("Enter a title and valid YouTube URL.");
      return;
    }

    if (action === "delete-video") {
      const id = actionEl.dataset.id;
      state.videos = state.videos.filter((video) => video.id !== id);
      state.unlockedVideoIds = state.unlockedVideoIds.filter((videoId) => videoId !== id);
      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
      return;
    }

    if (action === "unlock-video") {
      const videoId = actionEl.dataset.id;
      if (!videoId) return;
      if (state.unlockedVideoIds.includes(videoId)) return;
      if (state.videoRewards < 1) {
        alert("Complete a task to earn a video reward.");
        return;
      }

      state.videoRewards -= 1;
      state.unlockedVideoIds.push(videoId);
      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
      return;
    }

    if (action === "add-routine") {
      const task = state.newRot.task.trim();
      const time = state.newRot.time || "10:00";
      if (task) {
        state.routines.push({ id: String(Date.now()), task, icon: "\u2B50", time, completed: false, rewardClaimedToday: false });
        state.newRot = { ...state.newRot, task: "", icon: "\u2B50", time: "10:00" };
        window.SmartyStateHelpers.persist();
        window.SmartyApp.render();
        return;
      }
      alert("Enter a task description.");
      return;
    }

    if (action === "add-routine-bulk") {
      const time = state.newRot.time || "10:00";
      const lines = String(state.newRot.bulk || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (!lines.length) {
        alert("Type one or more tasks (one per line).");
        return;
      }

      const base = Date.now();
      lines.forEach((task, index) => {
        state.routines.push({
          id: String(base + index),
          task,
          icon: "\u2B50",
          time,
          completed: false,
          rewardClaimedToday: false,
        });
      });

      state.newRot = { ...state.newRot, bulk: "", task: "" };
      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
      return;
    }

    if (action === "delete-routine") {
      const id = actionEl.dataset.id;
      state.routines = state.routines.filter((routine) => routine.id !== id);
      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
      return;
    }

    if (action === "delete-all-routines") {
      if (!confirm("Delete all to-do list items?")) return;
      state.routines = [];
      state.unlockedVideoIds = [];
      state.videoRewards = 0;
      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
      return;
    }

    if (action === "start-recording") return this.startRecording("child-note");
    if (action === "stop-recording") return this.stopRecording();
    if (action === "start-parent-reply") return this.startRecording("parent-reply", actionEl.dataset.logId);
    if (action === "stop-parent-reply") return this.stopRecording();

    if (action === "play-audio") {
      if (state.audioURL) new Audio(state.audioURL).play();
      return;
    }

    if (action === "play-log-audio") {
      const audio = actionEl.dataset.audio || "";
      if (audio) new Audio(audio).play();
      return;
    }

    if (action === "new-audio") {
      state.audioURL = null;
      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
    }
  },
};

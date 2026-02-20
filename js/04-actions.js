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
        utils.speak(`Great job! You finished ${item.task}! You earned a star!`);
        utils.addLog("TASK", item.task, { status: "completed" });
        state.stars += 1;
      }
      return { ...item, completed: nextDone };
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
    if (target.id === "new-video-title") state.newVid.title = target.value;
    if (target.id === "new-video-url") state.newVid.url = target.value;
    if (target.id === "new-routine-task") state.newRot.task = target.value;
    if (target.id === "new-routine-time") state.newRot.time = target.value;
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

    if (action === "parent-auth") return this.setView("parent-auth");
    if (action === "go-landing") return this.setView("landing");
    if (action === "enter-parent") return this.setView("parent");

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
      window.SmartyStateHelpers.persist();
      window.SmartyApp.render();
      return;
    }

    if (action === "add-routine") {
      const task = state.newRot.task.trim();
      const time = state.newRot.time;
      if (task) {
        state.routines.push({ id: String(Date.now()), task, icon: "⭐", time, completed: false });
        state.newRot = { task: "", icon: "⭐", time: "10:00" };
        window.SmartyStateHelpers.persist();
        window.SmartyApp.render();
        return;
      }
      alert("Enter a task description.");
      return;
    }

    if (action === "delete-routine") {
      const id = actionEl.dataset.id;
      state.routines = state.routines.filter((routine) => routine.id !== id);
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

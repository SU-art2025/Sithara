window.SmartyViews = {
  renderCurrentView() {
    const state = window.SmartyState;
    if (state.view === "landing") return this.renderLanding();
    if (state.view === "parent-auth") return this.renderParentAuth();
    if (state.view === "child") return this.renderChild();
    if (state.view === "parent") return this.renderParent();
    return "";
  },

  renderLanding() {
    return `
      <section class="page landing">
        <div class="panel center landing-card">
          <div class="logo">:)</div>
          <h1 class="home-title">Hey Little Star, Meet <span class="brand-name">Sithare</span></h1>
          <p class="home-subtitle">A warm, safe, and happy space made just for your day.</p>
          <div class="clock">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          <button class="btn btn-primary" data-action="start-day">Start Day</button>
          <button class="btn btn-ghost" data-action="parent-auth">Parent Settings</button>
        </div>
      </section>
    `;
  },
  renderParentAuth() {
    const state = window.SmartyState;
    const utils = window.SmartyUtils;
    return `
      <section class="page parent-auth">
        <div class="panel auth-card">
          <button class="btn btn-link" data-action="go-landing">Back</button>
          <h2>Parent Verification</h2>
          <p>Restricted area. Please sign in.</p>
          <div class="pin-row">
            <input id="parent-pin" type="${state.parentAuth.showPin ? "text" : "password"}" placeholder="Enter PIN" value="${utils.escapeHtml(state.parentAuth.pin)}" />
            <button class="btn btn-ghost pin-eye" data-action="toggle-pin-visibility" aria-label="Show or hide PIN">&#128065;</button>
          </div>
          <button class="btn btn-primary" data-action="enter-parent">Enter Dashboard</button>
        </div>
      </section>
    `;
  },
  renderVoiceBox() {
    const state = window.SmartyState;
    if (state.audioURL) {
      return `
        <div class="voice-box">
          <h3>Voice Note</h3>
          <p>Recorded successfully.</p>
          <div class="row">
            <button class="btn btn-secondary" data-action="play-audio">Listen Back</button>
            <button class="btn btn-ghost" data-action="new-audio">New Note</button>
          </div>
        </div>
      `;
    }

    if (state.isRecording) {
      return `
        <div class="voice-box">
          <h3>Voice Note</h3>
          <p>Recording...</p>
          <button class="btn btn-danger" data-action="stop-recording">Stop</button>
        </div>
      `;
    }

    return `
      <div class="voice-box">
        <h3>Voice Note</h3>
        <p>Tell me more about how you feel.</p>
        <button class="btn btn-danger" data-action="start-recording">Record</button>
      </div>
    `;
  },

  renderChild() {
    const state = window.SmartyState;
    const utils = window.SmartyUtils;
    const emojis = window.SmartyData.EMOJIS;

    const nowIndex = state.routines.findIndex((r) => !r.completed);
    const nowTask = nowIndex !== -1 ? state.routines[nowIndex] : null;
    const nextTask = nowIndex !== -1 ? state.routines.slice(nowIndex + 1).find((r) => !r.completed) : null;

    const emotionButtons = emojis
      .map(
        (emoji) => `
      <button class="emoji" data-action="emoji" data-label="${utils.escapeHtml(emoji.label)}" data-icon="${utils.escapeHtml(emoji.icon)}">
        <span class="emoji-icon">${emoji.icon}</span>
        <span class="emoji-label">${utils.escapeHtml(emoji.label)}</span>
      </button>
    `
      )
      .join("");

    let checklist = "";
    if (state.isFocusMode) {
      if (nowTask) {
        checklist = `
          <div class="focus-task">
            <button class="task-card focus" data-action="toggle-routine" data-id="${utils.escapeHtml(nowTask.id)}">
              <span class="task-icon">${nowTask.icon}</span>
              <div class="task-text">
                <strong>${utils.escapeHtml(nowTask.task)}</strong>
                <small>Tap when finished</small>
              </div>
            </button>
            ${
              nextTask
                ? `<div class="next-task">Next: ${utils.escapeHtml(nextTask.icon)} ${utils.escapeHtml(nextTask.task)} (${utils.escapeHtml(nextTask.time)})</div>`
                : ""
            }
          </div>
        `;
      } else {
        checklist = `<div class="done-all">All Finished! You did a great job today.</div>`;
      }
    } else {
      checklist = state.routines
        .map(
          (item) => `
        <button class="task-card ${item.completed ? "completed" : ""}" data-action="toggle-routine" data-id="${utils.escapeHtml(item.id)}">
          <span class="task-icon">${item.icon}</span>
          <div class="task-text">
            <strong>${utils.escapeHtml(item.task)}</strong>
            <small>${utils.escapeHtml(item.time)}</small>
          </div>
          <span class="check">${item.completed ? "✓" : ""}</span>
        </button>
      `
        )
        .join("");
    }

    const videos = state.videos
      .map((video) => {
        const id = utils.extractYoutubeId(video.url);
        const watchUrl = utils.toYoutubeWatchUrl(video.url);
        const isUnlocked = state.unlockedVideoIds.includes(video.id);
        const thumb = id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : "";
        return `
        <article class="video-card ${isUnlocked ? "unlocked" : "locked"}">
          ${
            isUnlocked
              ? `<div class="video-frame">
                  ${
                    id
                      ? `<iframe
                          src="https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&controls=1"
                          title="${utils.escapeHtml(video.title)}"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerpolicy="strict-origin-when-cross-origin"
                          loading="lazy"
                          allowfullscreen
                        ></iframe>`
                      : '<div class="video-missing">Video not found</div>'
                  }
                </div>`
              : `<div class="video-frame locked">
                  ${thumb ? `<img src="${thumb}" alt="${utils.escapeHtml(video.title)} preview" />` : '<div class="video-missing">Video not found</div>'}
                  <div class="video-lock">Locked Reward Video</div>
                </div>`
          }
          <h4>${utils.escapeHtml(video.title)}</h4>
          ${
            isUnlocked
              ? watchUrl
                ? `<a class="btn btn-link" href="${utils.escapeHtml(watchUrl)}" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>`
                : ""
              : `<button class="btn btn-primary" data-action="unlock-video" data-id="${utils.escapeHtml(video.id)}" ${state.videoRewards < 1 ? "disabled" : ""}>Unlock (1 Reward)</button>`
          }
        </article>
      `;
      })
      .join("");

    return `
      <section class="page child">
        <header class="topbar">
          <button class="btn btn-link" data-action="go-landing">Back</button>
          <button class="btn btn-secondary" data-action="toggle-focus">${state.isFocusMode ? "Focus Mode" : "All Tasks"}</button>
          <div class="stars">⭐ ${state.stars}</div>
        </header>

        <div class="child-grid">
          <section class="card emotion-card">
            <h2 class="emotion-title">How am I?</h2>
            <div class="emoji-grid">${emotionButtons}</div>
            ${this.renderVoiceBox()}
          </section>

          <section class="card">
            <h2>Checklist</h2>
            <div class="tasks">${checklist}</div>
          </section>

          <section class="card wide">
            <h2>Fun Time</h2>
            <p class="reward-note">Rewards available: <strong>${state.videoRewards}</strong>. Complete tasks to unlock videos.</p>
            <div class="videos">${videos}</div>
          </section>
        </div>
      </section>
    `;
  },

  renderInsights(stats) {
    const utils = window.SmartyUtils;
    const state = window.SmartyState;
    const dominantMood = stats.sorted[0] ? stats.sorted[0][0] : "N/A";

    const logRows =
      state.logs
        .map(
          (log) => {
            const isVoiceLog = log.type === "VOICE" && !!log.audio;
            const isReplyRecording =
              state.isRecording &&
              state.recordingMode === "parent-reply" &&
              String(state.replyTargetLogId) === String(log.id);

            return `
      <div class="log-row">
        <div>
          <strong>${utils.escapeHtml(log.type)}</strong>
          <p>${utils.escapeHtml(log.detail)}</p>
          ${
            log.audio
              ? `<button class="btn btn-secondary" data-action="play-log-audio" data-audio="${utils.escapeHtml(log.audio)}">Play Voice</button>`
              : ""
          }
          ${
            isVoiceLog
              ? isReplyRecording
                ? `<button class="btn btn-danger" data-action="stop-parent-reply">Stop Reply</button>`
                : `<button class="btn btn-primary" data-action="start-parent-reply" data-log-id="${utils.escapeHtml(log.id)}">Reply Voice</button>`
              : ""
          }
          ${
            log.parentReply
              ? `<button class="btn btn-secondary" data-action="play-log-audio" data-audio="${utils.escapeHtml(log.parentReply)}">Play Parent Reply</button>`
              : ""
          }
        </div>
        <span>${utils.escapeHtml(log.timeStr)}</span>
      </div>
    `
          }
        )
        .join("") || '<p class="muted">No activity recorded yet.</p>';

    const moodRows =
      stats.sorted
        .map(([label, count]) => {
          const width = stats.total ? (count / stats.total) * 100 : 0;
          return `
        <div class="mood-row">
          <div class="row between"><span>${utils.escapeHtml(label)}</span><span>${count}</span></div>
          <div class="bar"><i style="width:${width}%"></i></div>
        </div>
      `;
        })
        .join("") || '<p class="muted">Insufficient data for analysis.</p>';

    return `
      <div class="parent-content insights-content">
        <div class="stats">
          <div class="stat-card"><label>Routine Completion</label><strong>${stats.rate}%</strong></div>
          <div class="stat-card"><label>Total Actions</label><strong>${stats.total}</strong></div>
          <div class="stat-card"><label>Dominant Mood</label><strong>${utils.escapeHtml(dominantMood)}</strong></div>
        </div>
        <div class="split">
          <section class="card insights-log-card"><h3>Real-time Logs</h3>${logRows}</section>
          <section class="card insights-sentiment-card"><h3>Sentiment Analysis</h3>${moodRows}</section>
        </div>
      </div>
    `;
  },

  renderLibrary() {
    const state = window.SmartyState;
    const utils = window.SmartyUtils;

    const videos = state.videos
      .map((video) => {
        const id = utils.extractYoutubeId(video.url);
        const thumb = id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : "";
        return `
        <article class="video-item">
          <img src="${thumb}" alt="Preview" />
          <h4>${utils.escapeHtml(video.title)}</h4>
          <p>${utils.escapeHtml(video.url)}</p>
          <button class="btn btn-danger" data-action="delete-video" data-id="${utils.escapeHtml(video.id)}">Delete</button>
        </article>
      `;
      })
      .join("");

    return `
      <div class="parent-content library-content">
        <section class="card library-form-card">
          <h3>Whitelist New Video</h3>
          <div class="form-grid two">
            <input id="new-video-title" type="text" placeholder="Friendly Title" value="${utils.escapeHtml(state.newVid.title)}" />
            <div class="row">
              <input id="new-video-url" type="text" placeholder="YouTube URL" value="${utils.escapeHtml(state.newVid.url)}" />
              <button class="btn btn-primary" data-action="add-video">Add</button>
            </div>
          </div>
        </section>
        <section class="gallery library-gallery">${videos}</section>
      </div>
    `;
  },

  renderPlanner() {
    const state = window.SmartyState;
    const utils = window.SmartyUtils;

    const routines = state.routines
      .map(
        (routine) => `
      <div class="routine-row">
        <div>
          <strong>${utils.escapeHtml(routine.icon)} ${utils.escapeHtml(routine.task)}</strong>
          <p>${utils.escapeHtml(routine.time)} ${routine.completed ? "• Completed Today" : ""}</p>
        </div>
        <button class="btn btn-danger" data-action="delete-routine" data-id="${utils.escapeHtml(routine.id)}">Delete</button>
      </div>
    `
      )
      .join("");

    return `
      <div class="parent-content planner-content">
        <section class="card planner-form-card">
          <h3>Manage To-Do List</h3>
          <div class="form-grid three">
            <input id="new-routine-task" type="text" placeholder="Type a to-do item" value="${utils.escapeHtml(state.newRot.task)}" />
            <input id="new-routine-time" type="time" value="${utils.escapeHtml(state.newRot.time)}" />
            <button class="btn btn-primary" data-action="add-routine">Add Item</button>
          </div>
          <div class="form-grid">
            <textarea id="new-routine-bulk" rows="4" placeholder="Type multiple items (one per line)">${utils.escapeHtml(state.newRot.bulk || "")}</textarea>
            <div class="row">
              <button class="btn btn-secondary" data-action="add-routine-bulk">Add Typed List</button>
              <button class="btn btn-danger" data-action="delete-all-routines">Delete All</button>
            </div>
          </div>
        </section>
        <section class="card planner-list-card">${routines}</section>
      </div>
    `;
  },

  renderParent() {
    const state = window.SmartyState;
    const stats = window.SmartyStateHelpers.getStats();

    let content = "";
    if (state.parentTab === "insights") content = this.renderInsights(stats);
    if (state.parentTab === "library") content = this.renderLibrary();
    if (state.parentTab === "planner") content = this.renderPlanner();

    return `
      <section class="page parent">
        <aside class="sidebar">
          <h2>Parent Portal</h2>
          <button class="nav-btn ${state.parentTab === "insights" ? "active" : ""}" data-action="tab" data-tab="insights">Activity Insights</button>
          <button class="nav-btn ${state.parentTab === "library" ? "active" : ""}" data-action="tab" data-tab="library">Content Filter</button>
          <button class="nav-btn ${state.parentTab === "planner" ? "active" : ""}" data-action="tab" data-tab="planner">Daily Planner</button>
          <div class="sidebar-tools">
            <p>Settings</p>
            <button class="btn btn-secondary" data-action="refresh-parent-data">Refresh</button>
            <button class="btn btn-danger" data-action="delete-recorded-data">Delete Recorded Data</button>
            <div class="select-delete">
              <label><input id="delete-logs" type="checkbox" ${state.deleteSelected.logs ? "checked" : ""} /> Activity Logs</label>
              <label><input id="delete-audio" type="checkbox" ${state.deleteSelected.audio ? "checked" : ""} /> Voice Notes</label>
              <label><input id="delete-stars" type="checkbox" ${state.deleteSelected.stars ? "checked" : ""} /> Stars</label>
              <label><input id="delete-checklist" type="checkbox" ${state.deleteSelected.checklist ? "checked" : ""} /> Checklist Progress</label>
              <button class="btn btn-danger" data-action="delete-selected-data">Delete Selected Data</button>
            </div>
          </div>
          <button class="btn btn-danger" data-action="go-landing">Logout</button>
        </aside>
        <main class="parent-main">
          <header>
            <h1>${state.parentTab === "insights" ? "Dashboard Overview" : state.parentTab === "library" ? "Approved Media" : "Routine Architecture"}</h1>
            <p>Managing child safety and behavioral progress.</p>
          </header>
          ${content}
        </main>
      </section>
    `;
  },
};



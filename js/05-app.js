window.SmartyApp = {
  appRoot: document.getElementById("app"),

  render() {
    this.appRoot.innerHTML = window.SmartyViews.renderCurrentView();
    window.SmartyStateHelpers.persist();
  },

  initialize() {
    const initialView = document.body.dataset.view || "landing";
    window.SmartyState.view = initialView;

    this.appRoot.addEventListener("click", (event) => {
      const actionEl = event.target.closest("[data-action]");
      if (!actionEl) return;
      window.SmartyActions.handleAction(actionEl);
    });

    this.appRoot.addEventListener("input", (event) => {
      window.SmartyActions.handleInput(event.target);
    });

    this.render();
  },
};

window.SmartyApp.initialize();

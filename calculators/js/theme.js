const Theme = {
  value: "auto",
  accent: "none",

  load() {
    try {
      const settings = JSON.parse(localStorage.getItem("settings") || "{}");
      this.value = ["auto", "light", "dark"].includes(settings.theme) ? settings.theme : "auto";
      this.accent = ["none", "blue", "pink"].includes(settings.accent) ? settings.accent : "none";
    } catch {}
  },

  set(v) {
    this.value = v;
    this.save();
    this.apply();
  },

  setAccent(v) {
    this.accent = v;
    this.save();
    this.apply();
  },

  save() {
    try {
      localStorage.setItem("settings", JSON.stringify({ theme: this.value, accent: this.accent }));
    } catch {}
  },

  apply() {
    const dark = this.value === "dark" ||
      (this.value === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.dataset.accent = this.accent;
    document.querySelectorAll("#themeSeg button").forEach(button => {
      const selected = button.dataset.v === this.value;
      button.classList.toggle("on", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    document.querySelectorAll("#accentSeg button").forEach(button => {
      const selected = button.dataset.accent === this.accent;
      button.classList.toggle("on", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }
};

Theme.load();
Theme.apply();
document.querySelectorAll("#themeSeg button")
  .forEach(b => b.onclick = () => Theme.set(b.dataset.v));
document.querySelectorAll("#accentSeg button")
  .forEach(b => b.onclick = () => Theme.setAccent(b.dataset.accent));
matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => Theme.apply());
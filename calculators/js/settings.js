(() => {
  const panel = document.getElementById("panel");
  const overlay = document.getElementById("overlay");

  const toggle = open => {
    panel.classList.toggle("open", open);
    overlay.classList.toggle("open", open);
    document.getElementById("gear").setAttribute("aria-expanded", String(open));
  };

  document.getElementById("gear").onclick = () => toggle(true);
  document.getElementById("closePanel").onclick = () => toggle(false);
  overlay.onclick = () => toggle(false);
  document.querySelectorAll("[data-external-link]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      window.api.openExternal(link.href);
    });
  });

  const creatorCard = document.querySelector(".creator-card");
  const creatorAvatar = document.querySelector(".creator-avatar");
  creatorAvatar.addEventListener("load", () => creatorCard.classList.remove("avatar-unavailable"));
  creatorAvatar.addEventListener("error", () => creatorCard.classList.add("avatar-unavailable"));

  const loadGithubProfile = async () => {
    try {
      const profile = await window.api.githubProfile();
      if (!profile?.login || !profile.avatarUrl || !profile.profileUrl) return;

      const avatarUrl = new URL(profile.avatarUrl);
      const profileUrl = new URL(profile.profileUrl);
      if (avatarUrl.protocol !== "https:" || avatarUrl.hostname !== "avatars.githubusercontent.com") return;
      if (profileUrl.protocol !== "https:" || profileUrl.hostname !== "github.com") return;

      const name = profile.name || profile.login;
      document.getElementById("creatorName").textContent = name;
      document.querySelector(".creator-avatar-fallback").textContent = name.charAt(0).toUpperCase();
      document.getElementById("githubProfileLink").href = profileUrl.href;
      creatorAvatar.alt = `Photo de profil de ${profile.login}`;
      creatorAvatar.src = avatarUrl.href;
    } catch {}
  };

  loadGithubProfile();

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") toggle(false);
  });
})();
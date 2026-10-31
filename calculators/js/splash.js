(() => {
  const splash = document.getElementById("splash");
  const timerValue = document.getElementById("timerValue");
  const timerProgress = document.getElementById("timerProgress");
  const timerLength = 5000;
  const circumference = 2 * Math.PI * 18;
  let completed = false;

  if (!document.documentElement.classList.contains("show-splash")) {
    splash.remove();
    return;
  }

  timerProgress.style.strokeDasharray = circumference;
  timerProgress.style.strokeDashoffset = circumference;

  const finish = () => {
    if (completed) return;
    completed = true;
    document.documentElement.classList.remove("show-splash");
    splash.classList.add("splash-out");
    window.setTimeout(() => splash.remove(), 350);
  };

  const startedAt = performance.now();
  const updateTimer = () => {
    const elapsed = Math.min(performance.now() - startedAt, timerLength);
    const progress = elapsed / timerLength;
    const remaining = Math.ceil((timerLength - elapsed) / 1000);
    timerValue.textContent = String(remaining);
    timerProgress.style.strokeDashoffset = String(circumference * (1 - progress));

    if (elapsed >= timerLength) finish();
    else window.setTimeout(updateTimer, 100);
  };

  updateTimer();
})();
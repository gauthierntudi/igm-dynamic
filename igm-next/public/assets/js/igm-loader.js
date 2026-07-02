(function () {
  var root = document.getElementById("igm-loader");
  if (!root) return;

  root.setAttribute("data-init", "1");

  var words = ["Inspection", "Générale", "des Mines", "Bienvenue"];
  var wordsRaw = root.getAttribute("data-loader-words");
  if (wordsRaw) {
    try {
      var parsed = JSON.parse(wordsRaw);
      if (Array.isArray(parsed) && parsed.length) {
        words = parsed;
      }
    } catch (e) {
      /* garde le fallback FR */
    }
  }

  var el = root.querySelector(".igm-loader-typewriter .line");
  if (!el) return;
  var progressEl = root.querySelector(".igm-loader-progress .value");
  var loaded = false;
  var domReady = false;
  var startedAt = Date.now();
  var MIN_LOADER_MS = 1200;
  var MAX_LOADER_MS = 3200;

  var wordIndex = 0;
  var charIndex = 0;
  var mode = "typing";
  var progressStarted = false;
  var progressValue = 0;
  var finishing = false;

  function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function step() {
    if (!el) return;
    var word = words[wordIndex] || "";

    if (mode === "typing") {
      charIndex = Math.min(word.length, charIndex + 1);
      el.textContent = word.slice(0, charIndex);

      if (charIndex >= word.length) {
        if (wordIndex >= words.length - 1) {
          startProgress();
          return;
        }
        mode = "pause";
        setTimeout(function () {
          mode = "deleting";
          step();
        }, 220);
        return;
      }

      setTimeout(step, rand(14, 26));
      return;
    }

    if (mode === "deleting") {
      charIndex = Math.max(0, charIndex - 1);
      el.textContent = word.slice(0, charIndex);

      if (charIndex <= 0) {
        wordIndex = Math.min(words.length - 1, wordIndex + 1);
        mode = "typing";
        setTimeout(step, 80);
        return;
      }

      setTimeout(step, rand(10, 18));
      return;
    }
  }

  function hide() {
    if (!root || root.classList.contains("is-hidden") || root.classList.contains("is-hiding")) return;

    function hideRoot() {
      if (!root) return;
      root.classList.add("is-hidden");
      root.setAttribute("aria-hidden", "true");
    }

    var elapsed = Date.now() - startedAt;
    var wait = Math.max(0, MIN_LOADER_MS - elapsed);

    function runHide() {
      var gsap = typeof window !== "undefined" ? window.gsap : null;
      if (gsap && typeof gsap.timeline === "function") {
        var inner = root.querySelector(".igm-loader-inner");
        root.classList.add("is-hiding");
        gsap
          .timeline({
            defaults: { ease: "power2.out" },
            onComplete: hideRoot,
          })
          .set(root, { pointerEvents: "none" }, 0)
          .to(inner || root, { y: -10, scale: 0.98, opacity: 0, duration: 0.35 }, 0)
          .to(root, { opacity: 0, duration: 0.4 }, 0);
        return;
      }

      root.classList.add("is-hiding");
      setTimeout(hideRoot, 360);
    }

    setTimeout(runHide, wait);
  }

  function setProgress(value) {
    progressValue = value;
    if (progressEl) progressEl.textContent = value + "%";
  }

  function finishLoader() {
    if (finishing) return;
    finishing = true;
    setProgress(100);
    hide();
  }

  function progressTick() {
    if (!progressStarted) return;
    if (!progressEl) return;

    if (progressValue < 88) {
      setProgress(progressValue + 1);
      setTimeout(progressTick, loaded || domReady ? 8 : 12);
      return;
    }

    if (progressValue < 99) {
      setProgress(progressValue + 1);
      setTimeout(progressTick, loaded || domReady ? 14 : 22);
      return;
    }

    if (!loaded && !domReady) {
      setTimeout(progressTick, 40);
      return;
    }

    finishLoader();
  }

  function startProgress() {
    if (progressStarted) return;
    progressStarted = true;
    setTimeout(function () {
      root.classList.add("is-progress");
      el.textContent = "";
      setProgress(0);
      progressTick();
    }, 350);
  }

  function markLoaded() {
    loaded = true;
  }

  function markDomReady() {
    domReady = true;
  }

  window.addEventListener("load", markLoaded);
  document.addEventListener("DOMContentLoaded", markDomReady);

  if (document.readyState === "interactive" || document.readyState === "complete") {
    markDomReady();
  }

  if (document.readyState === "complete") {
    markLoaded();
  }

  setTimeout(finishLoader, MAX_LOADER_MS);

  step();
})();
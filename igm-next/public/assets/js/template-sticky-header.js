(function () {
  var header = document.querySelector("header.header-area");
  if (!header) return;

  function syncHeaderHeight() {
    document.documentElement.style.setProperty(
      "--igm-sticky-header-height",
      (header.offsetHeight || 92) + "px"
    );
  }

  var threshold = header.offsetHeight || 60;
  syncHeaderHeight();

  function onScroll() {
    var shouldStick = window.scrollY > threshold;
    if (shouldStick) header.classList.add("sticky");
    else header.classList.remove("sticky");
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", syncHeaderHeight, { passive: true });
  onScroll();
  syncHeaderHeight();
})();
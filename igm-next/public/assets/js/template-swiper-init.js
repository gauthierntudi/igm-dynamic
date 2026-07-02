(function () {
  function initCounterUp() {
    if (typeof window === "undefined") return;

    var counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          if (entry.isIntersecting) {
            if (el.getAttribute("data-animating") === "true") return;

            var targetStr = el.getAttribute("data-target");
            if (!targetStr) return;
            var target = parseFloat(targetStr);
            if (isNaN(target)) return;

            el.setAttribute("data-animating", "true");

            var parentItem = el.closest(".chiffre-item");
            if (parentItem) {
              var circleFill = parentItem.querySelector(".circle-chart-fill");
              if (circleFill) {
                var percentage = circleFill.getAttribute("data-percentage");
                circleFill.style.strokeDasharray = percentage + ", 100";
              }
            }

            var duration = 2000;
            var startTime = null;

            function animate(currentTime) {
              if (!startTime) startTime = currentTime;
              var progress = currentTime - startTime;
              var currentCount = (progress / duration) * target;

              if (target % 1 === 0) {
                el.innerText = Math.min(Math.floor(currentCount), target);
              } else {
                el.innerText = Math.min(currentCount, target).toFixed(1);
              }

              if (progress < duration) {
                requestAnimationFrame(animate);
              } else {
                el.setAttribute("data-animating", "false");
                el.innerText = target;
              }
            }
            requestAnimationFrame(animate);
          } else {
            el.innerText = "0";
            el.setAttribute("data-animating", "false");
            var parentItem = el.closest(".chiffre-item");
            if (parentItem) {
              var circleFill = parentItem.querySelector(".circle-chart-fill");
              if (circleFill) {
                circleFill.style.strokeDasharray = "0, 100";
              }
            }
          }
        });
      },
      { threshold: 0.1 },
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCounterUp);
  } else {
    initCounterUp();
  }
})();

(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var counts = document.querySelectorAll(".count");

  function renderCount(el, value) {
    var decimals = Number(el.dataset.decimals || "0");
    el.textContent = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
  }

  function showFinalCounts() {
    counts.forEach(function (el) {
      renderCount(el, Number(el.dataset.target));
    });
  }

  if (reduceMotion) {
    showFinalCounts();
    return;
  }

  if (!("IntersectionObserver" in window)) {
    showFinalCounts();
    document.documentElement.classList.remove("motion");
    return;
  }

  counts.forEach(function (el) {
    renderCount(el, 0);
  });

  function runCount(el) {
    var target = Number(el.dataset.target);
    var decimals = Number(el.dataset.decimals || "0");
    var duration = 1100;
    var start = performance.now();

    function frame(now) {
      var progress = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      renderCount(el, target * eased);
      if (progress < 1) {
        requestAnimationFrame(frame);
        return;
      }
      renderCount(el, target);
    }

    requestAnimationFrame(frame);
  }

  var statObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        statObserver.unobserve(entry.target);
        var el = entry.target.querySelector(".count");
        if (el) runCount(el);
      });
    },
    { threshold: 0.45 }
  );

  document.querySelectorAll(".stat").forEach(function (stat) {
    statObserver.observe(stat);
  });

  var seen = 0;
  var revealObserver = new IntersectionObserver(
    function (entries) {
      var visible = entries.filter(function (entry) {
        return entry.isIntersecting;
      });
      visible.sort(function (a, b) {
        var ra = a.target.getBoundingClientRect();
        var rb = b.target.getBoundingClientRect();
        if (Math.abs(ra.top - rb.top) > 8) return ra.top - rb.top;
        return ra.left - rb.left;
      });
      visible.forEach(function (entry) {
        entry.target.style.transitionDelay = seen * 150 + "ms";
        seen += 1;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.28 }
  );

  document.querySelectorAll(".reveal").forEach(function (el) {
    revealObserver.observe(el);
  });
})();

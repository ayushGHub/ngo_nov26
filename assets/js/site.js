/* LEAF — site behaviour. Vanilla ES2019+, no dependencies. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.dataset.stuck = window.scrollY > 8 ? "true" : "false";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    var setNav = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.dataset.open = String(open);
    };
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        toggle.focus();
      }
    });
    // reset when resizing up to desktop
    window.matchMedia("(min-width: 1101px)").addEventListener("change", function (m) {
      if (m.matches) setNav(false);
    });
  }

  /* ---------- homepage section navigation ---------- */
  if (nav && (window.location.pathname === "/" || window.location.pathname.endsWith("/index.html"))) {
    var navLinks = Array.prototype.slice.call(nav.querySelectorAll("a[href]"));
    var homeLink = navLinks.find(function (link) {
      var url = new URL(link.href, window.location.href);
      return (url.pathname === "/" || url.pathname.endsWith("/index.html")) && !url.hash;
    });
    var navSections = navLinks.map(function (link) {
      var url = new URL(link.href, window.location.href);
      var section = url.hash && document.getElementById(url.hash.slice(1));
      return section && (url.pathname === "/" || url.pathname.endsWith("/index.html"))
        ? { link: link, section: section }
        : null;
    }).filter(Boolean);

    if (homeLink && navSections.length) {
      var updateCurrentSection = function () {
        var marker = window.scrollY + (header ? header.offsetHeight : 0) + Math.min(window.innerHeight * .2, 120);
        var current = homeLink;
        navSections.forEach(function (item) {
          if (item.section.getBoundingClientRect().top + window.scrollY <= marker) current = item.link;
        });
        navLinks.forEach(function (link) { link.removeAttribute("aria-current"); });
        current.setAttribute("aria-current", current === homeLink ? "page" : "location");
      };
      var scheduleCurrentSectionUpdate = function () {
        window.requestAnimationFrame(updateCurrentSection);
      };
      window.addEventListener("scroll", scheduleCurrentSectionUpdate, { passive: true });
      window.addEventListener("resize", scheduleCurrentSectionUpdate);
      window.addEventListener("hashchange", scheduleCurrentSectionUpdate);
      updateCurrentSection();
    }
  }

  /* ---------- hero carousel ---------- */
  var hero = document.querySelector("[data-carousel]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero__slide"));
    var dotWrap = hero.querySelector(".hero__dots");
    var prevBtn = hero.querySelector('[data-carousel-prev]');
    var nextBtn = hero.querySelector('[data-carousel-next]');
    var index = 0;
    var timer = null;
    var DELAY = 7000;

    var dots = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Show slide " + (i + 1) + " of " + slides.length);
      b.addEventListener("click", function () { go(i); restart(); });
      if (dotWrap) dotWrap.appendChild(b);
      return b;
    });

    function go(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var on = i === index;
        s.dataset.active = String(on);
        s.setAttribute("aria-hidden", String(!on));
        // keep offscreen slides out of the tab order
        s.querySelectorAll("a, button").forEach(function (el) {
          if (on) el.removeAttribute("tabindex");
          else el.setAttribute("tabindex", "-1");
        });
      });
      dots.forEach(function (d, i) {
        d.setAttribute("aria-selected", String(i === index));
      });
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      if (reduceMotion || slides.length < 2) return;
      stop();
      timer = setInterval(function () { go(index + 1); }, DELAY);
    }
    function restart() { stop(); start(); }

    if (prevBtn) prevBtn.addEventListener("click", function () { go(index - 1); restart(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { go(index + 1); restart(); });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", start);
    hero.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { go(index - 1); restart(); }
      if (e.key === "ArrowRight") { go(index + 1); restart(); }
    });
    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });

    // touch swipe
    var x0 = null;
    hero.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
      x0 = null;
      start();
    }, { passive: true });

    go(0);
    start();
  }

  /* ---------- scroll reveal + progress meters ---------- */
  var revealables = document.querySelectorAll(".reveal");
  var meters = document.querySelectorAll(".meter__fill");

  function fillMeter(el) {
    var pct = parseFloat(el.dataset.pct || "0");
    el.style.width = Math.max(0, Math.min(100, pct)) + "%";
  }

  function showAll() {
    revealables.forEach(function (el) { el.dataset.shown = "true"; });
    meters.forEach(fillMeter);
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.dataset.shown = "true";
        en.target.querySelectorAll(".meter__fill").forEach(fillMeter);
        io.unobserve(en.target);
      });
      // a fixed offset, not a percentage: on a very tall viewport a
      // percentage pushes the trigger line above content already on screen
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0.1 });
    revealables.forEach(function (el) { io.observe(el); });
    // meters outside a .reveal still need filling
    meters.forEach(function (m) { if (!m.closest(".reveal")) fillMeter(m); });
    // belt and braces: never leave content hidden if the observer misses
    window.addEventListener("load", function () { setTimeout(showAll, 1200); });
  } else {
    showAll();
  }

  /* ---------- copy to clipboard ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.dataset.copy;
      var done = function () {
        var old = btn.textContent;
        btn.dataset.copied = "true";
        btn.textContent = "Copied";
        setTimeout(function () {
          btn.textContent = old;
          btn.removeAttribute("data-copied");
        }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (err) { /* no-op */ }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- lightbox ----------
     Enhances gallery links. Each .gallery__item is a real <a href="full.jpg">,
     so with no JS the image simply opens in a new tab. */
  var galleryLinks = Array.prototype.slice.call(document.querySelectorAll(".gallery__item[href]"));
  if (galleryLinks.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML =
      '<button class="lightbox__btn lightbox__btn--close" type="button" aria-label="Close viewer">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<button class="lightbox__btn lightbox__btn--prev" type="button" aria-label="Previous photo">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<button class="lightbox__btn lightbox__btn--next" type="button" aria-label="Next photo">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>' +
      '<figure style="margin:0;display:grid;place-items:center">' +
      '<img class="lightbox__img" alt="">' +
      '<figcaption class="lightbox__cap"></figcaption>' +
      '<div class="lightbox__count" aria-live="polite"></div></figure>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector(".lightbox__img");
    var lbCap = lb.querySelector(".lightbox__cap");
    var lbNum = lb.querySelector(".lightbox__count");
    var lbIndex = 0;
    var lastFocus = null;

    function lbShow(i) {
      lbIndex = (i + galleryLinks.length) % galleryLinks.length;
      var link = galleryLinks[lbIndex];
      var thumb = link.querySelector("img");
      var cap = link.querySelector("figcaption");
      lbImg.src = link.getAttribute("href");
      lbImg.alt = thumb ? thumb.alt : "";
      lbCap.textContent = cap ? cap.textContent.trim() : (thumb ? thumb.alt : "");
      lbNum.textContent = (lbIndex + 1) + " of " + galleryLinks.length;
    }
    function lbOpen(i) {
      lastFocus = document.activeElement;
      lbShow(i);
      lb.dataset.open = "true";
      document.body.dataset.lbOpen = "true";
      lb.querySelector(".lightbox__btn--close").focus();
    }
    function lbClose() {
      lb.removeAttribute("data-open");
      document.body.removeAttribute("data-lb-open");
      lbImg.removeAttribute("src");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    galleryLinks.forEach(function (link, i) {
      link.addEventListener("click", function (e) {
        // let modified clicks fall through to the browser
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        lbOpen(i);
      });
    });

    lb.querySelector(".lightbox__btn--close").addEventListener("click", lbClose);
    lb.querySelector(".lightbox__btn--prev").addEventListener("click", function () { lbShow(lbIndex - 1); });
    lb.querySelector(".lightbox__btn--next").addEventListener("click", function () { lbShow(lbIndex + 1); });
    lb.addEventListener("click", function (e) {
      if (e.target === lb) lbClose();   // backdrop click
    });
    document.addEventListener("keydown", function (e) {
      if (lb.dataset.open !== "true") return;
      if (e.key === "Escape") lbClose();
      if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
      if (e.key === "ArrowRight") lbShow(lbIndex + 1);
      if (e.key === "Tab") {   // keep focus inside the dialog
        var f = lb.querySelectorAll("button");
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();

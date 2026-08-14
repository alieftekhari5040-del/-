/* ═══════════════════════════════════════════════════════════
   VITTO — Season Planner · interactions
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Helpers ──────────────────────────────────────────── */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ── Planner data ──────────────────────────────────────── */
  const PLANNER = {
    spring: {
      name: "Spring",
      range: "March · April · May",
      accent: "#b7c9a8",
      headline: "Clear the space, <em>let things grow.</em>",
      months: [
        { m: "Mar", d: "Spring reset — declutter your space, wardrobe and calendar." },
        { m: "Apr", d: "Wardrobe switch: light layers, soft hues, airy textures." },
        { m: "May", d: "Slow mornings, early blooms and one fresh weekly ritual." }
      ]
    },
    summer: {
      name: "Summer",
      range: "June · July · August",
      accent: "#d9a441",
      headline: "Longest light, <em>lived slowly.</em>",
      months: [
        { m: "Jun", d: "Extend evenings outdoors — plan sunset rituals, not schedules." },
        { m: "Jul", d: "Peak golden hour: escapes, swims and open-air meals." },
        { m: "Aug", d: "Harvest warmth — savor late summer with intention." }
      ]
    },
    autumn: {
      name: "Autumn",
      range: "September · October · November",
      accent: "#a04d2b",
      headline: "Gather, reflect, <em>layer warmly.</em>",
      months: [
        { m: "Sep", d: "Gentle shift — introduce layers and warm tones to your days." },
        { m: "Oct", d: "The cozy season: candlelit evenings, amber walks, slow food." },
        { m: "Nov", d: "Gather & give — plan around gratitude and small gatherings." }
      ]
    },
    winter: {
      name: "Winter",
      range: "December · January · February",
      accent: "#cfdde8",
      headline: "Rest deeply, <em>begin softly.</em>",
      months: [
        { m: "Dec", d: "Wrap in warmth — gatherings, glow and generous pauses." },
        { m: "Jan", d: "New year, new plan: set twelve months of clear intentions." },
        { m: "Feb", d: "Rest deeply — stillness, low light and small quiet joys." }
      ]
    }
  };

  const renderPlanner = (seasonKey) => {
    const s = PLANNER[seasonKey];
    const stage = $("#plannerStage");
    if (!stage || !s) return;

    stage.innerHTML = `
      <div class="planner__panel is-active" style="--season-accent:${s.accent}">
        <div>
          <p class="planner__months">${s.range}</p>
          <h3>${s.headline}</h3>
          <p class="section-lead">The Vitto recommended rhythm for ${s.name.toLowerCase()} — three months, three focuses, one clear plan.</p>
        </div>
        <div class="planner__months-grid">
          ${s.months.map(m => `
            <div class="planner__month">
              <b>${m.m}</b>
              <p>${m.d}</p>
            </div>`).join("")}
        </div>
      </div>`;
  };

  /* ── Nav: scrolled state ──────────────────────────────── */
  const nav = $("#nav");
  const onScrollNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScrollNav();

  /* ── Back to top ──────────────────────────────────────── */
  const toTop = $("#toTop");
  const onScrollToTop = () => {
    const visible = window.scrollY > 700;
    toTop.classList.toggle("is-visible", visible);
  };
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ── Scroll handler (raf-throttled) ───────────────────── */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollNav();
      onScrollToTop();
      heroParallax();
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── Hero parallax ────────────────────────────────────── */
  const heroMedia = $("#heroMedia");
  const heroImg  = heroMedia ? $("img", heroMedia) : null;
  const heroParallax = () => {
    if (!heroImg) return;
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroImg.style.transform = `scale(1.06) translateY(${y * 0.22}px)`;
    }
  };
  heroParallax();

  /* ── Mobile menu ──────────────────────────────────────── */
  const toggle = $("#navToggle");
  const menu   = $("#navMenu");
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$(".nav__link, .nav__cta", menu).forEach(link =>
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ── Reveal on scroll ─────────────────────────────────── */
  const revealEls = $$(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  revealEls.forEach((el, i) => {
    el.style.setProperty("--d", `${Math.min(i % 4, 3) * 0.09}s`);
    io.observe(el);
  });

  /* ── Active nav link (section spy) ────────────────────── */
  const sections = ["seasons", "planner", "lookbook", "contact"]
    .map(id => document.getElementById(id)).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $$(".nav__link").forEach(l =>
        l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-38% 0px -55% 0px" });
  sections.forEach(s => spy.observe(s));

  /* ── Stats counters ───────────────────────────────────── */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10) || 0;
      const dur = 1400;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$(".stat__num").forEach(n => counterIO.observe(n));

  /* ── Planner tabs ─────────────────────────────────────── */
  const tabs = $$(".planner__tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderPlanner(tab.dataset.season);
    });
  });
  renderPlanner("spring");

  /* ── Newsletter form (front-end demo) ─────────────────── */
  const form = $("#newsletterForm");
  const note = $("#formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#email").value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!valid) {
      note.textContent = "Please enter a valid email address.";
      note.className = "contact__note is-err";
      return;
    }
    note.textContent = "Welcome to the Vitto List — see you next season. 🍂";
    note.className = "contact__note is-ok";
    form.reset();
  });

  /* ── Footer year ──────────────────────────────────────── */
  $("#year").textContent = new Date().getFullYear();
})();

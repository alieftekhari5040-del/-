/* ═══════════════════════════════════════════════════════════
   THE ASCENT BLUEPRINT — برنامه روزانه · interactions
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ── Persian (Jalali) date ────────────────────────────── */
  const faDate = () => new Intl.DateTimeFormat("fa-IR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  }).format(new Date());

  const heroDate = $("#heroDate");
  if (heroDate) heroDate.textContent = faDate();

  const planDate = $("#planDate");
  if (planDate) planDate.value = faDate();

  /* ── Nav: scrolled state ──────────────────────────────── */
  const nav = $("#nav");
  const toTop = $("#toTop");
  const onScrollNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  const onScrollToTop = () => toTop.classList.toggle("is-visible", window.scrollY > 700);
  onScrollNav();

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

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

  /* ── Scroll (raf-throttled) ───────────────────────────── */
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollNav();
      onScrollToTop();
      ticking = false;
    });
  }, { passive: true });

  /* ── Reveal on scroll ─────────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el, i) => {
    el.style.setProperty("--d", `${Math.min(i % 4, 3) * 0.09}s`);
    io.observe(el);
  });

  /* ── Active nav link (section spy) ────────────────────── */
  const sections = ["planner", "features", "design", "contact"]
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
      const dur = 1300;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("fa-IR");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$(".stat__num").forEach(n => counterIO.observe(n));

  /* ── Planner: persist to localStorage ─────────────────── */
  const PLAN_KEY = "ascent-daily-plan-v1";
  const writables = $$(".plan__write");
  const checks    = $$(".plan__check input");

  const save = () => {
    const data = {
      date: planDate ? planDate.value : "",
      writes: writables.map(el => el.innerHTML),
      checks: checks.map(c => c.checked)
    };
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  };

  const load = () => {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(PLAN_KEY) || "null"); } catch (e) { /* ignore */ }
    if (!data) return;
    if (data.date && planDate) planDate.value = data.date;
    writables.forEach((el, i) => { if (data.writes && data.writes[i]) el.innerHTML = data.writes[i]; });
    checks.forEach((c, i) => { if (data.checks && data.checks[i]) c.checked = data.checks[i]; });
  };

  writables.forEach(el => el.addEventListener("input", save));
  checks.forEach(c => c.addEventListener("change", save));
  if (planDate) planDate.addEventListener("change", save);

  /* ── Planner: reset ───────────────────────────────────── */
  $("#resetPlan").addEventListener("click", () => {
    if (!confirm("برنامه امروز از اول پاک شود؟")) return;
    writables.forEach(el => (el.innerHTML = ""));
    checks.forEach(c => (c.checked = false));
    if (planDate) planDate.value = faDate();
    save();
  });

  /* ── Planner: print / PDF ─────────────────────────────── */
  $("#printPlan").addEventListener("click", () => window.print());

  /* ── Newsletter form ──────────────────────────────────── */
  const form = $("#newsletterForm");
  const note = $("#formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#email").value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!valid) {
      note.textContent = "لطفاً یک ایمیل معتبر وارد کن.";
      note.className = "contact__note is-err";
      return;
    }
    note.textContent = "خوش آمدی به آسنت — اولین قدم را همین امروز بردار. 🏔️";
    note.className = "contact__note is-ok";
    form.reset();
  });

  /* ── Footer year ──────────────────────────────────────── */
  $("#year").textContent = new Date().getFullYear();

  /* ── Init ─────────────────────────────────────────────── */
  load();
})();

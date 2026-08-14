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

  const planDate = $("#planDate");
  if (planDate) planDate.value = faDate();

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

  /* ── Reset ────────────────────────────────────────────── */
  $("#resetPlan").addEventListener("click", () => {
    if (!confirm("برنامه امروز از اول پاک شود؟")) return;
    writables.forEach(el => (el.innerHTML = ""));
    checks.forEach(c => (c.checked = false));
    if (planDate) planDate.value = faDate();
    save();
  });

  /* ── Print / PDF ──────────────────────────────────────── */
  $("#printPlan").addEventListener("click", () => window.print());

  /* ── Footer year ──────────────────────────────────────── */
  $("#year").textContent = new Date().getFullYear();

  /* ── Init ─────────────────────────────────────────────── */
  load();
})();

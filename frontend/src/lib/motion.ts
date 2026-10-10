// ============================================================
// MOTION PRESETS — a small, shared vocabulary for animation across
// the app. Before this, every bottom sheet independently wrote its
// own near-identical spring config (damping:30, stiffness:340 in
// most places, but a couple of showcase moments — Wrapped's slide
// reveals — used Framer Motion's bare `type:'spring'` with no
// damping/stiffness specified at all, which defaults to a fairly
// bouncy, game-like motion). That inconsistency is what read as
// "unprofessional" — a premium interface has ONE considered feel,
// not five almost-matching ones.
// ============================================================

// Bottom sheets sliding up (MemberSheet, GlobalNav, PersonalFinance,
// NotificationBell, TripDetailPage's memory sheet). Snappy but
// controlled — reaches its position quickly with only the faintest
// settle, no visible overshoot/bounce.
export const sheetSpring = { type: 'spring', damping: 32, stiffness: 340, mass: 0.9 } as const;

// Content reveals — cards, modals, showcase moments (Wrapped's
// slides). A refined ease-out curve rather than a spring: springs
// imply physical bounce, which suits a sheet being flicked into place
// but reads as playful/toy-like for something like a stat reveal.
// This curve (a gentle ease-out-expo) is the same family of easing
// used by Stripe, Linear, Vercel's own product UIs for entrance
// motion — confident deceleration, zero overshoot.
export const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;
export const revealTransition = (delay = 0) => ({ duration: 0.5, delay, ease: REVEAL_EASE });

// Small pop-ins (badges, achievement unlocks, emoji reactions) — a
// restrained spring, noticeably calmer than Framer's bare default.
export const popSpring = { type: 'spring', damping: 22, stiffness: 260 } as const;

// Standard fade+rise for lists and page content.
export const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

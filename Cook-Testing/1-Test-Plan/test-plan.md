# Test Plan — Cook's Application

**Document Version:** 1.0  
**Date:** April 2026  
**Project:** Cook's — AI-Powered Smart Arabic & International Kitchen Platform  
**Prepared by:** Rania Bouali  

---

## 1. Introduction

This test plan defines the strategy, scope, resources, and schedule for testing the Cook's web application. The plan focuses on verifying the correctness, reliability, and performance of the community, profile, challenge, authentication, and notifications features.

---

## 2. Scope

### 2.1 In Scope

The following modules are included in this test cycle:

| Module | Description |
|---|---|
| **Authentication** | Sign up, Sign in, Guest mode, Logout, session persistence |
| **Daily Challenges** | Guess the Dish, Missing Ingredient, True or False |
| **Streak System** | One-per-day enforcement, streak increment, emoji unlock at 3/7/14 |
| **Community Feed** | Post creation (text + photo), reactions, comments, sharing |
| **User Profile** | XP calculation, level display, badge unlock, heatmap, avatar upload |
| **Notifications** | Bell badge, unread count, mark-all-read, dropdown panel |
| **Multilingual Support** | EN / FR / AR language switching |

### 2.2 Out of Scope

The following modules are explicitly excluded from this test cycle:

- Smart Fridge (3D rendering, ingredient shelf management)
- Recipe Discovery (search, filter, guided cooking)
- Home page hero section and trending grid
- Meal Planner calendar view
- Backend API integration (tested separately)

---

## 3. Objectives

1. **Verify functional requirements** — Every feature behaves as specified in the HCI report.
2. **Data persistence** — localStorage state survives page refresh and browser restart.
3. **One-challenge-per-day logic** — A user cannot play more than one challenge per calendar day.
4. **Streak unlock thresholds** — Emoji reactions unlock exactly at streak 3 (🫕), 7 (🧆), and 14 (🥙).
5. **Multilingual support** — All UI strings switch correctly in EN, FR, and AR. RTL layout applies for Arabic.
6. **Reaction system** — Each post allows one active reaction per user; toggling deselects; switching changes counts.
7. **Profile accuracy** — XP = streak × 180; level thresholds are Beginner (0–499 XP), Home Chef (500–999 XP), Skilled Cook (1000–1799 XP), Master Chef (1800+ XP).

---

## 4. Test Environment

### 4.1 Browsers

| Browser | Version | Role |
|---|---|---|
| Google Chrome | 120+ | Primary test browser |
| Mozilla Firefox | 121+ | Cross-browser validation |
| Opera | Latest | Third browser check |

### 4.2 Server

- **Live Server** extension in VS Code (port 5500)
- URL: `http://localhost:5500/index.html`

### 4.3 Tools

| Tool | Purpose |
|---|---|
| Chrome DevTools | Performance profiling, localStorage inspection, console errors |
| DevTools → Application → Storage | Inspect and modify localStorage values |
| DevTools → Network | Verify asset load times |
| DevTools → Console | Catch JavaScript errors |
| Node.js + selenium-webdriver | End-to-end automation |

---

## 5. Test Deliverables

| Deliverable | File | Description |
|---|---|---|
| Test Cases | `2-Black-Box-Testing/test-cases.md` | 50+ detailed functional test cases |
| Equivalence Partitioning | `2-Black-Box-Testing/equivalence-partitioning.md` | Input class analysis |
| Boundary Value Analysis | `2-Black-Box-Testing/boundary-value-analysis.md` | Edge value tests |
| Decision Tables | `2-Black-Box-Testing/decision-tables.md` | Logic combinations |
| State Transition Diagrams | `2-Black-Box-Testing/state-transition.md` | State machine docs |
| Traceability Matrix | `2-Black-Box-Testing/traceability-matrix.md` | Req-to-test mapping |
| Unit Tests | `3-White-Box-Testing/unit-tests.js` | JS unit test suite |
| Test Runner | `3-White-Box-Testing/test-runner.html` | Browser test runner |
| Coverage Report | `3-White-Box-Testing/coverage-report.md` | Code coverage analysis |
| Static Analysis | `3-White-Box-Testing/static-analysis.md` | Code review findings |
| Bug Reports | `4-Bug-Reports/bug-log.md` | Logged defects |
| Performance Results | `5-Performance-Testing/performance-results.md` | Benchmark data |
| Selenium Scripts | `6-Selenium-Automation/` | Automated E2E tests |

---

## 6. Test Schedule

| Day | Activities |
|---|---|
| **Day 1** | Environment setup, review HCI report, create test cases (TC-001 to TC-025) |
| **Day 2** | Execute auth and challenge test cases (TC-001 to TC-025), log bugs |
| **Day 3** | Execute community and profile test cases (TC-026 to TC-050), log bugs |
| **Day 4** | Write and run unit tests; conduct performance benchmarks; static analysis |
| **Day 5** | Run Selenium scripts; finalize bug log; compile traceability matrix; review report |

---

## 7. Performance Benchmarks

All measurements are taken on Chrome 120 with hardware acceleration enabled, on localhost (Live Server).

| Metric | Target | Priority |
|---|---|---|
| Initial page load (auth overlay visible) | < 2 seconds | High |
| Community feed render (10 posts) | < 500 ms | High |
| Challenge cards render | < 500 ms | High |
| Profile page load with heatmap | < 1 second | Medium |
| Reaction click response (count update) | < 100 ms | High |
| Language switch (full UI re-render) | < 300 ms | Medium |
| Notification panel open | < 100 ms | Low |
| localStorage write (save recipe) | < 50 ms | Low |

---

## 8. Entry and Exit Criteria

### 8.1 Entry Criteria
- Application runs without console errors on Live Server.
- All target features are implemented and visible in the UI.
- Test environment is configured.

### 8.2 Exit Criteria
- All 50 test cases have been executed.
- All Critical and High severity bugs are resolved or documented.
- Unit test pass rate ≥ 90%.
- Selenium scripts run without unexpected failures.
- Traceability matrix shows 100% requirement coverage.

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| localStorage cleared between sessions | Medium | High | Document test setup steps to re-initialize state |
| Date-dependent tests fail on wrong system date | Low | Medium | Set system date manually if needed |
| Selenium ChromeDriver version mismatch | Medium | Medium | Pin ChromeDriver version matching installed Chrome |
| Challenge one-per-day makes streak tests slow | High | Medium | Manually set `challenge_played_date` to yesterday in localStorage |

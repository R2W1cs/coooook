# Cook's — Testing Suite

## Project Overview

Cook's is an AI-powered Arabic and international kitchen platform. It provides features including a smart fridge manager, recipe discovery, weekly meal planner, community feed, daily challenges with streak rewards, and a user profile system. The application runs entirely in the browser, using localStorage for persistence and optionally connecting to a PHP backend.

This testing suite covers the **community, profile, challenges, authentication, and notifications** modules in depth. It is structured across five testing disciplines: black-box functional testing, white-box unit testing, bug tracking, performance benchmarking, and Selenium end-to-end automation.

---

## Testing Scope

| Module | In Scope |
|---|---|
| Authentication (Sign up, Sign in, Guest mode, Logout) | ✅ |
| Daily Challenges (Guess the Dish, Missing Ingredient, True or False) | ✅ |
| Streak system and emoji unlock (3 / 7 / 14 days) | ✅ |
| Community Feed (posts, reactions, comments, sharing) | ✅ |
| User Profile (XP, level, badges, heatmap, avatar) | ✅ |
| Notifications (bell, badge count, mark-all-read) | ✅ |
| Smart Fridge management | ❌ (out of scope) |
| Recipe Discovery and filters | ❌ (out of scope) |
| Home page hero and category sections | ❌ (out of scope) |
| Meal Planner calendar | ❌ (out of scope) |

---

## How to Run Each Type of Test

### Black-Box Tests (Manual)
1. Open `index.html` using **Live Server** in VS Code.
2. Open the test case file: `2-Black-Box-Testing/test-cases.md`.
3. Execute each test case step-by-step.
4. Record **Actual Result** and **Status** in the table.

### White-Box Unit Tests (Browser)
1. Open `3-White-Box-Testing/test-runner.html` using **Live Server**.
2. Tests run automatically on page load.
3. Green rows = Pass, Red rows = Fail.
4. Check the browser console for detailed error messages.

### Performance Tests (Manual / DevTools)
1. Open `index.html` in Chrome.
2. Open **DevTools → Performance** tab.
3. Record while navigating to each page.
4. Compare timings against targets in `5-Performance-Testing/performance-results.md`.

### Selenium Automation (Node.js)
1. Follow setup instructions in `6-Selenium-Automation/selenium-setup.md`.
2. Start Live Server on port 5500.
3. Run: `node 6-Selenium-Automation/test-login.js`
4. Run: `node 6-Selenium-Automation/test-challenges.js`
5. Run: `node 6-Selenium-Automation/test-community.js`

---

## Tools Required

| Tool | Purpose | Version |
|---|---|---|
| VS Code + Live Server | Serve the application locally | Latest |
| Google Chrome | Primary test browser | 120+ |
| Mozilla Firefox | Cross-browser testing | 121+ |
| Opera | Third browser validation | Latest |
| Chrome DevTools | Performance profiling | Built-in |
| Node.js | Run Selenium scripts | 18+ |
| selenium-webdriver (npm) | Browser automation | 4.x |
| ChromeDriver | Selenium Chrome driver | Match Chrome version |

---

## Team Members and Responsibilities

| Name | Role | Responsibilities |
|---|---|---|
| Rania Bouali | Test Lead / QA Engineer | Test plan, black-box cases, bug reporting |
| Team Member 2 | White-Box Tester | Unit tests, coverage analysis, static review |
| Team Member 3 | Automation Engineer | Selenium scripts, performance testing |
| Team Member 4 | Documentation | Traceability matrix, reports, README |

---

## Folder Structure

```
Cook-Testing/
├── README.md                          ← This file
├── 1-Test-Plan/
│   └── test-plan.md                   ← Full test plan document
├── 2-Black-Box-Testing/
│   ├── test-cases.md                  ← 50+ functional test cases
│   ├── equivalence-partitioning.md    ← Input class analysis
│   ├── boundary-value-analysis.md     ← Boundary value tests
│   ├── decision-tables.md             ← Logic decision tables
│   ├── state-transition.md            ← State machine diagrams
│   └── traceability-matrix.md         ← Requirements coverage
├── 3-White-Box-Testing/
│   ├── unit-tests.js                  ← JavaScript unit tests
│   ├── test-runner.html               ← Browser test runner
│   ├── coverage-report.md             ← Code coverage analysis
│   └── static-analysis.md            ← Manual code review
├── 4-Bug-Reports/
│   └── bug-log.md                     ← Bug tracking log
├── 5-Performance-Testing/
│   └── performance-results.md         ← Benchmark results
└── 6-Selenium-Automation/
    ├── selenium-setup.md              ← Setup instructions
    ├── test-login.js                  ← Auth flow automation
    ├── test-challenges.js             ← Challenge flow automation
    └── test-community.js             ← Community flow automation
```

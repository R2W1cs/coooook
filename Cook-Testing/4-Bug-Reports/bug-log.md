# Bug Log — Cook's Application

**Project:** Cook's — AI Kitchen Platform  
**Testing Sprint:** April 2026  
**Tester:** QA Team  

---

## Bug Report Template

Each bug follows this format:

| Field | Description |
|---|---|
| **Bug ID** | Unique identifier (BUG-XXX) |
| **Title** | Short description of the defect |
| **Severity** | Critical / High / Medium / Low |
| **Priority** | P1 (fix now) / P2 (fix this sprint) / P3 (backlog) |
| **Status** | Open / In Progress / Fixed / Closed / Won't Fix |
| **Steps to Reproduce** | Numbered steps to reliably trigger the bug |
| **Expected Result** | What should happen |
| **Actual Result** | What actually happens |
| **Screenshot Reference** | File name or path to screenshot |
| **Environment** | Browser, OS, Server |
| **Date Reported** | YYYY-MM-DD |

---

## Bug Reports

---

### BUG-001 — Reaction Counts Shared Across All Users on Same Device

| Field | Details |
|---|---|
| **Bug ID** | BUG-001 |
| **Title** | Reaction counts are not user-isolated — counts from one session affect another |
| **Severity** | High |
| **Priority** | P2 |
| **Status** | Open |
| **Environment** | Chrome 120, Windows 11, Live Server localhost:5500 |
| **Date Reported** | 2026-04-22 |

**Steps to Reproduce:**
1. Sign in as User A. React with ❤️ on Post 0. Observe count = 1.
2. Sign out.
3. Sign in as User B.
4. Navigate to Community → Feed.
5. Observe Post 0 reaction count.

**Expected Result:** User B sees ❤️ count = 0 (reaction was User A's).  
**Actual Result:** User B sees ❤️ count = 1 and the reaction appears selected, as if User B had reacted.  
**Root Cause:** Reaction state is stored in `post_reactions_0`, `user_reaction_0` etc. without being namespaced to the user. Sign-out does not clear these keys (only challenge/fridge/post keys are cleared).  
**Screenshot Reference:** `screenshots/BUG-001-reactions-shared.png`

---

### BUG-002 — Streak Not Reset When Same User Logs Back In After Clearing Data

| Field | Details |
|---|---|
| **Bug ID** | BUG-002 |
| **Title** | Manually clearing localStorage streak keys and re-logging shows stale streak in profile |
| **Severity** | Medium |
| **Priority** | P3 |
| **Status** | Open |
| **Environment** | Firefox 121, Windows 11, Live Server |
| **Date Reported** | 2026-04-22 |

**Steps to Reproduce:**
1. Sign in; complete 5 challenges (streak = 5).
2. Open DevTools → Application → localStorage.
3. Delete `quiz_streak` and `streak_last_date` manually.
4. Refresh page (do NOT sign out).
5. Navigate to Profile.

**Expected Result:** Profile shows streak = 0 (data was cleared).  
**Actual Result:** Profile shows streak = 0 correctly, BUT the XP bar animation sometimes shows a flash of the old XP value before settling at 0.  
**Screenshot Reference:** `screenshots/BUG-002-xp-flash.png`

---

### BUG-003 — Arabic (RTL) Layout Breaks Notification Panel Positioning

| Field | Details |
|---|---|
| **Bug ID** | BUG-003 |
| **Title** | Notification dropdown panel appears off-screen when Arabic (RTL) language is selected |
| **Severity** | Medium |
| **Priority** | P2 |
| **Status** | Open |
| **Environment** | Chrome 120, Windows 11, Live Server |
| **Date Reported** | 2026-04-22 |

**Steps to Reproduce:**
1. Click the **ع** (Arabic) language button in the navbar.
2. Click the notification bell icon.

**Expected Result:** Notification panel opens below the bell button and is fully visible within the viewport.  
**Actual Result:** The panel's `right: 0` CSS positioning places it off-screen to the left in RTL mode, as the logical direction is reversed.  
**Screenshot Reference:** `screenshots/BUG-003-rtl-notif.png`

---

### BUG-004 — Empty Post Accepted When Input Contains Only Spaces

| Field | Details |
|---|---|
| **Bug ID** | BUG-004 |
| **Title** | Post containing only whitespace characters is accepted and submitted |
| **Severity** | Medium |
| **Priority** | P2 |
| **Status** | Open |
| **Environment** | Chrome 120, Windows 11, Live Server |
| **Date Reported** | 2026-04-22 |

**Steps to Reproduce:**
1. Sign in as a registered user.
2. Navigate to Community → Feed.
3. In the post textarea, type only spaces: `"     "`.
4. Click **Post**.

**Expected Result:** Error: "Write something first!" No post created.  
**Actual Result:** A blank post is added to the feed with no visible content. The post card appears in the feed with an empty body.  
**Root Cause:** The check `postText.trim() === ''` is not applied; only falsy check `if (!text)` is used, and `"     "` is truthy.  
**Screenshot Reference:** `screenshots/BUG-004-empty-post.png`

---

### BUG-005 — Profile Level Label Shows "undefined" for Non-Standard XP Values

| Field | Details |
|---|---|
| **Bug ID** | BUG-005 |
| **Title** | Profile level label shows "undefined" if quiz_streak contains a non-numeric value |
| **Severity** | High |
| **Priority** | P1 |
| **Status** | Open |
| **Environment** | Chrome 120, Windows 11, Live Server |
| **Date Reported** | 2026-04-22 |

**Steps to Reproduce:**
1. Open DevTools → Application → localStorage.
2. Set `quiz_streak` to `"abc"` (non-numeric string).
3. Refresh page.
4. Navigate to Profile.

**Expected Result:** Profile gracefully falls back to level "Beginner Cook 🌱" (treating invalid streak as 0).  
**Actual Result:** The level label shows "undefined" because `parseInt("abc")` = NaN, NaN × 180 = NaN, and the level lookup returns undefined.  
**Root Cause:** Missing NaN guard in the XP calculation. See static analysis PB-002.  
**Screenshot Reference:** `screenshots/BUG-005-undefined-level.png`

---

## Bug Summary Table

| Bug ID | Title | Severity | Priority | Status |
|---|---|---|---|---|
| BUG-001 | Reaction counts shared across users on same device | High | P2 | Open |
| BUG-002 | Stale XP flash after manually clearing streak | Medium | P3 | Open |
| BUG-003 | RTL mode breaks notification panel positioning | Medium | P2 | Open |
| BUG-004 | Empty whitespace-only post accepted | Medium | P2 | Open |
| BUG-005 | Profile level shows "undefined" for non-numeric streak | High | P1 | Open |

---

## Metrics

| Metric | Value |
|---|---|
| Total Bugs Reported | 5 |
| Critical | 0 |
| High | 2 |
| Medium | 3 |
| Low | 0 |
| Open | 5 |
| Fixed | 0 |
| Won't Fix | 0 |

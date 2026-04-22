# Static Analysis Report — Cook's Application

**Date:** April 2026  
**Analyst:** QA Team  
**File reviewed:** `script.js` (~2,500 lines)  
**Method:** Manual code review  

---

## 1. Code Smells

### CS-001 — Long Functions

| Function | Approx. Lines | Issue |
|---|---|---|
| `renderProfile()` | ~200 | Does too much: computes XP, renders badges, heatmap, stats, saved recipes, and sign-out — all in one function. Should be split into `renderProfileHeader()`, `renderProfileBadges()`, `renderProfileStats()`. |
| `renderQuiz()` | ~100 | Constructs three full challenge card HTML blocks inline with embedded JS event handlers. Should use separate `renderGuessTheDish()`, `renderMissingIngredient()`, `renderTrueOrFalse()` functions. |
| `renderCommunity()` | ~80 | Orchestrates feed AND challenge panel from a single function. The two concerns should be separated. |
| `bootApp()` | ~30 | Mixes session setup, DOM manipulation, data loading, and navigation. |

### CS-002 — Duplicated Code

| Pattern | Locations | Description |
|---|---|---|
| `generateNotifications(); renderNotifBadge();` | Lines 1393, 1957, 1967, 1977 | Called after every challenge submission. Should be a single helper: `refreshNotifications()`. |
| `localStorage.getItem('quiz_streak') \|\| '0'` | At least 8 locations | Repeated pattern. Should be extracted to `getStreak()` helper. |
| `JSON.parse(localStorage.getItem('heatmap_days') \|\| '[]')` | Lines 1818, profile render | Repeated. Should be `getHeatmapDays()`. |
| `document.getElementById('page-profile').classList.contains('active')` | Lines 1820, 1956, 1966, 1976 | Repeated DOM query. Should be `isProfilePageActive()`. |

### CS-003 — Magic Numbers / Strings

| Value | Location | Issue |
|---|---|---|
| `180` (XP per streak day) | Inside `renderProfile()` | Should be a named constant `XP_PER_STREAK_DAY = 180`. |
| `3, 7, 14` (streak thresholds) | Multiple places | Should be `STREAK_THRESHOLDS = [3, 7, 14]` or similar. |
| `20` (notification cap) | `generateNotifications()` | Should be `MAX_NOTIFICATIONS = 20`. |
| `'quiz_streak'`, `'challenge_played_date'` | 10+ locations each | localStorage key strings should be constants at the top of the file to prevent typo bugs. |

### CS-004 — Long Inline HTML Strings

Several functions use multi-hundred-character template literals to render complex HTML. While common in vanilla JS apps, this makes the code hard to read and debug. Consider using a helper `el(tag, attrs, children)` builder or a minimal template function.

---

## 2. Potential Bugs

### PB-001 — Missing Null Checks on DOM Elements

**Location:** Multiple rendering functions  
**Description:** Several functions call `document.getElementById('...')` and immediately call methods on the result without checking for `null`. If the element is not in the DOM at the time the function runs (e.g., during initialization), a `TypeError: Cannot read properties of null` is thrown.

**Example:**
```javascript
// Line ~1380 in toggleSaveRecipe
document.getElementById('homesSavedCount').textContent = savedRecipes.length;
// If this runs before page-home is in the DOM, it throws.
```

**Impact:** Medium — could crash during rapid navigation.  
**Fix:** Use optional chaining: `document.getElementById('homesSavedCount')?.textContent = ...`

---

### PB-002 — Type Coercion in Streak Comparison

**Location:** `addStreak()` (line 1826)  
**Code:** `parseInt(localStorage.getItem('quiz_streak') || '0', 10)`  

**Description:** If `quiz_streak` is somehow set to a non-numeric string (e.g., `"NaN"` or `""`), `parseInt` returns `NaN`, and `NaN + 1` = `NaN`. Subsequent comparisons with milestone thresholds (`streak >= 3`) will all be false, silently preventing unlocks.

**Fix:**
```javascript
const streak = Math.max(0, parseInt(localStorage.getItem('quiz_streak') || '0', 10) || 0);
```

---

### PB-003 — Race Condition in `loadAndRender()` Async Flow

**Location:** `bootApp()` → `loadAndRender()` → multiple `fetchX()` functions  
**Description:** `loadAndRender()` calls `renderAll()` after `Promise.allSettled()`. However, between `bootApp()` and `loadAndRender()` completing, other code (e.g., `renderProfile()` at line 790) may run synchronously before async data is ready, rendering stale/empty data.

**Impact:** Low — fallback to localStorage is always present, so the worst case is empty displays on first load.

---

### PB-004 — Notification Deduplication Uses `find()` on Potentially Stale Array

**Location:** `generateNotifications()` (lines 2378, 2401, 2422)  
**Description:** The deduplication check (`notifs.find(n => n.type === 'challenge_reminder' && n.date === todayStr)`) operates on the array read from localStorage. If the localStorage value is manually modified or corrupted, the dedup logic may add duplicate entries.

**Impact:** Low — cosmetic issue (duplicate notifications).

---

## 3. Security Concerns

### SC-001 — Sensitive Data in localStorage (Unencrypted)

**Severity:** Medium  
**Description:** User passwords are stored in plaintext in localStorage:
```javascript
const user = { name, email, password, joined: ... };
localStorage.setItem('cooks_user', JSON.stringify(user));
```
Anyone with physical or script access to the browser can read the user's password.

**Fix:** Never store passwords on the client. Passwords should only exist during the sign-in request and be sent to the server over HTTPS. On the client, store only a session token.

---

### SC-002 — XSS Risk from User-Generated Content in innerHTML

**Severity:** High  
**Description:** Community posts are rendered using `innerHTML` with user-provided caption and username text:
```javascript
list.innerHTML = posts.map(p => `<div>...${p.caption}...</div>`).join('');
```
If `p.caption` contains `<script>alert(1)</script>`, this executes in the DOM.

**Fix:** Sanitize all user-generated text before inserting into innerHTML. Use `textContent` for plain text fields, or a sanitizer library (e.g., DOMPurify) for rich content.

---

### SC-003 — No CSRF Protection on API Requests

**Severity:** Medium (only relevant when backend is active)  
**Description:** `apiRequest()` sends POST/PUT requests with no CSRF token, relying only on `Content-Type: application/json`. While browsers block cross-origin reads, the lack of CSRF tokens may be an issue depending on the server's session model.

---

### SC-004 — Cookie Security

**Description:** `document.cookie = "is_guest=true; path=/"` is set for guest users without the `SameSite` or `Secure` attribute. On production, this should be `is_guest=true; path=/; SameSite=Strict; Secure`.

---

## 4. Performance Issues

### PI-001 — Multiple localStorage Reads in Render Loops

**Location:** `renderCommunity()`, `renderQuiz()`, `renderProfile()`  
**Description:** Each call to `renderNotifBadge()` reads `cooks_notifications` from localStorage. This is called inside `generateNotifications()` which is itself called after every challenge submission, creating redundant sequential reads.

**Fix:** Cache the notifications array in a module-level variable (e.g., `let _notifs = []`) and only re-read from localStorage when explicitly invalidated.

---

### PI-002 — DOM Re-render on Every Reaction Click

**Description:** After every reaction click, `renderCommunity()` is called, which re-renders the entire feed from scratch. On feeds with many posts, this is O(n) DOM work per click.

**Fix:** Use targeted DOM updates — only update the reaction bar of the specific post that was clicked.

---

### PI-003 — Synchronous JSON.parse in Tight Loops

**Location:** `generateNotifications()` calls `JSON.parse(localStorage.getItem('cooks_notifications') || '[]')` and then `JSON.stringify(notifs)` at the end. If called on every challenge submission (3 calls) plus badge render, this is 6 serialization operations per user action.

**Fix:** Cache the deserialized notifications in a variable between reads within the same call stack.

---

## 5. Summary

| Category | Count | Critical | High | Medium | Low |
|---|---|---|---|---|---|
| Code Smells | 4 | 0 | 0 | 3 | 1 |
| Potential Bugs | 4 | 0 | 1 | 2 | 1 |
| Security Concerns | 4 | 0 | 1 | 2 | 1 |
| Performance Issues | 3 | 0 | 0 | 2 | 1 |
| **Total** | **15** | **0** | **2** | **9** | **4** |

# Boundary Value Analysis — Cook's Application

Boundary Value Analysis (BVA) tests the edges of input domains, where errors are most likely to occur. For each boundary, we test: minimum−1 (just below), minimum (exact), minimum+1 (just above), maximum−1, maximum (exact), maximum+1.

---

## BVA-1: Streak Unlock Thresholds

The streak system unlocks emoji reactions at exactly 3, 7, and 14 days.

### Boundary 1A — First Unlock (🫕 at streak = 3)

| Test ID | Streak Value | Description | Expected: 🫕 Unlocked? |
|---|---|---|---|
| BVA-1A-1 | 2 | Just below threshold | ❌ No |
| BVA-1A-2 | **3** | **Exact threshold** | ✅ Yes |
| BVA-1A-3 | 4 | Just above threshold | ✅ Yes |

**How to test:** Set `localStorage.setItem('quiz_streak', '<value>')`, refresh page, navigate to Community → Feed, check if 🫕 in the reaction bar is active (not locked).

---

### Boundary 1B — Second Unlock (🧆 at streak = 7)

| Test ID | Streak Value | Description | Expected: 🧆 Unlocked? |
|---|---|---|---|
| BVA-1B-1 | 6 | Just below threshold | ❌ No |
| BVA-1B-2 | **7** | **Exact threshold** | ✅ Yes |
| BVA-1B-3 | 8 | Just above threshold | ✅ Yes |

---

### Boundary 1C — Third Unlock (🥙 at streak = 14)

| Test ID | Streak Value | Description | Expected: 🥙 Unlocked? |
|---|---|---|---|
| BVA-1C-1 | 13 | Just below threshold | ❌ No |
| BVA-1C-2 | **14** | **Exact threshold** | ✅ Yes |
| BVA-1C-3 | 15 | Just above threshold | ✅ Yes |

---

## BVA-2: XP Level Thresholds

Profile level changes at XP = 500, 1000, and 1800. XP = streak × 180.

| Test ID | Streak | XP | Description | Expected Level |
|---|---|---|---|---|
| BVA-2-1 | 2 | 360 | Below Beginner→Home boundary | Beginner Cook 🌱 |
| BVA-2-2 | **2** | **360** | One streak short of 500 XP (need ~2.77 → streak 2 = 360) | Beginner Cook 🌱 |
| BVA-2-3 | **3** | **540** | First value crossing 500 XP | Home Chef 🍳 |
| BVA-2-4 | 5 | 900 | Below 1000 XP threshold | Home Chef 🍳 |
| BVA-2-5 | **6** | **1080** | First value crossing 1000 XP | Skilled Cook ⭐ |
| BVA-2-6 | 9 | 1620 | Below 1800 XP threshold | Skilled Cook ⭐ |
| BVA-2-7 | **10** | **1800** | Exact 1800 XP | Master Chef 👑 |
| BVA-2-8 | 11 | 1980 | Just above 1800 XP | Master Chef 👑 |

---

## BVA-3: Post Text Length

The app currently accepts any non-empty string. We test the minimum and practical maximum.

| Test ID | Input Length | Input | Expected Result |
|---|---|---|---|
| BVA-3-1 | 0 | `""` | Error: "Write something first!" |
| BVA-3-2 | 1 | `"A"` | Post created successfully |
| BVA-3-3 | 500 | 500-character string | Post created successfully |
| BVA-3-4 | 1000 | 1000-character string | Post created (no limit enforced) |
| BVA-3-5 | Whitespace only | `"   "` | Treated as empty; error shown |

---

## BVA-4: Comment Text Length

| Test ID | Input Length | Input | Expected Result |
|---|---|---|---|
| BVA-4-1 | 0 | `""` | Comment rejected |
| BVA-4-2 | 1 | `"!"` | Comment accepted |
| BVA-4-3 | 200 | 200-character string | Comment accepted |

---

## BVA-5: Notification Count Badge

The badge shows unread notification count. At 0 it is hidden; from 1 it is visible; at 10+ it shows "9+".

| Test ID | Unread Count | Expected Badge Text | Expected Visibility |
|---|---|---|---|
| BVA-5-1 | 0 | — | Hidden |
| BVA-5-2 | 1 | "1" | Visible |
| BVA-5-3 | 9 | "9" | Visible |
| BVA-5-4 | 10 | "9+" | Visible |
| BVA-5-5 | 20 | "9+" | Visible (capped) |

**How to test:** Manually set `cooks_notifications` in localStorage with arrays of objects where `read: false`.

---

## BVA-6: Notification History Cap

Notifications are capped at 20 entries in `generateNotifications()`.

| Test ID | Total Notifications | Expected Stored Count |
|---|---|---|
| BVA-6-1 | 19 | 19 |
| BVA-6-2 | 20 | 20 |
| BVA-6-3 | 21 | 20 (oldest trimmed) |

**How to test:** Manually construct a 21-item `cooks_notifications` array in localStorage, then call `generateNotifications()` from the console and inspect the result.

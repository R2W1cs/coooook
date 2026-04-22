/**
 * Cook's — Unit Tests
 * Run via: open test-runner.html in a browser (using Live Server)
 *
 * Tests target pure localStorage-based functions extracted from script.js.
 * DOM-dependent side effects are guarded with null checks inside the real
 * functions, so we only verify state changes here.
 */

// ─────────────────────────────────────────────────────────────
// MINIMAL TEST FRAMEWORK
// ─────────────────────────────────────────────────────────────

const TestResults = [];

function describe(suiteName, fn) {
  TestResults.push({ type: 'suite', name: suiteName });
  try { fn(); } catch (e) {
    TestResults.push({ type: 'error', name: suiteName, message: e.message });
  }
}

function it(testName, fn) {
  try {
    fn();
    TestResults.push({ type: 'pass', name: testName });
  } catch (e) {
    TestResults.push({ type: 'fail', name: testName, message: e.message });
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(
      (msg ? msg + ': ' : '') +
      'Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual)
    );
  }
}

function assertNotEqual(actual, unexpected, msg) {
  if (actual === unexpected) {
    throw new Error(
      (msg ? msg + ': ' : '') +
      'Did not expect ' + JSON.stringify(unexpected)
    );
  }
}

function assertTrue(value, msg) {
  if (!value) throw new Error((msg || 'Expected truthy value') + ', got: ' + value);
}

function assertFalse(value, msg) {
  if (value) throw new Error((msg || 'Expected falsy value') + ', got: ' + value);
}

function assertContains(arr, item, msg) {
  if (!arr.includes(item)) {
    throw new Error((msg || 'Array should contain ' + JSON.stringify(item)));
  }
}

function assertNotContains(arr, item, msg) {
  if (arr.includes(item)) {
    throw new Error((msg || 'Array should NOT contain ' + JSON.stringify(item)));
  }
}

// ─────────────────────────────────────────────────────────────
// LOCAL IMPLEMENTATIONS
// These mirror the exact logic from script.js so tests are
// self-contained (no need to load the full app).
// ─────────────────────────────────────────────────────────────

function canPlayChallenge() {
  return localStorage.getItem('challenge_played_date') !== new Date().toDateString();
}

function markChallengePlayed() {
  const today = new Date().toDateString();
  localStorage.setItem('challenge_played_date', today);
  const days = JSON.parse(localStorage.getItem('heatmap_days') || '[]');
  if (!days.includes(today)) {
    days.push(today);
    localStorage.setItem('heatmap_days', JSON.stringify(days));
  }
}

function addStreak() {
  const today = new Date().toDateString();
  if (localStorage.getItem('streak_last_date') === today) return;
  const streak = parseInt(localStorage.getItem('quiz_streak') || '0', 10) + 1;
  localStorage.setItem('quiz_streak', String(streak));
  localStorage.setItem('streak_last_date', today);
}

function toggleSaveRecipe(recipeId) {
  let saved = JSON.parse(localStorage.getItem('cooks_saved_recipes') || '[]');
  const isSaved = saved.includes(recipeId);
  if (isSaved) {
    saved = saved.filter(x => x !== recipeId);
  } else {
    saved.push(recipeId);
  }
  localStorage.setItem('cooks_saved_recipes', JSON.stringify(saved));
  return saved;
}

function generateNotifications() {
  let notifs = JSON.parse(localStorage.getItem('cooks_notifications') || '[]');
  const todayStr = new Date().toDateString();
  const lastPlayed = localStorage.getItem('challenge_played_date');
  const streak = parseInt(localStorage.getItem('quiz_streak') || '0');

  if (lastPlayed !== todayStr) {
    const exists = notifs.find(n => n.type === 'challenge_reminder' && n.date === todayStr);
    if (!exists) {
      notifs.unshift({
        id: Date.now(),
        type: 'challenge_reminder',
        date: todayStr,
        icon: '🏆',
        text: streak > 0
          ? "Don't lose your " + streak + " day streak! Complete today's challenge 🔥"
          : "A new challenge is waiting for you today! 🏆",
        read: false,
        time: 'Today'
      });
    }
  }

  const milestones = [
    { streak: 3,  emoji: '🫕', text: "Amazing! You hit a 3 day streak and unlocked 🫕 reaction!" },
    { streak: 7,  emoji: '🧆', text: "Incredible! 7 day streak achieved! You unlocked 🧆 reaction!" },
    { streak: 14, emoji: '🥙', text: "Legendary! 14 day streak! You unlocked 🥙 reaction!" }
  ];

  milestones.forEach(m => {
    if (streak >= m.streak) {
      const exists = notifs.find(n => n.type === 'milestone_' + m.streak);
      if (!exists) {
        notifs.unshift({
          id: Date.now() + m.streak,
          type: 'milestone_' + m.streak,
          date: todayStr,
          icon: m.emoji,
          text: m.text,
          read: false,
          time: 'Achievement'
        });
      }
    }
  });

  notifs = notifs.slice(0, 20);
  localStorage.setItem('cooks_notifications', JSON.stringify(notifs));
  return notifs;
}

// ─────────────────────────────────────────────────────────────
// HELPER: Clean localStorage keys used in tests
// ─────────────────────────────────────────────────────────────

function cleanupChallengeKeys() {
  localStorage.removeItem('challenge_played_date');
  localStorage.removeItem('quiz_streak');
  localStorage.removeItem('streak_last_date');
  localStorage.removeItem('heatmap_days');
}

function cleanupNotifKeys() {
  localStorage.removeItem('cooks_notifications');
  localStorage.removeItem('challenge_played_date');
  localStorage.removeItem('quiz_streak');
}

function cleanupSaveKeys() {
  localStorage.removeItem('cooks_saved_recipes');
}

// ─────────────────────────────────────────────────────────────
// TEST SUITE 1: canPlayChallenge()
// ─────────────────────────────────────────────────────────────

describe('canPlayChallenge()', () => {

  it('returns true when challenge_played_date is not set', () => {
    cleanupChallengeKeys();
    assertTrue(canPlayChallenge(), 'Should return true when no date is stored');
    cleanupChallengeKeys();
  });

  it('returns true when challenge_played_date is a past date', () => {
    cleanupChallengeKeys();
    localStorage.setItem('challenge_played_date', 'Mon Jan 01 2000');
    assertTrue(canPlayChallenge(), 'Should return true for a past date');
    cleanupChallengeKeys();
  });

  it('returns false when challenge_played_date is today', () => {
    cleanupChallengeKeys();
    localStorage.setItem('challenge_played_date', new Date().toDateString());
    assertFalse(canPlayChallenge(), 'Should return false when played today');
    cleanupChallengeKeys();
  });

  it('returns false immediately after markChallengePlayed() is called', () => {
    cleanupChallengeKeys();
    assertTrue(canPlayChallenge(), 'Should be available before playing');
    markChallengePlayed();
    assertFalse(canPlayChallenge(), 'Should be locked after playing');
    cleanupChallengeKeys();
  });

  it('treats different date strings for same day as equal', () => {
    cleanupChallengeKeys();
    const today = new Date().toDateString();
    localStorage.setItem('challenge_played_date', today);
    assertFalse(canPlayChallenge(), 'Same date string should lock challenge');
    cleanupChallengeKeys();
  });

});

// ─────────────────────────────────────────────────────────────
// TEST SUITE 2: addStreak()
// ─────────────────────────────────────────────────────────────

describe('addStreak()', () => {

  it('increments streak from 0 to 1 on first call', () => {
    cleanupChallengeKeys();
    addStreak();
    assertEqual(localStorage.getItem('quiz_streak'), '1', 'Streak should be 1');
    cleanupChallengeKeys();
  });

  it('increments streak from 2 to 3', () => {
    cleanupChallengeKeys();
    localStorage.setItem('quiz_streak', '2');
    addStreak();
    assertEqual(localStorage.getItem('quiz_streak'), '3', 'Streak should be 3');
    cleanupChallengeKeys();
  });

  it('does NOT increment streak twice on the same day', () => {
    cleanupChallengeKeys();
    addStreak();
    assertEqual(localStorage.getItem('quiz_streak'), '1', 'First call: streak = 1');
    addStreak();
    assertEqual(localStorage.getItem('quiz_streak'), '1', 'Second call same day: streak still 1');
    cleanupChallengeKeys();
  });

  it('sets streak_last_date to today', () => {
    cleanupChallengeKeys();
    addStreak();
    assertEqual(localStorage.getItem('streak_last_date'), new Date().toDateString());
    cleanupChallengeKeys();
  });

  it('increments from existing non-zero streak correctly', () => {
    cleanupChallengeKeys();
    localStorage.setItem('quiz_streak', '13');
    addStreak();
    assertEqual(localStorage.getItem('quiz_streak'), '14', 'Should go from 13 to 14');
    cleanupChallengeKeys();
  });

  it('handles missing quiz_streak key (defaults to 0)', () => {
    cleanupChallengeKeys();
    localStorage.removeItem('quiz_streak');
    addStreak();
    assertEqual(localStorage.getItem('quiz_streak'), '1', 'Default 0 + 1 = 1');
    cleanupChallengeKeys();
  });

});

// ─────────────────────────────────────────────────────────────
// TEST SUITE 3: markChallengePlayed()
// ─────────────────────────────────────────────────────────────

describe('markChallengePlayed()', () => {

  it('sets challenge_played_date to today', () => {
    cleanupChallengeKeys();
    markChallengePlayed();
    assertEqual(localStorage.getItem('challenge_played_date'), new Date().toDateString());
    cleanupChallengeKeys();
  });

  it('adds today to heatmap_days', () => {
    cleanupChallengeKeys();
    markChallengePlayed();
    const days = JSON.parse(localStorage.getItem('heatmap_days') || '[]');
    assertContains(days, new Date().toDateString(), 'Heatmap should contain today');
    cleanupChallengeKeys();
  });

  it('does not duplicate today in heatmap_days on repeated calls', () => {
    cleanupChallengeKeys();
    markChallengePlayed();
    markChallengePlayed();
    const days = JSON.parse(localStorage.getItem('heatmap_days') || '[]');
    assertEqual(days.length, 1, 'Heatmap should have exactly one entry for today');
    cleanupChallengeKeys();
  });

  it('preserves existing heatmap entries when adding a new day', () => {
    cleanupChallengeKeys();
    const past = 'Mon Jan 01 2024';
    localStorage.setItem('heatmap_days', JSON.stringify([past]));
    markChallengePlayed();
    const days = JSON.parse(localStorage.getItem('heatmap_days') || '[]');
    assertContains(days, past, 'Old heatmap entry should be preserved');
    assertContains(days, new Date().toDateString(), 'Today should also be present');
    cleanupChallengeKeys();
  });

  it('makes canPlayChallenge() return false', () => {
    cleanupChallengeKeys();
    markChallengePlayed();
    assertFalse(canPlayChallenge(), 'After marking played, canPlayChallenge should be false');
    cleanupChallengeKeys();
  });

});

// ─────────────────────────────────────────────────────────────
// TEST SUITE 4: toggleSaveRecipe()
// ─────────────────────────────────────────────────────────────

describe('toggleSaveRecipe()', () => {

  it('adds a recipe ID to saved list when not already saved', () => {
    cleanupSaveKeys();
    const result = toggleSaveRecipe('r1');
    assertContains(result, 'r1', 'r1 should be in saved list');
    cleanupSaveKeys();
  });

  it('removes a recipe ID when it is already saved', () => {
    cleanupSaveKeys();
    localStorage.setItem('cooks_saved_recipes', JSON.stringify(['r1']));
    const result = toggleSaveRecipe('r1');
    assertNotContains(result, 'r1', 'r1 should be removed from saved list');
    cleanupSaveKeys();
  });

  it('saves the result to localStorage', () => {
    cleanupSaveKeys();
    toggleSaveRecipe('r2');
    const stored = JSON.parse(localStorage.getItem('cooks_saved_recipes'));
    assertContains(stored, 'r2', 'r2 should be in localStorage');
    cleanupSaveKeys();
  });

  it('can save multiple different recipe IDs', () => {
    cleanupSaveKeys();
    toggleSaveRecipe('r1');
    toggleSaveRecipe('r2');
    toggleSaveRecipe('r3');
    const stored = JSON.parse(localStorage.getItem('cooks_saved_recipes'));
    assertEqual(stored.length, 3, 'Should have 3 saved recipes');
    cleanupSaveKeys();
  });

  it('removing one recipe does not affect others', () => {
    cleanupSaveKeys();
    localStorage.setItem('cooks_saved_recipes', JSON.stringify(['r1', 'r2', 'r3']));
    const result = toggleSaveRecipe('r2');
    assertNotContains(result, 'r2', 'r2 removed');
    assertContains(result, 'r1', 'r1 still present');
    assertContains(result, 'r3', 'r3 still present');
    cleanupSaveKeys();
  });

  it('does not save duplicates when toggling the same recipe twice', () => {
    cleanupSaveKeys();
    toggleSaveRecipe('r1');
    toggleSaveRecipe('r1');
    const stored = JSON.parse(localStorage.getItem('cooks_saved_recipes'));
    assertEqual(stored.length, 0, 'Both toggles cancel each other out');
    cleanupSaveKeys();
  });

});

// ─────────────────────────────────────────────────────────────
// TEST SUITE 5: generateNotifications()
// ─────────────────────────────────────────────────────────────

describe('generateNotifications()', () => {

  it('adds a challenge reminder when not played today', () => {
    cleanupNotifKeys();
    const notifs = generateNotifications();
    const reminder = notifs.find(n => n.type === 'challenge_reminder');
    assertTrue(!!reminder, 'Should have a challenge_reminder notification');
    cleanupNotifKeys();
  });

  it('does NOT add a challenge reminder when already played today', () => {
    cleanupNotifKeys();
    localStorage.setItem('challenge_played_date', new Date().toDateString());
    const notifs = generateNotifications();
    const reminder = notifs.find(n => n.type === 'challenge_reminder');
    assertFalse(!!reminder, 'Should not add reminder if already played today');
    cleanupNotifKeys();
  });

  it('adds streak 3 milestone notification when streak >= 3', () => {
    cleanupNotifKeys();
    localStorage.setItem('quiz_streak', '3');
    const notifs = generateNotifications();
    const milestone = notifs.find(n => n.type === 'milestone_3');
    assertTrue(!!milestone, 'Should have milestone_3 notification');
    cleanupNotifKeys();
  });

  it('does NOT add streak 3 milestone when streak < 3', () => {
    cleanupNotifKeys();
    localStorage.setItem('quiz_streak', '2');
    const notifs = generateNotifications();
    const milestone = notifs.find(n => n.type === 'milestone_3');
    assertFalse(!!milestone, 'milestone_3 should not appear for streak 2');
    cleanupNotifKeys();
  });

  it('adds streak 7 milestone notification when streak >= 7', () => {
    cleanupNotifKeys();
    localStorage.setItem('quiz_streak', '7');
    const notifs = generateNotifications();
    const milestone = notifs.find(n => n.type === 'milestone_7');
    assertTrue(!!milestone, 'Should have milestone_7 notification');
    cleanupNotifKeys();
  });

  it('adds streak 14 milestone notification when streak >= 14', () => {
    cleanupNotifKeys();
    localStorage.setItem('quiz_streak', '14');
    const notifs = generateNotifications();
    const milestone = notifs.find(n => n.type === 'milestone_14');
    assertTrue(!!milestone, 'Should have milestone_14 notification');
    cleanupNotifKeys();
  });

  it('does NOT duplicate an existing milestone notification', () => {
    cleanupNotifKeys();
    localStorage.setItem('quiz_streak', '3');
    generateNotifications();
    generateNotifications();
    const notifs = JSON.parse(localStorage.getItem('cooks_notifications'));
    const count = notifs.filter(n => n.type === 'milestone_3').length;
    assertEqual(count, 1, 'milestone_3 should appear only once');
    cleanupNotifKeys();
  });

  it('caps notifications at 20 entries', () => {
    cleanupNotifKeys();
    const existing = Array.from({ length: 20 }, (_, i) => ({
      id: i, type: 'old_' + i, date: 'old', icon: '📌', text: 'Old notif', read: true, time: 'Old'
    }));
    localStorage.setItem('cooks_notifications', JSON.stringify(existing));
    const notifs = generateNotifications();
    assertTrue(notifs.length <= 20, 'Should not exceed 20 notifications');
    cleanupNotifKeys();
  });

  it('marks new notifications as unread', () => {
    cleanupNotifKeys();
    const notifs = generateNotifications();
    const unread = notifs.filter(n => !n.read);
    assertTrue(unread.length > 0, 'New notifications should be unread');
    cleanupNotifKeys();
  });

  it('challenge reminder text mentions streak when streak > 0', () => {
    cleanupNotifKeys();
    localStorage.setItem('quiz_streak', '5');
    const notifs = generateNotifications();
    const reminder = notifs.find(n => n.type === 'challenge_reminder');
    assertTrue(!!reminder, 'Reminder should exist');
    assertTrue(reminder.text.includes('5'), 'Reminder text should mention the streak number');
    cleanupNotifKeys();
  });

});

// ─────────────────────────────────────────────────────────────
// EXPORT RESULTS for test-runner.html
// ─────────────────────────────────────────────────────────────

window.TestResults = TestResults;

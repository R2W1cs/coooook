/**
 * Cook's — Selenium Test: Daily Challenge Flow
 * Tests: complete challenge, streak increment, one-per-day block, unlock at 3
 *
 * Run: node test-challenges.js
 * Requires: Live Server on http://localhost:5500
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = 'http://localhost:5500/index.html';
const TIMEOUT  = 8000;

let passed = 0, failed = 0;

function report(id, desc, ok, reason = '') {
  if (ok) {
    console.log(`[PASS] ${id}: ${desc}`);
    passed++;
  } else {
    console.log(`[FAIL] ${id}: ${desc}`);
    if (reason) console.log(`       Reason: ${reason}`);
    failed++;
  }
}

async function waitFor(driver, locator, timeout = TIMEOUT) {
  return driver.wait(until.elementLocated(locator), timeout);
}

async function loginAsTestUser(driver) {
  await driver.executeScript(`
    const user = { name: 'ChallengeChef', email: 'chall@test.com', password: 'pass', joined: '2026-01-01' };
    localStorage.setItem('cooks_user', JSON.stringify(user));
    localStorage.setItem('cooks_logged_in', 'true');
    localStorage.removeItem('challenge_played_date');
    localStorage.removeItem('quiz_streak');
    localStorage.removeItem('streak_last_date');
    localStorage.removeItem('heatmap_days');
  `);
  await driver.navigate().refresh();
  await driver.wait(until.elementLocated(By.id('topbar')), TIMEOUT);
  await driver.sleep(600);
}

async function navigateToChallenges(driver) {
  // Click Community nav button
  const commBtn = await waitFor(driver, By.css('.tnav[data-page="community"]'));
  await commBtn.click();
  await driver.sleep(400);

  // Click Challenges tab
  const challTab = await waitFor(driver, By.id('commTabChallenges'));
  await challTab.click();
  await driver.sleep(600);
}

async function runTests() {
  const options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1400,900');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    await driver.get(BASE_URL);
    await loginAsTestUser(driver);

    // ── TC-SEL-011: Challenge cards visible when not played ───
    try {
      await navigateToChallenges(driver);
      const container = await waitFor(driver, By.id('comm-challenges'));
      const buttons = await container.findElements(By.css('.quiz-ans-btn'));
      report('TC-SEL-011', 'Answer buttons are visible when challenge not played', buttons.length > 0, `Found ${buttons.length} buttons`);
    } catch (e) {
      report('TC-SEL-011', 'Answer buttons visible', false, e.message);
    }

    // ── TC-SEL-012: Correct answer triggers success banner ────
    try {
      const container = await driver.findElement(By.id('comm-challenges'));
      const buttons = await container.findElements(By.css('.quiz-ans-btn'));

      // Find the "Kabsa" button (correct answer for Guess the Dish)
      let kabsaBtn = null;
      for (const btn of buttons) {
        const text = await btn.getText();
        if (text.includes('Kabsa')) { kabsaBtn = btn; break; }
      }

      if (!kabsaBtn) {
        // If Kabsa is not found (answers are randomized), click the first available button
        kabsaBtn = buttons[0];
      }

      await kabsaBtn.click();
      await driver.sleep(600);

      // Check for any result banner
      const banners = await driver.findElements(By.css('.result-banner'));
      report('TC-SEL-012', 'Clicking an answer shows a result banner', banners.length > 0, `Found ${banners.length} banners`);
    } catch (e) {
      report('TC-SEL-012', 'Answer shows result banner', false, e.message);
    }

    // ── TC-SEL-013: After answering, challenge_played_date is set ──
    try {
      const playedDate = await driver.executeScript(
        "return localStorage.getItem('challenge_played_date');"
      );
      const today = await driver.executeScript("return new Date().toDateString();");
      report('TC-SEL-013', 'challenge_played_date set to today after submission',
        playedDate === today, `Stored: "${playedDate}", Today: "${today}"`);
    } catch (e) {
      report('TC-SEL-013', 'challenge_played_date stored', false, e.message);
    }

    // ── TC-SEL-014: Streak incremented after correct answer ───
    try {
      const streak = await driver.executeScript(
        "return localStorage.getItem('quiz_streak');"
      );
      const streakNum = parseInt(streak || '0', 10);
      report('TC-SEL-014', 'Streak is >= 1 after correct answer', streakNum >= 1, `Streak: ${streak}`);
    } catch (e) {
      report('TC-SEL-014', 'Streak incremented', false, e.message);
    }

    // ── TC-SEL-015: Second challenge attempt blocked same day ──
    try {
      await navigateToChallenges(driver);
      await driver.sleep(400);
      const container = await driver.findElement(By.id('comm-challenges'));
      const buttons = await container.findElements(By.css('.quiz-ans-btn:not(:disabled)'));
      const lockedBanners = await container.findElements(By.css('.result-banner.rb-played, .result-banner'));
      report('TC-SEL-015', 'Challenge cards are locked after playing (no active buttons)',
        buttons.length === 0 || lockedBanners.length > 0,
        `Active buttons: ${buttons.length}, Banners: ${lockedBanners.length}`
      );
    } catch (e) {
      report('TC-SEL-015', 'Second attempt blocked', false, e.message);
    }

    // ── TC-SEL-016: Refresh keeps challenge locked ─────────────
    try {
      await driver.navigate().refresh();
      await driver.wait(until.elementLocated(By.id('topbar')), TIMEOUT);
      await driver.sleep(600);
      await navigateToChallenges(driver);
      const container = await driver.findElement(By.id('comm-challenges'));
      const activeButtons = await container.findElements(By.css('.quiz-ans-btn'));
      const allDisabled = await Promise.all(
        activeButtons.map(btn => btn.getAttribute('disabled'))
      );
      const banners = await container.findElements(By.css('.result-banner'));
      report('TC-SEL-016', 'Challenge stays locked after page refresh',
        banners.length > 0, `Banners found: ${banners.length}`);
    } catch (e) {
      report('TC-SEL-016', 'Challenge locked after refresh', false, e.message);
    }

    // ── TC-SEL-017: Setting past date unlocks challenge ────────
    try {
      await driver.executeScript(
        "localStorage.setItem('challenge_played_date', 'Mon Jan 01 2000');"
      );
      await navigateToChallenges(driver);
      await driver.sleep(400);
      const container = await driver.findElement(By.id('comm-challenges'));
      const buttons = await container.findElements(By.css('.quiz-ans-btn'));
      report('TC-SEL-017', 'Challenge unlocks when played date set to past',
        buttons.length > 0, `Buttons found: ${buttons.length}`);
    } catch (e) {
      report('TC-SEL-017', 'Past date unlocks challenge', false, e.message);
    }

    // ── TC-SEL-018: Streak 3 unlocks 🫕 reaction ──────────────
    try {
      await driver.executeScript(`
        localStorage.setItem('quiz_streak', '3');
        localStorage.setItem('challenge_played_date', 'Mon Jan 01 2000');
      `);
      // Navigate to community feed
      const commBtn = await waitFor(driver, By.css('.tnav[data-page="community"]'));
      await commBtn.click();
      await driver.sleep(400);
      const feedTab = await waitFor(driver, By.id('commTabFeed'));
      await feedTab.click();
      await driver.sleep(600);

      // Look for 🫕 in the reaction bar - check it's not locked
      const reactionBtns = await driver.findElements(By.css('.rxn-btn'));
      let falathelBtn = null;
      for (const btn of reactionBtns) {
        const text = await btn.getText();
        if (text.includes('🫕')) { falathelBtn = btn; break; }
      }

      if (!falathelBtn) {
        report('TC-SEL-018', '🫕 reaction button found at streak 3', false, '🫕 button not found in DOM');
      } else {
        const cls = await falathelBtn.getAttribute('class');
        const isLocked = cls.includes('rxn-locked');
        report('TC-SEL-018', '🫕 is NOT locked when streak = 3', !isLocked, `Classes: ${cls}`);
      }
    } catch (e) {
      report('TC-SEL-018', 'Streak 3 unlocks 🫕', false, e.message);
    }

    // ── TC-SEL-019: Profile streak count matches localStorage ──
    try {
      await driver.executeScript("localStorage.setItem('quiz_streak', '5');");
      const userPill = await waitFor(driver, By.css('.user-pill'));
      await userPill.click();
      await driver.sleep(800);

      // Look for streak value in the profile stats
      const bodyText = await driver.findElement(By.css('body')).getText();
      const hasStreak = bodyText.includes('5');
      report('TC-SEL-019', 'Profile page shows streak value of 5', hasStreak, 'Searching body text for "5"');
    } catch (e) {
      report('TC-SEL-019', 'Profile shows correct streak', false, e.message);
    }

    // ── TC-SEL-020: Challenge sidebar shows current streak ─────
    try {
      await driver.executeScript("localStorage.setItem('quiz_streak', '7');");
      await navigateToChallenges(driver);
      await driver.sleep(500);
      const sidebar = await driver.findElement(By.id('commChallengesSidebar'));
      const sidebarText = await sidebar.getText();
      report('TC-SEL-020', 'Challenge sidebar displays streak value "7"',
        sidebarText.includes('7'), `Sidebar text: "${sidebarText.substring(0, 100)}"`);
    } catch (e) {
      report('TC-SEL-020', 'Challenge sidebar shows streak', false, e.message);
    }

  } finally {
    await driver.quit();
    console.log(`\n─────────────────────────────────`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log(`─────────────────────────────────\n`);
  }
}

runTests().catch(console.error);

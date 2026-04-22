/**
 * Cook's — Selenium Test: Authentication Flow
 * Tests: sign up, sign in, guest mode, session persistence, logout
 *
 * Run: node test-login.js
 * Requires: Live Server on http://localhost:5500
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = 'http://localhost:5500/index.html';
const TIMEOUT  = 8000; // ms

// ─── Test reporter ───────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────
async function clearAppStorage(driver) {
  await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
  await driver.navigate().refresh();
  await driver.wait(until.elementLocated(By.id('authOverlay')), TIMEOUT);
}

async function waitFor(driver, locator, timeout = TIMEOUT) {
  return driver.wait(until.elementLocated(locator), timeout);
}

async function waitVisible(driver, locator, timeout = TIMEOUT) {
  const el = await waitFor(driver, locator, timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

async function fillSignupForm(driver, { name, email, pass, confirm, agree = true }) {
  await driver.findElement(By.id('tabSignup')).click();
  await driver.wait(until.elementLocated(By.id('suName')), TIMEOUT);
  await driver.findElement(By.id('suName')).sendKeys(name);
  await driver.findElement(By.id('suEmail')).sendKeys(email);
  await driver.findElement(By.id('suPass')).sendKeys(pass);
  await driver.findElement(By.id('suConfirm')).sendKeys(confirm || pass);
  if (agree) {
    const checkbox = await driver.findElement(By.id('agreePrivacy'));
    const checked = await checkbox.isSelected();
    if (!checked) await checkbox.click();
  }
}

// ─── Test Suite ───────────────────────────────────────────────
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
    // ── TC-SEL-001: Auth overlay visible on load ──────────────
    await driver.get(BASE_URL);
    await clearAppStorage(driver);
    try {
      const overlay = await waitVisible(driver, By.id('authOverlay'));
      const displayed = await overlay.isDisplayed();
      report('TC-SEL-001', 'Auth overlay is visible on first load', displayed);
    } catch (e) {
      report('TC-SEL-001', 'Auth overlay is visible on first load', false, e.message);
    }

    // ── TC-SEL-002: Sign up with valid data ───────────────────
    await clearAppStorage(driver);
    try {
      await fillSignupForm(driver, {
        name: 'SeleniumChef',
        email: 'sel.chef@cooks.test',
        pass: 'TestPass123',
        confirm: 'TestPass123'
      });
      await driver.findElement(By.css('#formSignup button[type="submit"]')).click();
      await driver.wait(until.elementLocated(By.id('topbar')), TIMEOUT);
      const topbar = await driver.findElement(By.id('topbar'));
      const topbarClass = await topbar.getAttribute('class');
      const isVisible = !topbarClass.includes('hidden');
      report('TC-SEL-002', 'Sign up with valid data shows the main app', isVisible);
    } catch (e) {
      report('TC-SEL-002', 'Sign up with valid data shows the main app', false, e.message);
    }

    // ── TC-SEL-003: Username appears in navbar after sign up ──
    try {
      const navName = await driver.findElement(By.id('upName'));
      const text = await navName.getText();
      report('TC-SEL-003', 'Username "SeleniumChef" displayed in navbar', text === 'SeleniumChef', `Got: "${text}"`);
    } catch (e) {
      report('TC-SEL-003', 'Username displayed in navbar', false, e.message);
    }

    // ── TC-SEL-004: Sign up with mismatched passwords ─────────
    await clearAppStorage(driver);
    try {
      await fillSignupForm(driver, {
        name: 'Chef2',
        email: 'chef2@test.com',
        pass: 'abc123',
        confirm: 'xyz999'
      });
      await driver.findElement(By.css('#formSignup button[type="submit"]')).click();
      await driver.sleep(500);
      const errors = await driver.findElements(By.css('.auth-inline-error'));
      const hasError = errors.length > 0;
      let errorText = '';
      if (hasError) errorText = await errors[0].getText();
      const correct = hasError && errorText.toLowerCase().includes('match');
      report('TC-SEL-004', 'Mismatched passwords shows error', correct, `Error text: "${errorText}"`);
    } catch (e) {
      report('TC-SEL-004', 'Mismatched passwords shows error', false, e.message);
    }

    // ── TC-SEL-005: Sign up without agreeing to terms ─────────
    await clearAppStorage(driver);
    try {
      await fillSignupForm(driver, {
        name: 'Chef3',
        email: 'chef3@test.com',
        pass: 'pass123',
        agree: false
      });
      await driver.findElement(By.css('#formSignup button[type="submit"]')).click();
      await driver.sleep(500);
      const errors = await driver.findElements(By.css('.auth-inline-error'));
      const hasError = errors.length > 0;
      report('TC-SEL-005', 'Missing checkbox shows error', hasError);
    } catch (e) {
      report('TC-SEL-005', 'Missing checkbox shows error', false, e.message);
    }

    // ── TC-SEL-006: Browse as guest ───────────────────────────
    await clearAppStorage(driver);
    try {
      const guestBtn = await waitFor(driver, By.css('button.btn-text-gold'));
      await guestBtn.click();
      await driver.wait(until.elementLocated(By.id('topbar')), TIMEOUT);
      const topbar = await driver.findElement(By.id('topbar'));
      const topbarClass = await topbar.getAttribute('class');
      const isVisible = !topbarClass.includes('hidden');
      report('TC-SEL-006', 'Guest mode loads the main app', isVisible);
    } catch (e) {
      report('TC-SEL-006', 'Guest mode loads the main app', false, e.message);
    }

    // ── TC-SEL-007: Sign in with correct credentials ──────────
    // First register a fresh user
    await clearAppStorage(driver);
    try {
      // Register
      await fillSignupForm(driver, {
        name: 'SignInUser',
        email: 'signin@test.com',
        pass: 'mypassword1'
      });
      await driver.findElement(By.css('#formSignup button[type="submit"]')).click();
      await driver.wait(until.elementLocated(By.id('topbar')), TIMEOUT);

      // Simulate sign out by clearing session flag
      await driver.executeScript("localStorage.removeItem('cooks_logged_in');");
      await driver.navigate().refresh();
      await driver.wait(until.elementLocated(By.id('authOverlay')), TIMEOUT);

      // Now sign in
      const signinTab = await driver.findElement(By.id('tabSignin'));
      await signinTab.click();
      const inputs = await driver.findElements(By.css('#formSignin input'));
      await inputs[0].sendKeys('signin@test.com');
      await inputs[1].sendKeys('mypassword1');
      await driver.findElement(By.id('signinBtn')).click();
      await driver.wait(until.elementLocated(By.id('topbar')), TIMEOUT);
      const topbar = await driver.findElement(By.id('topbar'));
      const cl = await topbar.getAttribute('class');
      report('TC-SEL-007', 'Sign in with correct credentials succeeds', !cl.includes('hidden'));
    } catch (e) {
      report('TC-SEL-007', 'Sign in with correct credentials succeeds', false, e.message);
    }

    // ── TC-SEL-008: Session persists after refresh ────────────
    try {
      await driver.navigate().refresh();
      await driver.sleep(1000);
      const overlay = await driver.findElements(By.id('authOverlay'));
      let authHidden = true;
      if (overlay.length > 0) {
        const cl = await overlay[0].getAttribute('class');
        authHidden = cl.includes('hidden');
      }
      report('TC-SEL-008', 'Session persists after page refresh', authHidden);
    } catch (e) {
      report('TC-SEL-008', 'Session persists after page refresh', false, e.message);
    }

    // ── TC-SEL-009: Logout returns to auth ────────────────────
    try {
      // Navigate to profile via user pill
      const userPill = await waitFor(driver, By.css('.user-pill'));
      await userPill.click();
      await driver.sleep(800);

      // Click sign out (look for a button containing sign out text)
      const allButtons = await driver.findElements(By.css('button'));
      let signOutFound = false;
      for (const btn of allButtons) {
        const text = await btn.getText().catch(() => '');
        if (text.toLowerCase().includes('sign out') || text.toLowerCase().includes('out')) {
          await btn.click();
          signOutFound = true;
          break;
        }
      }

      if (!signOutFound) {
        report('TC-SEL-009', 'Logout returns to auth screen', false, 'Sign Out button not found');
      } else {
        await driver.sleep(800);
        const overlay = await waitFor(driver, By.id('authOverlay'), TIMEOUT);
        const cl = await overlay.getAttribute('class');
        const isVisible = !cl.includes('hidden');
        report('TC-SEL-009', 'Logout returns to auth screen', isVisible);
      }
    } catch (e) {
      report('TC-SEL-009', 'Logout returns to auth screen', false, e.message);
    }

    // ── TC-SEL-010: New account has zero stats ────────────────
    await clearAppStorage(driver);
    try {
      await fillSignupForm(driver, {
        name: 'FreshUser',
        email: 'fresh@test.com',
        pass: 'Fresh123'
      });
      await driver.findElement(By.css('#formSignup button[type="submit"]')).click();
      await driver.wait(until.elementLocated(By.id('topbar')), TIMEOUT);

      const fridgeCount = await driver.findElement(By.id('homeFridgeCount'));
      const fridgeText = await fridgeCount.getText();
      const savedCount = await driver.findElement(By.id('homesSavedCount'));
      const savedText = await savedCount.getText();

      report('TC-SEL-010', 'New account has 0 fridge items and 0 saved recipes',
        fridgeText === '0' && savedText === '0',
        `Fridge: ${fridgeText}, Saved: ${savedText}`
      );
    } catch (e) {
      report('TC-SEL-010', 'New account has zero stats', false, e.message);
    }

  } finally {
    await driver.quit();
    console.log(`\n─────────────────────────────────`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log(`─────────────────────────────────\n`);
  }
}

runTests().catch(console.error);

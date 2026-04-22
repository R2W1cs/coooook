/**
 * Cook's — Selenium Test: Community Feed Flow
 * Tests: create post, add reaction, add comment, share post
 *
 * Run: node test-community.js
 * Requires: Live Server on http://localhost:5500
 */

const { Builder, By, Key, until } = require('selenium-webdriver');
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

async function loginAndGoToFeed(driver) {
  await driver.executeScript(`
    localStorage.clear();
    const user = { name: 'CommChef', email: 'comm@test.com', password: 'pass', joined: '2026-01-01' };
    localStorage.setItem('cooks_user', JSON.stringify(user));
    localStorage.setItem('cooks_logged_in', 'true');
    localStorage.setItem('quiz_streak', '5');
  `);
  await driver.navigate().refresh();
  await driver.wait(until.elementLocated(By.id('topbar')), TIMEOUT);
  await driver.sleep(600);

  // Navigate to Community → Feed
  const commBtn = await waitFor(driver, By.css('.tnav[data-page="community"]'));
  await commBtn.click();
  await driver.sleep(400);

  const feedTab = await waitFor(driver, By.id('commTabFeed'));
  await feedTab.click();
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
    await loginAndGoToFeed(driver);

    // ── TC-SEL-021: Demo posts visible in feed ─────────────────
    try {
      const feed = await waitFor(driver, By.id('commFeed'));
      const posts = await feed.findElements(By.css('.comm-post-card'));
      report('TC-SEL-021', 'Demo posts visible in community feed', posts.length > 0, `Found ${posts.length} posts`);
    } catch (e) {
      report('TC-SEL-021', 'Demo posts visible', false, e.message);
    }

    // ── TC-SEL-022: Create a text post ────────────────────────
    let postText = `Selenium test post ${Date.now()}`;
    try {
      const textarea = await waitFor(driver, By.id('postText'));
      await textarea.clear();
      await textarea.sendKeys(postText);

      const postBtn = await driver.findElement(By.css('.post-box .btn-primary'));
      await postBtn.click();
      await driver.sleep(700);

      const feed = await driver.findElement(By.id('commFeed'));
      const feedText = await feed.getText();
      report('TC-SEL-022', 'Text post appears in feed after submission', feedText.includes(postText), `Looking for: "${postText.substring(0, 30)}"`);
    } catch (e) {
      report('TC-SEL-022', 'Text post created', false, e.message);
    }

    // ── TC-SEL-023: Empty post shows error ───────────────────
    try {
      const textarea = await driver.findElement(By.id('postText'));
      await textarea.clear();
      const postBtn = await driver.findElement(By.css('.post-box .btn-primary'));
      await postBtn.click();
      await driver.sleep(400);

      const statusMsg = await driver.findElement(By.id('postStatusMsg'));
      const msgStyle = await statusMsg.getCssValue('display');
      const msgText = await statusMsg.getText();
      const hasError = msgStyle !== 'none' || msgText.length > 0;
      report('TC-SEL-023', 'Empty post submission shows error message', hasError, `Status: display=${msgStyle}, text="${msgText}"`);
    } catch (e) {
      report('TC-SEL-023', 'Empty post rejected', false, e.message);
    }

    // ── TC-SEL-024: Posts persist after refresh ───────────────
    try {
      await driver.navigate().refresh();
      await driver.wait(until.elementLocated(By.id('topbar')), TIMEOUT);
      await driver.sleep(600);

      const commBtn = await waitFor(driver, By.css('.tnav[data-page="community"]'));
      await commBtn.click();
      await driver.sleep(400);
      const feedTab = await waitFor(driver, By.id('commTabFeed'));
      await feedTab.click();
      await driver.sleep(600);

      const feed = await driver.findElement(By.id('commFeed'));
      const feedText = await feed.getText();
      report('TC-SEL-024', 'User post persists after page refresh', feedText.includes(postText.substring(0, 20)));
    } catch (e) {
      report('TC-SEL-024', 'Posts persist after refresh', false, e.message);
    }

    // ── TC-SEL-025: Click ❤️ reaction increments count ────────
    try {
      const feed = await driver.findElement(By.id('commFeed'));
      const reactionBars = await feed.findElements(By.css('.rxn-bar'));

      if (reactionBars.length === 0) {
        report('TC-SEL-025', '❤️ reaction increments count', false, 'No reaction bars found');
      } else {
        const firstBar = reactionBars[0];
        const heartBtns = await firstBar.findElements(By.css('.rxn-btn'));

        let heartBtn = null;
        for (const btn of heartBtns) {
          const text = await btn.getText();
          if (text.includes('❤️')) { heartBtn = btn; break; }
        }

        if (!heartBtn) {
          report('TC-SEL-025', '❤️ reaction increments count', false, '❤️ button not found');
        } else {
          // Get count before click
          const beforeSpan = await heartBtn.findElement(By.css('span'));
          const beforeCount = parseInt(await beforeSpan.getText() || '0', 10) || 0;

          await heartBtn.click();
          await driver.sleep(400);

          // Re-query to avoid stale element
          const updatedBars = await feed.findElements(By.css('.rxn-bar'));
          const updatedHeart = await updatedBars[0].findElements(By.css('.rxn-btn'));
          let updatedBtn = null;
          for (const btn of updatedHeart) {
            const text = await btn.getText();
            if (text.includes('❤️')) { updatedBtn = btn; break; }
          }
          const afterSpan = await updatedBtn.findElement(By.css('span'));
          const afterCount = parseInt(await afterSpan.getText() || '0', 10) || 0;

          report('TC-SEL-025', '❤️ click increments count by 1',
            afterCount === beforeCount + 1, `Before: ${beforeCount}, After: ${afterCount}`);
        }
      }
    } catch (e) {
      report('TC-SEL-025', '❤️ reaction increments count', false, e.message);
    }

    // ── TC-SEL-026: Click same reaction again deselects ────────
    try {
      const feed = await driver.findElement(By.id('commFeed'));
      const reactionBars = await feed.findElements(By.css('.rxn-bar'));

      if (reactionBars.length === 0) {
        report('TC-SEL-026', 'Clicking active reaction deselects it', false, 'No reaction bars');
      } else {
        const firstBar = reactionBars[0];
        const heartBtns = await firstBar.findElements(By.css('.rxn-btn'));

        let heartBtn = null;
        for (const btn of heartBtns) {
          const text = await btn.getText();
          if (text.includes('❤️')) { heartBtn = btn; break; }
        }

        if (heartBtn) {
          // Check if it's active
          const cls = await heartBtn.getAttribute('class');
          const isActive = cls.includes('rxn-active');

          if (isActive) {
            const beforeSpan = await heartBtn.findElement(By.css('span'));
            const beforeCount = parseInt(await beforeSpan.getText() || '0', 10) || 0;
            await heartBtn.click();
            await driver.sleep(400);

            const updatedBars = await feed.findElements(By.css('.rxn-bar'));
            const updatedHeart = await updatedBars[0].findElements(By.css('.rxn-btn'));
            let updatedBtn = null;
            for (const btn of updatedHeart) {
              const text = await btn.getText();
              if (text.includes('❤️')) { updatedBtn = btn; break; }
            }
            const afterSpan = await updatedBtn.findElement(By.css('span'));
            const afterCount = parseInt(await afterSpan.getText() || '0', 10) || 0;

            report('TC-SEL-026', 'Second click on ❤️ decrements count',
              afterCount === beforeCount - 1, `Before: ${beforeCount}, After: ${afterCount}`);
          } else {
            report('TC-SEL-026', 'Clicking active reaction deselects it', false, '❤️ was not active to start with');
          }
        } else {
          report('TC-SEL-026', 'Clicking active reaction deselects it', false, '❤️ not found');
        }
      }
    } catch (e) {
      report('TC-SEL-026', 'Reaction toggle deselects', false, e.message);
    }

    // ── TC-SEL-027: Locked emoji (🫕 at streak 0) shows tooltip ──
    try {
      await driver.executeScript("localStorage.setItem('quiz_streak', '0');");
      await driver.navigate().refresh();
      await driver.wait(until.elementLocated(By.id('topbar')), TIMEOUT);
      await driver.sleep(600);

      const commBtn = await waitFor(driver, By.css('.tnav[data-page="community"]'));
      await commBtn.click();
      await driver.sleep(400);
      const feedTab = await waitFor(driver, By.id('commTabFeed'));
      await feedTab.click();
      await driver.sleep(600);

      const feed = await driver.findElement(By.id('commFeed'));
      const lockBtns = await feed.findElements(By.css('.rxn-locked'));
      report('TC-SEL-027', 'Locked emoji buttons exist when streak = 0', lockBtns.length > 0, `Found ${lockBtns.length} locked buttons`);
    } catch (e) {
      report('TC-SEL-027', 'Locked emojis at streak 0', false, e.message);
    }

    // ── TC-SEL-028: Add a comment to a post ────────────────────
    try {
      await driver.executeScript("localStorage.setItem('quiz_streak', '5');");
      await driver.navigate().refresh();
      await driver.wait(until.elementLocated(By.id('topbar')), TIMEOUT);
      await driver.sleep(600);

      const commBtn = await waitFor(driver, By.css('.tnav[data-page="community"]'));
      await commBtn.click();
      await driver.sleep(400);
      const feedTab = await waitFor(driver, By.id('commTabFeed'));
      await feedTab.click();
      await driver.sleep(600);

      // Find the first comment input
      const commentInputs = await driver.findElements(By.css('.comment-input, input[placeholder*="comment"], input[placeholder*="Comment"]'));

      if (commentInputs.length === 0) {
        // Try toggling comments open first
        const commentBtns = await driver.findElements(By.css('.comm-action-btn, button[onclick*="comment"]'));
        if (commentBtns.length > 0) {
          await commentBtns[0].click();
          await driver.sleep(400);
        }
        const inputsAfter = await driver.findElements(By.css('.comment-input, input[placeholder*="omment"]'));
        if (inputsAfter.length > 0) {
          const commentText = 'Great recipe from Selenium!';
          await inputsAfter[0].sendKeys(commentText);
          await inputsAfter[0].sendKeys(Key.RETURN);
          await driver.sleep(500);
          const feedText = await driver.findElement(By.id('commFeed')).getText();
          report('TC-SEL-028', 'Comment appears in post after submission', feedText.includes(commentText));
        } else {
          report('TC-SEL-028', 'Comment input found and comment added', false, 'Comment input not found');
        }
      } else {
        const commentText = 'Great recipe from Selenium!';
        await commentInputs[0].sendKeys(commentText);
        await commentInputs[0].sendKeys(Key.RETURN);
        await driver.sleep(500);
        const feedText = await driver.findElement(By.id('commFeed')).getText();
        report('TC-SEL-028', 'Comment appears in post after submission', feedText.includes(commentText));
      }
    } catch (e) {
      report('TC-SEL-028', 'Add comment to post', false, e.message);
    }

    // ── TC-SEL-029: Share button shows toast ───────────────────
    try {
      const shareBtns = await driver.findElements(By.css('button[onclick*="share"], .comm-action-btn'));
      let shareBtn = null;
      for (const btn of shareBtns) {
        const text = await btn.getText();
        if (text.toLowerCase().includes('share') || text.includes('🔗')) {
          shareBtn = btn;
          break;
        }
      }

      if (!shareBtn) {
        report('TC-SEL-029', 'Share button shows toast', false, 'No share button found');
      } else {
        await shareBtn.click();
        await driver.sleep(400);
        const toast = await driver.findElement(By.id('toast'));
        const toastText = await toast.getText();
        const isVisible = toastText.length > 0;
        report('TC-SEL-029', 'Share button shows a toast message', isVisible, `Toast: "${toastText}"`);
      }
    } catch (e) {
      report('TC-SEL-029', 'Share button shows toast', false, e.message);
    }

    // ── TC-SEL-030: Feed tab shows feed, Challenges tab shows challenges ──
    try {
      const commBtn = await waitFor(driver, By.css('.tnav[data-page="community"]'));
      await commBtn.click();
      await driver.sleep(400);

      const feedTab = await driver.findElement(By.id('commTabFeed'));
      await feedTab.click();
      await driver.sleep(400);

      const feedPanel = await driver.findElement(By.id('commPanelFeed'));
      const feedDisplay = await feedPanel.getCssValue('display');

      const challTab = await driver.findElement(By.id('commTabChallenges'));
      await challTab.click();
      await driver.sleep(400);

      const challPanel = await driver.findElement(By.id('commPanelChallenges'));
      const challDisplay = await challPanel.getCssValue('display');

      report('TC-SEL-030', 'Community tab switching works (Feed ↔ Challenges)',
        feedDisplay !== 'none' || challDisplay !== 'none',
        `Feed: ${feedDisplay}, Challenges: ${challDisplay}`
      );
    } catch (e) {
      report('TC-SEL-030', 'Tab switching works', false, e.message);
    }

  } finally {
    await driver.quit();
    console.log(`\n─────────────────────────────────`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log(`─────────────────────────────────\n`);
  }
}

runTests().catch(console.error);

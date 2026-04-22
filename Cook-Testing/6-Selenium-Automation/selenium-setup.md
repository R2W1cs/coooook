# Selenium WebDriver Setup — Cook's Application

## Prerequisites

- Node.js 18+ installed ([nodejs.org](https://nodejs.org))
- Google Chrome browser (version 120+)
- Live Server serving the Cook's app on `http://localhost:5500`

---

## Step 1 — Create a Project Folder

```bash
mkdir selenium-tests
cd selenium-tests
npm init -y
```

---

## Step 2 — Install selenium-webdriver

```bash
npm install selenium-webdriver
```

---

## Step 3 — Install ChromeDriver

Since Chrome 115+, ChromeDriver is managed automatically by selenium-webdriver via **Chrome for Testing**. You do **not** need to manually download ChromeDriver.

If you are on an older setup or the automatic download fails, install manually:

```bash
npm install chromedriver
```

Then add this to the top of your test files:

```javascript
require('chromedriver');
```

---

## Step 4 — Verify Installation

Create `check.js`:

```javascript
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function() {
  const options = new chrome.Options();
  // Remove --headless if you want to see the browser window
  options.addArguments('--headless=new');
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  await driver.get('http://localhost:5500/index.html');
  const title = await driver.getTitle();
  console.log('Page title:', title);
  await driver.quit();
})();
```

Run:
```bash
node check.js
```

Expected output: `Page title: Cook's — AI Kitchen`

---

## Step 5 — Run the Test Scripts

Ensure Live Server is running on port 5500, then:

```bash
node test-login.js
node test-challenges.js
node test-community.js
```

Each script prints results to the console:

```
[PASS] TC-SEL-001: Auth overlay is visible on load
[PASS] TC-SEL-002: Sign up with valid data succeeds
[FAIL] TC-SEL-005: Sign in with wrong password shows error
       Reason: Element #signinError not found within timeout
```

---

## Step 6 — Run in Headed Mode (Visual)

Remove or comment out the `--headless=new` argument in the Chrome options to watch the browser perform the tests in real time. This is useful for debugging failing tests.

---

## Step 7 — Viewing Test Reports

Currently, results are printed to stdout. To generate an HTML report, install `mocha` and `mochawesome`:

```bash
npm install mocha mochawesome
npx mocha test-login.js --reporter mochawesome
```

The report is saved to `mochawesome-report/mochawesome.html`.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `SessionNotCreatedException: Chrome version mismatch` | Update Chrome or pin ChromeDriver version to match |
| `ECONNREFUSED` — cannot reach localhost:5500 | Start Live Server first; verify port in the test BASE_URL |
| `NoSuchElementException` | The element was not found in time. Increase `driver.wait()` timeout |
| `StaleElementReferenceException` | The DOM was re-rendered after the element was located. Re-query the element |
| Tests pass locally but fail in CI | Add `--no-sandbox --disable-dev-shm-usage` to Chrome options |

---

## Chrome Options for CI / Headless

```javascript
const options = new chrome.Options();
options.addArguments('--headless=new');
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');
options.addArguments('--disable-gpu');
options.addArguments('--window-size=1400,900');
```

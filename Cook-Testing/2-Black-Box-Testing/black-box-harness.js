(function () {
  const APP_URL = "../../index.html";
  const suites = [];
  const registry = [];

  function stringifyStorageValue(value) {
    if (typeof value === "string") return value;
    return JSON.stringify(value);
  }

  function defineSuite(name, register) {
    const suite = { name, tests: [] };
    const api = {
      it(id, title, fn) {
        suite.tests.push({ id, title, fn });
        registry.push({ suite: name, id, title });
      }
    };
    register(api);
    suites.push(suite);
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message + " | expected=" + JSON.stringify(expected) + " actual=" + JSON.stringify(actual));
    }
  }

  function includes(actual, expected, message) {
    if (!String(actual).includes(expected)) {
      throw new Error(message + " | missing=" + JSON.stringify(expected) + " actual=" + JSON.stringify(actual));
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function waitFor(fn, options = {}) {
    const timeout = options.timeout || 5000;
    const interval = options.interval || 50;
    const label = options.label || "condition";
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const value = fn();
      if (value) return value;
      await delay(interval);
    }
    throw new Error("Timed out waiting for " + label);
  }

  function mountFrame(frame) {
    const mount = document.getElementById("appFrameMount");
    mount.innerHTML = "";
    mount.appendChild(frame);
  }

  async function createApp(storage = {}) {
    window.localStorage.clear();
    Object.entries(storage).forEach(([key, value]) => {
      window.localStorage.setItem(key, stringifyStorageValue(value));
    });

    const frame = document.createElement("iframe");
    frame.src = APP_URL + "?bb=" + Date.now();
    mountFrame(frame);

    await new Promise((resolve, reject) => {
      frame.onload = resolve;
      frame.onerror = reject;
    });

    const ctx = {
      frame,
      win: frame.contentWindow,
      doc: frame.contentDocument
    };

    await waitFor(() => ctx.doc && ctx.doc.getElementById("authOverlay"), { label: "app boot" });
    await delay(200);
    return ctx;
  }

  async function reloadApp(ctx) {
    const frame = ctx.frame;
    await new Promise((resolve, reject) => {
      frame.onload = resolve;
      frame.onerror = reject;
      frame.contentWindow.location.reload();
    });
    ctx.win = frame.contentWindow;
    ctx.doc = frame.contentDocument;
    await waitFor(() => ctx.doc && ctx.doc.getElementById("authOverlay"), { label: "reloaded app" });
    await delay(200);
    return ctx;
  }

  function setValue(el, value) {
    el.focus();
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function click(el) {
    el.click();
    await delay(120);
  }

  async function signup(ctx, data) {
    await click(ctx.doc.getElementById("tabSignup"));
    setValue(ctx.doc.getElementById("suName"), data.name || "");
    setValue(ctx.doc.getElementById("suEmail"), data.email || "");
    setValue(ctx.doc.getElementById("suPass"), data.password || "");
    setValue(ctx.doc.getElementById("suConfirm"), data.confirm || data.password || "");
    const checkbox = ctx.doc.getElementById("agreePrivacy");
    if (checkbox.checked !== Boolean(data.agree)) checkbox.click();
    await click(ctx.doc.querySelector("#formSignup button[type='submit']"));
  }

  async function signin(ctx, data) {
    await click(ctx.doc.getElementById("tabSignin"));
    const form = ctx.doc.getElementById("formSignin");
    const inputs = form.querySelectorAll("input");
    setValue(inputs[0], data.email || "");
    setValue(inputs[1], data.password || "");
    await click(ctx.doc.getElementById("signinBtn"));
  }

  async function bootLoggedInApp(extraStorage = {}) {
    return createApp(Object.assign({
      cooks_user: {
        name: "BlackBoxChef",
        email: "blackbox@test.local",
        password: "TestPass123",
        joined: "4/22/2026"
      },
      cooks_logged_in: "true"
    }, extraStorage));
  }

  async function openCommunity(ctx, tab) {
    await click(ctx.doc.querySelector(".tnav[data-page='community']"));
    if (tab === "challenges") {
      await click(ctx.doc.getElementById("commTabChallenges"));
      await waitFor(() => ctx.doc.getElementById("comm-challenges").children.length > 0, {
        label: "community challenges"
      });
    } else {
      await click(ctx.doc.getElementById("commTabFeed"));
      await waitFor(() => ctx.doc.getElementById("commFeed").children.length > 0, {
        label: "community feed"
      });
    }
    await delay(100);
  }

  async function openProfile(ctx) {
    await click(ctx.doc.querySelector(".user-pill"));
    await waitFor(() => ctx.doc.getElementById("profileDetail") && ctx.doc.getElementById("profileDetail").textContent.length > 0, {
      label: "profile"
    });
    await delay(100);
  }

  function getSignupError(ctx) {
    return ctx.doc.querySelector("#formSignup .auth-inline-error")?.textContent || "";
  }

  function getSigninError(ctx) {
    return ctx.doc.querySelector("#formSignin .auth-inline-error")?.textContent || "";
  }

  function getStorage(key) {
    return window.localStorage.getItem(key);
  }

  function setStorage(key, value) {
    window.localStorage.setItem(key, stringifyStorageValue(value));
  }

  function parseStorage(key, fallback) {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }

  async function answerChallenge(ctx, answerText) {
    await openCommunity(ctx, "challenges");
    const buttons = Array.from(ctx.doc.querySelectorAll(".quiz-ans-btn"));
    const target = buttons.find(btn => btn.textContent.includes(answerText)) || buttons[0];
    assert(target, "No challenge answer button found");
    await click(target);
    await waitFor(() => ctx.doc.querySelector(".result-banner"), { label: "challenge result banner" });
  }

  async function createPost(ctx, text) {
    await openCommunity(ctx, "feed");
    setValue(ctx.doc.getElementById("postText"), text);
    await click(ctx.doc.querySelector(".post-box .btn-primary"));
    await delay(160);
  }

  async function toggleComments(ctx, index) {
    await click(ctx.doc.getElementById("comment-btn-" + index));
    await waitFor(() => ctx.doc.getElementById("comments-section-" + index).style.display === "block", {
      label: "comments section"
    });
  }

  async function addComment(ctx, index, text) {
    await toggleComments(ctx, index);
    const input = ctx.doc.getElementById("comment-input-" + index);
    setValue(input, text);
    await click(input.parentElement.querySelector("button"));
    await delay(120);
  }

  function findReactionButton(ctx, postIndex, emoji) {
    const bars = Array.from(ctx.doc.querySelectorAll("#commFeed .rxn-bar"));
    const buttons = Array.from(bars[postIndex]?.querySelectorAll(".rxn-btn") || []);
    return buttons.find(btn => btn.textContent.includes(emoji));
  }

  function getReactionCount(btn) {
    const span = btn.querySelector("span");
    return Number.parseInt((span?.textContent || "0").trim() || "0", 10) || 0;
  }

  function getVisibleText(ctx, selector) {
    return ctx.doc.querySelector(selector)?.textContent?.trim() || "";
  }

  function getBodyText(ctx) {
    return ctx.doc.body.textContent || "";
  }

  async function run() {
    const resultsEl = document.getElementById("results");
    const runMetaEl = document.getElementById("runMeta");
    const summary = {
      total: 0,
      pass: 0,
      fail: 0,
      suites: suites.length
    };

    document.getElementById("statSuites").textContent = String(summary.suites);
    runMetaEl.textContent = "Running tests...";

    for (const suite of suites) {
      const suiteEl = document.createElement("section");
      suiteEl.className = "suite-block";
      suiteEl.innerHTML = '<div class="suite-title">' + suite.name + "</div>";
      resultsEl.appendChild(suiteEl);

      for (const test of suite.tests) {
        summary.total += 1;
        let status = "PASS";
        let detail = "";

        try {
          await test.fn({
            APP_URL,
            assert,
            equal,
            includes,
            delay,
            waitFor,
            createApp,
            reloadApp,
            signup,
            signin,
            bootLoggedInApp,
            openCommunity,
            openProfile,
            answerChallenge,
            createPost,
            addComment,
            click,
            setValue,
            getSignupError,
            getSigninError,
            getStorage,
            setStorage,
            parseStorage,
            findReactionButton,
            getReactionCount,
            getVisibleText,
            getBodyText,
            getRegisteredTests: () => registry.slice()
          });
          summary.pass += 1;
        } catch (error) {
          status = "FAIL";
          detail = error && error.message ? error.message : String(error);
          summary.fail += 1;
        }

        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML =
          '<div class="status ' + (status === "PASS" ? "status-pass" : "status-fail") + '">' + status + "</div>" +
          '<div class="meta">' +
          '<div><span class="test-id">' + test.id + "</span><span class=\"test-name\">" + test.title + "</span></div>" +
          (detail ? '<div class="detail">' + detail + "</div>" : "") +
          "</div>";
        suiteEl.appendChild(row);

        document.getElementById("statTotal").textContent = String(summary.total);
        document.getElementById("statPass").textContent = String(summary.pass);
        document.getElementById("statFail").textContent = String(summary.fail);
        const pct = summary.total ? Math.round((summary.pass / summary.total) * 100) : 0;
        document.getElementById("progressFill").style.width = pct + "%";
      }
    }

    const finishedAt = new Date().toLocaleTimeString();
    runMetaEl.textContent =
      "Completed at " + finishedAt + " | " + summary.pass + "/" + summary.total + " passed";
    document.title = "Cook's Black-Box Tests - " + summary.pass + "/" + summary.total;
  }

  window.CookBlackBox = { defineSuite };
  window.addEventListener("load", run);
})();

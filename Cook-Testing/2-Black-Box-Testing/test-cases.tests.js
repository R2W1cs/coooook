window.CookBlackBox.defineSuite("Black-Box Test Cases", ({ it }) => {
  it("TC-BB-001", "Sign up with valid data opens the real app", async (h) => {
    const ctx = await h.createApp();
    await h.signup(ctx, {
      name: "RealChef",
      email: "realchef@test.local",
      password: "Password123",
      agree: true
    });

    h.assert(!ctx.doc.getElementById("topbar").classList.contains("hidden"), "Topbar should be visible after sign up");
    h.equal(ctx.doc.getElementById("upName").textContent.trim(), "RealChef", "Navbar name should match signed up user");
    h.equal(h.getStorage("cooks_logged_in"), "true", "Session flag should be stored");
  });

  it("TC-BB-002", "Sign up with mismatched passwords shows a real validation error", async (h) => {
    const ctx = await h.createApp();
    await h.signup(ctx, {
      name: "ChefMismatch",
      email: "mismatch@test.local",
      password: "Password123",
      confirm: "Wrong123",
      agree: true
    });

    h.includes(h.getSignupError(ctx), "Passwords do not match", "Mismatch error should be rendered");
    h.assert(ctx.doc.getElementById("topbar").classList.contains("hidden"), "App should stay closed when sign up fails");
  });

  it("TC-BB-003", "Browse as Guest enters guest mode through the real UI", async (h) => {
    const ctx = await h.createApp();
    await h.click(ctx.doc.querySelector("button.btn-text-gold"));

    h.assert(!ctx.doc.getElementById("topbar").classList.contains("hidden"), "Topbar should be visible in guest mode");
    h.equal(ctx.doc.getElementById("upName").textContent.trim(), "Guest", "Guest mode should display Guest");
  });

  it("TC-BB-004", "Sign in with stored credentials works through the real form", async (h) => {
    const ctx = await h.createApp({
      cooks_user: {
        name: "SigninChef",
        email: "signin@test.local",
        password: "mypassword1",
        joined: "4/22/2026"
      }
    });

    await h.signin(ctx, { email: "signin@test.local", password: "mypassword1" });

    h.assert(!ctx.doc.getElementById("topbar").classList.contains("hidden"), "Sign in should reveal the app");
    h.equal(ctx.doc.getElementById("upName").textContent.trim(), "SigninChef", "Signed in user name should appear");
  });

  it("TC-BB-005", "Correct challenge answer stores played date and increments streak", async (h) => {
    const ctx = await h.bootLoggedInApp();
    await h.answerChallenge(ctx, "Kabsa");

    h.equal(h.getStorage("challenge_played_date"), new Date().toDateString(), "Played date should be stored for today");
    h.equal(h.getStorage("quiz_streak"), "1", "Correct answer should start a streak");
    h.includes(h.getVisibleText(ctx, ".result-banner"), "Correct", "Correct banner should be shown");
  });

  it("TC-BB-006", "Playing once locks the challenges for the rest of the day", async (h) => {
    const ctx = await h.bootLoggedInApp();
    await h.answerChallenge(ctx, "Kabsa");
    await h.openCommunity(ctx, "challenges");

    h.includes(h.getVisibleText(ctx, ".result-banner"), "Already played today", "Locked banner should be shown after the first play");
    h.equal(ctx.doc.querySelectorAll(".quiz-ans-btn").length, 0, "No answer buttons should remain when locked");
  });

  it("TC-BB-007", "Creating a text post adds it to the top of the real community feed", async (h) => {
    const ctx = await h.bootLoggedInApp();
    const text = "Black-box post " + Date.now();
    await h.createPost(ctx, text);

    const firstCaption = ctx.doc.querySelector(".comm-post-card .post-caption")?.textContent || "";
    h.includes(firstCaption, text, "Newest post should render first in the feed");
    h.includes(h.getVisibleText(ctx, "#postStatusMsg"), "Posted", "Post success message should appear");
  });

  it("TC-BB-008", "Submitting an empty post shows the real error state", async (h) => {
    const ctx = await h.bootLoggedInApp();
    await h.openCommunity(ctx, "feed");
    await h.click(ctx.doc.querySelector(".post-box .btn-primary"));

    h.includes(h.getVisibleText(ctx, "#postStatusMsg"), "Write something first", "Empty post error should appear");
  });

  it("TC-BB-009", "Reaction toggle updates counts on a real post", async (h) => {
    const ctx = await h.bootLoggedInApp({ quiz_streak: "5" });
    await h.openCommunity(ctx, "feed");

    const heart = h.findReactionButton(ctx, 0, "❤️");
    const before = h.getReactionCount(heart);
    await h.click(heart);

    const activeHeart = h.findReactionButton(ctx, 0, "❤️");
    const afterAdd = h.getReactionCount(activeHeart);
    h.equal(afterAdd, before + 1, "First heart click should increment the count");

    await h.click(activeHeart);
    const finalHeart = h.findReactionButton(ctx, 0, "❤️");
    const afterRemove = h.getReactionCount(finalHeart);
    h.equal(afterRemove, before, "Second heart click should toggle the count back");
  });

  it("TC-BB-010", "Adding a comment updates the visible comment list and counter", async (h) => {
    const ctx = await h.bootLoggedInApp();
    await h.openCommunity(ctx, "feed");
    await h.addComment(ctx, 0, "Great recipe from black-box test");

    h.includes(h.getBodyText(ctx), "Great recipe from black-box test", "Comment text should render in the feed");
    h.equal(h.getVisibleText(ctx, "#comment-count-0"), "1", "Comment count should increment");
  });

  it("TC-BB-011", "Profile XP is calculated from the stored streak in the real profile view", async (h) => {
    const ctx = await h.bootLoggedInApp({ quiz_streak: "5" });
    await h.openProfile(ctx);

    h.includes(h.getBodyText(ctx), "900 XP", "XP should be rendered as streak x 180");
  });
});

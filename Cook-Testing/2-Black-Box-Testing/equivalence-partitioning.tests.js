window.CookBlackBox.defineSuite("Equivalence Partitioning Tests", ({ it }) => {
  it("EP-BB-001", "Challenge eligibility valid partition: no played date means challenge is available", async (h) => {
    const ctx = await h.bootLoggedInApp();
    await h.openCommunity(ctx, "challenges");
    h.assert(ctx.doc.querySelectorAll(".quiz-ans-btn").length > 0, "No stored date should keep the challenge available");
  });

  it("EP-BB-002", "Challenge eligibility valid partition: past played date still allows play", async (h) => {
    const ctx = await h.bootLoggedInApp({ challenge_played_date: "Mon Jan 01 2000" });
    await h.openCommunity(ctx, "challenges");
    h.assert(ctx.doc.querySelectorAll(".quiz-ans-btn").length > 0, "Past date should be treated as playable");
  });

  it("EP-BB-003", "Challenge eligibility invalid partition: today's date blocks play", async (h) => {
    const ctx = await h.bootLoggedInApp({ challenge_played_date: new Date().toDateString() });
    await h.openCommunity(ctx, "challenges");
    h.equal(ctx.doc.querySelectorAll(".quiz-ans-btn").length, 0, "Today's played date should block all answers");
    h.includes(h.getVisibleText(ctx, ".result-banner"), "Already played today", "Locked banner should be visible");
  });

  it("EP-BB-004", "Email valid partition accepts a normal email", async (h) => {
    const ctx = await h.createApp();
    await h.signup(ctx, {
      name: "EmailValid",
      email: "chef@cooks.com",
      password: "Password123",
      agree: true
    });
    h.assert(!ctx.doc.getElementById("topbar").classList.contains("hidden"), "Valid email partition should allow sign up");
  });

  it("EP-BB-005", "Email invalid partition rejects a value without @", async (h) => {
    const ctx = await h.createApp();
    await h.signup(ctx, {
      name: "EmailInvalid",
      email: "chefcooks.com",
      password: "Password123",
      agree: true
    });
    h.includes(h.getSignupError(ctx), "Please enter a valid email", "Missing @ should be rejected");
  });

  it("EP-BB-006", "Password valid partition accepts matching values", async (h) => {
    const ctx = await h.createApp();
    await h.signup(ctx, {
      name: "PasswordValid",
      email: "passwordvalid@test.local",
      password: "Pass123",
      confirm: "Pass123",
      agree: true
    });
    h.assert(!ctx.doc.getElementById("topbar").classList.contains("hidden"), "Matching passwords should be accepted");
  });

  it("EP-BB-007", "Password invalid partition rejects mismatched values", async (h) => {
    const ctx = await h.createApp();
    await h.signup(ctx, {
      name: "PasswordInvalid",
      email: "passwordinvalid@test.local",
      password: "Pass123",
      confirm: "Pass456",
      agree: true
    });
    h.includes(h.getSignupError(ctx), "Passwords do not match", "Different password partition should fail");
  });

  it("EP-BB-008", "Post content valid partition accepts non-empty text", async (h) => {
    const ctx = await h.bootLoggedInApp();
    const text = "Partition post " + Date.now();
    await h.createPost(ctx, text);
    h.includes(h.getBodyText(ctx), text, "Non-empty post should render");
  });

  it("EP-BB-009", "Post content invalid partition rejects whitespace-only text", async (h) => {
    const ctx = await h.bootLoggedInApp();
    await h.openCommunity(ctx, "feed");
    h.setValue(ctx.doc.getElementById("postText"), "   ");
    await h.click(ctx.doc.querySelector(".post-box .btn-primary"));
    h.includes(h.getVisibleText(ctx, "#postStatusMsg"), "Write something first", "Whitespace-only input should be treated as empty");
  });

  it("EP-BB-010", "Streak partitions unlock reactions at the expected thresholds", async (h) => {
    const lowCtx = await h.bootLoggedInApp({ quiz_streak: "2" });
    await h.openCommunity(lowCtx, "feed");
    h.assert(h.findReactionButton(lowCtx, 0, "🫕").className.includes("rxn-locked"), "Streak 2 should keep 🫕 locked");

    const firstCtx = await h.bootLoggedInApp({ quiz_streak: "3" });
    await h.openCommunity(firstCtx, "feed");
    h.assert(h.findReactionButton(firstCtx, 0, "🫕").className.includes("rxn-unlocked"), "Streak 3 should unlock 🫕");

    const secondCtx = await h.bootLoggedInApp({ quiz_streak: "7" });
    await h.openCommunity(secondCtx, "feed");
    h.assert(h.findReactionButton(secondCtx, 0, "🧆").className.includes("rxn-unlocked"), "Streak 7 should unlock 🧆");

    const allCtx = await h.bootLoggedInApp({ quiz_streak: "14" });
    await h.openCommunity(allCtx, "feed");
    h.assert(h.findReactionButton(allCtx, 0, "🥙").className.includes("rxn-unlocked"), "Streak 14 should unlock 🥙");
  });
});

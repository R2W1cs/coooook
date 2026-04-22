window.CookBlackBox.defineSuite("Decision Table Tests", ({ it }) => {
  it("DT-BB-001", "Challenge rule: not played + correct answer marks played and increments streak", async (h) => {
    const ctx = await h.bootLoggedInApp();
    await h.answerChallenge(ctx, "Kabsa");

    h.equal(h.getStorage("quiz_streak"), "1", "Correct answer should increment streak");
    h.equal(h.getStorage("challenge_played_date"), new Date().toDateString(), "Correct answer should mark today as played");
    h.includes(h.getVisibleText(ctx, ".result-banner"), "Correct", "Success banner should appear");
  });

  it("DT-BB-002", "Challenge rule: not played + wrong answer marks played but keeps streak unchanged", async (h) => {
    const ctx = await h.bootLoggedInApp({ quiz_streak: "2" });
    await h.answerChallenge(ctx, "Mansaf");

    h.equal(h.getStorage("quiz_streak"), "2", "Wrong answer should not increase streak");
    h.equal(h.getStorage("challenge_played_date"), new Date().toDateString(), "Wrong answer should still mark the challenge as played");
    h.includes(h.getVisibleText(ctx, ".result-banner"), "Not quite", "Wrong-answer banner should appear");
  });

  it("DT-BB-003", "Challenge rule: already played today shows the locked banner immediately", async (h) => {
    const ctx = await h.bootLoggedInApp({ challenge_played_date: new Date().toDateString() });
    await h.openCommunity(ctx, "challenges");

    h.equal(ctx.doc.querySelectorAll(".quiz-ans-btn").length, 0, "Already played state should hide answer buttons");
    h.includes(h.getVisibleText(ctx, ".result-banner"), "Already played today", "Already-played banner should appear");
  });

  it("DT-BB-004", "Sign-up rule: missing fields shows the fill-all-fields error", async (h) => {
    const ctx = await h.createApp();
    await h.signup(ctx, {
      name: "",
      email: "",
      password: "",
      confirm: "",
      agree: false
    });

    h.includes(h.getSignupError(ctx), "Please fill all fields", "Missing fields should trigger the first validation rule");
  });

  it("DT-BB-005", "Sign-up rule: valid fields but unchecked privacy shows the privacy error", async (h) => {
    const ctx = await h.createApp();
    await h.signup(ctx, {
      name: "NoPrivacyChef",
      email: "noprivacy@test.local",
      password: "Password123",
      confirm: "Password123",
      agree: false
    });

    h.includes(h.getSignupError(ctx), "Please agree to the privacy policy", "Unchecked privacy should trigger the privacy rule");
  });

  it("DT-BB-006", "Reaction rule: locked emoji does not activate when the streak threshold is not met", async (h) => {
    const ctx = await h.bootLoggedInApp({ quiz_streak: "0" });
    await h.openCommunity(ctx, "feed");

    const locked = h.findReactionButton(ctx, 0, "🫕");
    await h.click(locked);

    h.assert(locked.className.includes("rxn-locked"), "Locked emoji should remain locked");
    h.includes(h.getVisibleText(ctx, "#lock-msg-demo_0"), "Complete challenges to unlock", "Lock message should be shown");
  });

  it("DT-BB-007", "Reaction rule: clicking an unlocked emoji activates it and clicking again removes it", async (h) => {
    const ctx = await h.bootLoggedInApp({ quiz_streak: "5" });
    await h.openCommunity(ctx, "feed");

    const heart = h.findReactionButton(ctx, 0, "❤️");
    const before = h.getReactionCount(heart);
    await h.click(heart);
    const active = h.findReactionButton(ctx, 0, "❤️");
    h.equal(h.getReactionCount(active), before + 1, "Unlocked reaction should increment on first click");

    await h.click(active);
    const cleared = h.findReactionButton(ctx, 0, "❤️");
    h.equal(h.getReactionCount(cleared), before, "Second click should remove the user's reaction");
  });

  it("DT-BB-008", "Reaction rule: switching from one unlocked emoji to another updates both counts", async (h) => {
    const ctx = await h.bootLoggedInApp({ quiz_streak: "5" });
    await h.openCommunity(ctx, "feed");

    const heartBefore = h.findReactionButton(ctx, 0, "❤️");
    const clapBefore = h.findReactionButton(ctx, 0, "👏");
    const heartCountBefore = h.getReactionCount(heartBefore);
    const clapCountBefore = h.getReactionCount(clapBefore);

    await h.click(heartBefore);
    await h.click(h.findReactionButton(ctx, 0, "👏"));

    const heartAfter = h.findReactionButton(ctx, 0, "❤️");
    const clapAfter = h.findReactionButton(ctx, 0, "👏");
    h.equal(h.getReactionCount(heartAfter), heartCountBefore, "Switching away should restore the heart count");
    h.equal(h.getReactionCount(clapAfter), clapCountBefore + 1, "Switching to clap should increment the clap count");
  });
});

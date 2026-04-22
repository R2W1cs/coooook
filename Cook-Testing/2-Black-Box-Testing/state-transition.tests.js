window.CookBlackBox.defineSuite("State Transition Tests", ({ it }) => {
  it("ST-BB-001", "Auth state transitions from logged out to guest", async (h) => {
    const ctx = await h.createApp();
    h.assert(!ctx.doc.getElementById("authOverlay").classList.contains("hidden"), "Auth overlay should start visible");

    await h.click(ctx.doc.querySelector("button.btn-text-gold"));
    h.equal(ctx.doc.getElementById("upName").textContent.trim(), "Guest", "Guest transition should set the visible user");
  });

  it("ST-BB-002", "Auth state transitions from logged out to signed in after successful sign up", async (h) => {
    const ctx = await h.createApp();
    await h.signup(ctx, {
      name: "TransitionChef",
      email: "transition@test.local",
      password: "Password123",
      agree: true
    });

    h.assert(ctx.doc.getElementById("authOverlay").classList.contains("hidden"), "Auth overlay should hide after sign up");
    h.assert(!ctx.doc.getElementById("topbar").classList.contains("hidden"), "Topbar should become visible");
  });

  it("ST-BB-003", "Signed-in state returns to logged-out state on logout", async (h) => {
    const ctx = await h.bootLoggedInApp();
    await h.openProfile(ctx);

    const signOutButton = Array.from(ctx.doc.querySelectorAll("button")).find(btn => btn.textContent.includes("Sign Out"));
    h.assert(signOutButton, "Sign out button should exist");
    await h.click(signOutButton);
    await h.waitFor(() => !ctx.doc.getElementById("authOverlay").classList.contains("hidden"), { label: "auth overlay after logout" });

    h.assert(ctx.doc.getElementById("topbar").classList.contains("hidden"), "Topbar should hide after logout");
  });

  it("ST-BB-004", "Signed-in state persists across refresh", async (h) => {
    const ctx = await h.bootLoggedInApp();
    await h.reloadApp(ctx);

    h.assert(ctx.doc.getElementById("authOverlay").classList.contains("hidden"), "Refresh should keep the auth overlay hidden");
    h.assert(!ctx.doc.getElementById("topbar").classList.contains("hidden"), "Refresh should keep the topbar visible");
  });

  it("ST-BB-005", "Challenge state goes from available to completed and then locked", async (h) => {
    const ctx = await h.bootLoggedInApp();
    await h.openCommunity(ctx, "challenges");
    h.assert(ctx.doc.querySelectorAll(".quiz-ans-btn").length > 0, "Challenge should start in available state");

    await h.answerChallenge(ctx, "Kabsa");
    h.includes(h.getVisibleText(ctx, ".result-banner"), "Correct", "Correct state should be shown");

    await h.openCommunity(ctx, "challenges");
    h.includes(h.getVisibleText(ctx, ".result-banner"), "Already played today", "Challenge should transition to locked state");
  });

  it("ST-BB-006", "Locked challenge state persists across refresh on the same day", async (h) => {
    const ctx = await h.bootLoggedInApp();
    await h.answerChallenge(ctx, "Kabsa");
    await h.reloadApp(ctx);
    await h.openCommunity(ctx, "challenges");

    h.includes(h.getVisibleText(ctx, ".result-banner"), "Already played today", "Refresh should preserve same-day lock");
  });

  it("ST-BB-007", "Locked challenge returns to available when the stored date is moved to the past", async (h) => {
    const ctx = await h.bootLoggedInApp({
      challenge_played_date: new Date().toDateString()
    });

    h.setStorage("challenge_played_date", "Mon Jan 01 2000");
    await h.reloadApp(ctx);
    await h.openCommunity(ctx, "challenges");

    h.assert(ctx.doc.querySelectorAll(".quiz-ans-btn").length > 0, "Past date should transition the challenge back to available");
  });
});

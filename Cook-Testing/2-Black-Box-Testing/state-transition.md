# Executable State Transition Tests

The state diagrams have been replaced with runnable transition checks.

## Real Test File

- `Cook-Testing/2-Black-Box-Testing/state-transition.tests.js`

## What It Verifies

- logged out -> guest
- logged out -> signed in
- signed in -> logged out
- signed in -> refresh -> signed in
- challenge available -> completed -> locked
- challenge locked -> refresh -> locked
- challenge locked -> past date -> available

## Example

```js
it("ST-BB-005", "Challenge state goes from available to completed and then locked", async (h) => {
  const ctx = await h.bootLoggedInApp();
  await h.openCommunity(ctx, "challenges");
  h.assert(ctx.doc.querySelectorAll(".quiz-ans-btn").length > 0, "Challenge should start in available state");

  await h.answerChallenge(ctx, "Kabsa");
  await h.openCommunity(ctx, "challenges");
  h.includes(h.getVisibleText(ctx, ".result-banner"), "Already played today", "Challenge should transition to locked state");
});
```

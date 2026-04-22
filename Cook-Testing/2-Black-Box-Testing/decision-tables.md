# Executable Decision Table Tests

The decision-table combinations are now backed by real UI checks.

## Real Test File

- `Cook-Testing/2-Black-Box-Testing/decision-tables.tests.js`

## Automated Rules

- challenge logic: correct, wrong, already played
- sign-up validation ordering
- reaction logic: locked, activate, deactivate, switch

## Example

```js
it("DT-BB-002", "Challenge rule: not played + wrong answer marks played but keeps streak unchanged", async (h) => {
  const ctx = await h.bootLoggedInApp({ quiz_streak: "2" });
  await h.answerChallenge(ctx, "Mansaf");

  h.equal(h.getStorage("quiz_streak"), "2", "Wrong answer should not increase streak");
  h.equal(h.getStorage("challenge_played_date"), new Date().toDateString(), "Wrong answer should still mark the challenge as played");
});
```

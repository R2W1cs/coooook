# Executable Equivalence Partitioning Tests

This topic now uses representative inputs in runnable browser tests instead of static tables.

## Real Test File

- `Cook-Testing/2-Black-Box-Testing/equivalence-partitioning.tests.js`

## Automated Partitions

- challenge availability: missing date, past date, today
- signup email: valid and invalid partitions
- signup password confirmation: valid and invalid partitions
- post content: non-empty and whitespace-only partitions
- streak thresholds: `<3`, `>=3`, `>=7`, `>=14`

## Example

```js
it("EP-BB-003", "Challenge eligibility invalid partition: today's date blocks play", async (h) => {
  const ctx = await h.bootLoggedInApp({ challenge_played_date: new Date().toDateString() });
  await h.openCommunity(ctx, "challenges");

  h.equal(ctx.doc.querySelectorAll(".quiz-ans-btn").length, 0, "Today's played date should block all answers");
  h.includes(h.getVisibleText(ctx, ".result-banner"), "Already played today", "Locked banner should be visible");
});
```

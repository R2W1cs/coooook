# Executable Black-Box Test Cases

This file now points to real runnable browser tests instead of manual step-by-step checklists.

## Run It

1. Start Live Server from the repo root so `index.html` is served.
2. Open `Cook-Testing/2-Black-Box-Testing/black-box-test-runner.html`.
3. The runner will load the real app in an iframe and execute the suites automatically.

## Real Test File

- `Cook-Testing/2-Black-Box-Testing/test-cases.tests.js`

## Covered Automated Cases

- `TC-BB-001`: valid sign up
- `TC-BB-002`: mismatched password validation
- `TC-BB-003`: guest mode
- `TC-BB-004`: valid sign in
- `TC-BB-005`: correct challenge answer
- `TC-BB-006`: one-per-day challenge lock
- `TC-BB-007`: create post
- `TC-BB-008`: empty post rejection
- `TC-BB-009`: reaction toggle
- `TC-BB-010`: comment creation
- `TC-BB-011`: profile XP rendering

## Example

```js
it("TC-BB-005", "Correct challenge answer stores played date and increments streak", async (h) => {
  const ctx = await h.bootLoggedInApp();
  await h.answerChallenge(ctx, "Kabsa");

  h.equal(h.getStorage("challenge_played_date"), new Date().toDateString(), "Played date should be stored for today");
  h.equal(h.getStorage("quiz_streak"), "1", "Correct answer should start a streak");
});
```

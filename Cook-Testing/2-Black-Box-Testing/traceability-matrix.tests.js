window.CookBlackBox.defineSuite("Traceability Matrix Verification", ({ it }) => {
  const requirementMap = [
    { req: "REQ-AUTH-001", testIds: ["TC-BB-001", "DT-BB-004", "DT-BB-005"] },
    { req: "REQ-AUTH-002", testIds: ["TC-BB-004"] },
    { req: "REQ-AUTH-003", testIds: ["TC-BB-003", "ST-BB-001"] },
    { req: "REQ-AUTH-004", testIds: ["ST-BB-003"] },
    { req: "REQ-AUTH-005", testIds: ["ST-BB-004"] },
    { req: "REQ-CHAL-001", testIds: ["TC-BB-005", "DT-BB-001"] },
    { req: "REQ-CHAL-002", testIds: ["TC-BB-006", "DT-BB-003"] },
    { req: "REQ-CHAL-003", testIds: ["ST-BB-007", "EP-BB-002"] },
    { req: "REQ-COMM-001", testIds: ["TC-BB-007", "EP-BB-008"] },
    { req: "REQ-COMM-003", testIds: ["TC-BB-008", "EP-BB-009"] },
    { req: "REQ-COMM-004", testIds: ["TC-BB-009", "DT-BB-007"] },
    { req: "REQ-COMM-005", testIds: ["TC-BB-009", "DT-BB-007"] },
    { req: "REQ-COMM-006", testIds: ["DT-BB-008"] },
    { req: "REQ-COMM-007", testIds: ["DT-BB-006", "EP-BB-010"] },
    { req: "REQ-COMM-008", testIds: ["EP-BB-010"] },
    { req: "REQ-COMM-009", testIds: ["TC-BB-010"] },
    { req: "REQ-COMM-013", testIds: ["TC-BB-007"] },
    { req: "REQ-PROF-002", testIds: ["TC-BB-011"] }
  ];

  it("TM-BB-001", "Every mapped requirement points to registered executable tests", async (h) => {
    const allIds = new Set(h.getRegisteredTests().map(test => test.id));
    const missing = [];

    for (const row of requirementMap) {
      const uncovered = row.testIds.filter(id => !allIds.has(id));
      if (uncovered.length) missing.push(row.req + " -> " + uncovered.join(", "));
    }

    h.equal(missing.length, 0, "All traceability references should resolve to real automated tests");
  });

  it("TM-BB-002", "The executable suite registry does not contain duplicate test IDs", async (h) => {
    const seen = new Set();
    const duplicates = [];

    for (const test of h.getRegisteredTests()) {
      if (seen.has(test.id)) duplicates.push(test.id);
      seen.add(test.id);
    }

    h.equal(duplicates.length, 0, "Duplicate automated test IDs would break traceability");
  });
});

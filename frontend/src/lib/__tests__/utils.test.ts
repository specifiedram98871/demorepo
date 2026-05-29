import { describe, expect, test } from "vitest";

import { ISSUE_STATUSES } from "@/lib/utils";

describe("issue statuses", () => {
  test("keeps done in workflow", () => {
    expect(ISSUE_STATUSES).toContain("done");
  });
});

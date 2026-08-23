import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { withTestServer } from "./setup.js";

describe("api-material.js", () => {
  it("integration: GET /material/:id returns 404 for invalid material ids", async () => {
    await withTestServer(async ({ request }) => {
      const response = await request("/material/not-a-valid-object-id");

      assert.equal(response.status, 404);
      assert.deepEqual(response.body, { error: "Material not found" });
    });
  });

  it("integration: POST /material rejects unauthenticated material uploads", async () => {
    await withTestServer(async ({ request }) => {
      const response = await request("/material", {
        method: "POST",
        body: JSON.stringify({
          title: "Lecture notes",
          courseCode: "COMPSCI732",
          description: "Week 1 summary",
        }),
      });

      assert.equal(response.status, 401);
      assert.equal(response.text, "Unauthorized");
    });
  });

  it("integration: POST /material/:id/download rejects unauthenticated downloads", async () => {
    await withTestServer(async ({ request }) => {
      const response = await request("/material/material-id/download", {
        method: "POST",
      });

      assert.equal(response.status, 401);
      assert.equal(response.text, "Unauthorized");
    });
  });
});

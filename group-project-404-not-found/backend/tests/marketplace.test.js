import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { withTestServer } from "./setup.js";

describe("api-marketplace.js API requests", () => {
  it("GET /marketplace/:id returns 404 for invalid listing ids", async () => {
    await withTestServer(async ({ request }) => {
      const response = await request("/marketplace/not-a-valid-object-id");

      assert.equal(response.status, 404);
      assert.deepEqual(response.body, { error: "Listing not found" });
    });
  });

  it("GET /marketplace/:id/similar returns 404 for invalid listing ids", async () => {
    await withTestServer(async ({ request }) => {
      const response = await request("/marketplace/not-a-valid-object-id/similar");

      assert.equal(response.status, 404);
      assert.deepEqual(response.body, { error: "Listing not found" });
    });
  });

  it("POST /marketplace rejects unauthenticated listing creation", async () => {
    await withTestServer(async ({ request }) => {
      const response = await request("/marketplace", {
        method: "POST",
        body: JSON.stringify({
          title: "Calculator",
          price: 10,
          contactMethods: JSON.stringify({ email: "seller@example.com" }),
        }),
      });

      assert.equal(response.status, 401);
      assert.equal(response.text, "Unauthorized");
    });
  });

  it("PATCH /marketplace/:id rejects unauthenticated listing updates", async () => {
    await withTestServer(async ({ request }) => {
      const response = await request("/marketplace/listing-id", {
        method: "PATCH",
        body: JSON.stringify({
          title: "Updated calculator",
          price: 20,
        }),
      });

      assert.equal(response.status, 401);
      assert.equal(response.text, "Unauthorized");
    });
  });

  it("DELETE /marketplace/:id rejects unauthenticated listing deletion", async () => {
    await withTestServer(async ({ request }) => {
      const response = await request("/marketplace/listing-id", {
        method: "DELETE",
      });

      assert.equal(response.status, 401);
      assert.equal(response.text, "Unauthorized");
    });
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertContains,
  assertRoutes,
  routeSource,
  withTestServer,
} from "./setup.js";

describe("api-course.js", () => {
  it("unit: declares the expected course endpoints", () => {
    assertRoutes("api-course.js", [
      "GET /",
      "GET /:id/details",
      "GET /:code",
    ]);
  });

  it("unit: validates course query and response structure", () => {
    const course = routeSource("api-course.js");

    assertContains(course, "search", "Course list should accept search query");
    assertContains(course, "department", "Course list should accept department query");
    assertContains(course, "level", "Course list should accept level query");
    assertContains(course, "semester", "Course list should accept semester query");
    assertContains(
      course,
      "recentMaterials",
      "Course details should include recent materials"
    );
    assertContains(
      course,
      "recentListings",
      "Course details should include recent marketplace listings"
    );
  });

  it("unit: checks course error response structure", () => {
    const course = routeSource("api-course.js");

    assertContains(course, "Course not found", "Missing course should return a 404 error");
    assertContains(
      course,
      "Failed to load courses",
      "Course list failures should return JSON errors"
    );
    assertContains(
      course,
      "Failed to load course details",
      "Course detail failures should return JSON errors"
    );
    assertContains(
      course,
      "Error searching course",
      "Course search failures should return JSON errors"
    );
  });

  it("integration: returns 404 for invalid course detail ids", async () => {
    await withTestServer(async ({ request }) => {
      const response = await request("/course/not-a-valid-object-id/details");

      assert.equal(response.status, 404);
      assert.deepEqual(response.body, { error: "Course not found" });
    });
  });
});

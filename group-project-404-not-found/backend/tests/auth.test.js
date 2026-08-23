import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertContains,
  assertRoutes,
  routeSource,
  withTestServer,
} from "./setup.js";

describe("api-auth.js", () => {
  it("unit: declares the expected auth endpoints", () => {
    assertRoutes("api-auth.js", [
      "POST /register",
      "POST /login",
      "POST /logout",
    ]);
  });

  it("unit: validates registration structure", () => {
    const auth = routeSource("api-auth.js");

    assertContains(auth, "Email is required", "Register should require email");
    assertContains(auth, "UPI is required", "Register should require UPI");
    assertContains(auth, "Phone number is required", "Register should require phone");
    assertContains(
      auth,
      "Password must be at least 6 characters",
      "Register should enforce password length"
    );
    assertContains(
      auth,
      "Please use your University of Auckland email address to sign up.",
      "Register should require a University of Auckland email"
    );
  });

  it("unit: validates login and cookie structure", () => {
    const auth = routeSource("api-auth.js");

    assertContains(
      auth,
      "Email and password are required",
      "Login should require credentials"
    );
    assertContains(auth, "Invalid email or password", "Login should hide which field failed");
    assertContains(auth, 'res.cookie("authToken"', "Auth should write the auth cookie");
    assertContains(auth, "sameSite", "Auth cookie should set sameSite");
    assertContains(auth, "secure: isProduction", "Auth cookie should be secure in production");
    assertContains(auth, "expires: new Date(0)", "Logout should expire the auth cookie");
  });

  it("integration: returns validation errors before registration data access", async () => {
    await withTestServer(async ({ request }) => {
      const missingEmail = await request("/register", {
        method: "POST",
        body: JSON.stringify({ password: "secret1", upi: "abc123", phone: "0210000000" }),
      });
      assert.equal(missingEmail.status, 400);
      assert.deepEqual(missingEmail.body, { error: "Email is required" });

      const missingUpi = await request("/register", {
        method: "POST",
        body: JSON.stringify({
          email: "student@aucklanduni.ac.nz",
          password: "secret1",
          phone: "0210000000",
        }),
      });
      assert.equal(missingUpi.status, 400);
      assert.deepEqual(missingUpi.body, { error: "UPI is required" });

      const missingPhone = await request("/register", {
        method: "POST",
        body: JSON.stringify({
          email: "student@aucklanduni.ac.nz",
          password: "secret1",
          upi: "abc123",
        }),
      });
      assert.equal(missingPhone.status, 400);
      assert.deepEqual(missingPhone.body, { error: "Phone number is required" });

      const shortPassword = await request("/register", {
        method: "POST",
        body: JSON.stringify({
          email: "student@aucklanduni.ac.nz",
          password: "12345",
          upi: "abc123",
          phone: "0210000000",
        }),
      });
      assert.equal(shortPassword.status, 400);
      assert.deepEqual(shortPassword.body, {
        error: "Password must be at least 6 characters",
      });
    });
  });

  it("integration: rejects non-University of Auckland registration emails", async () => {
    await withTestServer(async ({ request }) => {
      const response = await request("/register", {
        method: "POST",
        body: JSON.stringify({
          email: "person@example.com",
          password: "secret1",
          upi: "abc123",
          phone: "0210000000",
        }),
      });

      assert.equal(response.status, 400);
      assert.deepEqual(response.body, {
        error: "Please use your University of Auckland email address to sign up.",
      });
    });
  });

  it("integration: validates login payload and clears logout cookie", async () => {
    await withTestServer(async ({ request }) => {
      const login = await request("/login", {
        method: "POST",
        body: JSON.stringify({ email: "student@aucklanduni.ac.nz" }),
      });
      assert.equal(login.status, 400);
      assert.deepEqual(login.body, { error: "Email and password are required" });

      const logout = await request("/logout", { method: "POST" });
      assert.equal(logout.status, 204);
      assert.match(
        logout.headers.get("set-cookie"),
        /authToken=;.*Expires=Thu, 01 Jan 1970/i
      );
    });
  });
});

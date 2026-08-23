import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createApp } from "../src/app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");

export function routeSource(fileName) {
  return readFileSync(
    path.join(backendRoot, "src", "routes", "api", fileName),
    "utf8"
  );
}

export function assertContains(fileContent, expected, label) {
  assert.match(
    fileContent,
    expected instanceof RegExp ? expected : new RegExp(escapeRegExp(expected)),
    label
  );
}

export function assertRoutes(fileName, expectedRoutes) {
  const routes = declaredRoutes(routeSource(fileName));
  assert.deepEqual(
    routes,
    expectedRoutes,
    `${fileName} should expose the expected API structure`
  );
}

export async function withTestServer(testFn) {
  const app = createApp({ logger: false });
  const server = app.listen(0, "127.0.0.1");

  try {
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });

    const { port } = server.address();
    await testFn({
      baseUrl: `http://127.0.0.1:${port}`,
      request: (pathName, options) =>
        request(`http://127.0.0.1:${port}${pathName}`, options),
    });
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (!error || error.code === "ERR_SERVER_NOT_RUNNING") {
          resolve();
          return;
        }

        reject(error);
      });
    });
  }
}

export async function request(url, options = {}) {
  const response = await fetch(url, {
    redirect: "manual",
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  const contentType = response.headers.get("content-type") || "";
  const body = text && contentType.includes("application/json")
    ? JSON.parse(text)
    : text;

  return {
    body,
    headers: response.headers,
    status: response.status,
    text,
  };
}

function declaredRoutes(fileContent) {
  const routePattern = /router\.(get|post|patch|delete)\(\s*["'`]([^"'`]+)["'`]/g;
  return [...fileContent.matchAll(routePattern)].map(
    (match) => `${match[1].toUpperCase()} ${match[2]}`
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

import request from "supertest";
import app from "../../server.ts";

import { cleanupDatabase } from "../helpers/dbHelpers.ts";

describe("Authentication Routes", () => {
  const userData = {
    email: `test-endpoint-${Date.now()}@example.com`,
    username: `testuser-endpoint-${Date.now()}`,
    password: "TestPassword123!",
    firstName: "Test",
    lastName: "User",
  };

  afterAll(async () => {
    await cleanupDatabase();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user with valid data", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "User created successfully",
      );
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 400 for invalid email", async () => {
      const userData = {
        email: "invalid-email",
        username: `testuser-${Date.now()}`,
        password: "TestPassword123!",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });

    it("should return 400 for short password", async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        username: `testuser-${Date.now()}`,
        password: "short",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Login successful");
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 400 for missing email", async () => {
      const credentials = {
        password: "TestPassword123!",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(credentials)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });

    it("should return 401 for invalid credentials", async () => {
      const credentials = {
        email: `test-${Date.now()}-${Math.random()}@example.com`,
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/refresh", () => {
    const registerAndGetRefreshCookie = async (): Promise<string> => {
      const newUser = {
        email: `test-refresh-${Date.now()}-${Math.random()}@example.com`,
        username: `testuser-refresh-${Date.now()}-${Math.random()}`,
        password: "TestPassword123!",
        firstName: "Refresh",
        lastName: "User",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(newUser)
        .expect(201);

      const cookies = response.headers["set-cookie"] as unknown as string[];
      const refreshCookie = cookies.find((c) => c.startsWith("refreshToken="));

      if (!refreshCookie) {
        throw new Error("No refreshToken cookie set on register");
      }

      return refreshCookie;
    };

    it("should rotate the token and return a new access token", async () => {
      const refreshCookie = await registerAndGetRefreshCookie();

      const response = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", refreshCookie)
        .expect(200);

      expect(response.body).toHaveProperty("accessToken");

      const cookies = response.headers["set-cookie"] as unknown as string[];
      expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
    });

    it("should return 401 when no refresh token cookie is sent", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .expect(401);

      expect(response.body).toHaveProperty("error", "Refresh token required");
    });

    it("should return 403 for a malformed refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", "refreshToken=not-a-valid-jwt")
        .expect(403);

      expect(response.body).toHaveProperty("error");
    });

    it("should detect reuse and reject a rotated token on second use", async () => {
      const refreshCookie = await registerAndGetRefreshCookie();

      await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", refreshCookie)
        .expect(200);

      const response = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", refreshCookie)
        .expect(401);

      expect(response.body).toHaveProperty(
        "error",
        "Token reuse detected. Please login again.",
      );
    });
  });
});

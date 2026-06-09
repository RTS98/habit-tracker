import request from "supertest";
import app from "../../server.ts";
import { randomUUID } from "crypto";
import { cleanupDatabase, createTestUser } from "../helpers/dbHelpers.ts";

describe("User routes", () => {
  afterEach(async () => {
    await cleanupDatabase();
  });
  describe("GET /api/users", () => {
    it("should return 200 and a list of users", async () => {
      const { token } = await createTestUser();
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return 404 when user is not found", async () => {
      const { token } = await createTestUser();
      const response = await request(app)
        .get(`/api/users/${randomUUID()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it("should return 200 and the user's profile", async () => {
      const { user, token } = await createTestUser();
      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBeDefined();
    });
  });

  describe("POST /api/users", () => {
    it("should return 201 for POST /api/users", async () => {
      const { token } = await createTestUser();
      const response = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send({
          username: `newuser-${Date.now()}-${Math.random()}`,
          email: `newuser-${Date.now()}-${Math.random()}@example.com`,
          password: "Password123",
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBeDefined();
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should return 404 when user is not found", async () => {
      const { token } = await createTestUser();
      const response = await request(app)
        .put(`/api/users/${randomUUID()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "Updated",
          lastName: "User",
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it("should update the user's profile", async () => {
      const { user, token } = await createTestUser();
      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: `updated-${Date.now()}-${Math.random()}`,
          lastName: `updated-${Date.now()}-${Math.random()}`,
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.firstName).toBeDefined();
      expect(response.body.user.lastName).toBeDefined();
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should return 404 when user is not found", async () => {
      const { token } = await createTestUser();
      const response = await request(app)
        .delete(`/api/users/${randomUUID()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it("should return 204 for DELETE /api/users/:id", async () => {
      const { user, token } = await createTestUser();
      const response = await request(app)
        .delete(`/api/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);
    });
  });

  describe("POST /api/users/change-password", () => {
    it("should return 404 when user is not found", async () => {
      const { token } = await createTestUser();
      await cleanupDatabase(); // Remove the user to simulate not found
      const response = await request(app)
        .post("/api/users/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "TestPassword123!",
          newPassword: "Newpassword456",
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it("should return 400 when current password is incorrect", async () => {
      const { token } = await createTestUser();
      const response = await request(app)
        .post("/api/users/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "WrongPassword!",
          newPassword: "Newpassword456",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should change the user's password", async () => {
      const { token } = await createTestUser();
      const response = await request(app)
        .post("/api/users/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "TestPassword123!",
          newPassword: "Newpassword456",
        });

      expect(response.status).toBe(200);
    });
  });
});

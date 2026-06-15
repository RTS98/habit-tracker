import request from "supertest";
import app from "../../server.ts";
import {
  cleanupDatabase,
  createTestTag,
  createTestUser,
} from "../helpers/dbHelpers.ts";
import { randomUUID } from "crypto";

describe("Tag routes", () => {
  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("GET /api/tags", () => {
    it("should return 200 for GET /api/tags", async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .get("/api/tags")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it("should return 401 for GET /api/tags without token", async () => {
      const response = await request(app).get("/api/tags");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/tags/:id", () => {
    it("should return 200 for GET /api/tags/:id", async () => {
      const { token } = await createTestUser();
      const { id } = await createTestTag();

      const response = await request(app)
        .get(`/api/tags/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it("should return 401 for GET /api/tags/:id without token", async () => {
      const { id } = await createTestTag();
      const response = await request(app).get(`/api/tags/${id}`);

      expect(response.status).toBe(401);
    });

    it("should return 404 for GET /api/tags/:id with non-existent id", async () => {
      const { token } = await createTestUser();
      const response = await request(app)
        .get(`/api/tags/${randomUUID()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/tags", () => {
    it("should return 201 for POST /api/tags", async () => {
      const { token } = await createTestUser();
      const response = await request(app)
        .post("/api/tags")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Tag",
          color: "#ff0000",
        });

      expect(response.status).toBe(201);
    });

    it("should return 401 for POST /api/tags without token", async () => {
      const response = await request(app)
        .post("/api/tags")
        .send({
          name: `Test ${Date.now()}`,
          color: "#ff0000",
        });

      expect(response.status).toBe(401);
    });

    it("should return 400 for POST /api/tags with missing fields", async () => {
      const { token } = await createTestUser();
      const response = await request(app)
        .post("/api/tags")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/tags/:id", () => {
    it("should return 200 for PUT /api/tags/:id", async () => {
      const { token } = await createTestUser();
      const { id } = await createTestTag();

      const response = await request(app)
        .put(`/api/tags/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Tag",
          color: "#00ff00",
        });

      expect(response.status).toBe(200);
    });

    it("should return 401 for PUT /api/tags/:id without token", async () => {
      const { id } = await createTestTag();

      const response = await request(app)
        .put(`/api/tags/${id}`)
        .send({
          name: `Updated ${Date.now()}`,
          color: "#00ff00",
        });

      expect(response.status).toBe(401);
    });

    it("should return 404 for PUT /api/tags/:id with non-existent id", async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .put(`/api/tags/${randomUUID()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: `Updated ${Date.now()}`,
          color: "#00ff00",
        });

      expect(response.status).toBe(404);
    });

    it("should return 409 for PUT /api/tags/:id with duplicate name", async () => {
      const { token } = await createTestUser();
      const tag1 = await createTestTag({ name: "Duplicate Tag" });
      const tag2 = await createTestTag();

      const response = await request(app)
        .put(`/api/tags/${tag2.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: tag1.name,
          color: "#00ff00",
        });

      expect(response.status).toBe(409);
    });

    it("should return 400 for PUT /api/tags/:id with invalid data", async () => {
      const { token } = await createTestUser();
      const { id } = await createTestTag();

      const response = await request(app)
        .put(`/api/tags/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/tags/:id", () => {
    it("should return 204 for DELETE /api/tags/:id", async () => {
      const { token } = await createTestUser();
      const { id } = await createTestTag();

      const response = await request(app)
        .delete(`/api/tags/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it("should return 401 for DELETE /api/tags/:id without token", async () => {
      const { id } = await createTestTag();

      const response = await request(app).delete(`/api/tags/${id}`);

      expect(response.status).toBe(401);
    });

    it("should return 404 for DELETE /api/tags/:id with non-existent id", async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .delete(`/api/tags/${randomUUID()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});

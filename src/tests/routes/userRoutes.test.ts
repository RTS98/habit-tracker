import request from "supertest";
import app from "../../server.ts";
import { randomUUID } from "crypto";
import { createTestUser } from "../helpers/dbHelpers.ts";

describe("User routes", () => {
  it("should return 200 for GET /api/users", async () => {
    const { token } = await createTestUser();
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it("should return 200 for GET /api/users/:id", async () => {
    const { token } = await createTestUser();
    const response = await request(app)
      .get(`/api/users/${randomUUID()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it("should return 201 for POST /api/users", async () => {
    const { user, token } = await createTestUser();
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: user.email,
        username: user.username,
        password: "Password123",
      });

    expect(response.status).toBe(201);
  });

  it("should return 200 for PUT /api/users/:id", async () => {
    const { token } = await createTestUser();
    const response = await request(app)
      .put(`/api/users/${randomUUID()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "updateduser",
        email: "updatedemail@email.com",
      });

    expect(response.status).toBe(200);
  });

  it("should return 200 for DELETE /api/users/:id", async () => {
    const { token } = await createTestUser();
    const response = await request(app)
      .delete(`/api/users/${randomUUID()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});

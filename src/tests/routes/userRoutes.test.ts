import request from "supertest";
import app from "../../server.ts";
import { randomUUID } from "crypto";

describe("User routes", () => {
  it("should return 200 for GET /api/users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
  });

  it("should return 200 for GET /api/users/:id", async () => {
    const response = await request(app).get(`/api/users/${randomUUID()}`);

    expect(response.status).toBe(200);
  });

  it("should return 201 for POST /api/users", async () => {
    const response = await request(app).post("/api/users").send({
      name: "testuser",
      password: "password123",
      email: "email@email.com",
    });

    expect(response.status).toBe(201);
  });

  it("should return 200 for PUT /api/users/:id", async () => {
    const response = await request(app).put(`/api/users/${randomUUID()}`).send({
      name: "updateduser",
      email: "updatedemail@email.com",
    });

    expect(response.status).toBe(200);
  });

  it("should return 200 for DELETE /api/users/:id", async () => {
    const response = await request(app).delete(`/api/users/${randomUUID()}`);

    expect(response.status).toBe(200);
  });
});

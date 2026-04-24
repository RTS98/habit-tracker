import request from "supertest";
import app from "../../server.ts";

describe("User routes", () => {
  it("should return 200 for GET /api/users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
  });

  it("should return 200 for GET /api/users/:id", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.status).toBe(200);
  });

  it("should return 201 for POST /api/users", async () => {
    const response = await request(app).post("/api/users").send({
      username: "testuser",
      email: "email@email.com",
    });

    expect(response.status).toBe(201);
  });

  it("should return 200 for PUT /api/users/:id", async () => {
    const response = await request(app).put("/api/users/1").send({
      username: "updateduser",
      email: "updatedemail@email.com",
    });

    expect(response.status).toBe(200);
  });

  it("should return 200 for DELETE /api/users/:id", async () => {
    const response = await request(app).delete("/api/users/1");

    expect(response.status).toBe(200);
  });
});

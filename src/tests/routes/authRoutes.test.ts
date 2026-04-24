import request from "supertest";
import app from "../../server.ts";

describe("Auth routes", () => {
  it("should return 201 for login", async () => {
    const response = await request(app).post("/api/auth/login");

    expect(response.status).toBe(201);
  });

  it("should return 201 for register", async () => {
    const response = await request(app).post("/api/auth/register");

    expect(response.status).toBe(201);
  });

  it("should return 200 for logout", async () => {
    const response = await request(app).post("/api/auth/logout");

    expect(response.status).toBe(200);
  });
});

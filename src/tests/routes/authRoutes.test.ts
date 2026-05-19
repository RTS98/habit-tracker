import request from "supertest";
import app from "../../server.ts";
import { cleanupDatabase } from "../helpers/dbHelpers.ts";

describe("Auth routes", () => {
  const userData = {
    email: `test-routeStatus@example.com`,
    username: `testuser-routeStatus-${Date.now()}`,
    password: "TestPassword123!",
    firstName: "Test",
    lastName: "User",
  };

  afterAll(async () => {
    await cleanupDatabase();
  });

  it("should return 201 for register", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(userData);

    expect(response.status).toBe(201);
  });

  it("should return 200 for login", async () => {
    const response = await request(app).post("/api/auth/login").send(userData);

    expect(response.status).toBe(200);
  });

  it("should return 200 for logout", async () => {
    const response = await request(app).post("/api/auth/logout");

    expect(response.status).toBe(200);
  });
});

import request from "supertest";
import app from "../../server.ts";

describe("Habit routes", () => {
  it("should return 200 for GET /api/habits", async () => {
    const response = await request(app).get("/api/habits");

    expect(response.status).toBe(200);
  });

  it("should return 201 for POST /api/habits", async () => {
    const response = await request(app).post("/api/habits").send({
      name: "Test Habit",
      description: "This is a test habit",
      frequency: "daily",
    });

    expect(response.status).toBe(201);
  });

  it("should return 200 for DELETE /api/habits/:id", async () => {
    const response = await request(app).delete("/api/habits/1");

    expect(response.status).toBe(200);
  });
});

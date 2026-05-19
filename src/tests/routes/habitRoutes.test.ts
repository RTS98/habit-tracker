import request from "supertest";
import app from "../../server.ts";
import {
  cleanupDatabase,
  createTestHabit,
  createTestUser,
} from "../helpers/dbHelpers.ts";

describe("Habit routes", () => {
  afterEach(async () => {
    await cleanupDatabase();
  });

  it("should return 200 for GET /api/habits", async () => {
    const { token } = await createTestUser();
    const response = await request(app)
      .get("/api/habits")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it("should return 201 for POST /api/habits", async () => {
    const { token } = await createTestUser();
    const response = await request(app)
      .post("/api/habits")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Habit",
        description: "This is a test habit",
        frequency: "daily",
      });

    expect(response.status).toBe(201);
  });

  it("should return 200 for DELETE /api/habits/:id", async () => {
    const { user, token } = await createTestUser();
    const habit = await createTestHabit(user.id, {
      name: "Temporary habit",
      description: "To be deleted",
    });
    const response = await request(app)
      .delete(`/api/habits/${habit.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});

import request from "supertest";
import app from "../../server.ts";

describe("Tag routes", () => {
  it("should return 200 for GET /api/tags", async () => {
    const response = await request(app).get("/api/tags");

    expect(response.status).toBe(200);
  });
});

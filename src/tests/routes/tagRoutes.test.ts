import request from "supertest";
import app from "../../server.ts";
import { cleanupDatabase, createTestUser } from "../helpers/dbHelpers.ts";

describe("Tag routes", () => {
  it("should return 200 for GET /api/tags", async () => {
    const { token } = await createTestUser();

    const response = await request(app)
      .get("/api/tags")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});

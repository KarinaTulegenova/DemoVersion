const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectDB } = require("../src/config/db");

let mongo;

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret123";
  process.env.MONGODB_URI = "mongodb://localhost/test";
  const appModule = require("../src/app");
  global.__app = appModule.app;
  mongo = await MongoMemoryServer.create();
  await connectDB(mongo.getUri());
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

test("register and login", async () => {
  const app = global.__app;
  const register = await request(app)
    .post("/api/auth/register")
    .send({ username: "Test", email: "test@example.com", password: "password" })
    .expect(201);

  expect(register.body.token).toBeDefined();

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@example.com", password: "password" })
    .expect(200);

  expect(login.body.token).toBeDefined();
});

import { Elysia } from "elysia";
import { node } from "@elysia/node";
import * as schema from "@repo/shared/zod-schema";
import { signJwt } from "../lib/jwt";
import { authPlugin } from "./auth";

const app = new Elysia({ adapter: node() }).get("/", () => "Hello Elysia");

//signup route

app.post("/signup", (req) => {
  const { success, data } = schema.signupSchema.safeParse(req.body);

  if (!success) {
    return { error: "Invalid Input" };
  }

  const token = signJwt({ email: data.email });

  return { message: "User signed up successfully", data: { token } };
});

//login route

app.post("/login", (req) => {
  const { success, data } = schema.loginSchema.safeParse(req.body);

  if (!success) {
    return { error: "Invalid Input" };
  }

  const token = signJwt({ email: data.email });

  return { message: "User logged in successfully", data: { token } };
});

app
  .use(authPlugin)
  .get("/protected", ({ user }) => {
    return { message: "This is a protected route", user: user };
  });

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});


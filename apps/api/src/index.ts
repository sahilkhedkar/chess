import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import * as schema from "@repo/shared/zod-schema";
import { signJwt } from "../lib/jwt";
import { authPlugin } from "./auth";
import { userStore } from "@repo/db/db";
import { cors } from "@elysiajs/cors";

const app = new Elysia({ adapter: node() }).use(cors()).get("/", () => "Hello Elysia");

//signup route

app.post("/signup", async (req: any) => {
  const { success, data } = schema.signup.safeParse(req.body);
  if (!success) {
    return { error: "Invalid input" };
  }

  const existingUser = await userStore.findByUsername(data.email);
  if (existingUser) {
    return { error: "User already exists" };
  }

  await userStore.createUser(data.email, data.password);

  const token = signJwt({ email: data.email });

  return {
    message: "User signed up successfully!",
    data: {
      token,
    },
  };
});

//login route

app.post("/login", async (req: any) => {
  const { success, data } = schema.login.safeParse(req.body);
  if (!success) {
    return { error: "Invalid input" };
  }

  const user = await userStore.verifyUser(data.email, data.password);
  if (!user) {
    return { error: "Invalid credentials" };
  }

  const token = signJwt({ email: data.email });

  return {
    message: "User logged in successfully!",
    data: {
      token,
    },
  };
});

app.use(authPlugin).get("/protected", ({ user }: any) => {
  return {
    message: "This is a protected route!",
    user: user,
  };
});

app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});

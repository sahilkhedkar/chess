import { z } from "zod";

export const name = "zod-schema";

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export { signupSchema, loginSchema };
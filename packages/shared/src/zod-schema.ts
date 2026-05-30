import { z } from "zod";

export const name = "zod-schema";

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export { signupSchema, loginSchema };
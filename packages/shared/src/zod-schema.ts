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

const websocketMessageSchema = z.object({
    type: z.string(),
    payload: z.object().optional()
});

export { signupSchema, loginSchema, websocketMessageSchema };
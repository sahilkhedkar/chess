import { z } from "zod";

export const name = "zod-schema";

const signup = z.object({
    email: z.string().email(),
    password: z.string()
});

const login = z.object({
    email: z.string().email(),
    password: z.string(),
});

const websocketMessage = z.object({
    type: z.string(),
    payload: z.object().optional()
});

export { signup, login, websocketMessage };
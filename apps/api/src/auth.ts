import {Elysia} from "elysia"
import {decodeJwt} from "../lib/jwt"

export const authPlugin = new Elysia({name: "auth"})
    .derive({ as: "scoped"} , ({request}) => {
        const header = request.headers.get("Authorization")
        const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
        const user = token ? decodeJwt(token) : null;
        return { user };
    })
    .onBeforeHandle({ as : "scoped" } , ({user , set}) => {
        if (!user) {
            return { error: "Unauthorized" }
        }
    })
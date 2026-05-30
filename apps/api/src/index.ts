import { Elysia } from 'elysia'
import { node } from '@elysia/node'
import * as schema from "@repo/shared/zod-schema"

const app = new Elysia({ adapter: node() }).get('/', () => 'Hello Elysia')


//signup route

app.post("/signup" , (req) => {
    console.log(schema.name)

    const { email, password } = req.body

    return `User created successfully`
})

//login route

app.post("/login" , (req,res) => {
    const { email, password } = req.body

    return res.status(200).json({ message: 'User logged in successfully' })
})

app.listen(3000 , () => {
    console.log('Server is running on http://localhost:3000')
})
import { Elysia } from 'elysia'
import { node } from '@elysia/node'

new Elysia({ adapter: node() })
    .get('/', () => 'Hello Elysia')
    .listen(3000 , () => {
        console.log('Server is running on http://localhost:3000')
    })
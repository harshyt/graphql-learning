import { ApolloServer } from '@apollo/server'
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4'
import cors from 'cors';
import express from 'express';
import { authMiddleware, handleLogin } from './auth.js';
import { readFile } from 'node:fs/promises'
import { resolvers } from './resolvers.js'

const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post('/login', handleLogin);

const typeDefs = await readFile('./schema.graphql', 'utf-8')

function getContext({ req }) {
  return req
}

const apolloServer = new ApolloServer({ typeDefs, resolvers })
await apolloServer.start()
app.use('/graphql', apolloMiddleware(apolloServer, { context: getContext }))

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Ther graphql server is running at http://localhost:${PORT}/graphql`)
});

import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import typeDefs from './schema.js';
import resolvers from './resolvers.js';
import mongodb from 'mongodb';
const { MongoClient } = mongodb;
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const MONGO_DB = process.env.DB_HOST;
const client = await MongoClient.connect(MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = client.db();
const context = { db };

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

server.applyMiddleware({ app });

app.get('/', (req, res) => res.end('Welcome to PhotoShare API!'));

app.listen({ port: 4000 }, () =>
  console.log(
    `GraphQL Service running @ http://localhost:4000${server.graphqlPath}`
  )
);

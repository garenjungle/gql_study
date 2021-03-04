import http from 'http';
import { ApolloServer, PubSub } from 'apollo-server-express';
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

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    const githubToken = req
      ? req.headers.authorization
      : connection.context.Authorization;
    const currentUser = await db.collection('users').findOne({ githubToken });
    return { db, currentUser, pubsub };
  },
});

server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

app.get('/', (req, res) => res.end('Welcome to PhotoShare API!'));

httpServer.listen({ port: 4000 }, () => {
  console.log(
    `GraphQL Service running @ http://localhost:4000${server.graphqlPath}`
  );
  console.log(
    `GraphQL Service running @ ws://localhost:4000${server.subscriptionsPath}`
  );
});

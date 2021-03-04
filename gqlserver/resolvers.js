import { GraphQLScalarType } from 'graphql';
import authorizeWithGithub from './libs.js';
import mongodb from 'mongodb';
const { ObjectID } = mongodb;
import axios from 'axios';

const resolvers = {
  Query: {
    totalPhotos: (parent, args, { db }) =>
      db.collection('photos').estimatedDocumentCount(),

    allPhotos: (parent, args, { db }) =>
      db.collection('photos').find().toArray(),

    totalUsers: (parent, args, { db }) =>
      db.collection('users').estimatedDocumentCount(),

    allUsers: (parent, args, { db }) => db.collection('users').find().toArray(),

    me: (parent, args, { currentUser }) => currentUser,
  },

  Mutation: {
    postPhoto: async (parent, args, { db, currentUser, pubsub }) => {
      if (!currentUser) {
        throw new Error('only an authorized user can post a photo.');
      }

      const newPhoto = {
        ...args.input,
        userID: currentUser.githubLogin,
        created: new Date(),
      };

      const { insertedIds } = await db.collection('photos').insert(newPhoto);
      newPhoto.id = insertedIds[0];

      pubsub.publish('PHOTO_ADDED', { newPhoto });

      return newPhoto;
    },

    githubAuth: async (parent, { code }, { db, pubsub }) => {
      let {
        message,
        access_token,
        avatar_url,
        login,
        name,
      } = await authorizeWithGithub({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
      });
      if (!!message) {
        throw new Error(message);
      }
      let latestUserInfo = {
        name,
        githubLogin: login,
        githubToken: access_token,
        avatar: avatar_url,
      };
      const {
        ops: [user],
      } = await db
        .collection('users')
        .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

      pubsub.publish('NEW_USER', { newUser: user });

      return { user, token: access_token };
    },

    addFakeUsers: async (parent, { count }, { db, pubsub }) => {
      const randomUserApi = `https://randomuser.me/api/?results=${count}`;
      const response = await axios(randomUserApi);
      const { results } = response.data;
      const users = results.map((r) => ({
        githubLogin: r.login.username,
        name: `${r.name.first} ${r.name.last}`,
        avatar: r.picture.thumbnail,
        githubToken: r.login.sha1,
      }));
      await db.collection('users').insert(users);
      users.forEach((user) => {
        pubsub.publish('NEW_USER', { newUser: user });
      });
      return users;
    },

    fakeUserAuth: async (parent, { githubLogin }, { db }) => {
      const user = await db.collection('users').findOne({ githubLogin });
      if (!user) {
        throw new Error(`Cannot find user with githubLogin "${githubLogin}"`);
      }
      return {
        token: user.githubToken,
        user,
      };
    },
  },

  Photo: {
    id: (parent) => parent.id || parent._id,

    url: (parent) => `/img/photos/${parent.id}.jpg`,

    postedBy: (parent, args, { db }) =>
      db.collection('users').findOne({ githubLogin: parent.userID }),

    taggedUsers: async (parent, args, { db }) => {
      const tags = await db.collection('tags').find().toArray();

      const logins = tags
        .filter((t) => t.photoID === parent._id.toString())
        .map((t) => t.githubLogin);

      return db
        .collection('users')
        .find({ githubLogin: { $in: logins } })
        .toArray();
    },
  },

  User: {
    postedPhotos: (parent, args, { db }) =>
      db.collection('photos').find({ userID: parent.githubLogin }).toArray(),

    inPhotos: async (parent, args, { db }) => {
      const tags = await db.collection('tags').find().toArray();

      const photoIDs = tags
        .filter((t) => t.githubLogin === parent.githubLogin)
        .map((t) => ObjectID(t.photoID));

      return db
        .collection('photos')
        .find({ _id: { $in: photoIDs } })
        .toArray();
    },
  },

  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value',
    parseValue: (value) => new Date(value),
    serialize: (value) => new Date(value).toISOString(),
    parseLiteral: (ast) => ast.value,
  }),

  Subscription: {
    newPhoto: {
      subscribe: (parent, args, { pubsub }) =>
        pubsub.asyncIterator(['PHOTO_ADDED']),
    },
    newUser: {
      subscribe: (parent, args, { pubsub }) =>
        pubsub.asyncIterator(['NEW_USER']),
    },
  },
};

export default resolvers;

import { ApolloServer, gql } from 'apollo-server';

const typeDefs = gql`
  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
  }

  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory = PORTRAIT
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`;

let _id = 0;

const users = [
  {
    githubLogin: 'mHattrup',
    name: 'Mike Hattrup',
  },
  {
    githubLogin: 'gPlake',
    name: 'Glen Plake',
  },
  {
    githubLogin: 'sSchmidt',
    name: 'Scot Schmidt',
  },
];

const photos = [
  {
    id: '1',
    name: 'DTHC',
    description: 'THCIOOMFC',
    category: 'ACTION',
    githubUser: 'gPlake',
  },
  {
    id: '2',
    name: 'ETS',
    category: 'SELFIE',
    githubUser: 'sSchmidt',
  },
  {
    id: '3',
    name: 'G25',
    description: '25LOGT',
    category: 'LANDSCAPE',
    githubUser: 'sSchmidt',
  },
];

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos,
  },
  Mutation: {
    postPhoto(parent, args) {
      const newPhoto = {
        id: _id++,
        ...args.input,
      };
      photos.push(newPhoto);
      return newPhoto;
    },
  },
  Photo: {
    url: (parent) => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: (parent) => {
      return users.find((u) => u.githubLogin === parent.githubUser);
    },
  },
  User: {
    postedPhotos: (parent) => {
      return photos.filter((p) => p.githubUser === parent.githubLogin);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => console.log(`GraphQL Service running on ${url}`));

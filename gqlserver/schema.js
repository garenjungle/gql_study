import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  scalar DateTime

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
    created: DateTime!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory = PORTRAIT
    description: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
    totalUsers: Int!
    allUsers: [User!]!
    me: User
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
    githubAuth(code: String!): AuthPayload!
    addFakeUsers(count: Int = 1): [User!]!
    fakeUserAuth(githubLogin: ID!): AuthPayload!
  }

  type Subscription {
    newPhoto: Photo!
    newUser: User!
  }
`;

export default typeDefs;

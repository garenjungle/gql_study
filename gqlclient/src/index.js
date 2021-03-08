import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  split,
} from '@apollo/client';

import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

// import { persistCache } from 'apollo3-cache-persist';

const cache = new InMemoryCache();

// persistCache({
//   cache,
//   storage: localStorage,
// });

// if (localStorage['apollo-cache-persist']) {
//   let cacheData = JSON.parse(localStorage['apollo-cache-persist']);
//   cache.restore(cacheData);
// }

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: { reconnect: true },
});

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext((context) => ({
    headers: {
      ...context.headers,
      authorization: localStorage.getItem('token'),
    },
  }));
  return forward(operation);
});

const httpAuthLink = authLink.concat(httpLink);

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpAuthLink
);

export const client = new ApolloClient({ cache, link });

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

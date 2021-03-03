import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client';

import { setContext } from '@apollo/client/link/context';
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

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: localStorage.getItem('token'),
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

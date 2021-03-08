import { gql } from '@apollo/client';
import Users from './Users';
import { BrowserRouter } from 'react-router-dom';
import AuthorizedUser from './AuthorizedUser';
import { useEffect } from 'react';
import { client } from './index';

export const ROOT_QUERY = gql`
  query allUsers {
    totalUsers
    allUsers {
      ...userInfo
    }
    me {
      ...userInfo
    }
  }

  fragment userInfo on User {
    githubLogin
    name
    avatar
  }
`;

const LISTEN_FOR_USERS = gql`
  subscription {
    newUser {
      githubLogin
      name
      avatar
    }
  }
`;

function App() {
  useEffect(() => {
    const listenForUsers = client
      .subscribe({ query: LISTEN_FOR_USERS })
      .subscribe(({ data: { newUser } }) => {
        const readData = client.readQuery({ query: ROOT_QUERY });
        const data = { ...readData };
        data.totalUsers += 1;
        data.allUsers = [...data.allUsers, newUser];
        client.writeQuery({ query: ROOT_QUERY, data });
      });
    return () => {
      listenForUsers.unsubscribe();
    };
  });

  return (
    <BrowserRouter>
      <div>
        <AuthorizedUser />
        <Users />
      </div>
    </BrowserRouter>
  );
}

export default App;

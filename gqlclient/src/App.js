import { gql } from '@apollo/client';
import Users from './Users';
import { BrowserRouter } from 'react-router-dom';
import AuthorizedUser from './AuthorizedUser';

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

function App() {
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

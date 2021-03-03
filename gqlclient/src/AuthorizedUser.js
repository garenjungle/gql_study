import React, { useState, useEffect } from 'react';
import { useHistory, withRouter } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { ROOT_QUERY } from './App';
import { client } from './index';

const GITHUB_AUTH_MUTATION = gql`
  mutation githubAuth($code: String!) {
    githubAuth(code: $code) {
      token
    }
  }
`;

function CurrentUser({ name, avatar, logout }) {
  return (
    <div>
      <img src={avatar} width={48} height={48} alt='' />
      <h1>{name}</h1>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
}

function Me({ logout, requestCode, signingIn }) {
  const { loading, data } = useQuery(ROOT_QUERY);
  if (loading) return <p>로딩중...</p>;
  if (data.me) return <CurrentUser {...data.me} logout={logout} />;

  return (
    <button onClick={requestCode} disabled={signingIn}>
      깃허브로 로그인
    </button>
  );
}

function AuthorizedUser() {
  const [signingIn, setSigningIn] = useState(false);

  let history = useHistory();

  const authorizationComplete = (cache, { data }) => {
    localStorage.setItem('token', data.githubAuth.token);
    history.replace('/');
    setSigningIn(false);
  };

  const [githubAuth] = useMutation(GITHUB_AUTH_MUTATION, {
    update: authorizationComplete,
    refetchQueries: [{ query: ROOT_QUERY }],
  });

  useEffect(() => {
    if (window.location.search.match(/code=/)) {
      setSigningIn(true);
      const code = window.location.search.replace('?code=', '');
      githubAuth({ variables: { code } });
    }
  }, [history, githubAuth]);

  const requestCode = () => {
    const clientID = 'aa4cebdf05ce1185d08c';
    window.location = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`;
  };

  return (
    <Me
      signingIn={signingIn}
      requestCode={requestCode}
      logout={() => {
        localStorage.removeItem('token');
        const readData = client.readQuery({ query: ROOT_QUERY });
        const data = { ...readData, me: null };
        client.writeQuery({ query: ROOT_QUERY, data });
      }}
    />
  );
}

export default withRouter(AuthorizedUser);

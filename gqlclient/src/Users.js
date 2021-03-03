import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { ROOT_QUERY } from './App';

const ADD_FAKE_USERS_MUTATION = gql`
  mutation addFakeUsers($count: Int!) {
    addFakeUsers(count: $count) {
      githubLogin
      name
      avatar
    }
  }
`;

function Users() {
  const { loading, error, data, refetch } = useQuery(ROOT_QUERY);

  if (loading) return <p>사용자 불러오는 중...</p>;
  if (error) return <p> 에러 발생...</p>;

  return (
    <UserList
      count={data.totalUsers}
      users={data.allUsers}
      refetchUsers={refetch}
    />
  );
}

function UserList({ count, users, refetchUsers }) {
  const updateUserCache = (cache, { data: { addFakeUsers } }) => {
    const readData = cache.readQuery({ query: ROOT_QUERY });
    const data = { ...readData };
    data.totalUsers += addFakeUsers.length;
    data.allUsers = [...data.allUsers, ...addFakeUsers];
    cache.writeQuery({ query: ROOT_QUERY, data });
  };

  const [addFakeUsers] = useMutation(ADD_FAKE_USERS_MUTATION, {
    update: updateUserCache,
  });

  return (
    <div>
      <p>{count} Users</p>
      <button onClick={() => refetchUsers()}>다시 가져오기</button>
      <button onClick={() => addFakeUsers({ variables: { count: 1 } })}>
        임시 사용자 추가
      </button>
      <ul>
        {users.map((user) => (
          <UserListItem
            key={user.githubLogin}
            name={user.name}
            avatar={user.avatar}
          />
        ))}
      </ul>
    </div>
  );
}

function UserListItem({ name, avatar }) {
  return (
    <li>
      <img src={avatar} width={48} height={48} alt='' />
      {name}
    </li>
  );
}

export default Users;

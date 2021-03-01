import axios from 'axios';

const requestGithubToken = async (credentials) => {
  try {
    const response = await axios({
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      url: 'https://github.com/login/oauth/access_token',
      data: JSON.stringify(credentials),
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const requestGithubUserAccount = async (token) => {
  try {
    const response = await axios({
      method: 'get',
      headers: {
        Authorization: 'token ' + token,
      },
      url: 'https://api.github.com/user',
    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const authorizeWithGithub = async (credentials) => {
  const { access_token } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(access_token);
  return { ...githubUser, access_token };
};

export default authorizeWithGithub;

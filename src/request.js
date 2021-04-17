import axios from 'axios'

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true
});

instance.interceptors.request.use(
function(config) {
  const token = localStorage.getItem("token");
  const tokenJSON = JSON.parse(token)
  if (token) {
    config.headers["x-access-token"] = tokenJSON.token;
  }
  return config;
},
function(error) {
  return Promise.reject(error);
}
);

export default instance;
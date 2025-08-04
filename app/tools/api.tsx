declare const process: {
  env: {
    NODE_ENV: string;
  };
};
const api = process.env.NODE_ENV === 'production'
  ? 'https://school.blxg.asia'
  : 'http://localhost:3000';

export default api;
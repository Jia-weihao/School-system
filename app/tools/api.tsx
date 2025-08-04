// API基础URL配置
// 根据当前环境设置API基础URL
declare const process: {
  env: {
    NODE_ENV: string;
  };
};
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://school.blxg.asia'
  : 'http://localhost:3000';

export default API_BASE_URL;
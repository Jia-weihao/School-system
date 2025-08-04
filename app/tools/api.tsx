// API基础URL配置
// 根据当前环境设置API基础URL
declare const process: {
  env: {
    NODE_ENV: string;
  };
};
const API_BASE_URL = "https://school.blxg.asia";

export default API_BASE_URL;
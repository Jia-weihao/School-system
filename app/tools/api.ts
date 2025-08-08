// API基础URL配置
// 根据当前环境设置API基础URL
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://school.blxg.asia'
  : 'https://school.blxg.asia';

export default API_BASE_URL;
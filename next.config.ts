import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    '@ant-design/icons', 
    'antd', 
    'rc-util', 
    'rc-pagination', 
    'rc-picker',
    '@ant-design/cssinjs',
    '@ant-design/react-slick',
    'rc-field-form',
    'rc-textarea',
    'rc-select',
    'rc-table',
    'rc-motion',
    'dayjs'
  ]
};

export default nextConfig;

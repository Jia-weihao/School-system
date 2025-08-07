'use client';

import React, { useState } from 'react';
import API_BASE_URL from '../tools/api.tsx';

const TestConnectionPage: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('正在测试连接...');

    try {
      console.log('开始测试API连接...');
      
      const response = await fetch(`${API_BASE_URL}/api/addstudent`);
      
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('后端返回数据:', data);
      
      setResult(`✅ 连接成功！
      
      数据类型: ${Array.isArray(data) ? '数组' : typeof data}
      数据数量: ${Array.isArray(data) ? data.length : '不是数组'}

      原始数据示例:
      ${JSON.stringify(data.slice ? data.slice(0, 1) : data, null, 2)}`);

    } catch (error) {
      console.error('连接失败:', error);
      setResult(`❌ 连接失败: ${error instanceof Error ? error.message : '未知错误'}

      请检查:
      1. 后端服务是否运行在 ${API_BASE_URL}
      2. 数据库连接是否正常
      3. 是否有跨域问题`);
      } finally {
        setLoading(false);
      }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔗 API连接测试</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testConnection}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? '🔄 测试中...' : '🚀 测试连接'}
        </button>
      </div>

      {result && (
        <div style={{
          padding: '20px',
          backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '6px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {result}
        </div>
      )}

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <h3>📋 使用说明：</h3>
        <ol>
          <li>确保后端服务正在运行</li>
          <li>确保数据库有学生数据</li>
          <li>点击"测试连接"按钮</li>
          <li>查看连接结果和数据格式</li>
        </ol>
        
        <h3>🔧 API端点：</h3>
        <p><code>GET ${API_BASE_URL}/api/addstudent</code></p>
      </div>
    </div>
  );
};

export default TestConnectionPage;
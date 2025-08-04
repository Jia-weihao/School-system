'use client';

import React, { useState } from 'react';
import { Input, Select, Button, Table, Card, Row, Col } from 'antd';
import { SearchOutlined, UploadOutlined, DownloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const Management = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('全部');

  // 模拟数据
  const tableData = [
    { id: 1, name: '我上学了第一课', type: '教案', size: '2.5MB', uploadDate: '2022-06-02', downloads: 156, checked: true },
    { id: 2, name: '我上学了第一课', type: '教案', size: '2.5MB', uploadDate: '2022-06-02', downloads: 156, checked: true },
    { id: 3, name: '我上学了第一课', type: '教案', size: '2.5MB', uploadDate: '2022-06-02', downloads: 156, checked: true },
    { id: 4, name: '我上学了第一课', type: '导学案', size: '1.8MB', uploadDate: '2022-06-02', downloads: 89, checked: true },
    { id: 5, name: '我上学了第一课', type: '导学案', size: '1.8MB', uploadDate: '2022-06-02', downloads: 89, checked: true },
    { id: 6, name: '我上学了第一课', type: '导学案', size: '1.8MB', uploadDate: '2022-06-02', downloads: 89, checked: true },
    { id: 7, name: '我上学了第一课', type: '课件', size: '5.2MB', uploadDate: '2022-06-02', downloads: 234, checked: false },
    { id: 8, name: '我上学了第一课', type: '课件', size: '5.2MB', uploadDate: '2022-06-02', downloads: 234, checked: false },
    { id: 9, name: '我上学了第一课', type: '课件', size: '5.2MB', uploadDate: '2022-06-02', downloads: 234, checked: false },
    { id: 10, name: '我上学了第一课', type: '课件', size: '5.2MB', uploadDate: '2022-06-02', downloads: 234, checked: false }
  ];

  // 统计卡片数据
  const statsData = [
    { title: '资源总数', value: '1,234个', color: '#1890ff' },
    { title: '课件数量', value: '456个', color: '#52c41a' },
    { title: '视频数量', value: '234个', color: '#faad14' },
    { title: '文档数量', value: '544个', color: '#f5222d' },
    { title: '总下载量', value: '15,678次', color: '#722ed1' }
  ];

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_: any, __: any, idx: number) => idx + 1
    },
    { title: '资源名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    { title: '大小', dataIndex: 'size', key: 'size', width: 100 },
    { title: '上传日期', dataIndex: 'uploadDate', key: 'uploadDate', width: 120 },
    { title: '下载次数', dataIndex: 'downloads', key: 'downloads', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="link" size="small" icon={<EyeOutlined />}>查看</Button>
          <Button type="link" size="small" icon={<DownloadOutlined />}>下载</Button>
          <Button type="link" size="small" icon={<DeleteOutlined />} danger>删除</Button>
        </div>
      )
    }
  ];

  // 添加了资源统计卡片组件
  const StatsCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
    <Card style={{ background: color, color: 'white', borderRadius: 8 }}>
      <div style={{ fontSize: 16, fontWeight: 'bold' }}>{title}</div>
      <div style={{ fontSize: 24, marginTop: 8 }}>{value}</div>
    </Card>
  );

  return (
    <div style={{ padding: '20px' }}>
      {/* 资源统计卡片区域 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {statsData.map((stat, index) => (
          <Col span={4} key={index}>
            <StatsCard title={stat.title} value={stat.value} color={stat.color} />
          </Col>
        ))}
      </Row>

      {/* 搜索和操作区域 */}
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '16px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
      }}>
        <Input
          placeholder="请输入资源名称"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: '300px' }}
        />
        <Select
          value={selectedType}
          onChange={setSelectedType}
          style={{ width: '150px' }}
        >
          <Select.Option value="全部">全部类型</Select.Option>
          <Select.Option value="教案">教案</Select.Option>
          <Select.Option value="导学案">导学案</Select.Option>
          <Select.Option value="课件">课件</Select.Option>
        </Select>
        <Button type="primary" icon={<UploadOutlined />}>
          上传资源
        </Button>
      </div>

      {/* 表格区域 */}
      <div style={{ background: '#fff', borderRadius: '8px', padding: '20px' }}>
        <Table
          columns={columns}
          dataSource={tableData.map((item, idx) => ({ ...item, key: item.id, index: idx + 1 }))}
          pagination={{
            total: 800,
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: false,
            simple: true,
            showTotal: (total) => `共${total}条`
          }}
          rowKey="id"
          scroll={{ x: 900 }}
        />
      </div>
    </div>
  );
};

export default Management;
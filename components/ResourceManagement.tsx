'use client';

import React, { useState } from 'react';
import styles from '../app/dashboard/dashboard.module.css';
import { Input, Select, Button, Form, Row, Col, Table, Checkbox, Pagination, Card } from 'antd';
import { DownloadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;

// 教学资源管理组件
const TeachingResourceManagement = () => {
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 模拟资源数据
  const resourceData = Array.from({ length: 10 }).map((_, index) => ({
    key: index + 1,
    id: index + 1,
    resourceName: `教上学习第${index + 1}课`,
    resourceType: index % 3 === 0 ? '教案' : index % 3 === 1 ? '课件' : '试题',
    grade: '一年级',
    year: '一年级',
    subject: '语文',
    version: '人教版上册',
    volume: '上册',
    chapter: '第一章第一节',
    status: '已审核',
    uploadDate: '2022-06-02 15:59'
  }));

  const handleSearch = (values: any) => {
    console.log('搜索条件:', values);
    // 这里可以实现搜索逻辑
  };

  const handleReset = () => {
    form.resetFields();
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '资源名称',
      dataIndex: 'resourceName',
      key: 'resourceName',
    },
    {
      title: '资源类型',
      dataIndex: 'resourceType',
      key: 'resourceType',
    },
    {
      title: '学段',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: '年级',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: '学科',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '册次',
      dataIndex: 'volume',
      key: 'volume',
    },
    {
      title: '章节',
      dataIndex: 'chapter',
      key: 'chapter',
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '上传日期',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <span>
          <Button type="link" size="small" style={{ color: '#1890ff', padding: '0 8px' }}>下载</Button>
          <Button type="link" size="small" style={{ color: '#ff4d4f', padding: '0 8px' }}>删除</Button>
        </span>
      ),
    },
  ];

  return (
    <div className={styles.resourceManagement}>
      <div className={styles.resourceHeader}>
        <h3>教学资源管理</h3>
      </div>
      
      {/* 资源统计卡片 */}
       
      
      <Form
        form={form}
        layout="inline"
        onFinish={handleSearch}
        style={{ marginBottom: 20 }}
      >
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col span={8}>
            <Form.Item label="资源名称" name="resourceName">
              <Input placeholder="输入关键字搜索" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="资源类型" name="resourceType">
              <Select placeholder="教案" style={{ width: '100%' }}>
                <Option value="教案">教案</Option>
                <Option value="课件">课件</Option>
                <Option value="试题">试题</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="学段" name="grade">
              <Select placeholder="小学" style={{ width: '100%' }}>
                <Option value="小学">小学</Option>
                <Option value="初中">初中</Option>
                <Option value="高中">高中</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="年级" name="year">
              <Select placeholder="一年级" style={{ width: '100%' }}>
                <Option value="一年级">一年级</Option>
                <Option value="二年级">二年级</Option>
                <Option value="三年级">三年级</Option>
                <Option value="四年级">四年级</Option>
                <Option value="五年级">五年级</Option>
                <Option value="六年级">六年级</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="学科" name="subject">
              <Select placeholder="语文" style={{ width: '100%' }}>
                <Option value="语文">语文</Option>
                <Option value="数学">数学</Option>
                <Option value="英语">英语</Option>
                <Option value="物理">物理</Option>
                <Option value="化学">化学</Option>
                <Option value="生物">生物</Option>
                <Option value="历史">历史</Option>
                <Option value="地理">地理</Option>
                <Option value="政治">政治</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="版本" name="version">
              <Select placeholder="人教版" style={{ width: '100%' }}>
                <Option value="人教版">人教版</Option>
                <Option value="北师大版">北师大版</Option>
                <Option value="苏教版">苏教版</Option>
                <Option value="沪教版">沪教版</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="册次" name="volume">
              <Select placeholder="上册" style={{ width: '100%' }}>
                <Option value="上册">上册</Option>
                <Option value="下册">下册</Option>
                <Option value="全一册">全一册</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="章节" name="chapter">
              <Select placeholder="第一章" style={{ width: '100%' }}>
                <Option value="第一章第一节">第一章第一节</Option>
                <Option value="第二章">第二章</Option>
                <Option value="第三章">第三章</Option>
                <Option value="第四章">第四章</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="审核状态" name="status">
              <Select placeholder="已审核" style={{ width: '100%' }}>
                <Option value="已审核">已审核</Option>
                <Option value="未审核">未审核</Option>
                <Option value="审核中">审核中</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ marginTop: 16, width: '100%' }}>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8, backgroundColor: '#1677ff' }}>
              查询
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Col>
        </Row>
      </Form>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button type="link" icon={<DownloadOutlined />} style={{ marginRight: '10px' }}>批量导出</Button>
        <Button type="link" icon={<DeleteOutlined />} style={{ marginRight: '10px' }}>批量删除</Button>
        <Button type="link" icon={<DownloadOutlined />}>上传资源</Button>
      </div>

      {/* 表格展示区域 */}
      <Table 
        rowSelection={rowSelection}
        columns={columns} 
        dataSource={resourceData}
        pagination={false}
        size="middle"
        bordered
        rowClassName={(record, index) => index % 2 === 0 ? '' : styles.evenRow}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', alignItems: 'center' }}>
        <div>共 800 条</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>每页</span>
          <Select defaultValue="10" style={{ width: '60px', marginRight: '8px' }}>
            <Option value="10">10</Option>
            <Option value="20">20</Option>
            <Option value="50">50</Option>
          </Select>
          <Pagination 
            total={800} 
            showSizeChanger={false} 
            defaultCurrent={1} 
            defaultPageSize={10} 
            showQuickJumper 
          />
        </div>
      </div>
    </div>
  );
};

// 课外资源管理组件
const ExtracurricularResourceManagement = () => {
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 模拟课外资源数据
  const resourceData = Array.from({ length: 10 }).map((_, index) => ({
    key: index + 1,
    id: index + 1,
    activityName: `课外活动${index + 1}`,
    activityType: index % 3 === 0 ? '文化活动' : index % 3 === 1 ? '体育活动' : '科技活动',
    organizer: index % 2 === 0 ? '学生会' : '团委',
    uploadDate: '2022-06-02 15:59'
  }));

  const handleSearch = (values: any) => {
    console.log('搜索条件:', values);
    // 这里可以实现搜索逻辑
  };

  const handleReset = () => {
    form.resetFields();
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '活动名称',
      dataIndex: 'activityName',
      key: 'activityName',
    },
    {
      title: '活动类型',
      dataIndex: 'activityType',
      key: 'activityType',
    },
    {
      title: '组织者',
      dataIndex: 'organizer',
      key: 'organizer',
    },
    {
      title: '上传日期',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <span>
          <Button type="link" size="small" style={{ color: '#1890ff', padding: '0 8px' }}>下载</Button>
          <Button type="link" size="small" style={{ color: '#ff4d4f', padding: '0 8px' }}>删除</Button>
        </span>
      ),
    },
  ];

  return (
    <div className={styles.resourceManagement}>
      <div className={styles.resourceHeader}>
        <h3>课外资源管理</h3>
      </div>
      
      {/* 资源统计卡片 */}
       
      
      <Form
        form={form}
        layout="inline"
        onFinish={handleSearch}
        style={{ marginBottom: 20 }}
      >
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col span={8}>
            <Form.Item label="活动名称" name="activityName">
              <Input placeholder="输入关键字搜索" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="活动类型" name="activityType">
              <Select placeholder="选择" style={{ width: '100%' }}>
                <Option value="文化活动">文化活动</Option>
                <Option value="体育活动">体育活动</Option>
                <Option value="科技活动">科技活动</Option>
                <Option value="社会实践">社会实践</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="组织者" name="organizer">
              <Select placeholder="选择" style={{ width: '100%' }}>
                <Option value="学生会">学生会</Option>
                <Option value="团委">团委</Option>
                <Option value="教务处">教务处</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ marginTop: 16, width: '100%' }}>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8, backgroundColor: '#1677ff' }}>
              查询
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Col>
        </Row>
      </Form>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button type="link" icon={<DownloadOutlined />} style={{ marginRight: '10px' }}>批量导出</Button>
        <Button type="link" icon={<DeleteOutlined />} style={{ marginRight: '10px' }}>批量删除</Button>
        <Button type="link" icon={<DownloadOutlined />}>上传资源</Button>
      </div>

      {/* 表格展示区域 */}
      <Table 
        rowSelection={rowSelection}
        columns={columns} 
        dataSource={resourceData}
        pagination={false}
        size="middle"
        bordered
        rowClassName={(record, index) => index % 2 === 0 ? '' : styles.evenRow}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', alignItems: 'center' }}>
        <div>共 800 条</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>每页</span>
          <Select defaultValue="10" style={{ width: '60px', marginRight: '8px' }}>
            <Option value="10">10</Option>
            <Option value="20">20</Option>
            <Option value="50">50</Option>
          </Select>
          <Pagination 
            total={800} 
            showSizeChanger={false} 
            defaultCurrent={1} 
            defaultPageSize={10} 
            showQuickJumper 
          />
        </div>
      </div>
    </div>
  );
};

// 资源类型管理组件
const ResourceTypeManagement = () => {
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 模拟资源类型数据
  const typeData = Array.from({ length: 10 }).map((_, index) => ({
    key: index + 1,
    id: index + 1,
    typeName: `资源类型${index + 1}`,
    createDate: '2022-06-02 15:59'
  }));

  const handleSearch = (values: any) => {
    console.log('搜索条件:', values);
    // 这里可以实现搜索逻辑
  };

  const handleReset = () => {
    form.resetFields();
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '类型名称',
      dataIndex: 'typeName',
      key: 'typeName',
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <span>
          <Button type="link" size="small" style={{ color: '#1890ff', padding: '0 8px' }}>编辑</Button>
          <Button type="link" size="small" style={{ color: '#ff4d4f', padding: '0 8px' }}>删除</Button>
        </span>
      ),
    },
  ];

  return (
    <div className={styles.resourceManagement}>
      <div className={styles.resourceHeader}>
        <h3>资源类型管理</h3>
      </div>
      
     
      
      <Form
        form={form}
        layout="inline"
        onFinish={handleSearch}
        style={{ marginBottom: 20 }}
      >
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col span={8}>
            <Form.Item label="类型名称" name="typeName">
              <Input placeholder="输入关键字搜索" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="创建日期" name="createDate">
              <Input placeholder="选择日期" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ marginTop: 16, width: '100%' }}>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8, backgroundColor: '#1677ff' }}>
              查询
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Col>
        </Row>
      </Form>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button type="link" icon={<EditOutlined />} style={{ marginRight: '10px' }}>新增类型</Button>
        <Button type="link" icon={<DeleteOutlined />}>批量删除</Button>
      </div>

      {/* 表格展示区域 */}
      <Table 
        rowSelection={rowSelection}
        columns={columns} 
        dataSource={typeData}
        pagination={false}
        size="middle"
        bordered
        rowClassName={(record, index) => index % 2 === 0 ? '' : styles.evenRow}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', alignItems: 'center' }}>
        <div>共 800 条</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>每页</span>
          <Select defaultValue="10" style={{ width: '60px', marginRight: '8px' }}>
            <Option value="10">10</Option>
            <Option value="20">20</Option>
            <Option value="50">50</Option>
          </Select>
          <Pagination 
            total={800} 
            showSizeChanger={false} 
            defaultCurrent={1} 
            defaultPageSize={10} 
            showQuickJumper 
          />
        </div>
      </div>
    </div>
  );
};

// 主资源管理组件
interface ResourceManagementProps {
  type: 'teaching' | 'extracurricular' | 'type';
}

const ResourceManagement: React.FC<ResourceManagementProps> = ({ type }) => {
  switch (type) {
    case 'teaching':
      return <TeachingResourceManagement />;
    case 'extracurricular':
      return <ExtracurricularResourceManagement />;
    case 'type':
      return <ResourceTypeManagement />;
    default:
      return <TeachingResourceManagement />;
  }
};

export default ResourceManagement;
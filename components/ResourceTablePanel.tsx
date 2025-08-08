'use client';

import React, { useState } from 'react';
import { Form, Input, Select, Button, Row, Col, Table, Checkbox, Modal, message } from 'antd';
import { UploadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import AddResourceForm from './AddResourceForm';
import styles from './ResourceTablePanel.module.css';

export default function ResourceTablePanel() {
  const [form] = Form.useForm();
  const [showAddForm, setShowAddForm] = useState(false);
  const [tableData, setTableData] = useState([
    { id: 1, name: '我上学了第一课', type: '教案', subject: '语文', grade: '一年级', volume: '人教版上册', chapter: '第一章第一节', status: '已审核', submitTime: '2022-06-02 16:50', checked: true },
    { id: 2, name: '我上学了第一课', type: '教案', subject: '语文', grade: '一年级', volume: '人教版上册', chapter: '第一章第一节', status: '已审核', submitTime: '2022-06-02 16:50', checked: true },
    { id: 3, name: '我上学了第一课', type: '教案', subject: '语文', grade: '一年级', volume: '人教版上册', chapter: '第一章第一节', status: '已审核', submitTime: '2022-06-02 16:50', checked: true },
    { id: 4, name: '我上学了第一课', type: '导学案', subject: '语文', grade: '一年级', volume: '人教版上册', chapter: '第一章第一节', status: '已审核', submitTime: '2022-06-02 16:50', checked: true },
    { id: 5, name: '我上学了第一课', type: '导学案', subject: '语文', grade: '一年级', volume: '人教版上册', chapter: '第一章第一节', status: '已审核', submitTime: '2022-06-02 16:50', checked: true },
    { id: 6, name: '我上学了第一课', type: '导学案', subject: '语文', grade: '一年级', volume: '人教版上册', chapter: '第一章第一节', status: '待审核', submitTime: '2022-06-02 16:50', checked: true },
    { id: 7, name: '我上学了第一课', type: '课件', subject: '语文', grade: '一年级', volume: '人教版上册', chapter: '第一章第一节', status: '待审核', submitTime: '2022-06-02 16:50', checked: false },
    { id: 8, name: '我上学了第一课', type: '课件', subject: '语文', grade: '一年级', volume: '人教版上册', chapter: '第一章第一节', status: '待审核', submitTime: '2022-06-02 16:50', checked: false },
    { id: 9, name: '我上学了第一课', type: '课件', subject: '语文', grade: '一年级', volume: '人教版上册', chapter: '第一章第一节', status: '待审核', submitTime: '2022-06-02 16:50', checked: false },
    { id: 10, name: '我上学了第一课', type: '课件', subject: '语文', grade: '一年级', volume: '人教版上册', chapter: '第一章第一节', status: '待审核', submitTime: '2022-06-02 16:50', checked: false }
  ]);

  // 全选状态管理
  const [selectAll, setSelectAll] = useState(false);

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    const newData = tableData.map(item => ({ ...item, checked }));
    setTableData(newData);
  };

  // 处理单个选择
  const handleSelectItem = (id: number, checked: boolean) => {
    const newData = tableData.map(item =>
      item.id === id ? { ...item, checked } : item
    );
    setTableData(newData);

    // 更新全选状态
    const allChecked = newData.every(item => item.checked);
    setSelectAll(allChecked);
  };

  const columns = [
    {
      title: <Checkbox checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} />,
      dataIndex: 'checked',
      key: 'checked',
      width: 50,
      render: (checked: boolean, record: any) => (
        <Checkbox
          checked={checked}
          onChange={(e) => handleSelectItem(record.id, e.target.checked)}
        />
      )
    },
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, idx: number) => idx + 1
    },
    { title: '资源名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '资源类型', dataIndex: 'type', key: 'type', width: 100 },
    { title: '学科', dataIndex: 'subject', key: 'subject', width: 100 },
    { title: '年级', dataIndex: 'grade', key: 'grade', width: 100 },
    { title: '册次', dataIndex: 'volume', key: 'volume', width: 120 },
    { title: '章节', dataIndex: 'chapter', key: 'chapter', width: 120 },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <span style={{
          color: status === '已审核' ? '#52c41a' : '#faad14',
          fontWeight: 'bold'
        }}>
          {status}
        </span>
      )
    },
    { title: '提交时间', dataIndex: 'submitTime', key: 'submitTime', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <div className={styles.actionButton}>
          <Button
            type="link"
            size="small"
            onClick={() => handleDelete(record.id)}
            className={styles.deleteButton}
          >
            删除
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleView(record)}
            className={styles.viewButton}
          >
            查看{record.id === 1 && <ThunderboltOutlined style={{ marginLeft: 4 }} />}
          </Button>
          {record.status === '待审核' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleApprove(record)}
              className={styles.approveButton}
            >
              审核
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleSearch = (values: any) => {
    console.log('搜索条件:', values);
    message.success('搜索完成');
  };

  const handleReset = () => {
    form.resetFields();
    message.info('已重置筛选条件');
  };

  // 批量审核功能
  const handleBatchApprove = () => {
    const checkedItems = tableData.filter(item => item.checked);
    if (checkedItems.length === 0) {
      message.warning('请先选择要审核的资源');
      return;
    }

    const newData = tableData.map(item =>
      item.checked ? { ...item, status: '已审核' } : item
    );
    setTableData(newData);
    message.success(`已批量审核 ${checkedItems.length} 个资源`);
  };

  // 审核设置功能
  const handleApprovalSettings = () => {
    message.info('审核设置功能开发中...');
  };

  // 删除资源
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个资源吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        setTableData(tableData.filter(item => item.id !== id));
        message.success('删除成功');
      }
    });
  };

  // 查看资源
  const handleView = (record: any) => {
    message.info(`查看资源: ${record.name}`);
  };

  // 审核资源
  const handleApprove = (record: any) => {
    const newData = tableData.map(item =>
      item.id === record.id ? { ...item, status: '已审核' } : item
    );
    setTableData(newData);
    message.success('审核成功');
  };

  // 添加新资源
  const handleAddResource = (values: any) => {
    const newResource = {
      id: Date.now(),
      name: values.resourceName || '新资源',
      type: values.resourceType || '教案',
      subject: values.subject || '语文',
      grade: values.grade || '一年级',
      volume: values.version + values.volume || '人教版上册',
      chapter: values.courseCatalog || '第一章第一节',
      status: '待审核',
      submitTime: new Date().toLocaleString(),
      checked: false
    };

    setTableData([newResource, ...tableData]);
    setShowAddForm(false);
    message.success('资源添加成功！');
  };

  return (
    <>
      {/* 搜索筛选区域 */}
      <div className={styles.searchPanel}>
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="资源名称" name="resourceName">
                <Input placeholder="请输入资源名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="资源类型" name="resourceType" initialValue="教案">
                <Select>
                  <Select.Option value="教案">教案</Select.Option>
                  <Select.Option value="导学案">导学案</Select.Option>
                  <Select.Option value="课件">课件</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="学段" name="schoolStage" initialValue="小学">
                <Select>
                  <Select.Option value="小学">小学</Select.Option>
                  <Select.Option value="初中">初中</Select.Option>
                  <Select.Option value="高中">高中</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="年级" name="grade" initialValue="一年级">
                <Select>
                  <Select.Option value="一年级">一年级</Select.Option>
                  <Select.Option value="二年级">二年级</Select.Option>
                  <Select.Option value="三年级">三年级</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="学科" name="subject" initialValue="语文">
                <Select>
                  <Select.Option value="语文">语文</Select.Option>
                  <Select.Option value="数学">数学</Select.Option>
                  <Select.Option value="英语">英语</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="版本" name="version" initialValue="人教版">
                <Select>
                  <Select.Option value="人教版">人教版</Select.Option>
                  <Select.Option value="北师大版">北师大版</Select.Option>
                  <Select.Option value="苏教版">苏教版</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="册次" name="volume" initialValue="上册">
                <Select>
                  <Select.Option value="上册">上册</Select.Option>
                  <Select.Option value="下册">下册</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="章节" name="chapter" initialValue="第一章">
                <Select>
                  <Select.Option value="第一章">第一章</Select.Option>
                  <Select.Option value="第二章">第二章</Select.Option>
                  <Select.Option value="第三章">第三章</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="审核状态" name="approvalStatus" initialValue="已审核">
                <Select>
                  <Select.Option value="已审核">已审核</Select.Option>
                  <Select.Option value="待审核">待审核</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item style={{ marginTop: 32 }}>
                <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                  查询
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>

      {/* 表格区域 */}
      <div className={styles.tablePanel}>
        <div className={styles.headerRow}>
          <h3 style={{ margin: 0 }}>教学资源管理</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              icon={<UploadOutlined />}
              onClick={handleBatchApprove}
              disabled={!tableData.some(item => item.checked)}
            >
              批量审核
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={handleApprovalSettings}
            >
              审核设置
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setShowAddForm(true)}
            >
              上传
            </Button>
            <Button icon={<ThunderboltOutlined />}></Button>
          </div>
        </div>

        <Table
          className={styles.resourceTable}
          columns={columns}
          dataSource={tableData.map((item, idx) => ({ ...item, key: item.id, index: idx + 1 }))}
          pagination={{
            total: 800,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共${total}条`
          }}
          rowKey="id"
          scroll={{ x: 1200 }}
          rowClassName={(record) => record.checked ? 'ant-table-row-selected' : ''}
        />
      </div>

      {/* 新增资源表单弹窗 */}
      <Modal
        title="新增教学资源"
        open={showAddForm}
        onCancel={() => setShowAddForm(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        destroyOnHidden
      >
        <AddResourceForm
          onCancel={() => setShowAddForm(false)}
          onSubmit={handleAddResource}
        />
      </Modal>
    </>
  );
} 
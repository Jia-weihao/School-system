'use client';

import React, { useState, useEffect } from 'react';
import { Input, Select, Button, Form, Row, Col, Table, Pagination, Switch, Modal, message } from 'antd';
import { PlusCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { 
  getResourceTypes,
  createResourceType,
  updateResourceType,
  deleteResourceType,
  type MainResourceType
} from '../src/services/resourceService';

const { Option } = Select;
const { TextArea } = Input;

interface ResourceTypeData {
  key: string;
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ResourceTypeManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typeData, setTypeData] = useState<ResourceTypeData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    pages: 0
  });
  const [currentEditRecord, setCurrentEditRecord] = useState<ResourceTypeData | null>(null);

  // 获取资源类型列表
  const fetchResourceTypes = async (params: any = {}) => {
    try {
      setLoading(true);
      const response = await getResourceTypes({
        page: pagination.current,
        limit: pagination.pageSize,
        ...params
      });

      // 修复：添加安全检查，确保 response 和 response.data 存在
      const responseData = response?.data || response;
      const list = responseData?.list || [];
      const paginationData = responseData?.pagination || { current: 1, pageSize: 10, total: 0, pages: 0 };

      const formattedData = (list || []).map((item: MainResourceType) => ({
        key: item._id,
        _id: item._id,
        name: item.name,
        description: item.description,
        isActive: item.status, // 修复：使用 status 字段映射到 isActive
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));

      setTypeData(formattedData);
      setPagination(prev => ({
        ...prev,
        ...paginationData
      }));
    } catch (error) {
      console.error('获取资源类型列表失败:', error);
      message.error('获取资源类型列表失败');

      // 设置默认空数组，防止undefined错误
      setTypeData([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchResourceTypes();
  }, []);

  // 搜索处理
  const handleSearch = async (values: any) => {
    const searchParams = {
      typeName: values.typeName,
      status: values.status,
      category: values.category
    };

    setPagination(prev => ({ ...prev, current: 1 }));
    await fetchResourceTypes(searchParams);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchResourceTypes();
  };

  // 选择行处理
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // 状态切换处理
  const handleStatusChange = async (checked: boolean, record: ResourceTypeData) => {
    try {
      await updateResourceType(record._id, {
        typeName: record.name,
        description: record.description,
        status: checked
      });

      setTypeData(prevData =>
        prevData.map(item =>
          item._id === record._id ? { ...item, isActive: checked } : item
        )
      );

      message.success('状态更新成功');
    } catch (error) {
      console.error('状态更新失败:', error);
      message.error('状态更新失败');
    }
  };

  // 新增类型弹窗处理
  const handleAddType = () => {
    setAddModalVisible(true);
  };

  const handleAddModalClose = () => {
    setAddModalVisible(false);
    addForm.resetFields();
  };

  // 新增提交
  const handleAddSubmit = async (values: any) => {
    try {
      await createResourceType({
        typeName: values.typeName,
        description: values.remark
      });

      message.success('新增类型成功');
      handleAddModalClose();
      fetchResourceTypes(); // 重新获取数据
    } catch (error) {
      console.error('新增类型失败:', error);
      message.error('新增类型失败');
    }
  };

  // 编辑处理
  const handleEdit = (record: ResourceTypeData) => {
    setCurrentEditRecord(record);
    editForm.setFieldsValue({
      typeName: record.name,
      remark: record.description
    });
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setCurrentEditRecord(null);
    editForm.resetFields();
  };

  // 编辑提交
  const handleEditSubmit = async (values: any) => {
    if (!currentEditRecord) return;

    try {
      await updateResourceType(currentEditRecord._id, {
        typeName: values.typeName,
        description: values.remark,
        status: currentEditRecord.isActive
      });

      message.success('更新类型成功');
      handleEditModalClose();
      fetchResourceTypes(); // 重新获取数据
    } catch (error) {
      console.error('更新类型失败:', error);
      message.error('更新类型失败');
    }
  };

  // 删除处理
  const handleDelete = async (record: ResourceTypeData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除资源类型"${record.name}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteResourceType(record._id);
          message.success('删除成功');
          fetchResourceTypes(); // 重新获取数据
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      }
    });
  };

  // 分页处理
  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }));

    // 重新获取数据
    fetchResourceTypes();
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (text: string) => text || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '状态',
      key: 'isActive',
      width: 80,
      render: (text: any, record: ResourceTypeData) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleStatusChange(checked, record)}
          size="small"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (text: any, record: ResourceTypeData) => (
        <span>
          <Button
            type="link"
            size="small"
            style={{ color: 'blue', padding: '0 4px' }}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            style={{ color: 'blue', padding: '0 4px' }}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '0' }}>
      {/* 标题 */}
      <div style={{
        backgroundColor: '#f0f2f5',
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: 'normal',
        color: '#000'
      }}>
        资源类型管理
      </div>

      {/* 搜索表单 */}
      <div style={{
        backgroundColor: '#fff',
        margin: '0 24px 16px 24px',
        padding: '24px',
        borderRadius: '8px'
      }}>
        <Form
          form={form}
          onFinish={handleSearch}
          layout="inline"
          style={{ width: '100%' }}
        >
          <Row gutter={24} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item
                label="类型名称"
                name="typeName"
                style={{ width: '100%', marginBottom: 16 }}
              >
                <Input placeholder="请输入类型名称" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="状态"
                name="status"
                style={{ width: '100%', marginBottom: 16 }}
              >
                <Select placeholder="全部" style={{ width: '100%' }}>
                  <Option value="">全部</Option>
                  <Option value="enabled">启用</Option>
                  <Option value="disabled">禁用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ marginTop: 8 }}>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  marginRight: 8,
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff'
                }}
              >
                查询
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* 表格区域 */}
      <div style={{
        backgroundColor: '#fff',
        margin: '0 24px',
        borderRadius: '8px'
      }}>
        {/* 新增类型按钮 */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={handleAddType}
          >
            <PlusCircleOutlined
              style={{
                color: 'blue',
                fontSize: '16px',
              }}
            />
            <span
              style={{
                color: 'blue',
                fontSize: '14px'
              }}
            >
              新增类型
            </span>
          </div>
        </div>

        {/* 表格 */}
        <div style={{ padding: '0 24px' }}>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={typeData}
            pagination={false}
            loading={loading}
            size="middle"
            bordered={false}
          />
        </div>

        {/* 分页 */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#666', fontSize: '14px' }}>共 {pagination.total} 条</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 8, color: '#666', fontSize: '14px' }}>每页</span>
            <Select
              value={pagination.pageSize.toString()}
              size="small"
              style={{ width: 60, marginRight: 8 }}
              onChange={(value) => handlePageChange(1, parseInt(value))}
            >
              <Option value="10">10</Option>
              <Option value="20">20</Option>
              <Option value="50">50</Option>
            </Select>
            <span style={{ marginRight: 16, color: '#666', fontSize: '14px' }}>条</span>
            <Pagination
              current={pagination.current}
              total={pagination.total}
              pageSize={pagination.pageSize}
              showSizeChanger={false}
              showQuickJumper={false}
              size="small"
              onChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* 新增类型弹窗 */}
      <Modal
        title="新增类型"
        open={addModalVisible}
        onCancel={handleAddModalClose}
        footer={null}
        width={400}
        closeIcon={<CloseOutlined />}
        styles={{
          header: {
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 'normal'
          }
        }}
      >
        <Form
          form={addForm}
          onFinish={handleAddSubmit}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label={
              <span>
                <span style={{ color: 'red', marginRight: 4 }}>*</span>
                类型名称
              </span>
            }
            name="typeName"
            rules={[{ required: true, message: '请输入类型名称' }]}
          >
            <Input placeholder="请输入类型名称" />
          </Form.Item>

          <Form.Item
            label="备注"
            name="remark"
          >
            <TextArea
              placeholder="请输入备注"
              rows={4}
              style={{ resize: 'none' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center', marginTop: 30 }}>
            <Button
              onClick={handleAddModalClose}
              style={{ marginRight: 16, width: 80 }}
            >
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                width: 80
              }}
            >
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑类型弹窗 */}
      <Modal
        title="编辑类型"
        open={editModalVisible}
        onCancel={handleEditModalClose}
        footer={null}
        width={400}
        closeIcon={<CloseOutlined />}
        styles={{
          header: {
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 'normal'
          }
        }}
      >
        <Form
          form={editForm}
          onFinish={handleEditSubmit}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label={
              <span>
                <span style={{ color: 'red', marginRight: 4 }}>*</span>
                类型名称
              </span>
            }
            name="typeName"
            rules={[{ required: true, message: '请输入类型名称' }]}
          >
            <Input placeholder="请输入类型名称" />
          </Form.Item>

          <Form.Item
            label="备注"
            name="remark"
          >
            <TextArea
              placeholder="请输入备注"
              rows={4}
              style={{ resize: 'none' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center', marginTop: 30 }}>
            <Button
              onClick={handleEditModalClose}
              style={{ marginRight: 16, width: 80 }}
            >
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                width: 80
              }}
            >
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResourceTypeManagement;
'use client';

import React, { useState, useEffect } from 'react';
import styles from '../app/dashboard/dashboard.module.css';
import { Input, Select, Button, Form, Row, Col, Table, Pagination, message, Modal } from 'antd';
import { DownloadOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import AddExtracurricularResourceForm from './AddExtracurricularResourceForm';
import ResourceViewModal from './ResourceViewModal';
import ResourceApprovalModal from './ResourceApprovalModal';
import { ExtracurricularResourceData } from './types/ResourceTypes';
import {
  getExtracurricularResources,
  createExtracurricularResource,
  updateExtracurricularResource,
  deleteExtracurricularResource,
  batchDeleteExtracurricularResources, // 添加这个导入
  getResourceTypes,
  getAuditStatuses,
  auditResource,
  type ExtracurricularResource,
  type CreateExtracurricularResourceData,
  type ResourceType,
  type AuditStatus
} from '../src/services/resourceService';

const { Option } = Select;

const ExtracurricularResourceManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ExtracurricularResourceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [resourceData, setResourceData] = useState<ExtracurricularResourceData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    pages: 0
  });

  // 下拉选项数据 - 确保初始化为空数组
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [auditStatuses, setAuditStatuses] = useState<AuditStatus[]>([]);

  // 获取基础数据
  const fetchBasicData = async () => {
    try {
      console.log('开始获取基础数据...');

      // 获取资源类型 - 使用主资源类型接口
      const resourceTypesRes = await getResourceTypes();
      console.log('资源类型响应:', resourceTypesRes);

      // 安全处理响应数据，从list中提取
      const responseData = resourceTypesRes?.data || resourceTypesRes;
      const list = responseData?.list || [];

      if (Array.isArray(list)) {
        setResourceTypes(list);
        console.log('设置资源类型成功:', list);
      } else {
        console.warn('资源类型数据格式异常:', resourceTypesRes);
        setResourceTypes([]);
      }

      // 获取审核状态
      const auditStatusesRes = await getAuditStatuses();
      console.log('审核状态响应:', auditStatusesRes);

      if (auditStatusesRes?.success && Array.isArray(auditStatusesRes.data)) {
        setAuditStatuses(auditStatusesRes.data);
        console.log('设置审核状态成功:', auditStatusesRes.data);
      } else {
        console.warn('审核状态数据格式异常:', auditStatusesRes);
        setAuditStatuses([]);
      }
    } catch (error) {
      console.error('获取基础数据失败:', error);
      message.error('获取基础数据失败');

      // 确保状态为空数组，防止undefined错误
      setResourceTypes([]);
      setAuditStatuses([]);
    }
  };

  // 获取课外资源列表
  const fetchExtracurricularResources = async (params: any = {}) => {
    try {
      setLoading(true);
      console.log('获取课外资源，参数:', params);

      const response = await getExtracurricularResources({
        page: pagination.current,
        limit: pagination.pageSize,
        ...params
      });

      console.log('课外资源响应:', response);

      // 处理响应数据 - 后端返回 { success: true, data: { list: [...], pagination: {...} } }
      if (response?.success) {
        const responseData = response.data || {};
        const list = responseData.list || [];
        const paginationData = responseData.pagination || {
          current: 1,
          pageSize: 10,
          total: 0,
          pages: 0
        };

        console.log('解析的列表数据:', list);
        console.log('解析的分页数据:', paginationData);

        const formattedData = list.map((item: ExtracurricularResource, index: number) => ({
          key: item._id,
          id: (pagination.current - 1) * pagination.pageSize + index + 1,
          resourceName: item.resourceName || item.name || '',
          resourceType: item.mainTypeId?.name || '',
          adminPermission: item.approvalStatusId?.name || '',
          modifyTime: new Date(item.updatedAt || item.createdAt || new Date()).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\//g, '-'),
          status: item.approvalStatusId?.name || '',
          _id: item._id,
          originalData: item
        }));

        console.log('格式化后的数据:', formattedData);

        setResourceData(formattedData);
        setPagination(prev => ({
          ...prev,
          current: paginationData.current || 1,
          total: paginationData.total || 0,
          pageSize: paginationData.pageSize || 10,
          pages: paginationData.pages || 0
        }));
      } else {
        console.warn('课外资源响应格式异常:', response);
        setResourceData([]);
      }
    } catch (error) {
      console.error('获取课外资源列表失败:', error);
      message.error('获取课外资源列表失败');
      setResourceData([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchBasicData();
    fetchExtracurricularResources();
  }, []);

  // 当分页状态改变时重新获取数据
  useEffect(() => {
    fetchExtracurricularResources();
  }, [pagination.current, pagination.pageSize]);

  // 搜索处理 - 修复参数映射
  const handleSearch = async (values: any) => {
    console.log('搜索表单值:', values);

    const searchParams = {
      resourceName: values.resourceName, // 修正参数名
      mainTypeId: values.resourceType,   // 修正参数名
      approvalStatusId: values.status    // 修正参数名
    };

    console.log('搜索参数:', searchParams);

    setPagination(prev => ({ ...prev, current: 1 }));
    await fetchExtracurricularResources(searchParams);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchExtracurricularResources();
  };

  // 选择行处理
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('选中的行:', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // 上传资源
  const handleUploadResource = () => {
    setShowAddForm(true);
  };

  const handleBackToList = () => {
    setShowAddForm(false);
  };

  // 表单提交
  const handleFormSubmit = async (values: any) => {
    try {
      console.log('接收到表单数据:', values);

      // 创建符合API期望格式的数据对象
      const resourceData: CreateExtracurricularResourceData = {
        name: values.resourceName,
        resourceName: values.resourceName,
        description: values.resourceIntro || values.description || '',
        typeId: values.resourceType,
        gradeId: values.grade || '',
        subjectId: values.subject || ''
      };

      console.log('发送到API的数据:', resourceData);

      await createExtracurricularResource(resourceData);

      message.success('课外资源上传成功！');
      setShowAddForm(false);
      fetchExtracurricularResources(); // 重新获取数据
    } catch (error) {
      console.error('上传课外资源失败:', error);
      message.error(`上传课外资源失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 审核处理 - 修复状态名称
  const handleApprove = (record: ExtracurricularResourceData) => {
    console.log('准备审核资源:', record);
    setCurrentRecord(record);
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async (approved: boolean, reason?: string) => {
    if (!currentRecord) return;

    try {
      console.log('开始审核资源:', {
        id: currentRecord._id,
        approved,
        reason,
        auditStatuses
      });

      // 根据审核结果选择状态 - 修复状态名称
      const statusName = approved ? '审核通过' : '审核拒绝';
      const auditStatus = auditStatuses.find(status => status.name === statusName);

      if (!auditStatus) {
        message.error(`找不到审核状态: ${statusName}`);
        console.error('可用的审核状态:', auditStatuses.map(s => s.name));
        return;
      }

      console.log('使用审核状态:', auditStatus);

      const result = await auditResource(
        currentRecord._id,
        auditStatus._id,
        'extracurricular',
        reason
      );

      console.log('审核结果:', result);

      if (result.success) {
        message.success(approved ? '审核通过' : '审核拒绝');
        setShowApprovalModal(false);
        setCurrentRecord(null);
        // 重新获取数据
        await fetchExtracurricularResources();
      } else {
        message.error(result.message || '审核失败');
      }
    } catch (error: any) {
      console.error('审核失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '审核失败';
      message.error(errorMessage);
    }
  };

  // 查看详情
  const handleView = (record: ExtracurricularResourceData) => {
    setCurrentRecord(record);
    setShowViewModal(true);
  };

  // 删除资源 - 完整修复版本
  const handleDelete = async (record: ExtracurricularResourceData) => {
    console.log('=== 开始删除操作 ===');
    console.log('准备删除资源:', record);
    console.log('资源ID:', record._id);
    console.log('资源key:', record.key);

    // 验证ID是否存在
    if (!record._id) {
      message.error('资源ID不存在，无法删除');
      console.error('资源数据缺少_id字段:', record);
      return;
    }

    // 验证ID格式（MongoDB ObjectId格式）
    if (!/^[0-9a-fA-F]{24}$/.test(record._id)) {
      message.error('资源ID格式无效');
      console.error('无效的ID格式:', record._id);
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除资源"${record.resourceName}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          console.log('开始删除资源，ID:', record._id);
          console.log('删除前的资源数据:', record);

          // 显示加载状态
          const hideLoading = message.loading('正在删除...', 0);

          const result = await deleteExtracurricularResource(record._id);
          
          hideLoading();
          console.log('删除API返回结果:', result);

          if (result && result.success) {
            message.success('删除成功');
            console.log('删除成功，准备刷新列表');
            // 重新获取数据
            await fetchExtracurricularResources();
          } else {
            const errorMsg = result?.message || '删除失败，服务器未返回成功状态';
            console.error('删除失败，API返回:', result);
            message.error(errorMsg);
          }
        } catch (error: any) {
          console.error('=== 删除操作异常 ===');
          console.error('错误对象:', error);
          console.error('错误详情:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              baseURL: error.config?.baseURL
            }
          });
          
          let errorMessage = '删除失败';
          
          if (error.response) {
            // 服务器响应了错误状态码
            const status = error.response.status;
            const data = error.response.data;
            
            if (status === 404) {
              errorMessage = '资源不存在或已被删除';
            } else if (status === 400) {
              errorMessage = data?.message || '请求参数错误';
            } else if (status === 500) {
              errorMessage = data?.message || '服务器内部错误';
            } else {
              errorMessage = data?.message || `服务器错误 (${status})`;
            }
          } else if (error.request) {
            // 请求已发出但没有收到响应
            errorMessage = '网络连接失败，请检查网络或后端服务';
          } else {
            // 其他错误
            errorMessage = error.message || '未知错误';
          }
          
          message.error(errorMessage);
        }
      }
    });
  };

  // 批量删除 - 完整修复版本
  const handleBatchDelete = () => {
    console.log('=== 开始批量删除操作 ===');
    console.log('准备批量删除');
    console.log('选中的行keys:', selectedRowKeys);
    console.log('当前资源数据:', resourceData);

    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的资源');
      return;
    }

    // 获取选中资源的详细信息
    const selectedResources = resourceData.filter(item => selectedRowKeys.includes(item.key));
    console.log('选中的资源详情:', selectedResources);

    // 提取真实的ID并验证格式
    const resourceIds = selectedResources
      .map(item => item._id)
      .filter(id => id && /^[0-9a-fA-F]{24}$/.test(id));
    
    console.log('提取的资源IDs:', resourceIds);

    if (resourceIds.length === 0) {
      message.error('选中的资源缺少有效ID，无法删除');
      return;
    }

    if (resourceIds.length !== selectedRowKeys.length) {
      console.warn('部分资源缺少有效ID:', {
        selectedCount: selectedRowKeys.length,
        validIdCount: resourceIds.length
      });
      
      Modal.confirm({
        title: '部分资源ID无效',
        content: `选中了 ${selectedRowKeys.length} 个资源，但只有 ${resourceIds.length} 个有效ID。是否继续删除有效的资源？`,
        okText: '继续删除',
        cancelText: '取消',
        onOk: () => performBatchDelete(resourceIds)
      });
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${resourceIds.length} 个资源吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => performBatchDelete(resourceIds)
    });
  };

  // 执行批量删除的实际操作
  const performBatchDelete = async (resourceIds: string[]) => {
    try {
      console.log('开始批量删除，IDs:', resourceIds);

      // 显示加载状态
      const hideLoading = message.loading('正在批量删除...', 0);

      const result = await batchDeleteExtracurricularResources(resourceIds);
      
      hideLoading();
      console.log('批量删除API返回结果:', result);

      if (result && result.success) {
        message.success(`批量删除成功，共删除 ${resourceIds.length} 个资源`);
        console.log('批量删除成功，准备刷新列表');
        setSelectedRowKeys([]);
        // 重新获取数据
        await fetchExtracurricularResources();
      } else {
        const errorMsg = result?.message || '批量删除失败，服务器未返回成功状态';
        console.error('批量删除失败，API返回:', result);
        message.error(errorMsg);
      }
    } catch (error: any) {
      console.error('=== 批量删除操作异常 ===');
      console.error('错误对象:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      
      let errorMessage = '批量删除失败';
      
      if (error.response) {
        // 服务器响应了错误状态码
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = data?.message || '请求参数错误';
        } else if (status === 500) {
          errorMessage = data?.message || '服务器内部错误';
        } else {
          errorMessage = data?.message || `服务器错误 (${status})`;
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        errorMessage = '网络连接失败，请检查网络或后端服务';
      } else {
        // 其他错误
        errorMessage = error.message || '未知错误';
      }
      
      message.error(errorMessage);
    }
  };

  // 批量导出
  const handleBatchExport = async () => {
    try {
      // 简化导出功能，生成CSV格式
      const dataToExport = selectedRowKeys.length > 0
        ? resourceData.filter(item => selectedRowKeys.includes(item.key))
        : resourceData;

      const csvContent = [
        ['序号', '资源名称', '资源类型', '管理员权限', '修改时间', '状态'].join(','),
        ...dataToExport.map(item => [
          item.id,
          `"${item.resourceName}"`,
          `"${item.resourceType}"`,
          `"${item.adminPermission}"`,
          `"${item.modifyTime}"`,
          `"${item.status}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `课外资源_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    }
  };

  // 分页处理 - 修复版本
  const handlePageChange = (page: number, pageSize?: number) => {
    console.log('分页变化:', { page, pageSize });

    const newPagination = {
      ...pagination,
      current: page,
      pageSize: pageSize || pagination.pageSize
    };

    setPagination(newPagination);

    // 使用新的分页参数获取数据
    fetchExtracurricularResources();
  };

  if (showAddForm) {
    return (
      <AddExtracurricularResourceForm
        onSubmit={handleFormSubmit}
        onBack={handleBackToList}
        onCancel={handleBackToList}
        resourceTypes={resourceTypes}
      />
    );
  }

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
      title: '管理员权限',
      dataIndex: 'adminPermission',
      key: 'adminPermission',
    },
    {
      title: '修改时间',
      dataIndex: 'modifyTime',
      key: 'modifyTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: ExtracurricularResourceData) => (
        <span>
          <Button
            type="link"
            size="small"
            style={{ color: 'blue', padding: '0 4px' }}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
          <Button
            type="link"
            size="small"
            style={{ color: 'blue', padding: '0 4px' }}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {record.status === '待审核' && (
            <Button
              type="link"
              size="small"
              style={{ color: 'blue', padding: '0 4px' }}
              onClick={() => handleApprove(record)}
            >
              审核
            </Button>
          )}
        </span>
      ),
    },
  ];

  // 在渲染部分，确保使用安全的数组检查
  return (
    <div className={styles.resourceManagement}>
      <div className={styles.resourceHeader}>
        <h3>课外资源管理</h3>
      </div>

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
              <Select placeholder="请选择资源类型" style={{ width: '100%' }}>
                {Array.isArray(resourceTypes) && resourceTypes.map(type => (
                  <Option key={type._id} value={type._id}>{type.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="审核状态" name="status">
              <Select placeholder="请选择审核状态" style={{ width: '100%' }}>
                {Array.isArray(auditStatuses) && auditStatuses.map(status => (
                  <Option key={status._id} value={status._id}>{status.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ marginTop: 16, width: '100%' }}>
          <Col span={24} style={{ textAlign: 'left' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ marginRight: 8, backgroundColor: 'blue' }}
            >
              查询
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Col>
        </Row>
      </Form>

      {/* 操作按钮区域 */}
      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={handleBatchExport}
          style={{ marginRight: '5px', color: 'blue' }}
        >
          批量导出
        </Button>
        <Button
          type="link"
          icon={<DeleteOutlined />}
          onClick={handleBatchDelete}
          style={{ marginRight: '5px', color: 'blue' }}
        >
          批量删除
        </Button>
        <Button
          type="link"
          icon={<UploadOutlined />}
          style={{ marginRight: '5px', color: 'blue' }}
          onClick={handleUploadResource}
        >
          上传资源
        </Button>
      </div>

      {/* 表格展示区域 */}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={resourceData}
        pagination={false}
        loading={loading}
        size="middle"
        bordered
        rowClassName={(record, index) => index % 2 === 0 ? '' : styles.evenRow}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', alignItems: 'center' }}>
        <div>共 {pagination.total} 条</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>每页</span>
          <Select
            value={pagination.pageSize.toString()}
            style={{ width: '60px', marginRight: '8px' }}
            onChange={(value) => handlePageChange(1, parseInt(value))}
          >
            <Option value="10">10</Option>
            <Option value="20">20</Option>
            <Option value="50">50</Option>
          </Select>
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            showSizeChanger={false}
            showQuickJumper
            onChange={handlePageChange}
          />
        </div>
      </div>

      {/* 查看弹窗 */}
      <ResourceViewModal
        visible={showViewModal}
        record={currentRecord}
        onClose={() => setShowViewModal(false)}
        isExtracurricular={true}
      />

      {/* 审核弹窗 */}
      <ResourceApprovalModal
        visible={showApprovalModal}
        record={currentRecord}
        onClose={() => setShowApprovalModal(false)}
        onSubmit={handleApprovalSubmit}
        isExtracurricular={true}
      />
    </div>
  );
};

export default ExtracurricularResourceManagement;
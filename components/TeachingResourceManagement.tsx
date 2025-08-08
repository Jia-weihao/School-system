'use client';

import React, { useState, useEffect } from 'react';
import styles from '../app/dashboard/dashboard.module.css';
import { Input, Select, Button, Form, Row, Col, Table, Pagination, message, Modal, Tag } from 'antd';
import { DownloadOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import AddResourceForm from './AddResourceForm';
import ResourceViewModal from './ResourceViewModal';
import ResourceApprovalModal from './ResourceApprovalModal';
import { ResourceData } from './types/ResourceTypes';
import {
  getTeachingResources,
  createTeachingResource,
  updateTeachingResource,
  deleteTeachingResource,
  getResourceTypes,
  getGrades,
  getSubjects,
  getTextbookVersions,
  getVolumes,
  getAuditStatuses,
  auditResource,
  type TeachingResource,
  type CreateTeachingResourceData,
  type ResourceType,
  type Grade,
  type Subject,
  type TextbookVersion,
  type Volume,
  type AuditStatus
} from '../src/services/resourceService';

const { Option } = Select;

const TeachingResourceManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ResourceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [resourceData, setResourceData] = useState<ResourceData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    pages: 0
  });

  // 下拉选项数据
  const [mainResourceTypes, setMainResourceTypes] = useState<ResourceType[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [versions, setVersions] = useState<TextbookVersion[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [auditStatuses, setAuditStatuses] = useState<AuditStatus[]>([]);

  // 获取基础数据
  const fetchBasicData = async () => {
    try {
      console.log('开始获取基础数据...');

      // 获取资源类型
      const resourceTypesRes = await getResourceTypes();
      console.log('资源类型响应:', resourceTypesRes);

      // 支持两种数据格式: {success: true, data: [...]} 或 {success: true, data: {list: [...]}}
      if (resourceTypesRes?.success) {
        if (Array.isArray(resourceTypesRes.data)) {
          setMainResourceTypes(resourceTypesRes.data);
          console.log('设置资源类型成功(直接数组格式):', resourceTypesRes.data);
        } else if (resourceTypesRes.data && Array.isArray(resourceTypesRes.data.list)) {
          setMainResourceTypes(resourceTypesRes.data.list);
          console.log('设置资源类型成功(包含list字段):', resourceTypesRes.data.list);
        } else {
          console.warn('资源类型数据格式异常:', resourceTypesRes);
          setMainResourceTypes([]);
        }
      } else {
        console.warn('资源类型请求失败:', resourceTypesRes);
        setMainResourceTypes([]);
      }

      // 获取年级
      const gradesRes = await getGrades();
      console.log('年级响应:', gradesRes);

      if (gradesRes?.success && Array.isArray(gradesRes.data)) {
        setGrades(gradesRes.data);
        console.log('设置年级成功:', gradesRes.data);
      } else {
        console.warn('年级数据格式异常:', gradesRes);
        setGrades([]);
      }

      // 获取学科
      const subjectsRes = await getSubjects();
      console.log('学科响应:', subjectsRes);

      if (subjectsRes?.success && Array.isArray(subjectsRes.data)) {
        setSubjects(subjectsRes.data);
        console.log('设置学科成功:', subjectsRes.data);
      } else {
        console.warn('学科数据格式异常:', subjectsRes);
        setSubjects([]);
      }

      // 获取版本
      const versionsRes = await getTextbookVersions();
      console.log('版本响应:', versionsRes);

      if (versionsRes?.success && Array.isArray(versionsRes.data)) {
        setVersions(versionsRes.data);
        console.log('设置版本成功:', versionsRes.data);
      } else {
        console.warn('版本数据格式异常:', versionsRes);
        setVersions([]);
      }

      // 获取册次
      const volumesRes = await getVolumes();
      console.log('册次响应:', volumesRes);

      if (volumesRes?.success && Array.isArray(volumesRes.data)) {
        setVolumes(volumesRes.data);
        console.log('设置册次成功:', volumesRes.data);
      } else {
        console.warn('册次数据格式异常:', volumesRes);
        setVolumes([]);
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
      setMainResourceTypes([]);
      setGrades([]);
      setSubjects([]);
      setVersions([]);
      setVolumes([]);
      setAuditStatuses([]);
    }
  };

  // 获取教学资源列表
  const fetchTeachingResources = async (params: any = {}) => {
    try {
      setLoading(true);

      // 清空当前数据，避免重复
      setResourceData([]);

      const response = await getTeachingResources({
        page: pagination.current,
        limit: pagination.pageSize,
        ...params
      });

      console.log('=== 从后端获取的完整响应数据 ===');
      console.log('响应对象:', response);
      
      if (response?.success) {
        const responseData = response.data || {};
        const list = responseData.list || [];
        
        console.log('=== 后端返回的资源列表 ===');
        console.log('资源数量:', list.length);
        console.log('完整列表数据:', list);
        
        const paginationData = responseData.pagination || {
          current: 1,
          pageSize: 10,
          total: 0,
          pages: 0
        };

        // 直接使用后端返回的正确数据
        const formattedData = list.map((item: any, index: number) => ({
          key: item._id,
          _id: item._id,
          serialNumber: (pagination.current - 1) * pagination.pageSize + index + 1,
          resourceName: item.resourceName || '未知',
          resourceType: item.mainTypeId?.name || '未知',
          subject: item.subjectId?.name || '未知', 
          gradeLevel: item.gradeId?.name || '未知',
          version: item.versionId?.name || '未知',
          volume: item.volumeId?.name || '未知',
          status: item.approvalStatusId?.name || '未知',
          adminPermission: item.permissionTypeId?.name || '未知',
          updateTime: item.updateTime ? new Date(item.updateTime).toLocaleString('zh-CN') :
            item.modifyTime ? new Date(item.modifyTime).toLocaleString('zh-CN') :
              item.uploadDate ? new Date(item.uploadDate).toLocaleString('zh-CN') : '未知',
          uploadDate: item.uploadDate ? new Date(item.uploadDate).toLocaleString('zh-CN') : '未知',
          originalData: item
        }));

        console.log('=== 格式化后的数据 ===');
        console.log('格式化数据:', formattedData);

        setResourceData(formattedData);
        setPagination(prev => ({
          ...prev,
          current: paginationData.current || 1,
          total: paginationData.total || 0,
          pageSize: paginationData.pageSize || 10,
          pages: paginationData.pages || 0
        }));
      } else {
        console.warn('教学资源响应格式异常:', response);
        setResourceData([]);
      }
    } catch (error) {
      console.error('获取教学资源列表失败:', error);
      message.error('获取教学资源列表失败');
      setResourceData([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchBasicData();
    fetchTeachingResources();
  }, []);

  // 当分页状态改变时重新获取数据 - 但要避免初始化时的重复调用
  useEffect(() => {
    // 只有在不是初始状态时才重新获取数据
    if (pagination.current !== 1 || pagination.pageSize !== 10) {
      fetchTeachingResources();
    }
  }, [pagination.current, pagination.pageSize]);

  // 搜索处理
  const handleSearch = async (values: any) => {
    const searchParams = {
      resourceName: values.resourceName,
      mainTypeId: values.resourceType,
      gradeId: values.grade,
      subjectId: values.subject,
      versionId: values.version,
      volumeId: values.volume,
      year: values.year,
      approvalStatusId: values.status
    };

    setPagination(prev => ({ ...prev, current: 1 }));
    await fetchTeachingResources(searchParams);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchTeachingResources();
  };

  // 选择行处理
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
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

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的资源');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个资源吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map(key => deleteTeachingResource(key as string))
          );
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          fetchTeachingResources();
        } catch (error) {
          console.error('批量删除失败:', error);
          message.error('批量删除失败');
        }
      }
    });
  };

  // 批量导出
  const handleBatchExport = async () => {
    try {
      const dataToExport = selectedRowKeys.length > 0
        ? resourceData.filter(item => selectedRowKeys.includes(item.key))
        : resourceData;

      const csvContent = [
        ['序号', '资源名称', '资源类型', '学科', '年级', '版本', '册次', '审核状态', '提交时间'].join(','),
        ...dataToExport.map(item => [
          item.serialNumber || item.id,
          `"${item.resourceName}"`,
          `"${item.resourceType}"`,
          `"${item.subject}"`,
          `"${item.gradeLevel}"`,
          `"${item.version}"`,
          `"${item.volume}"`,
          `"${item.status}"`,
          `"${item.uploadDate}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `教学资源_${new Date().toISOString().slice(0, 10)}.csv`;
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

  // 审核处理
  const handleApprove = (record: ResourceData) => {
    setCurrentRecord(record);
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async (approved: boolean) => {
    if (!currentRecord) return;

    try {
      const auditStatusId = auditStatuses.find(status =>
        status.name === (approved ? '已审核' : '审核拒绝')
      )?._id;

      if (auditStatusId) {
        await auditResource(currentRecord._id, auditStatusId, 'teaching');
        message.success(approved ? '审核通过' : '审核拒绝');
        fetchTeachingResources();
      }
    } catch (error) {
      console.error('审核失败:', error);
      message.error('审核失败');
    }

    setShowApprovalModal(false);
    setCurrentRecord(null);
  };

  // 查看详情
  const handleView = (record: ResourceData) => {
    setCurrentRecord(record);
    setShowViewModal(true);
  };

  // 删除资源
  const handleDelete = async (record: ResourceData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除资源"${record.resourceName}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteTeachingResource(record._id);
          message.success('删除成功');
          fetchTeachingResources();
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
  };

  if (showAddForm) {
    return (
      <AddResourceForm
        onSubmit={async (values: any) => {
          try {
            const resourceData: CreateTeachingResourceData = {
              resourceName: values.resourceName,
              description: values.description || '',
              mainTypeId: values.resourceType,
              gradeId: values.grade || '',
              subjectId: values.subject || '',
              versionId: values.version || '',
              volumeId: values.volume || ''
            };

            await createTeachingResource(resourceData);
            message.success('教学资源上传成功！');
            setShowAddForm(false);
            fetchTeachingResources();
          } catch (error) {
            console.error('上传教学资源失败:', error);
            message.error('上传教学资源失败');
          }
        }}
        onBack={() => setShowAddForm(false)}
      />
    );
  }

  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 60,
      render: (text: any, record: any, index: number) => {
        return record.serialNumber || ((pagination.current - 1) * pagination.pageSize + index + 1);
      }
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
      title: '学科',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: '年级',
      dataIndex: 'gradeLevel',
      key: 'gradeLevel',
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
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === '已审核') color = 'green';
        else if (status === '待审核') color = 'orange';
        else if (status === '审核拒绝') color = 'red';

        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: '提交时间',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: ResourceData) => (
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

  return (
    <div className={styles.resourceManagement}>
      <div className={styles.resourceHeader}>
        <h3>教学资源管理</h3>
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
              <Input placeholder="请输入资源名称" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="资源类型" name="resourceType">
              <Select placeholder="请选择资源类型" style={{ width: '100%' }}>
 
                {Array.isArray(mainResourceTypes) ? (
                  mainResourceTypes.length > 0 ? (
                    mainResourceTypes.map(type => (
                      <Option key={type._id} value={type._id}>{type.name}</Option>
                    ))
                  ) : (
                    <Option value="">暂无数据</Option>
                  )
                ) : (
                  <Option value="">数据加载中...</Option>
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="学段" name="grade">
              <Select placeholder="小学" style={{ width: '100%' }}>
                {Array.isArray(grades) && grades.map(grade => (
                  <Option key={grade._id} value={grade._id}>{grade.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col span={8}>
            <Form.Item label="年级" name="gradeLevel">
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
                {Array.isArray(subjects) && subjects.map(subject => (
                  <Option key={subject._id} value={subject._id}>{subject.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="版本" name="version">
              <Select placeholder="人教版" style={{ width: '100%' }}>
                {Array.isArray(versions) && versions.map(version => (
                  <Option key={version._id} value={version._id}>{version.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col span={8}>
            <Form.Item label="册次" name="volume">
              <Select placeholder="上册" style={{ width: '100%' }}>
                {Array.isArray(volumes) && volumes.map(volume => (
                  <Option key={volume._id} value={volume._id}>{volume.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="年份" name="year">
              <Select placeholder="第一册" style={{ width: '100%' }}>
                <Option value="2024">2024</Option>
                <Option value="2023">2023</Option>
                <Option value="2022">2022</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="审核状态" name="status">
              <Select placeholder="已审核" style={{ width: '100%' }}>
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
              搜索
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
      />

      {/* 审核弹窗 */}
      <ResourceApprovalModal
        visible={showApprovalModal}
        record={currentRecord}
        onClose={() => setShowApprovalModal(false)}
        onSubmit={handleApprovalSubmit}
      />
    </div>
  );
};

export default TeachingResourceManagement;
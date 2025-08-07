'use client';

import React, { useState } from 'react';
import { Card, Form, Button, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ResourceSearchForm from './ResourceSearchForm';
import ResourceTablePanel from './ResourceTablePanel';
import FileUpload from './FileUpload';
import {
    createTeachingResource,
    createExtracurricularResource,
    updateTeachingResource,
    updateExtracurricularResource,
    type TeachingResource,
    type ExtracurricularResource
} from '../src/services/resourceService';

interface ResourceManagementPageProps {
    type: 'teaching' | 'extracurricular';
    title: string;
}

const ResourceManagementPage: React.FC<ResourceManagementPageProps> = ({
    type,
    title
}) => {
    const [searchForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [searchParams, setSearchParams] = useState({});
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<TeachingResource | ExtracurricularResource | null>(null);
    const [viewingRecord, setViewingRecord] = useState<TeachingResource | ExtracurricularResource | null>(null);

    // 搜索处理
    const handleSearch = (values: any) => {
        setSearchParams(values);
    };

    // 重置搜索
    const handleReset = () => {
        searchForm.resetFields();
        setSearchParams({});
    };

    // 编辑资源
    const handleEdit = (record: TeachingResource | ExtracurricularResource) => {
        setEditingRecord(record);
        editForm.setFieldsValue({
            name: record.name,
            description: record.description,
            typeId: record.type._id,
            gradeId: record.grade._id,
            subjectId: record.subject._id,
            ...(type === 'teaching' && 'textbookVersion' in record ? {
                textbookVersionId: record.textbookVersion._id,
                volumeId: record.volume._id,
                chapterId: record.chapter._id,
            } : {})
        });
        setEditModalVisible(true);
    };

    // 查看资源
    const handleView = (record: TeachingResource | ExtracurricularResource) => {
        setViewingRecord(record);
        setViewModalVisible(true);
    };

    // 保存编辑
    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields();

            if (!editingRecord) return;

            const response = type === 'teaching'
                ? await updateTeachingResource(editingRecord._id, values)
                : await updateExtracurricularResource(editingRecord._id, values);

            if (response.success) {
                message.success('更新成功');
                setEditModalVisible(false);
                setEditingRecord(null);
                editForm.resetFields();
                // 触发表格刷新
                setSearchParams({ ...searchParams });
            } else {
                message.error(response.message || '更新失败');
            }
        } catch (error) {
            message.error('更新失败');
            console.error('更新失败:', error);
        }
    };

    // 文件上传成功后的处理
    const handleUploadSuccess = (fileInfo: any, resourceData: any) => {
        const newResourceData = {
            ...resourceData,
            fileUrl: fileInfo.url,
            fileSize: fileInfo.size,
            fileType: fileInfo.type,
        };

        // 创建资源记录
        const createResource = type === 'teaching'
            ? createTeachingResource(newResourceData)
            : createExtracurricularResource(newResourceData);

        createResource.then(response => {
            if (response.success) {
                message.success('资源上传成功');
                setUploadModalVisible(false);
                // 触发表格刷新
                setSearchParams({ ...searchParams });
            } else {
                message.error(response.message || '创建资源记录失败');
            }
        }).catch(error => {
            message.error('创建资源记录失败');
            console.error('创建资源记录失败:', error);
        });
    };

    return (
        <div style={{ padding: 24 }}>
            <Card title={title} style={{ marginBottom: 24 }}>
                {/* 搜索表单 */}
                <ResourceSearchForm
                    form={searchForm}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    type={type}
                />
            </Card>

            <Card
                title="资源列表"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setUploadModalVisible(true)}
                    >
                        上传资源
                    </Button>
                }
            >
                {/* 资源表格 */}
                <ResourceTablePanel />
                {/* 注意：ResourceTablePanel组件当前不支持type、searchParams、onEdit和onView属性，需要进一步修改该组件以适配需求 */}
            </Card>

            {/* 编辑模态框 */}
            <Modal
                title="编辑资源"
                open={editModalVisible}
                onOk={handleSaveEdit}
                onCancel={() => {
                    setEditModalVisible(false);
                    setEditingRecord(null);
                    editForm.resetFields();
                }}
                width={800}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                >
                    <Form.Item
                        label="资源名称"
                        name="name"
                        rules={[{ required: true, message: '请输入资源名称' }]}
                    >
                        <input type="text" placeholder="请输入资源名称" />
                    </Form.Item>
                    <Form.Item
                        label="资源描述"
                        name="description"
                    >
                        <textarea rows={4} placeholder="请输入资源描述" />
                    </Form.Item>
                    {/* 这里可以添加更多编辑字段 */}
                </Form>
            </Modal>

            {/* 查看模态框 */}
            <Modal
                title="资源详情"
                open={viewModalVisible}
                onCancel={() => {
                    setViewModalVisible(false);
                    setViewingRecord(null);
                }}
                footer={null}
                width={800}
            >
                {viewingRecord && (
                    <div>
                        <p><strong>资源名称：</strong>{viewingRecord.name}</p>
                        <p><strong>资源描述：</strong>{viewingRecord.description}</p>
                        <p><strong>资源类型：</strong>{viewingRecord.type.name}</p>
                        <p><strong>年级：</strong>{viewingRecord.grade.name}</p>
                        <p><strong>学科：</strong>{viewingRecord.subject.name}</p>
                        <p><strong>审核状态：</strong>{viewingRecord.auditStatus.name}</p>
                        <p><strong>文件大小：</strong>{viewingRecord.fileSize ? `${(viewingRecord.fileSize / 1024 / 1024).toFixed(2)} MB` : '-'}</p>
                        <p><strong>下载次数：</strong>{viewingRecord.downloadCount}</p>
                        <p><strong>创建时间：</strong>{new Date(viewingRecord.createdAt).toLocaleString()}</p>
                        {type === 'teaching' && 'textbookVersion' in viewingRecord && (
                            <>
                                <p><strong>教材版本：</strong>{viewingRecord.textbookVersion.name}</p>
                                <p><strong>册别：</strong>{viewingRecord.volume.name}</p>
                                <p><strong>章节：</strong>{viewingRecord.chapter.name}</p>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* 上传模态框 */}
            <Modal
                title="上传资源"
                open={uploadModalVisible}
                onCancel={() => setUploadModalVisible(false)}
                footer={null}
                width={800}
            >
                <FileUpload
                    onSuccess={handleUploadSuccess}
                    resourceType={type}
                />
            </Modal>
        </div>
    );
};

export default ResourceManagementPage;
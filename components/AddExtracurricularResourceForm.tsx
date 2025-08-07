'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Upload, message, Row, Col } from 'antd';
import { UploadOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { ResourceType } from '../src/services/resourceService';

const { TextArea } = Input;
const { Option } = Select;

interface AddExtracurricularResourceFormProps {
    onCancel?: () => void;
    onSubmit?: (values: any) => void;
    onBack?: () => void;
    resourceTypes?: ResourceType[];
}

const AddExtracurricularResourceForm: React.FC<AddExtracurricularResourceFormProps> = ({ 
    onCancel, 
    onSubmit, 
    onBack,
    resourceTypes = []
}) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 添加调试信息
    useEffect(() => {
        console.log('AddExtracurricularResourceForm 组件已挂载');
        console.log('resourceTypes:', resourceTypes);
        console.log('props:', { onCancel, onSubmit, onBack });
    }, []);

    // 文件上传配置
    const uploadProps: UploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            const isValidType = ['.doc', '.docx', '.pptx', '.ppt', '.mp4', '.jpg', '.png', '.mp3'].some(ext =>
                file.name.toLowerCase().endsWith(ext)
            );
            if (!isValidType) {
                message.error('支持扩展名: .doc .docx .pptx .ppt .mp4 .jpg .png .mp3');
                return false;
            }
            setFileList([...fileList, file as UploadFile]);
            return false; // 阻止自动上传
        },
        fileList,
        onChange: ({ fileList: newFileList }) => {
            setFileList(newFileList);
        },
    };

    // 封面图片上传
    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith('.jpg')) {
                message.error('封面图片只支持 .jpg 格式！');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                setCoverImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // 表单提交
    const handleSubmit = async (values: any) => {
        console.log('表单提交开始:', values);
        setIsLoading(true);
        
        try {
            // 添加文件路径信息
            const formData = {
                ...values,
                filePath: fileList.length > 0 ? fileList[0].name : '',
                coverImage: coverImage,
                description: values.resourceIntro
            };
            
            console.log('课外资源表单数据:', formData);
            
            if (onSubmit) {
                await onSubmit(formData);
            } else {
                console.warn('onSubmit 回调函数未定义');
                message.warning('提交功能未配置');
            }
        } catch (error) {
            console.error('表单提交错误:', error);
            message.error('提交失败，请重试');
        } finally {
            setIsLoading(false);
        }
    };

    // 添加错误边界和调试信息
    console.log('组件正在渲染...');

    return (
        <div 
            style={{ 
                padding: '20px', 
                background: '#f5f5f5', 
                minHeight: '100vh',
                width: '100%',
                boxSizing: 'border-box'
            }}
        >
            {/* 调试信息 - 可以在生产环境中移除 */}
            <div style={{ 
                background: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                padding: '10px', 
                marginBottom: '10px',
                borderRadius: '4px',
                fontSize: '12px'
            }}>
                调试信息: 组件已加载，resourceTypes数量: {resourceTypes?.length || 0}
            </div>

            {/* 面包屑导航 */}
            <div style={{
                fontSize: '14px',
                marginBottom: '20px',
                color: 'black',
                fontWeight: 'bold'
            }}>
                <Button
                    type="link"
                    onClick={() => {
                        console.log('返回按钮被点击');
                        if (onBack) {
                            onBack();
                        } else {
                            console.warn('onBack 回调函数未定义');
                        }
                    }}
                    style={{
                        padding: 0,
                        marginRight: '8px',
                        color: 'black',
                        fontSize: '14px',
                        height: 'auto',
                        fontWeight: 'bold'
                    }}
                >
                    课外资源管理
                </Button>
                》 上传课外资源
            </div>

            {/* 表单内容 */}
            <div style={{ 
                background: '#fff', 
                padding: '24px', 
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        resourceType: resourceTypes && resourceTypes.length > 0 ? resourceTypes[0]._id : ''
                    }}
                    style={{ width: '100%' }}
                >
                    {/* 资源名称 */}
                    <Form.Item
                        label={<span style={{ color: '#333', fontWeight: 500 }}>*资源名称</span>}
                        name="resourceName"
                        rules={[{ required: true, message: '请输入资源名称' }]}
                    >
                        <Input 
                            size="large" 
                            placeholder="请输入课外资源名称"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    {/* 资源类型 */}
                    <Form.Item
                        label={<span style={{ color: '#333', fontWeight: 500 }}>*资源类型</span>}
                        name="resourceType"
                        rules={[{ required: true, message: '请选择资源类型' }]}
                    >
                        <Select 
                            size="large" 
                            placeholder="请选择资源类型"
                            style={{ width: '100%' }}
                            notFoundContent={resourceTypes?.length === 0 ? "暂无资源类型数据" : "未找到匹配项"}
                        >
                            {Array.isArray(resourceTypes) && resourceTypes.map(type => (
                                <Option key={type._id} value={type._id}>{type.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* 资源简介 */}
                    <Form.Item
                        label={<span style={{ color: '#333', fontWeight: 500 }}>资源简介</span>}
                        name="resourceIntro"
                    >
                        <TextArea
                            rows={4}
                            placeholder="请输入课外资源的简介内容..."
                            style={{ resize: 'none', width: '100%' }}
                        />
                    </Form.Item>

                    {/* 文件上传区域 */}
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item label={<span style={{ color: '#333', fontWeight: 500 }}>*上传文件</span>}>
                                <Upload {...uploadProps} listType="text">
                                    <Button size="large" icon={<UploadOutlined />}>上传文件</Button>
                                </Upload>
                                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                                    支持扩展名: .doc .docx .pptx .ppt .mp4 .jpg .png .mp3
                                </div>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={<span style={{ color: '#333', fontWeight: 500 }}>上传封面图</span>}>
                                <div
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        border: '2px dashed #d9d9d9',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        background: coverImage ? `url(${coverImage}) center/cover` : '#fafafa',
                                        position: 'relative'
                                    }}
                                    onClick={() => document.getElementById('extracurricular-cover-upload')?.click()}
                                >
                                    {!coverImage && (
                                        <>
                                            <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
                                            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                                                上传封面图
                                            </div>
                                        </>
                                    )}
                                    {coverImage && (
                                        <Button
                                            type="text"
                                            icon={<CloseOutlined />}
                                            size="small"
                                            style={{
                                                position: 'absolute',
                                                top: '4px',
                                                right: '4px',
                                                background: 'rgba(0,0,0,0.5)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCoverImage(null);
                                            }}
                                        />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept=".jpg"
                                    onChange={handleCoverUpload}
                                    style={{ display: 'none' }}
                                    id="extracurricular-cover-upload"
                                />
                                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                                    支持格式：.jpg，建议尺寸：300x200px
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 提交按钮 */}
                    <Form.Item style={{ marginTop: '40px', textAlign: 'center' }}>
                        <Button
                            onClick={() => {
                                console.log('取消按钮被点击');
                                if (onCancel) {
                                    onCancel();
                                } else if (onBack) {
                                    onBack();
                                } else {
                                    console.warn('取消回调函数未定义');
                                }
                            }}
                            size="large"
                            style={{ marginRight: '16px', width: '120px' }}
                            disabled={isLoading}
                        >
                            取消
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            style={{ width: '120px', backgroundColor: '#1890ff' }}
                            loading={isLoading}
                        >
                            提交
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default AddExtracurricularResourceForm;
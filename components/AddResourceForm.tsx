'use client';

import React, { useState } from 'react';
import { Form, Input, Select, Button, Upload, message, Row, Col, Card } from 'antd';
import { UploadOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { TextArea } = Input;
const { Option } = Select;

interface AddResourceFormProps {
    onCancel?: () => void;
    onSubmit?: (values: any) => void;
}

const AddResourceForm: React.FC<AddResourceFormProps> = ({ onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([
        {
            uid: '-1',
            name: '文档.docx',
            status: 'done',
        },
        {
            uid: '-2',
            name: '组件.png',
            status: 'uploading',
        },
        {
            uid: '-3',
            name: '组件123.jpg',
            status: 'done',
        },
    ]);

    const [coverImage, setCoverImage] = useState<string | null>(null);

    // 课程目录数据
    const courseCatalog = [
        '识字1',
        '1 天地人',
        '2 金木水火土',
        '3 J L H',
        '4 日月水火',
        '5 对歌',
        '口语交际:我说你做',
        '语文园地一'
    ];

    // 文件上传配置
    const uploadProps: UploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            const isValidType = ['.doc', '.docx', '.pptx', '.ppt'].some(ext =>
                file.name.toLowerCase().endsWith(ext)
            );
            if (!isValidType) {
                message.error('只支持 .doc .docx .pptx .ppt 格式的文件！');
                return false;
            }
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
  const handleSubmit = (values: any) => {
    console.log('表单数据:', values);
    
    // 验证文件是否上传
    if (fileList.length === 0) {
      message.error('请至少上传一个文件！');
      return;
    }
    
    // 验证封面图片是否上传
    if (!coverImage) {
      message.warning('建议上传封面图片以提升资源展示效果');
    }
    
    message.success('资源提交成功！');
    onSubmit?.(values);
  };

    return (
        <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
            <Card style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
          教学资源管理 &gt; 新增教学资源
                </div>
            </Card>

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        schoolStage: '小学',
                        version: '人教部编版',
                        volume: '上册',
                        grade: '一年级',
                        subject: '语文',
                        courseCatalog: '我上学了',
                        resourceType: '教案',
                        resourceName: '文档.docx',
                        resourceIntro: ''
                    }}
                >
                    {/* 资源属性区域 */}
                    <Row gutter={16} style={{ marginBottom: '24px' }}>
                        <Col span={12}>
                            <Form.Item label="学段" name="schoolStage" rules={[{ required: true, message: '请选择学段' }]}>
                                <Select>
                                    <Option value="小学">小学</Option>
                                    <Option value="初中">初中</Option>
                                    <Option value="高中">高中</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="版本" name="version" rules={[{ required: true, message: '请选择版本' }]}>
                                <Select>
                                    <Option value="人教部编版">人教部编版</Option>
                                    <Option value="北师大版">北师大版</Option>
                                    <Option value="苏教版">苏教版</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginBottom: '24px' }}>
                        <Col span={8}>
                            <Form.Item label="册次" name="volume" rules={[{ required: true, message: '请选择册次' }]}>
                                <Select>
                                    <Option value="上册">上册</Option>
                                    <Option value="下册">下册</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="年级" name="grade" rules={[{ required: true, message: '请选择年级' }]}>
                                <Select>
                                    <Option value="一年级">一年级</Option>
                                    <Option value="二年级">二年级</Option>
                                    <Option value="三年级">三年级</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="学科" name="subject" rules={[{ required: true, message: '请选择学科' }]}>
                                <Select>
                                    <Option value="语文">语文</Option>
                                    <Option value="数学">数学</Option>
                                    <Option value="英语">英语</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 课程目录区域 */}
                    <Row gutter={16} style={{ marginBottom: '24px' }}>
                        <Col span={12}>
                            <Form.Item label="课程目录" name="courseCatalog" rules={[{ required: true, message: '请选择课程目录' }]}>
                                <Select
                                    showSearch
                                    placeholder="请选择课程目录"
                                    optionFilterProp="children"
                                >
                                    {courseCatalog.map((item, index) => (
                                        <Option key={index} value={item}>
                                            {item}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 资源详情区域 */}
                    <Row gutter={16} style={{ marginBottom: '24px' }}>
                        <Col span={8}>
                            <Form.Item label="资源类型" name="resourceType" rules={[{ required: true, message: '请选择资源类型' }]}>
                                <Select>
                                    <Option value="教案">教案</Option>
                                    <Option value="导学案">导学案</Option>
                                    <Option value="课件">课件</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                label="资源名称"
                                name="resourceName"
                                rules={[{ required: true, message: '请输入资源名称' }]}
                                extra={<span style={{ color: '#faad14', fontSize: '12px' }}>1</span>}
                            >
                                <Input placeholder="请输入资源名称" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="资源简介" name="resourceIntro">
                        <TextArea
                            rows={4}
                            placeholder="请输入资源简介"
                            style={{ resize: 'none' }}
                        />
                    </Form.Item>

                    {/* 文件上传和封面图片区域 */}
                    <Row gutter={16} style={{ marginBottom: '24px' }}>
                        <Col span={12}>
                            <Form.Item label="上传文件">
                                <Upload {...uploadProps} listType="text">
                                    <Button icon={<UploadOutlined />}>上传文件</Button>
                                </Upload>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                    支持扩展名: .doc .docx .pptx .ppt
                                </div>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="上传封面图">
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
                                    onClick={() => document.getElementById('cover-upload')?.click()}
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
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '4px',
                                                right: '4px',
                                                width: '20px',
                                                height: '20px',
                                                background: 'rgba(0,0,0,0.5)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCoverImage(null);
                                            }}
                                        >
                                            <CloseOutlined style={{ fontSize: '12px', color: 'white' }} />
                                        </div>
                                    )}
                                </div>
                                <input
                                    id="cover-upload"
                                    type="file"
                                    accept=".jpg"
                                    style={{ display: 'none' }}
                                    onChange={handleCoverUpload}
                                />
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                    只支持.jpg 格式
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 操作按钮 */}
                    <Form.Item style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Button
                            style={{ marginRight: '16px', borderColor: '#1890ff', color: '#1890ff' }}
                            onClick={onCancel}
                        >
                            取消
                        </Button>
                        <Button type="primary" htmlType="submit">
                            提交
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddResourceForm;
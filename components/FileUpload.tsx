'use client';

import React, { useState } from 'react';
import { Upload, Button, message, Form, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/es/upload/interface';

interface FileUploadProps {
  onSuccess: (fileInfo: any, resourceData: any) => void;
  resourceType: 'teaching' | 'extracurricular';
}

const FileUpload: React.FC<FileUploadProps> = ({ onSuccess, resourceType }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 处理上传成功
  const handleUpload = async (file: UploadFile) => {
    try {
      setLoading(true);

      // 在实际应用中，这里应该调用API上传文件
      // 模拟上传成功，1秒后返回结果
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟文件信息
      const fileInfo = {
        url: `https://example.com/uploads/${file.name}`,
        size: file.size,
        type: file.type,
        name: file.name,
      };

      // 获取表单数据
      const resourceData = await form.validateFields();

      // 调用成功回调
      onSuccess(fileInfo, resourceData);

      message.success('文件上传成功');
    } catch (error) {
      message.error('文件上传失败');
      console.error('文件上传失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Form form={form} layout="vertical">
        <Form.Item
          label="资源名称"
          name="resourceName"
          rules={[{ required: true, message: '请输入资源名称' }]}
        >
          <Input placeholder="请输入资源名称" />
        </Form.Item>

        <Form.Item
          label="资源描述"
          name="description"
        >
          <Input.TextArea rows={4} placeholder="请输入资源描述" />
        </Form.Item>

        {resourceType === 'teaching' && (
          <Form.Item
            label="教材版本"
            name="textbookVersionId"
            rules={[{ required: true, message: '请选择教材版本' }]}
          >
            <Input placeholder="请选择教材版本" />
            {/* 实际应用中这里应该是Select组件 */}
          </Form.Item>
        )}

        <Form.Item
          label="文件上传"
          rules={[{ required: true, message: '请上传文件' }]}
        >
          <Upload
            name="file"
            listType="drag"
            beforeUpload={() => false} // 手动控制上传
            onDrop={(files) => { if (files.length > 0) handleUpload(files[0]); }}
            showUploadList={false}
          >
            <Button
              icon={<UploadOutlined />}
              loading={loading}
              style={{ width: '100%' }}
            >
              点击或拖拽文件到此处上传
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.onchange = (e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleUpload(e.target.files[0] as unknown as UploadFile);
                }
              };
              fileInput.click();
            }}
            loading={loading}
            style={{ width: '100%' }}
          >
            选择文件上传
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FileUpload;
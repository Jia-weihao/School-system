'use client';

import React, { useState } from 'react';
import {
  Button,
  Upload,
  message,
  Row,
  Col,
  Card,
  Modal,
  Image,
  Space,
  Input,
  Select,
  Pagination
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Search } = Input;
const { Option } = Select;

interface ImageItem {
  id: number;
  name: string;
  url: string;
  size: string;
  uploadTime: string;
  category: string;
}

interface ImageGalleryPageProps {
  onBack?: () => void;
}

const ImageGalleryPage: React.FC<ImageGalleryPageProps> = ({ onBack }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 模拟图片数据
  const [imageData, setImageData] = useState<ImageItem[]>([
    {
      id: 1,
      name: '课外活动图片1.jpg',
      url: 'https://via.placeholder.com/300x200/4CAF50/white?text=课外活动1',
      size: '2.5MB',
      uploadTime: '2024-01-15 10:30',
      category: '课外活动'
    },
    {
      id: 2,
      name: '学习资料封面.png',
      url: 'https://via.placeholder.com/300x200/2196F3/white?text=学习资料',
      size: '1.8MB',
      uploadTime: '2024-01-14 15:20',
      category: '学习资料'
    },
    {
      id: 3,
      name: '德育教育图片.jpg',
      url: 'https://via.placeholder.com/300x200/FF9800/white?text=德育教育',
      size: '3.2MB',
      uploadTime: '2024-01-13 09:45',
      category: '德育教育'
    },
    {
      id: 4,
      name: '体育活动照片.jpg',
      url: 'https://via.placeholder.com/300x200/E91E63/white?text=体育活动',
      size: '4.1MB',
      uploadTime: '2024-01-12 14:15',
      category: '体育活动'
    },
    {
      id: 5,
      name: '艺术作品展示.png',
      url: 'https://via.placeholder.com/300x200/9C27B0/white?text=艺术作品',
      size: '2.9MB',
      uploadTime: '2024-01-11 11:30',
      category: '艺术作品'
    },
    {
      id: 6,
      name: '科技创新项目.jpg',
      url: 'https://via.placeholder.com/300x200/607D8B/white?text=科技创新',
      size: '3.5MB',
      uploadTime: '2024-01-10 16:45',
      category: '科技创新'
    }
  ]);

  // 文件上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.jpg,.jpeg,.png,.gif,.bmp,.webp',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('图片大小不能超过 10MB！');
        return false;
      }
      return false; // 阻止自动上传，手动处理
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
  };

  // 处理图片预览
  const handlePreview = (image: ImageItem) => {
    setPreviewImage(image.url);
    setPreviewTitle(image.name);
    setPreviewVisible(true);
  };

  // 删除图片
  const handleDelete = (image: ImageItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除图片"${image.name}"吗？`,
      onOk: () => {
        setImageData(prev => prev.filter(item => item.id !== image.id));
        message.success('删除成功');
      },
    });
  };

  // 上传图片
  const handleUpload = () => {
    if (fileList.length === 0) {
      message.warning('请先选择要上传的图片');
      return;
    }

    // 模拟上传过程
    const newImages = fileList.map((file, index) => ({
      id: imageData.length + index + 1,
      name: file.name,
      url: URL.createObjectURL(file.originFileObj as File),
      size: `${(file.size! / 1024 / 1024).toFixed(1)}MB`,
      uploadTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-'),
      category: '课外活动'
    }));

    setImageData(prev => [...newImages, ...prev]);
    setFileList([]);
    message.success(`成功上传 ${newImages.length} 张图片`);
  };

  // 筛选图片数据
  const filteredImages = imageData.filter(image => {
    const matchesKeyword = image.name.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    return matchesKeyword && matchesCategory;
  });

  // 分页数据
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedImages = filteredImages.slice(startIndex, endIndex);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面标题和返回按钮 */}
      <div style={{
        backgroundColor: '#fff',
        padding: '16px 24px',
        marginBottom: '16px',
        borderRadius: '6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{ marginRight: '12px' }}
          >
            返回
          </Button>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>图片资源管理</h2>
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          共 {filteredImages.length} 张图片
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <div style={{
        backgroundColor: '#fff',
        padding: '24px',
        marginBottom: '16px',
        borderRadius: '6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={8}>
            <Search
              placeholder="搜索图片名称"
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={(value) => setSearchKeyword(value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="选择分类"
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '100%' }}
            >
              <Option value="all">全部分类</Option>
              <Option value="课外活动">课外活动</Option>
              <Option value="学习资料">学习资料</Option>
              <Option value="德育教育">德育教育</Option>
              <Option value="体育活动">体育活动</Option>
              <Option value="艺术作品">艺术作品</Option>
              <Option value="科技创新">科技创新</Option>
            </Select>
          </Col>
          <Col span={10}>
            <Space>
              <Upload {...uploadProps} fileList={fileList} showUploadList={false}>
                <Button icon={<PlusOutlined />}>选择图片</Button>
              </Upload>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleUpload}
                disabled={fileList.length === 0}
              >
                上传图片 ({fileList.length})
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 图片网格展示 */}
      <div style={{
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Row gutter={[16, 16]}>
          {paginatedImages.map((image) => (
            <Col key={image.id} xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card
                hoverable
                cover={
                  <div style={{ height: '200px', overflow: 'hidden' }}>
                    <Image
                      src={image.url}
                      alt={image.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      preview={false}
                    />
                  </div>
                }
                actions={[
                  <EyeOutlined
                    key="preview"
                    onClick={() => handlePreview(image)}
                    style={{ color: '#1890ff' }}
                  />,
                  <DeleteOutlined
                    key="delete"
                    onClick={() => handleDelete(image)}
                    style={{ color: '#ff4d4f' }}
                  />
                ]}
                styles={{ body: { padding: '12px' } }}
              >
                <Card.Meta
                  title={
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'normal',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {image.name}
                    </div>
                  }
                  description={
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div>{image.category}</div>
                      <div>{image.size} • {image.uploadTime}</div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* 分页 */}
        {filteredImages.length > pageSize && (
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            borderTop: '1px solid #f0f0f0',
            paddingTop: '16px'
          }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredImages.length}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `第 ${range[0]}-${range[1]} 张/总共 ${total} 张`
              }
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size || pageSize);
              }}
              pageSizeOptions={['12', '24', '48', '96']}
            />
          </div>
        )}
      </div>

      {/* 图片预览模态框 */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <Image
          src={previewImage}
          alt={previewTitle}
          style={{ width: '100%' }}
        />
      </Modal>
    </div>
  );
};

export default ImageGalleryPage;
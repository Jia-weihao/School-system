'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import { ResourceData, ExtracurricularResourceData } from './types/ResourceTypes';

interface ResourceViewModalProps {
  visible: boolean;
  record: ResourceData | ExtracurricularResourceData | null;
  onClose: () => void;
  isExtracurricular?: boolean;
}

const ResourceViewModal: React.FC<ResourceViewModalProps> = ({
  visible,
  record,
  onClose,
  isExtracurricular = false
}) => {
  const renderTeachingResourceContent = (record: ResourceData) => (
    <>
      {/* 面包屑导航 */}
      <div style={{
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: '20px',
        fontSize: '14px',
        color: '#666'
      }}>
        {`小学 > ${record.year} > ${record.subject} > ${record.version} > ${record.volume} > 1 第一单元 > 数一数 > 1 ${record.resourceName}(${record.resourceType}) 2021-2022学年${record.subject}${record.year}${record.volume}`}
      </div>

      {/* 资源预览区域 */}
      <div style={{
        background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        borderRadius: '8px',
        padding: '40px',
        marginBottom: '20px',
        position: 'relative',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* 模拟课件内容 */}
        <div style={{
          color: 'white',
          textAlign: 'center',
          fontSize: '48px',
          fontWeight: 'bold'
        }}>
          {record.resourceName || '第一讲　数一数'}
        </div>
        <div style={{
          position: 'absolute',
          right: '20px',
          top: '20px',
          color: 'white',
          fontSize: '18px',
          background: 'rgba(255,255,255,0.2)',
          padding: '5px 10px',
          borderRadius: '15px'
        }}>
          主讲：黄老师
        </div>
        {/* 页码指示器 */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          color: 'white',
          background: 'rgba(0,0,0,0.3)',
          padding: '5px 10px',
          borderRadius: '15px',
          fontSize: '14px'
        }}>
          ＜ 1/5 ＞
        </div>
        {/* 装饰元素 */}
        <div style={{
          position: 'absolute',
          left: '50px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '60px'
        }}>
          🏊‍♂️
        </div>
        <div style={{
          position: 'absolute',
          right: '100px',
          top: '30%',
          fontSize: '24px'
        }}>
          🐠🐠🐠
        </div>
      </div>
    </>
  );

  const renderExtracurricularResourceContent = (record: ExtracurricularResourceData) => (
    <>
      {/* 面包屑导航 */}
      <div style={{
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: '20px',
        fontSize: '14px',
        color: '#666'
      }}>
        {`课外资源 > ${record.resourceType} > ${record.resourceName}`}
      </div>

      {/* 资源预览区域 */}
      <div style={{
        background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        borderRadius: '8px',
        padding: '40px',
        marginBottom: '20px',
        position: 'relative',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          color: 'white',
          textAlign: 'center',
          fontSize: '48px',
          fontWeight: 'bold'
        }}>
          {record.resourceName || '课外资源内容'}
        </div>
      </div>
    </>
  );

  return (
    <Modal
      title={record?.resourceName || "资源查看"}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
      width={800}
      style={{ top: 20 }}
    >
      <div style={{ padding: '0' }}>
        {record && (
          isExtracurricular 
            ? renderExtracurricularResourceContent(record as ExtracurricularResourceData)
            : renderTeachingResourceContent(record as ResourceData)
        )}
      </div>
    </Modal>
  );
};

export default ResourceViewModal;
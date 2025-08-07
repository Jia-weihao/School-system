'use client';

import React, { useState } from 'react';
import { Modal, Button, Input } from 'antd';
import { ResourceData, ExtracurricularResourceData } from './types/ResourceTypes';

interface ResourceApprovalModalProps {
  visible: boolean;
  record: ResourceData | ExtracurricularResourceData | null;
  onClose: () => void;
  onSubmit: (approved: boolean) => void;
  isExtracurricular?: boolean;
}

// 自定义单选框样式
const radioStyles = `
  .custom-radio {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid #d9d9d9;
    border-radius: 50%;
    background-color: white;
    margin-right: 8px;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .custom-radio:checked {
    border-color: #1890ff;
    background-color: white;
  }
  
  .custom-radio:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #1890ff;
  }
  
  .custom-radio:hover {
    border-color: #40a9ff;
  }
`;

const ResourceApprovalModal: React.FC<ResourceApprovalModalProps> = ({
  visible,
  record,
  onClose,
  onSubmit,
  isExtracurricular = false
}) => {
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'rejected'>('approved');

  const handleSubmit = () => {
    onSubmit(approvalStatus === 'approved');
  };

  const renderTeachingResourceApproval = (record: ResourceData) => (
    <div style={{ padding: '0' }}>
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

      {/* 审核意见区域 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>审核意见</h4>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="approvalStatus"
              value="approved"
              checked={approvalStatus === 'approved'}
              onChange={() => setApprovalStatus('approved')}
              className="custom-radio"
            />
            审核通过
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="approvalStatus"
              value="rejected"
              checked={approvalStatus === 'rejected'}
              onChange={() => setApprovalStatus('rejected')}
              className="custom-radio"
            />
            审核不通过
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            审核不通过原因
          </label>
          <Input.TextArea
            placeholder="请输入审核不通过的具体原因"
            rows={4}
            style={{
              borderRadius: '6px',
              resize: 'none'
            }}
            disabled={approvalStatus !== 'rejected'}
          />
        </div>
      </div>
    </div>
  );

  const renderExtracurricularResourceApproval = (record: ExtracurricularResourceData) => (
    <div style={{ padding: '0' }}>
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

      {/* 审核意见区域 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>审核意见</h4>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="approvalStatus"
              value="approved"
              checked={approvalStatus === 'approved'}
              onChange={() => setApprovalStatus('approved')}
              className="custom-radio"
            />
            审核通过
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="approvalStatus"
              value="rejected"
              checked={approvalStatus === 'rejected'}
              onChange={() => setApprovalStatus('rejected')}
              className="custom-radio"
            />
            审核不通过
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            审核不通过原因
          </label>
          <Input.TextArea
            placeholder="请输入审核不通过的具体原因"
            rows={4}
            style={{
              borderRadius: '6px',
              resize: 'none'
            }}
            disabled={approvalStatus !== 'rejected'}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      title={record?.resourceName || "资源审核"}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
    >
      <style>{radioStyles}</style>
      {record && (
        isExtracurricular 
          ? renderExtracurricularResourceApproval(record as ExtracurricularResourceData)
          : renderTeachingResourceApproval(record as ResourceData)
      )}
      
      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <Button
          style={{
            marginRight: '10px',
            borderRadius: '6px'
          }}
          onClick={onClose}
        >
          取消
        </Button>
        <Button
          type="primary"
          style={{
            borderRadius: '6px',
            backgroundColor: '#1890ff'
          }}
          onClick={handleSubmit}
        >
          提交审核
        </Button>
      </div>
    </Modal>
  );
};

export default ResourceApprovalModal;
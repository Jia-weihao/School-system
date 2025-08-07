'use client';

// 资源数据类型定义
export interface ResourceData {
  key: string | number;
  id?: number;
  _id: string;
  serialNumber?: number;
  resourceName: string;
  resourceType: string;
  grade?: string;
  gradeLevel?: string;
  year?: string;
  subject?: string;
  version?: string;
  volume?: string;
  chapter?: string;
  status: string;
  uploadDate: string;
  updateTime?: string;
  adminPermission?: string;
  modifyTime?: string;
  approvalStatus?: string;
  originalData?: any;
  // 添加后端返回的字段
  title?: string;
  mainTypeId?: { _id: string; name: string; description?: string };
  subTypeId?: { _id: string; name: string; description?: string };
  gradeId?: { _id: string; name: string; level?: string };
  subjectId?: { _id: string; name: string; category?: string };
  versionId?: { _id: string; name: string; publisher?: string };
  volumeId?: { _id: string; name: string };
  approvalStatusId?: { _id: string; name: string; description?: string };
  permissionTypeId?: { _id: string; name: string; description?: string };
}

// 课外资源数据类型
export interface ExtracurricularResourceData {
  key: string | number;
  id: number;
  resourceName: string;
  resourceType: string;
  adminPermission: string;
  modifyTime: string;
  status: string;
  approvalStatus?: string;
  _id: string; // 添加 _id 字段
  originalData?: any; // 添加原始数据字段
}

// 资源类型数据
export interface ResourceTypeData {
  key: string | number;
  id: number;
  name: string;
  type: string;
  publishMethod: string;
  status: boolean;
  _id: string; // 添加 _id 字段
}

// 资源管理组件属性
export interface ResourceManagementProps {
  type: 'teaching' | 'extracurricular' | 'type';
}

// 模态框属性
export interface ResourceViewModalProps {
  visible: boolean;
  record: ResourceData | ExtracurricularResourceData | null;
  onClose: () => void;
  isExtracurricular?: boolean;
}

export interface ResourceApprovalModalProps {
  visible: boolean;
  record: ResourceData | ExtracurricularResourceData | null;
  onClose: () => void;
  onSubmit: (approved: boolean) => void;
  isExtracurricular?: boolean;
}

// 表单提交数据类型
export interface FormSubmitData {
  resourceName: string;
  resourceType: string;
  grade?: string;
  subject?: string;
  version?: string;
  volume?: string;
  courseCatalog?: string;
  description?: string;
  filePath?: string;
  targetAudience?: string;
  difficultyLevel?: string;
}
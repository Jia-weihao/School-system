import axios, { AxiosProgressEvent } from 'axios';

// API 基础 URL - 使用127.0.0.1替代localhost
const API_BASE_URL = 'https://school.blxg.asia';

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 添加请求拦截器
axiosInstance.interceptors.request.use(config => {
  console.log('发送请求:', config.method?.toUpperCase(), config.url);

  // 添加认证令牌
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 只添加时间戳，避免缓存控制头导致CORS问题
  const timestamp = Date.now();
  if (config.url && config.url.includes('?')) {
    config.url += `&_t=${timestamp}`;
  } else {
    config.url += `?_t=${timestamp}`;
  }

  return config;
}, error => {
  console.error('请求拦截器错误:', error);
  return Promise.reject(error);
});

// 添加响应拦截器
axiosInstance.interceptors.response.use(
  response => {
    console.log('收到响应:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('请求失败:', error);

    if (error.response?.status === 401) {
      console.error('认证失败，请重新登录');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('连接被拒绝，请检查后端服务器');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('网络错误，请检查网络连接和CORS配置');
    }

    return Promise.reject(error);
  }
);

// 类型定义
export interface AuditStatus {
  _id: string;
  name: string;
  description: string;
  status: boolean;
}

export interface ResourceType {
  _id: string;
  name: string;
  description: string;
  status: boolean;
}

// 主资源类型接口
export interface MainResourceType {
  _id: string;
  name: string;
  description?: string;
  status: boolean; // 修复：使用 status 而不是 isActive
  createdAt: string;
  updatedAt: string;
}

// 子资源类型接口
export interface SubResourceType {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  _id: string;
  name: string;
  level: number;
  status: boolean;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  status: boolean;
}

export interface TextbookVersion {
  _id: string;
  name: string;
  publisher: string;
  status: boolean;
}

export interface Volume {
  _id: string;
  name: string;
  semester: number;
  status: boolean;
}

export interface Chapter {
  _id: string;
  name: string;
  order: number;
  subjectId: string;
  volumeId: string;
  status: boolean;
}

// 添加缺少的类型定义
export interface PermissionType {
  _id: string;
  name: string;
  description?: string;
  status: boolean;
}

export interface ResourceStatus {
  _id: string;
  name: string;
  description?: string;
  status: boolean;
}

export interface TeachingResource {
  _id: string;
  name: string;
  description: string;
  type: ResourceType;
  grade: Grade;
  subject: Subject;
  textbookVersion: TextbookVersion;
  volume: Volume;
  chapter: Chapter;
  auditStatus: AuditStatus;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ExtracurricularResource {
  uploadDate: string;
  approvalStatusId: any;
  mainTypeId: any;
  resourceName: string;
  _id: string;
  name: string;
  description: string;
  type: ResourceType;
  grade: Grade;
  subject: Subject;
  auditStatus: AuditStatus;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateTeachingResourceData {
  resourceName: string;
  description?: string;
  mainTypeId: string;
  gradeId?: string;
  subjectId?: string;
  versionId?: string;
  volumeId?: string;
  chapterId?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
}

export interface CreateExtracurricularResourceData {
  name: string;
  description?: string;
  typeId: string;
  gradeId?: string;
  subjectId?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
}

// API 函数

// 获取主资源类型列表
export const getMainResourceTypes = async () => {
  try {
    const response = await axiosInstance.get('/api/resource/main-types');
    return response.data;
  } catch (error: any) {
    console.error('获取主资源类型错误:', error);
    throw error;
  }
};

// 获取子资源类型列表
export const getSubResourceTypes = async (mainTypeId: string) => {
  try {
    const response = await axiosInstance.get(`/api/resource/sub-types?mainTypeId=${mainTypeId}`);
    return response.data;
  } catch (error: any) {
    console.error('获取子资源类型失败:', error);
    throw new Error(`获取子资源类型失败: ${error.message || '未知错误'}`);
  }
};

// 获取审核状态列表
export const getAuditStatuses = async () => {
  try {
    const response = await axiosInstance.get('/api/resource/audit-statuses');
    return response.data;
  } catch (error: any) {
    console.error('获取审核状态失败:', error);
    throw new Error(`获取审核状态失败: ${error.message || '未知错误'}`);
  }
};

// 获取资源类型列表 - 支持分页和搜索
export const getResourceTypes = async (params: {
  page?: number;
  limit?: number;
  typeName?: string;
  status?: string;
  category?: string;
} = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/api/resource/types?${queryString}` : '/api/resource/types';

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    console.error('获取资源类型失败:', error);
    throw new Error(`获取资源类型失败: ${error.message || '未知错误'}`);
  }
};

// 创建资源类型
export const createResourceType = async (data: {
  typeName: string;
  description?: string;
}) => {
  try {
    const response = await axiosInstance.post('/api/resource/types', data);
    return response.data;
  } catch (error: any) {
    console.error('创建资源类型失败:', error);
    throw new Error(`创建资源类型失败: ${error.response?.data?.message || error.message || '网络错误'}`);
  }
};

// 更新资源类型
export const updateResourceType = async (id: string, data: {
  typeName: string;
  description?: string;
  status?: boolean;
}) => {
  try {
    const response = await axiosInstance.put(`/api/resource/types/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('更新资源类型失败:', error);
    throw new Error(`更新资源类型失败: ${error.response?.data?.message || error.message || '网络错误'}`);
  }
};

// 删除资源类型
export const deleteResourceType = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/api/resource/types/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('删除资源类型失败:', error);
    throw new Error(`删除资源类型失败: ${error.response?.data?.message || error.message || '网络错误'}`);
  }
};

// 获取年级列表
export const getGrades = async () => {
  try {
    const response = await axiosInstance.get('/api/resource/grades');
    return response.data;
  } catch (error: any) {
    console.error('获取年级失败:', error);
    throw new Error(`获取年级失败: ${error.message || '未知错误'}`);
  }
};

// 获取学科列表
export const getSubjects = async () => {
  try {
    const response = await axiosInstance.get('/api/resource/subjects');
    return response.data;
  } catch (error: any) {
    console.error('获取学科失败:', error);
    throw new Error(`获取学科失败: ${error.message || '未知错误'}`);
  }
};

// 获取教材版本列表
export const getTextbookVersions = async () => {
  try {
    const response = await axiosInstance.get('/api/resource/versions');
    return response.data;
  } catch (error: any) {
    console.error('获取教材版本失败:', error);
    throw new Error(`获取教材版本失败: ${error.message || '未知错误'}`);
  }
};

// 获取册次列表
export const getVolumes = async () => {
  try {
    const response = await axiosInstance.get('/api/resource/volumes');
    return response.data;
  } catch (error: any) {
    console.error('获取册次失败:', error);
    throw new Error(`获取册次失败: ${error.message || '未知错误'}`);
  }
};

// 获取章节列表
export const getChapters = async (params?: {
  gradeId?: string;
  subjectId?: string;
  versionId?: string;
  volumeId?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.gradeId) queryParams.append('gradeId', params.gradeId);
    if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
    if (params?.versionId) queryParams.append('versionId', params.versionId);
    if (params?.volumeId) queryParams.append('volumeId', params.volumeId);

    const response = await axiosInstance.get(`/api/resource/chapters?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('获取章节列表失败:', error);
    throw error;
  }
};

// 获取教学资源列表
export const getTeachingResources = async (params: {
  page?: number;
  limit?: number;
  resourceName?: string;
  mainTypeId?: string;
  gradeId?: string;
  year?: string;
  subjectId?: string;
  versionId?: string;
  volumeId?: string;
  chapter?: string;
  approvalStatusId?: string;
  startDate?: string;
  endDate?: string;
} = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/api/resource/teaching?${queryString}` : '/api/resource/teaching';

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    console.error('获取教学资源失败:', error);
    throw new Error(`获取教学资源失败: ${error.message || '网络错误'}`);
  }
};

// 获取课外资源列表
export const getExtracurricularResources = async (params: {
  page?: number;
  limit?: number;
  resourceName?: string;
  mainTypeId?: string;
  gradeId?: string;
  subjectId?: string;
  approvalStatusId?: string;
  startDate?: string;
  endDate?: string;
} = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/api/resource/extracurricular?${queryString}` : '/api/resource/extracurricular';

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    console.error('获取课外资源失败:', error);
    throw new Error(`获取课外资源失败: ${error.message || '网络错误'}`);
  }
};

// 创建教学资源
export const createTeachingResource = async (data: CreateTeachingResourceData) => {
  try {
    const response = await axiosInstance.post('/api/resource/teaching', data);
    return response.data;
  } catch (error: any) {
    console.error('创建教学资源失败:', error);
    throw new Error(`创建教学资源失败: ${error.message || '网络错误'}`);
  }
};

// 更新教学资源
export const updateTeachingResource = async (id: string, data: Partial<CreateTeachingResourceData>) => {
  try {
    const response = await axiosInstance.put(`/api/resource/teaching/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('更新教学资源失败:', error);
    throw new Error(`更新教学资源失败: ${error.message || '网络错误'}`);
  }
};

// 删除教学资源
export const deleteTeachingResource = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/api/resource/teaching/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('删除教学资源失败:', error);
    throw new Error(`删除教学资源失败: ${error.message || '网络错误'}`);
  }
};

// 批量删除教学资源
export const batchDeleteTeachingResources = async (ids: string[]) => {
  try {
    const response = await axiosInstance.post('/api/resource/teaching/batch-delete', { ids });
    return response.data;
  } catch (error: any) {
    console.error('批量删除教学资源失败:', error);
    throw new Error(`批量删除教学资源失败: ${error.message || '网络错误'}`);
  }
};

// 批量审核教学资源
export const batchAuditTeachingResources = async (ids: string[], approvalStatusId: string, approvalReason?: string) => {
  try {
    const response = await axiosInstance.post('/api/resource/teaching/batch-audit', {
      ids,
      approvalStatusId,
      approvalReason
    });
    return response.data;
  } catch (error: any) {
    console.error('批量审核教学资源失败:', error);
    throw new Error(`批量审核教学资源失败: ${error.message || '网络错误'}`);
  }
};

// 删除第447行的第一个auditResource函数，保留第633行的修复版本
// 删除这个重复的函数声明（第447-460行左右）:
// export const auditResource = async (id: string, approvalStatusId: string, type: 'teaching' | 'extracurricular', approvalReason?: string) => {
//   try {
//     const endpoint = type === 'teaching'
//       ? `/api/resource/teaching/${id}/audit`
//       : `/api/resource/extracurricular/${id}/audit`;
//
//     const response = await axiosInstance.put(endpoint, {
//       approvalStatusId,
//       approvalReason
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error('审核资源失败:', error);
//     throw new Error(`审核资源失败: ${error.message || '网络错误'}`);
//   }
// };

// 下载资源
export const downloadResource = async (id: string, type: 'teaching' | 'extracurricular') => {
  try {
    const response = await axiosInstance.get(`/api/resource/${type}/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error('下载资源失败:', error);
    throw new Error(`下载资源失败: ${error.message || '网络错误'}`);
  }
};

// 导出资源
export const exportResources = async (type: 'teaching' | 'extracurricular', ids?: string[]) => {
  try {
    const response = await axiosInstance.post('/api/resource/export', {
      type,
      ids,
      format: 'json'
    });
    return response.data;
  } catch (error: any) {
    console.error('导出资源失败:', error);
    throw new Error(`导出资源失败: ${error.message || '网络错误'}`);
  }
};

// 文件上传
export const uploadFile = async (
  file: File,
  onProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/api/resource/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });

    return response.data;
  } catch (error: any) {
    console.error('文件上传失败:', error);
    throw new Error(`文件上传失败: ${error.message || '网络错误'}`);
  }
};

// 获取资源统计信息
export const getResourceStatistics = async () => {
  try {
    const response = await axiosInstance.get('/api/resource/statistics');
    return response.data;
  } catch (error: any) {
    console.error('获取资源统计失败:', error);
    throw new Error(`获取资源统计失败: ${error.message || '网络错误'}`);
  }
};

// 获取课程目录选项
export const getCourseCatalogs = async (params?: {
  gradeId?: string;
  subjectId?: string;
  versionId?: string;
  volumeId?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.gradeId) queryParams.append('gradeId', params.gradeId);
    if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
    if (params?.versionId) queryParams.append('versionId', params.versionId);
    if (params?.volumeId) queryParams.append('volumeId', params.volumeId);

    const response = await axiosInstance.get(`/api/resource/course-catalogs?${queryParams}`);
    return response.data;
  } catch (error: any) {
    console.error('获取课程目录失败:', error);
    throw new Error(`获取课程目录失败: ${error.message || '网络错误'}`);
  }
};

// 获取资源状态列表
export const getResourceStatuses = async () => {
  try {
    const response = await axiosInstance.get('/api/resource/resource-statuses');
    return response.data;
  } catch (error: any) {
    console.error('获取资源状态失败:', error);
    throw new Error(`获取资源状态失败: ${error.message || '网络错误'}`);
  }
};

// 获取权限类型列表
export const getPermissionTypes = async () => {
  try {
    const response = await axiosInstance.get('/api/resource/permission-types');
    return response.data;
  } catch (error: any) {
    console.error('获取权限类型失败:', error);
    throw new Error(`获取权限类型失败: ${error.message || '网络错误'}`);
  }
};

// 创建课外资源
export const createExtracurricularResource = async (data: CreateExtracurricularResourceData) => {
  try {
    // 将前端字段映射到后端期望的字段
    const requestData = {
      resourceName: data.name,
      mainTypeId: data.typeId,
      description: data.description || '',
      // 可以添加其他字段的默认值
      tags: [],
      duration: 0
    };

    console.log('发送课外资源创建请求:', requestData);

    const response = await axiosInstance.post('/api/resource/extracurricular/json', requestData);
    return response.data;
  } catch (error: any) {
    console.error('创建课外资源失败:', error);
    throw new Error(`创建课外资源失败: ${error.response?.data?.message || error.message || '网络错误'}`);
  }
};

// 更新课外资源
export const updateExtracurricularResource = async (id: string, data: Partial<CreateExtracurricularResourceData>) => {
  try {
    const response = await axiosInstance.put(`/api/resource/extracurricular/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('更新课外资源失败:', error);
    throw new Error(`更新课外资源失败: ${error.message || '网络错误'}`);
  }
};

// 删除课外资源 - 修复版本
export const deleteExtracurricularResource = async (id: string) => {
  try {
    console.log('发送删除请求，ID:', id);
    const response = await axiosInstance.delete(`/api/resource/extracurricular/${id}`);
    console.log('删除响应:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('删除课外资源失败:', error);
    console.error('错误详情:', error.response?.data);
    throw error; // 直接抛出错误，让调用方处理
  }
};

// 批量删除课外资源 - 修复版本
export const batchDeleteExtracurricularResources = async (ids: string[]) => {
  try {
    console.log('发送批量删除请求，IDs:', ids);
    const response = await axiosInstance.post('/api/resource/extracurricular/batch-delete', { ids });
    console.log('批量删除响应:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('批量删除课外资源失败:', error);
    console.error('错误详情:', error.response?.data);
    throw error; // 直接抛出错误，让调用方处理
  }
};

// 审核资源 - 修复版本
export const auditResource = async (id: string, approvalStatusId: string, type: 'teaching' | 'extracurricular', approvalReason?: string) => {
  try {
    const endpoint = type === 'teaching'
      ? `/api/resource/teaching/${id}/audit`
      : `/api/resource/extracurricular/${id}/audit`;

    console.log('发送审核请求:', { endpoint, id, approvalStatusId, approvalReason });

    const response = await axiosInstance.put(endpoint, {
      approvalStatusId,
      approvalReason: approvalReason || ''
    });

    console.log('审核响应:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('审核资源失败:', error);
    console.error('错误详情:', error.response?.data);
    throw error; // 直接抛出错误，让调用方处理
  }
};

// 获取课外资源基础数据
export const getExtracurricularBasicData = async () => {
  try {
    const response = await axiosInstance.get('/api/resource/extracurricular/basic-data');
    return response.data;
  } catch (error: any) {
    console.error('获取课外资源基础数据失败:', error);
    throw new Error(`获取课外资源基础数据失败: ${error.message || '网络错误'}`);
  }
};

// 获取目标受众列表
export const getTargetAudiences = async () => {
  try {
    const response = await axiosInstance.get('/api/resource/target-audiences');
    return response.data;
  } catch (error: any) {
    console.error('获取目标受众失败:', error);
    throw new Error(`获取目标受众失败: ${error.message || '网络错误'}`);
  }
};

// 获取难度等级列表
export const getDifficultyLevels = async () => {
  try {
    const response = await axiosInstance.get('/api/resource/difficulty-levels');
    return response.data;
  } catch (error: any) {
    console.error('获取难度等级失败:', error);
    throw new Error(`获取难度等级失败: ${error.message || '网络错误'}`);
  }
};
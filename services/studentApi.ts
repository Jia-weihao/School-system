// 学生数据接口
import API_BASE_URL from '../app/tools/api';

export interface StudentData {
  id: string;
  name: string;
  gender: string;
  studentId: string;
  idNumber: string;
  school: string;
  grade: string;
  class: string;
  selected: boolean;
}

// 后端数据格式（包含可能的字段变体）
interface BackendStudent {
  _id?: string;
  name?: string;
  xingbie?: string;      // 性别
  gender?: string;       // 性别的其他可能字段名
  studentId?: string;
  zhengjianhao?: string; // 证件号码
  idNumber?: string;     // 证件号码的其他可能字段名
  school?: string;
  njclass?: string;      // 年级
  grade?: string;        // 年级的其他可能字段名
  xingzhengclass?: string; // 行政班级
  class?: string;        // 班级的其他可能字段名
  [key: string]: any;    // 允许其他字段
}

// 数据转换函数
const transformBackendToFrontend = (backendData: BackendStudent): StudentData => {
  console.log('正在转换数据:', backendData);
  
  const result = {
    id: backendData._id || `temp_${Date.now()}_${Math.random()}`,
    name: backendData.name || '',
    gender: backendData.xingbie || backendData.gender || '',  // 兼容不同字段名
    studentId: backendData.studentId || '',
    idNumber: backendData.zhengjianhao || backendData.idNumber || '',  // 兼容不同字段名
    school: backendData.school || '',
    grade: backendData.njclass || backendData.grade || '',  // 兼容不同字段名
    class: backendData.xingzhengclass || backendData.class || '',  // 兼容不同字段名
    selected: false
  };
  
  console.log('转换结果:', result);
  return result;
};

// API函数
export const studentApi = {
  // 获取所有学生
  async getAllStudents(): Promise<StudentData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/addstudent`);
      
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('后端返回的原始数据:', data);
      
      // 处理数据格式
      const students = Array.isArray(data) ? data : [];
      
      // 详细分析第一条数据
      if (students.length > 0) {
        console.log('第一条原始数据详情:', students[0]);
        console.log('可用字段:', Object.keys(students[0]));
        console.log('字段值检查:', {
          name: students[0].name,
          xingbie: students[0].xingbie,
          studentId: students[0].studentId,
          zhengjianhao: students[0].zhengjianhao,
          school: students[0].school,
          njclass: students[0].njclass,
          xingzhengclass: students[0].xingzhengclass
        });
      }
      
      // 转换数据格式
      const transformedStudents = students.map(transformBackendToFrontend);
      console.log('转换后的数据:', transformedStudents);
      
      // 详细检查转换后的第一条数据
      if (transformedStudents.length > 0) {
        console.log('第一条转换后数据详情:', transformedStudents[0]);
      }
      
      return transformedStudents;
    } catch (error) {
      console.error('获取学生数据失败:', error);
      throw error;
    }
  }
};
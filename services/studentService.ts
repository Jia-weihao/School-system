// 学生成绩服务

// API基础URL
const API_URL = 'https://47.76.85.140';

// 学生成绩接口
export interface StudentGrade {
  _id?: string;
  id?: number; // 前端使用的ID
  name: string;
  math: number;
  chinese: number;
  english: number;
  physics: number;
  chemistry: number;
  biology: number;
  averageScore?: string; // 后端计算的虚拟属性
  createdAt?: string;
  updatedAt?: string;
}

// 获取所有学生成绩
export const getAllStudents = async (): Promise<StudentGrade[]> => {
  try {
    const response = await fetch(`${API_URL}/api/students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`获取学生成绩失败: ${response.status}`);
    }

    const result = await response.json();
    
    // 转换后端数据格式为前端格式
    return result.data.map((student: any, index: number) => ({
      ...student,
      id: index + 1, // 为前端添加一个连续的ID
    }));
  } catch (error) {
    console.error('获取学生成绩错误:', error);
    throw error;
  }
};

// 获取单个学生成绩
export const getStudentById = async (id: string): Promise<StudentGrade> => {
  try {
    const response = await fetch(`${API_URL}/api/students/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`获取学生成绩失败: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('获取学生成绩错误:', error);
    throw error;
  }
};

// 创建学生成绩
export const createStudent = async (student: StudentGrade): Promise<StudentGrade> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未授权，请先登录');
    }

    const response = await fetch(`${API_URL}/api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(student),
    });

    if (!response.ok) {
      throw new Error(`创建学生成绩失败: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('创建学生成绩错误:', error);
    throw error;
  }
};

// 更新学生成绩
export const updateStudent = async (id: string, student: Partial<StudentGrade>): Promise<StudentGrade> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未授权，请先登录');
    }

    const response = await fetch(`${API_URL}/api/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(student),
    });

    if (!response.ok) {
      throw new Error(`更新学生成绩失败: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('更新学生成绩错误:', error);
    throw error;
  }
};

// 删除学生成绩
export const deleteStudent = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未授权，请先登录');
    }

    const response = await fetch(`${API_URL}/api/students/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`删除学生成绩失败: ${response.status}`);
    }
  } catch (error) {
    console.error('删除学生成绩错误:', error);
    throw error;
  }
};

// 批量创建学生成绩（用于导入数据）
export const createManyStudents = async (students: StudentGrade[]): Promise<StudentGrade[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未授权，请先登录');
    }

    const response = await fetch(`${API_URL}/api/students/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(students),
    });

    if (!response.ok) {
      throw new Error(`批量创建学生成绩失败: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('批量创建学生成绩错误:', error);
    throw error;
  }
};
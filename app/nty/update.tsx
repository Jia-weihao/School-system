'use client';
import { useState, useImperativeHandle, forwardRef } from 'react';
import API_BASE_URL from '../tools/api';
import styles from './correct.module.css';
import { updateStudent, deleteStudent, createStudent, StudentGrade } from '../../services/studentService';

interface UpdateComponentProps {
  studentData: StudentGrade[];
  setStudentData: React.Dispatch<React.SetStateAction<StudentGrade[]>>;
  onOpenAddForm?: () => void;
}

const UpdateComponent = forwardRef<{ openAddForm: () => void }, UpdateComponentProps>(({ studentData, setStudentData }, ref) => {
  // 编辑表单状态
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    math: 0,
    chinese: 0,
    english: 0,
    physics: 0,
    chemistry: 0,
    biology: 0
  });

  // 添加学生表单状态
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    math: 0,
    chinese: 0,
    english: 0,
    physics: 0,
    chemistry: 0,
    biology: 0
  });

  // 处理学生删除
  const handleDeleteStudent = async (studentId: string) => {
    if (!studentId) return;

    if (window.confirm('确定要删除这名学生的成绩记录吗？')) {
      try {
        await deleteStudent(studentId);
        // 更新本地数据
        setStudentData(prevData => prevData.filter(student => student._id !== studentId));
        alert('删除成功！');
      } catch (err) {
        console.error('删除学生失败:', err);
        alert('删除失败，请稍后重试');
      }
    }
  };

  // 处理学生编辑
  const handleEditStudent = async (studentId: string, updatedFields: Partial<StudentGrade>) => {
    if (!studentId) return;

    try {
      const updatedStudent = await updateStudent(studentId, updatedFields);
      // 更新本地数据
      setStudentData(prevData =>
        prevData.map(student =>
          student._id === studentId ? { ...student, ...updatedStudent } : student
        )
      );
    } catch (err) {
      console.error('更新学生失败:', err);
      alert('更新失败，请稍后重试');
    }
  };

  // 打开编辑表单
  const handleOpenEditForm = (student: any) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name,
      math: student.math,
      chinese: student.chinese,
      english: student.english,
      physics: student.physics,
      chemistry: student.chemistry,
      biology: student.biology
    });
    setShowEditForm(true);
  };

  // 关闭编辑表单
  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingStudent(null);
    setEditFormData({
      name: '',
      math: 0,
      chinese: 0,
      english: 0,
      physics: 0,
      chemistry: 0,
      biology: 0
    });
  };

  // 提交编辑表单
  const handleSubmitEdit = async () => {
    if (!editingStudent) return;

    try {
      // 验证数据
      if (!editFormData.name.trim()) {
        alert('请输入学生姓名');
        return;
      }

      const subjects = ['math', 'chinese', 'english', 'physics', 'chemistry', 'biology'];
      for (const subject of subjects) {
        const score = editFormData[subject as keyof typeof editFormData];
        if (typeof score !== 'number' || score < 0 || score > 100) {
          alert(`${subject === 'math' ? '数学' : subject === 'chinese' ? '语文' : subject === 'english' ? '英语' : subject === 'physics' ? '物理' : subject === 'chemistry' ? '化学' : '生物'}成绩必须在0-100之间`);
          return;
        }
      }

      // 如果有_id（后端数据），则调用API更新
      if (editingStudent._id) {
        await handleEditStudent(editingStudent._id, editFormData);
      } else {
        // 否则只更新本地数据（适用于外部传入的数据）
        const updatedStudentData = studentData.map(s => {
          if (s.id === editingStudent.id) {
            return { ...s, ...editFormData };
          }
          return s;
        });
        setStudentData(updatedStudentData);
      }

      // 关闭表单
      handleCloseEditForm();
      alert('学生信息更新成功！');
    } catch (error) {
      console.error('更新学生信息失败:', error);
      alert('更新失败，请稍后重试');
    }
  };

  // 打开添加学生表单
  const handleOpenAddForm = () => {
    setAddFormData({
      name: '',
      math: 0,
      chinese: 0,
      english: 0,
      physics: 0,
      chemistry: 0,
      biology: 0
    });
    setShowAddForm(true);
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    openAddForm: handleOpenAddForm,
    deleteStudent: handleDeleteStudent,
    openEditForm: handleOpenEditForm
  }));

  // 关闭添加学生表单
  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setAddFormData({
      name: '',
      math: 0,
      chinese: 0,
      english: 0,
      physics: 0,
      chemistry: 0,
      biology: 0
    });
  };

  // 处理添加表单输入变化
  const handleAddFormInputChange = (field: string, value: string | number) => {
    setAddFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 提交添加学生表单
  const handleSubmitAdd = async () => {
    try {
      // 验证数据
      if (!addFormData.name.trim()) {
        alert('请输入学生姓名');
        return;
      }

      const subjects = ['math', 'chinese', 'english', 'physics', 'chemistry', 'biology'];
      for (const subject of subjects) {
        const score = addFormData[subject as keyof typeof addFormData];
        if (typeof score !== 'number' || score < 0 || score > 100) {
          alert(`${subject === 'math' ? '数学' : subject === 'chinese' ? '语文' : subject === 'english' ? '英语' : subject === 'physics' ? '物理' : subject === 'chemistry' ? '化学' : '生物'}成绩必须在0-100之间`);
          return;
        }
      }

      // 创建新学生对象
      const newStudent: StudentGrade = {
        ...addFormData,
        id: studentData.length + 1, // 临时ID
      };

      try {
        // 调用API创建学生
        const token = localStorage.getItem('token');
        if (!token) {
          alert('请先登录');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/students`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(addFormData),
        });

        if (!response.ok) {
          throw new Error(`添加失败: ${response.status}`);
        }

        const result = await response.json();
        
        // 更新本地数据
        const createdStudent = {
          ...result.data,
          id: studentData.length + 1
        };
        setStudentData(prevData => [...prevData, createdStudent]);
        
        // 关闭表单
        handleCloseAddForm();
        alert('学生成绩添加成功！');
      } catch (error) {
        console.error('添加学生失败:', error);
        // 如果API调用失败，仍然添加到本地数据（用于演示）
        setStudentData(prevData => [...prevData, newStudent]);
        handleCloseAddForm();
        alert('学生成绩添加成功！（本地模式）');
      }
    } catch (error) {
      console.error('添加学生信息失败:', error);
      alert('添加失败，请稍后重试');
    }
  };

  // 处理表单输入变化
  const handleFormInputChange = (field: string, value: string | number) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      {/* 编辑学生信息模态框 */}
      {showEditForm && editingStudent && (
        <div className={styles.reportCardModal}>
          <div className={styles.reportCardContent} style={{ maxWidth: '600px' }}>
            <div className={styles.reportCardHeader}>
              <h2>编辑学生信息</h2>
              <button
                className={styles.closeButton}
                onClick={handleCloseEditForm}
              >
                ×
              </button>
            </div>
            <div className={styles.reportCardBody}>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitEdit(); }}>
                <div className={styles.editFormGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>姓名</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editFormData.name}
                      onChange={(e) => handleFormInputChange('name', e.target.value)}
                      placeholder="请输入学生姓名"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>数学</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={editFormData.math}
                      onChange={(e) => handleFormInputChange('math', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      placeholder="0-100"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>语文</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={editFormData.chinese}
                      onChange={(e) => handleFormInputChange('chinese', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      placeholder="0-100"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>英语</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={editFormData.english}
                      onChange={(e) => handleFormInputChange('english', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      placeholder="0-100"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>物理</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={editFormData.physics}
                      onChange={(e) => handleFormInputChange('physics', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      placeholder="0-100"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>化学</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={editFormData.chemistry}
                      onChange={(e) => handleFormInputChange('chemistry', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      placeholder="0-100"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>生物</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={editFormData.biology}
                      onChange={(e) => handleFormInputChange('biology', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      placeholder="0-100"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className={styles.reportCardFooter}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCloseEditForm}
              >
                取消
              </button>
              <button
                type="button"
                className={styles.exportButton}
                onClick={handleSubmitEdit}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加学生信息模态框 */}
      {showAddForm && (
        <div className={styles.reportCardModal}>
          <div className={styles.reportCardContent} style={{ maxWidth: '600px' }}>
            <div className={styles.reportCardHeader}>
              <h2>添加学生成绩</h2>
              <button
                className={styles.closeButton}
                onClick={handleCloseAddForm}
              >
                ×
              </button>
            </div>
            <div className={styles.reportCardBody}>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitAdd(); }}>
                <div className={styles.editFormGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>姓名</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={addFormData.name}
                      onChange={(e) => handleAddFormInputChange('name', e.target.value)}
                      placeholder="请输入学生姓名"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>数学</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={addFormData.math}
                      onChange={(e) => handleAddFormInputChange('math', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      placeholder="0-100"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>语文</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={addFormData.chinese}
                      onChange={(e) => handleAddFormInputChange('chinese', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      placeholder="0-100"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>英语</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={addFormData.english}
                      onChange={(e) => handleAddFormInputChange('english', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      placeholder="0-100"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>物理</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={addFormData.physics}
                      onChange={(e) => handleAddFormInputChange('physics', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      placeholder="0-100"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>化学</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={addFormData.chemistry}
                      onChange={(e) => handleAddFormInputChange('chemistry', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      placeholder="0-100"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>生物</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={addFormData.biology}
                      onChange={(e) => handleAddFormInputChange('biology', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      placeholder="0-100"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className={styles.reportCardFooter}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCloseAddForm}
              >
                取消
              </button>
              <button
                type="button"
                className={styles.exportButton}
                onClick={handleSubmitAdd}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

// 导出组件和类型定义
export default UpdateComponent;
export type { UpdateComponentProps };
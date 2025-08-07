import React, { useState, useEffect } from 'react';

interface StudentData {
  id: number;
  name: string;
  studentId: string;
  grade: string;
}

interface CoursePermissionData {
  [courseName: string]: {
    hasPermission: boolean;
    limitedStudents: StudentData[];
  };
}

interface CoursePermissionFormProps {
  onDataChange?: (data: any) => void;
  initialData?: any;
}

const CoursePermissionForm: React.FC<CoursePermissionFormProps> = ({
  onDataChange,
  initialData = {}
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('语文');
  const [coursePermissions, setCoursePermissions] = useState<CoursePermissionData>({
    '语文': { hasPermission: false, limitedStudents: [] },
    '数学': { hasPermission: false, limitedStudents: [] },
    '英语': { hasPermission: false, limitedStudents: [] },
    '历史': { hasPermission: false, limitedStudents: [] },
    '政治': { hasPermission: false, limitedStudents: [] },
    '化学': { hasPermission: false, limitedStudents: [] },
    '物理': { hasPermission: false, limitedStudents: [] }
  });

  // 学生权限设置相关状态
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [availableStudents, setAvailableStudents] = useState<StudentData[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // 数据持久化
  useEffect(() => {
    const savedData = localStorage.getItem('coursePermissionData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const defaultPermissions = {
        '语文': { hasPermission: false, limitedStudents: [] },
        '数学': { hasPermission: false, limitedStudents: [] },
        '英语': { hasPermission: false, limitedStudents: [] },
        '历史': { hasPermission: false, limitedStudents: [] },
        '政治': { hasPermission: false, limitedStudents: [] },
        '化学': { hasPermission: false, limitedStudents: [] },
        '物理': { hasPermission: false, limitedStudents: [] }
      };
      setSelectedCourse(parsed.selectedCourse || '语文');
      setCoursePermissions(parsed.coursePermissions || defaultPermissions);
    }
  }, []);

  useEffect(() => {
    const data = {
      selectedCourse,
      coursePermissions
    };
    localStorage.setItem('coursePermissionData', JSON.stringify(data));
    if (onDataChange) {
      onDataChange(data);
    }
  }, [selectedCourse, coursePermissions, onDataChange]);

  // 生成随机学生数据
  const generateRandomStudents = () => {
    const surnames = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
    const maleNames = ['伟', '强', '磊', '军', '洋', '勇', '杰', '峰', '超', '辉'];
    const femaleNames = ['丽', '娜', '敏', '静', '秀', '芳', '艳', '莉', '红', '梅'];
    const grades = ['学生010', '学生032', '学生009', '学生039', '学生049', '学生059', '学生069', '学生079', '学生088', '学生098', '学生100', '学生101'];

    const students: StudentData[] = [];
    const studentCount = 15;

    for (let i = 0; i < studentCount; i++) {
      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      const ismale = Math.random() > 0.5;
      const namePool = ismale ? maleNames : femaleNames;
      const name = surname + namePool[Math.floor(Math.random() * namePool.length)];
      const grade = grades[Math.floor(Math.random() * grades.length)];
      
      // 生成随机学号
      const studentIdNum = String(202010001 + Math.floor(Math.random() * 999)).padStart(9, '0');
      
      students.push({
        id: 1000 + i,
        name: name,  // 使用生成的随机姓名
        studentId: studentIdNum,  // 使用生成的随机学号
        grade
      });
    }
    return students;
  };

  // 处理课程权限切换
  const handleCoursePermissionToggle = (courseName: string, hasPermission: boolean) => {
    setCoursePermissions(prev => ({
      ...prev,
      [courseName]: {
        ...prev[courseName],
        hasPermission
      }
    }));
  };

  // 添加学生权限
  const handleOpenAddStudentModal = () => {
    setShowAddStudentModal(true);
    setAvailableStudents(generateRandomStudents());
    setSelectedStudentIds([]);
    setStudentSearchTerm('');
  };

  const handleCloseAddStudentModal = () => {
    setShowAddStudentModal(false);
    setSelectedStudentIds([]);
    setStudentSearchTerm('');
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleConfirmAddStudents = () => {
    const studentsToAdd = availableStudents.filter(student => 
      selectedStudentIds.includes(student.id)
    );
    
    setCoursePermissions(prev => ({
      ...prev,
      [selectedCourse]: {
        ...prev[selectedCourse],
        limitedStudents: [...prev[selectedCourse].limitedStudents, ...studentsToAdd]
      }
    }));
    
    handleCloseAddStudentModal();
  };

  // 删除学生权限
  const handleDeleteStudent = (studentId: number) => {
    setCoursePermissions(prev => ({
      ...prev,
      [selectedCourse]: {
        ...prev[selectedCourse],
        limitedStudents: prev[selectedCourse].limitedStudents.filter(s => s.id !== studentId)
      }
    }));
  };

  // 批量删除学生权限
  const handleBatchDeleteStudents = () => {
    setCoursePermissions(prev => ({
      ...prev,
      [selectedCourse]: {
        ...prev[selectedCourse],
        limitedStudents: []
      }
    }));
  };

  // 获取学生头像颜色
  const getAvatarColor = (name: string) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // 过滤可用学生
  const filteredAvailableStudents = availableStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) || 
                         student.studentId.includes(studentSearchTerm) ||
                         student.grade.toLowerCase().includes(studentSearchTerm.toLowerCase());
    const alreadyAdded = coursePermissions[selectedCourse].limitedStudents.some(s => s.id === student.id);
    return matchesSearch && !alreadyAdded;
  });

  return (
    <div style={{ padding: '20px', minHeight: '500px' }}>
      {/* 左侧课程列表 */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ 
          width: '200px', 
          backgroundColor: '#f8fafc', 
          borderRadius: '8px', 
          padding: '16px',
          height: 'fit-content'
        }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
            课程列表
          </h4>
          {Object.keys(coursePermissions).map((courseName) => (
            <div
              key={courseName}
              onClick={() => setSelectedCourse(courseName)}
              style={{
                padding: '12px 16px',
                marginBottom: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: selectedCourse === courseName ? '#6366f1' : 'white',
                color: selectedCourse === courseName ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                fontWeight: selectedCourse === courseName ? '600' : '500',
                transition: 'all 0.2s'
              }}
            >
              {courseName}
            </div>
          ))}
        </div>

        {/* 右侧权限设置 */}
        <div style={{ flex: 1 }}>
          {/* 顶部按钮区域 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <button
              onClick={handleOpenAddStudentModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ➕ 添加学生
            </button>
            
            <button
              onClick={handleBatchDeleteStudents}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              🗑️ 批量删除
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              📤 导入学生
            </button>
          </div>

          {/* 课程权限设置 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
              {selectedCourse} 课程权限设置
            </h4>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`${selectedCourse}-permission`}
                  checked={!coursePermissions[selectedCourse].hasPermission}
                  onChange={() => handleCoursePermissionToggle(selectedCourse, false)}
                  style={{ accentColor: '#6366f1' }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>无权限限制</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`${selectedCourse}-permission`}
                  checked={coursePermissions[selectedCourse].hasPermission}
                  onChange={() => handleCoursePermissionToggle(selectedCourse, true)}
                  style={{ accentColor: '#6366f1' }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>限制特定学生</span>
              </label>
            </div>
          </div>

          {/* 学生权限列表 */}
          {coursePermissions[selectedCourse].hasPermission && (
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                有权限的学生列表
              </h4>
              
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
                {/* 表头 */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 150px 100px',
                  backgroundColor: '#e2e8f0',
                  padding: '12px 16px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <input type="checkbox" style={{ accentColor: '#6366f1' }} />
                  </div>
                  <div>姓名</div>
                  <div>学号</div>
                  <div style={{ textAlign: 'center' }}>操作</div>
                </div>

                {/* 数据行 */}
                {coursePermissions[selectedCourse].limitedStudents.map((student, index) => (
                  <div 
                    key={student.id}
                    style={{ 
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 150px 100px',
                      padding: '12px 16px',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc',
                      borderBottom: index < coursePermissions[selectedCourse].limitedStudents.length - 1 ? '1px solid #e5e7eb' : 'none',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <input type="checkbox" style={{ accentColor: '#6366f1' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: getAvatarColor(student.name),
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {student.name.charAt(0)}
                      </div>
                      <span style={{ fontSize: '14px', color: '#374151' }}>{student.name}</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#374151' }}>
                      {student.studentId}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        style={{
                          color: '#ef4444',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          textDecoration: 'underline'
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}

                {coursePermissions[selectedCourse].limitedStudents.length === 0 && (
                  <div style={{ 
                    padding: '40px 20px', 
                    textAlign: 'center', 
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    暂无有权限的学生
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 添加学生模态框 */}
      {showAddStudentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '800px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
          }}>
            {/* 模态框头部 */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                导入学生权限
              </h3>
              <button
                onClick={handleCloseAddStudentModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* 搜索栏 */}
            <div style={{ padding: '20px' }}>
              <input
                type="text"
                placeholder="请输入姓名、学号或学生编号"
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* 学生列表 */}
            <div style={{ padding: '0 20px', maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  已选择 {selectedStudentIds.length} 人
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {filteredAvailableStudents.map((student) => (
                  <label
                    key={student.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: selectedStudentIds.includes(student.id) ? '2px solid #6366f1' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedStudentIds.includes(student.id) ? '#eff6ff' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => handleStudentSelect(student.id)}
                      style={{ accentColor: '#6366f1' }}
                    />
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: getAvatarColor(student.name),
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {student.grade}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 模态框底部 */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCloseAddStudentModal}
                style={{
                  padding: '8px 20px',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmAddStudents}
                disabled={selectedStudentIds.length === 0}
                style={{
                  padding: '8px 20px',
                  backgroundColor: selectedStudentIds.length > 0 ? '#6366f1' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: selectedStudentIds.length > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: '500'
                }}
              >
                确定 ({selectedStudentIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePermissionForm; 
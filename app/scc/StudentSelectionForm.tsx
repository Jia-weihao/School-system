import React, { useState, useEffect } from 'react';
import { studentApi, StudentData } from '../../services/studentApi'

interface StudentSelectionFormProps {
  selectedClasses: boolean[];
  onStudentsChange?: (students: StudentData[]) => void;
  initialStudents?: StudentData[];
  onBack?: () => void;  // 添加返回回调
}

const StudentSelectionForm: React.FC<StudentSelectionFormProps> = ({
  selectedClasses,
  onStudentsChange,
  initialStudents = [],
  onBack
}) => {
  const [students, setStudents] = useState<StudentData[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 添加学生模态框相关状态
  const [addModalSearchTerm, setAddModalSearchTerm] = useState('');
  const [selectedClassesInModal, setSelectedClassesInModal] = useState<boolean[]>(
    Array.from({ length: 12 }, () => false)
  );
  const [availableStudents, setAvailableStudents] = useState<StudentData[]>([]);
  const [selectedNewStudents, setSelectedNewStudents] = useState<string[]>([]);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);

  const studentsPerPage = 5;
  const modalStudentsPerPage = 5;

  // 生成班级名称
  const getClassName = (index: number) => {
    const classNames = ['一班', '二班', '三班', '四班', '五班', '六班', 
                       '七班', '八班', '九班', '十班', '十一班', '十二班'];
    return classNames[index];
  };

  // 获取选中的班级列表
  const getSelectedClassNames = () => {
    return selectedClasses
      .map((selected, index) => selected ? getClassName(index) : null)
      .filter(Boolean)
      .join('、');
  };

  // 初始化数据加载
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 从本地存储加载已选择的学生
        const savedStudents = localStorage.getItem('selectedStudents');
        if (savedStudents) {
          const parsed = JSON.parse(savedStudents);
          setStudents(parsed);
          console.log('从本地存储加载学生数据:', parsed.length, '条');
        }

        // 从本地存储加载其他状态
        const savedSearchTerm = localStorage.getItem('studentSearchTerm');
        if (savedSearchTerm) {
          setSearchTerm(savedSearchTerm);
        }

        const savedCurrentPage = localStorage.getItem('studentCurrentPage');
        if (savedCurrentPage) {
          setCurrentPage(parseInt(savedCurrentPage, 10));
        }

        const savedSelectedIds = localStorage.getItem('selectedStudentIds');
        if (savedSelectedIds) {
          setSelectedStudentIds(JSON.parse(savedSelectedIds));
        }

      } catch (error) {
        console.error('加载本地存储数据失败:', error);
        // 如果加载失败，清除可能损坏的数据
        localStorage.removeItem('selectedStudents');
        localStorage.removeItem('studentSearchTerm');
        localStorage.removeItem('studentCurrentPage');
        localStorage.removeItem('selectedStudentIds');
      }
    };

    loadInitialData();
  }, []);

  // 保存学生数据到本地存储
  useEffect(() => {
    localStorage.setItem('selectedStudents', JSON.stringify(students));
    if (onStudentsChange) {
      onStudentsChange(students);
    }
  }, [students, onStudentsChange]);

  // 保存搜索条件到本地存储
  useEffect(() => {
    localStorage.setItem('studentSearchTerm', searchTerm);
  }, [searchTerm]);

  // 保存当前页码到本地存储
  useEffect(() => {
    localStorage.setItem('studentCurrentPage', currentPage.toString());
  }, [currentPage]);

  // 保存选中的学生ID到本地存储
  useEffect(() => {
    localStorage.setItem('selectedStudentIds', JSON.stringify(selectedStudentIds));
  }, [selectedStudentIds]);

  // 组件卸载前确保数据完全保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 确保所有数据都保存到localStorage
      localStorage.setItem('selectedStudents', JSON.stringify(students));
      localStorage.setItem('studentSearchTerm', searchTerm);
      localStorage.setItem('studentCurrentPage', currentPage.toString());
      localStorage.setItem('selectedStudentIds', JSON.stringify(selectedStudentIds));
    };

    // 监听页面卸载事件
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 清理事件监听器
    return () => {
      handleBeforeUnload(); // 组件卸载时也保存数据
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [students, searchTerm, currentPage, selectedStudentIds]);

  // 过滤学生
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.includes(searchTerm) ||
    student.class.includes(searchTerm)
  );

  // 分页
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedStudents.map(student => student.id);
      setSelectedStudentIds(prev => [...new Set([...prev, ...allIds])]);
    } else {
      const currentPageIds = paginatedStudents.map(student => student.id);
      setSelectedStudentIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  };

  // 处理单个学生选择
  const handleStudentSelect = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(prev => [...prev, studentId]);
    } else {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    setStudents(prev => prev.filter(student => !selectedStudentIds.includes(student.id)));
    setSelectedStudentIds([]);
  };

  // 删除所有学生
  const handleDeleteAll = () => {
    setStudents([]);
    setSelectedStudentIds([]);
  };

  // 删除单个学生
  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(student => student.id !== studentId));
    setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
  };

  // 生成随机学生数据
  const generateRandomStudents = () => {
    const surnames = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧', '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕'];
    const maleNames = ['伟', '强', '磊', '军', '勇', '涛', '明', '超', '辉', '华', '鹏', '飞', '宇', '峰', '斌', '杰', '浩', '亮', '志', '健', '俊', '凯', '东', '建', '龙', '海', '波', '文', '博', '翔'];
    const femaleNames = ['丽', '娜', '敏', '静', '秀', '美', '雅', '芳', '莉', '红', '艳', '玲', '燕', '霞', '婷', '慧', '琳', '颖', '萍', '晶', '欣', '蕾', '薇', '倩', '洁', '雪', '梅', '珍', '君', '瑶'];
    const classNames = ['一班', '二班', '三班', '四班', '五班', '六班', '七班', '八班', '九班', '十班', '十一班', '十二班'];
    const grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级', '十年级', '十一年级', '十二年级'];
    
    const students: StudentData[] = [];
    
    // 生成50-80个随机学生
    const studentCount = Math.floor(Math.random() * 31) + 50;
    
    for (let i = 0; i < studentCount; i++) {
      const id = `temp_${1000 + i}`;
      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      const isGender = Math.random() > 0.5;
      const gender = isGender ? '男' : '女';
      const namePool = isGender ? maleNames : femaleNames;
      const givenName = namePool[Math.floor(Math.random() * namePool.length)];
      const name = surname + givenName;
      const studentId = `202101${String(i + 1).padStart(3, '0')}`;
      const classIndex = Math.floor(Math.random() * 12);
      const className = classNames[classIndex];
      
      // 随机选择年级（1-12年级）
      const gradeIndex = Math.floor(Math.random() * 12);
      const grade = grades[gradeIndex];
      
      // 生成随机身份证号码（模拟）
      const idNumber = `14080219980${String(Math.floor(Math.random() * 10))}${String(Math.floor(Math.random() * 10))}${String(Math.floor(Math.random() * 10))}${String(Math.floor(Math.random() * 10))}`;
      
      students.push({
        id,
        name,
        gender,
        studentId,
        idNumber,
        school: '新宇星海实验学校',
        grade,
        class: className,
        selected: false
      });
    }
    
    return students;
  };

  // 获取可添加的学生列表（模拟API调用）
  const fetchAvailableStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('正在从后端获取学生数据...');
      
      // 从后端API获取所有学生数据
      const allStudents = await studentApi.getAllStudents();
      console.log('获取到的学生数据:', allStudents);
      
      // 过滤掉已经添加的学生
      const existingIds = students.map(s => s.id);
      const filtered = allStudents.filter((s: StudentData) => !existingIds.includes(s.id));
      
      setAvailableStudents(filtered);
      
      if (filtered.length === 0) {
        setError('暂无可添加的学生数据');
      }
    } catch (err) {
      console.error('获取学生数据失败:', err);
      const errorMessage = err instanceof Error ? err.message : '获取学生数据失败，请检查网络连接和后端服务';
      setError(errorMessage);
      
      // 如果API失败，可以作为备选方案生成一些模拟数据
      console.log('使用模拟数据作为备选方案');
      const mockStudents = generateRandomStudents();
      const existingIds = students.map(s => s.id);
      const filtered = mockStudents.filter((s: StudentData) => !existingIds.includes(s.id));
      setAvailableStudents(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  // 打开添加学生模态框
  const handleOpenAddModal = () => {
    setShowAddModal(true);
    fetchAvailableStudents();
  };

  // 关闭添加学生模态框
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddModalSearchTerm('');
    setSelectedClassesInModal(Array.from({ length: 12 }, () => false));
    setSelectedNewStudents([]);
    setModalCurrentPage(1);
  };

  // 确认添加学生
  const handleConfirmAddStudents = () => {
    const studentsToAdd = availableStudents.filter(student => 
      selectedNewStudents.includes(student.id)
    );
    
    setStudents(prev => [...prev, ...studentsToAdd]);
    handleCloseAddModal();
  };

  // 过滤可添加的学生
  const filteredAvailableStudents = availableStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(addModalSearchTerm.toLowerCase()) ||
                         student.studentId.includes(addModalSearchTerm);
    
    const selectedClassNames = selectedClassesInModal
      .map((selected, index) => selected ? getClassName(index) : null)
      .filter((className): className is string => className !== null);
    
    const matchesClass = selectedClassNames.length === 0 || 
                        selectedClassNames.some(className => student.class.includes(className));
    
    return matchesSearch && matchesClass;
  });

  // 模态框分页
  const modalTotalPages = Math.ceil(filteredAvailableStudents.length / modalStudentsPerPage);
  const paginatedAvailableStudents = filteredAvailableStudents.slice(
    (modalCurrentPage - 1) * modalStudentsPerPage,
    modalCurrentPage * modalStudentsPerPage
  );

  // 生成头像颜色
  const getAvatarColor = (name: string) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 返回按钮 */}
      {onBack && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>←</span>
            返回上一页
          </button>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#721c24',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0 4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 选课班级信息 */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '16px', 
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '500', color: '#495057' }}>
            已选择班级：{getSelectedClassNames()}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#6c757d' }}>
              💾 已选 {students.length} 名学生
            </span>
            <span style={{ fontSize: '12px', color: '#28a745' }}>
              ✅ 自动保存
            </span>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ← 返回
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleOpenAddModal}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ✚ 添加学生
          </button>
          
          <button
            onClick={handleBatchDelete}
            disabled={selectedStudentIds.length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedStudentIds.length > 0 ? '#dc3545' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedStudentIds.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            🗑 批量删除
          </button>
          
          <button
            onClick={handleDeleteAll}
            disabled={students.length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: students.length > 0 ? '#dc3545' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: students.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            🗑 全部删除
          </button>

          <button
            onClick={() => {
              // 清除所有本地存储
              localStorage.removeItem('selectedStudents');
              localStorage.removeItem('studentSearchTerm');
              localStorage.removeItem('studentCurrentPage');
              localStorage.removeItem('selectedStudentIds');
              // 重置状态
              setStudents([]);
              setSearchTerm('');
              setCurrentPage(1);
              setSelectedStudentIds([]);
              setError(null);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🧹 清除缓存
          </button>
        </div>

        {/* 搜索框 */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="请输入姓名、学号或班级"
            style={{
              padding: '8px 35px 8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px',
              width: '250px',
              outline: 'none'
            }}
          />
          <span style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6c757d',
            cursor: 'pointer'
          }}>
            🔍
          </span>
        </div>
      </div>

      {/* 学生表格 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                <input
                  type="checkbox"
                  checked={paginatedStudents.length > 0 && paginatedStudents.every(student => selectedStudentIds.includes(student.id))}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ accentColor: '#007bff' }}
                />
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: '600' }}>序号</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: '600' }}>姓名</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: '600' }}>性别</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: '600' }}>学号</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: '600' }}>证件号码</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: '600' }}>学校</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: '600' }}>年级</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: '600' }}>行政班级</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: '600' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student, index) => (
              <tr key={student.id} style={{ borderBottom: '1px solid #f1f3f4' }}>
                <td style={{ padding: '12px' }}>
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(student.id)}
                    onChange={(e) => handleStudentSelect(student.id, e.target.checked)}
                    style={{ accentColor: '#007bff' }}
                  />
                </td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{(currentPage - 1) * studentsPerPage + index + 1}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{student.name}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{student.gender}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{student.studentId}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{student.idNumber}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{student.school}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{student.grade}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{student.class}</td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    style={{
                      color: '#007bff',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textDecoration: 'underline'
                    }}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedStudents.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6c757d',
            fontSize: '14px'
          }}>
            {searchTerm ? '未找到匹配的学生' : '暂无学生数据'}
          </div>
        )}
      </div>

      {/* 分页 */}
      {students.length > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          {/* 左侧：数据统计 */}
          <div style={{ 
            fontSize: '14px', 
            color: '#6c757d'
          }}>
            共 {filteredStudents.length} 条数据，每页显示 {studentsPerPage} 条，共 {totalPages} 页
          </div>

          {/* 右侧：分页控件 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid #dee2e6',
                backgroundColor: 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                borderRadius: '4px',
                fontSize: '14px',
                color: currentPage === 1 ? '#6c757d' : '#495057'
              }}
            >
              首页
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid #dee2e6',
                backgroundColor: 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                borderRadius: '4px',
                fontSize: '14px',
                color: currentPage === 1 ? '#6c757d' : '#495057'
              }}
            >
              上一页
            </button>
            
            {/* 页码按钮 */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else {
                // 智能分页显示
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #dee2e6',
                    backgroundColor: currentPage === pageNum ? '#007bff' : 'white',
                    color: currentPage === pageNum ? 'white' : '#495057',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: currentPage === pageNum ? 'bold' : 'normal'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                border: '1px solid #dee2e6',
                backgroundColor: 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                borderRadius: '4px',
                fontSize: '14px',
                color: currentPage === totalPages ? '#6c757d' : '#495057'
              }}
            >
              下一页
            </button>
            
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                border: '1px solid #dee2e6',
                backgroundColor: 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                borderRadius: '4px',
                fontSize: '14px',
                color: currentPage === totalPages ? '#6c757d' : '#495057'
              }}
            >
              末页
            </button>
          </div>
        </div>
      )}

      {/* 添加学生模态框 */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '1200px',
            height: '80%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 模态框头部 */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>添加学生</h3>
              <button
                onClick={handleCloseAddModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ×
              </button>
            </div>

            {/* 模态框内容 */}
            <div style={{ flex: 1, padding: '20px', display: 'flex', gap: '20px' }}>
              {/* 左侧：学生列表 */}
              <div style={{ flex: 2 }}>
                {/* 搜索和筛选 */}
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    value={addModalSearchTerm}
                    onChange={(e) => {
                      setAddModalSearchTerm(e.target.value);
                      setModalCurrentPage(1);
                    }}
                    placeholder="请输入姓名、学号搜索"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px',
                      marginBottom: '16px'
                    }}
                  />

                  {/* 班级筛选 */}
                  <div>
                    <div style={{ marginBottom: '12px', fontWeight: '500', fontSize: '14px' }}>按班级筛选：</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                      {Array.from({ length: 12 }, (_, index) => (
                        <label key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                          <input
                            type="checkbox"
                            checked={selectedClassesInModal[index]}
                            onChange={(e) => {
                              const newSelected = [...selectedClassesInModal];
                              newSelected[index] = e.target.checked;
                              setSelectedClassesInModal(newSelected);
                              setModalCurrentPage(1);
                            }}
                            style={{ marginRight: '4px', accentColor: '#007bff' }}
                          />
                          {getClassName(index)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 学生列表 */}
                <div style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  {isLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>加载中...</div>
                  ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#dc3545' }}>{error}</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600' }}>选择</th>
                          <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600' }}>姓名</th>
                          <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600' }}>性别</th>
                          <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600' }}>学号</th>
                          <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600' }}>班级</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedAvailableStudents.map((student) => (
                          <tr key={student.id} style={{ borderBottom: '1px solid #f1f3f4' }}>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={selectedNewStudents.includes(student.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedNewStudents(prev => [...prev, student.id]);
                                  } else {
                                    setSelectedNewStudents(prev => prev.filter(id => id !== student.id));
                                  }
                                }}
                                style={{ accentColor: '#007bff' }}
                              />
                            </td>
                            <td style={{ padding: '8px', fontSize: '12px' }}>{student.name}</td>
                            <td style={{ padding: '8px', fontSize: '12px' }}>{student.gender}</td>
                            <td style={{ padding: '8px', fontSize: '12px' }}>{student.studentId}</td>
                            <td style={{ padding: '8px', fontSize: '12px' }}>{student.class}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  
                  {/* 模态框分页 */}
                  {modalTotalPages > 1 && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      marginTop: '16px',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => setModalCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={modalCurrentPage === 1}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #dee2e6',
                          backgroundColor: 'white',
                          cursor: modalCurrentPage === 1 ? 'not-allowed' : 'pointer',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        ‹
                      </button>
                      
                      {Array.from({ length: Math.min(5, modalTotalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setModalCurrentPage(pageNum)}
                            style={{
                              padding: '4px 8px',
                              border: '1px solid #dee2e6',
                              backgroundColor: modalCurrentPage === pageNum ? '#007bff' : 'white',
                              color: modalCurrentPage === pageNum ? 'white' : '#495057',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setModalCurrentPage(prev => Math.min(modalTotalPages, prev + 1))}
                        disabled={modalCurrentPage === modalTotalPages}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #dee2e6',
                          backgroundColor: 'white',
                          cursor: modalCurrentPage === modalTotalPages ? 'not-allowed' : 'pointer',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        ›
                      </button>
                      
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#6c757d',
                        marginLeft: '12px'
                      }}>
                        第 {modalCurrentPage} 页，共 {modalTotalPages} 页，共 {filteredAvailableStudents.length} 条数据
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 右侧：已选学生 */}
              <div style={{ flex: 1, borderLeft: '1px solid #e9ecef', paddingLeft: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                    已选学生 ({selectedNewStudents.length})
                  </h4>
                </div>
                
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {selectedNewStudents.map(studentId => {
                    const student = availableStudents.find(s => s.id === studentId);
                    if (!student) return null;
                    
                    return (
                      <div key={student.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px',
                        marginBottom: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: getAvatarColor(student.name),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            marginRight: '8px'
                          }}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500' }}>{student.name}</div>
                          <div style={{ color: '#6c757d', fontSize: '10px' }}>{student.class}</div>
                        </div>
                        <button
                          onClick={() => setSelectedNewStudents(prev => prev.filter(id => id !== student.id))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 模态框底部 */}
            <div style={{
              padding: '20px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={handleCloseAddModal}
                style={{
                  padding: '8px 20px',
                  border: '1px solid #ced4da',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmAddStudents}
                disabled={selectedNewStudents.length === 0}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  backgroundColor: selectedNewStudents.length > 0 ? '#007bff' : '#6c757d',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: selectedNewStudents.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                确定 ({selectedNewStudents.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSelectionForm; 
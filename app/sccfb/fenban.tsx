'use client';

import React, { useState, useEffect } from 'react'
import API_BASE_URL from '../tools/api';
import Startfenban from './startfenban';

// 后端学生数据结构
interface BackendStudent {
  _id: string;
  name: string;
  math: number;
  chinese: number;
  english: number;
  physics: number;
  chemistry: number;
  biology: number;
  averageScore: string;
  createdAt: string;
  updatedAt: string;
}

// 前端学生成绩数据结构
interface StudentGrade {
  id: string;
  name: string;
  studentId: string;
  class: string;
  subjects: {
    chinese: number;
    math: number;
    english: number;
    physics: number;
    chemistry: number;
    biology: number;
  };
  totalScore: number;
  averageScore: number;
  ranking: number;
  groupType?: 'normal' | 'key';
}

export default function Fenban() {
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustGroupType, setAdjustGroupType] = useState<'normal' | 'key'>('normal');
  const [showAutoClassification, setShowAutoClassification] = useState(false);
  const [sortField, setSortField] = useState<'ranking' | 'totalScore' | 'averageScore'>('ranking');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 从后端获取学生数据
  const fetchStudentsFromAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/students`);
      
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '获取数据失败');
      }
      
      console.log('后端返回的原始数据:', result.data);
      
      // 首先对后端数据去重（按_id和name去重）
      const uniqueBackendData = result.data.filter((student: BackendStudent, index: number, self: BackendStudent[]) => 
        index === self.findIndex((s: BackendStudent) => s._id === student._id || s.name === student.name)
      );
      
      console.log('去重后的后端数据:', uniqueBackendData);
      
      // 将去重后的后端数据转换为前端需要的格式
      const transformedStudents: StudentGrade[] = uniqueBackendData.map((student: BackendStudent, index: number) => {
        const totalScore = student.math + student.chinese + student.english + 
                          student.physics + student.chemistry + student.biology;
        
        return {
          id: student._id,
          name: student.name,
          studentId: `2024${(index + 1).toString().padStart(3, '0')}`, // 生成学号
          class: `${Math.floor(index / 3) + 1}班`, // 简单的班级分配
          subjects: {
            chinese: student.chinese,
            math: student.math,
            english: student.english,
            physics: student.physics,
            chemistry: student.chemistry,
            biology: student.biology
          },
          totalScore,
          averageScore: parseFloat(student.averageScore),
          ranking: 0, // 临时设置，后面会重新计算
          groupType: undefined
        };
      });
      
      // 最终确保数据唯一性（按ID和姓名双重去重）
      const uniqueStudents = transformedStudents.filter((student, index, self) => 
        index === self.findIndex(s => s.id === student.id && s.name === student.name)
      );
      
      // 按总分排序并设置排名
      uniqueStudents.sort((a, b) => b.totalScore - a.totalScore);
      uniqueStudents.forEach((student, index) => {
        student.ranking = index + 1;
      });
      
      console.log('转换并去重后的数据:', uniqueStudents);
      setStudents(uniqueStudents);
      
    } catch (error) {
      console.error('获取学生数据失败:', error);
      setError('无法连接到后端服务，请确保后端服务正在运行');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchStudentsFromAPI();
  }, []);

  // 筛选学生
  const filteredStudents = students.filter(student => 
    student.name.includes(searchTerm) || 
    student.studentId.includes(searchTerm) ||
    student.class.includes(searchTerm)
  );

  // 排序学生
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // 分页
  const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);
  const paginatedStudents = sortedStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  // 选择学生
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    const currentPageStudentIds = paginatedStudents.map(s => s.id);
    const currentPageSelectedCount = selectedStudents.filter(id => 
      currentPageStudentIds.includes(id)
    ).length;
    
    if (currentPageSelectedCount === paginatedStudents.length && paginatedStudents.length > 0) {
      setSelectedStudents(prev => prev.filter(id => 
        !currentPageStudentIds.includes(id)
      ));
    } else {
      setSelectedStudents(prev => [
        ...prev.filter(id => !currentPageStudentIds.includes(id)),
        ...currentPageStudentIds
      ]);
    }
  };

  // 调整分班
  const handleAdjustGroup = () => {
    const updatedStudents = students.map(student => 
      selectedStudents.includes(student.id)
        ? { ...student, groupType: adjustGroupType }
        : student
    );
    setStudents(updatedStudents);
    setShowAdjustModal(false);
    setSelectedStudents([]);
    
    const groupName = adjustGroupType === 'normal' ? '平行班' : '重点班';
    alert(`成功将 ${selectedStudents.length} 名学生分配到${groupName}`);
  };

  // 处理自动分班结果
  const handleAutoClassificationResult = (updatedStudents: StudentGrade[]) => {
    console.log('接收到的分班结果数量:', updatedStudents.length);
    console.log('当前学生数据数量:', students.length);
    console.log('接收到的分班结果:', updatedStudents);
    
    // 验证数据完整性
    if (updatedStudents.length !== students.length) {
      console.error('错误：分班结果数量与原始数据不匹配！', {
        原始数量: students.length,
        分班结果数量: updatedStudents.length
      });
      alert('分班过程中出现数据异常，请刷新页面重试');
      return;
    }
    
    // 直接使用分班结果，不进行任何额外处理
    console.log('应用分班结果');
    setStudents(updatedStudents);
    setSelectedStudents([]);
  };

  // 刷新数据
  const handleRefresh = () => {
    console.log('强制刷新数据...');
    setStudents([]); // 先清空当前数据
    setSelectedStudents([]);
    fetchStudentsFromAPI();
  };

  // 统计信息
  const normalCount = students.filter(s => s.groupType === 'normal').length;
  const keyCount = students.filter(s => s.groupType === 'key').length;
  const unassignedCount = students.filter(s => !s.groupType).length;

  // 排序处理
  const handleSort = (field: 'ranking' | 'totalScore' | 'averageScore') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 获取科目分数
  const getSubjectScore = (student: StudentGrade, subject: keyof StudentGrade['subjects']) => {
    return student.subjects[subject] || '-';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        backgroundColor: 'white',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>正在从后端加载学生成绩数据...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '10px' }}>❌ 连接错误</h3>
          <p style={{ color: '#dc2626', marginBottom: '15px' }}>{error}</p>
          <button
            onClick={handleRefresh}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 重试连接
          </button>
        </div>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>
          <p>请确保：</p>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>后端服务正在运行 (端口3000)</li>
            <li>数据库连接正常</li>
            <li>API接口 /api/students 可访问</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
      {/* 页面标题 */}
      <div style={{ 
        marginBottom: '20px', 
        paddingBottom: '10px', 
        borderBottom: '2px solid #e5e7eb' 
      }}>
        <h2 style={{ 
          margin: 0, 
          color: '#1f2937', 
          fontSize: '24px', 
          fontWeight: 'bold' 
        }}>
          🎯 智能分班管理
        </h2>
        <p style={{ 
          margin: '5px 0 0 0', 
          color: '#6b7280', 
          fontSize: '14px' 
        }}>
          基于后端真实学生成绩数据进行智能分班
        </p>
      </div>

      {/* 操作栏 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              setShowAutoClassification(true);
            }}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#10b981',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            🎯 智能自动分班
          </button>
          
          <button
            onClick={() => {
              if (selectedStudents.length === 0) {
                alert('请先选择要分班的学生');
                return;
              }
              setShowAdjustModal(true);
            }}
            disabled={selectedStudents.length === 0}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: selectedStudents.length === 0 ? '#9ca3af' : '#6366f1',
              color: 'white',
              fontSize: '14px',
              cursor: selectedStudents.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            📝 手动分班 ({selectedStudents.length})
          </button>
          
          <button
            onClick={() => {
              setSelectedStudents([]);
            }}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 清空选择
          </button>
          
          <button
            onClick={handleRefresh}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 刷新数据
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="搜索姓名、学号或班级"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px 8px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                width: '200px'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }}>
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          textAlign: 'center',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151' }}>
            {unassignedCount}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>待分班</div>
        </div>
        
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          textAlign: 'center',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8' }}>
            {normalCount}
          </div>
          <div style={{ fontSize: '12px', color: '#1d4ed8' }}>平行班</div>
        </div>
        
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#dcfce7',
          borderRadius: '8px',
          textAlign: 'center',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
            {keyCount}
          </div>
          <div style={{ fontSize: '12px', color: '#166534' }}>重点班</div>
        </div>
        
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          textAlign: 'center',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
            {students.length}
          </div>
          <div style={{ fontSize: '12px', color: '#92400e' }}>总人数</div>
        </div>
      </div>

      {/* 学生成绩表格 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>
                <input
                  type="checkbox"
                  checked={(() => {
                    const currentPageStudentIds = paginatedStudents.map(s => s.id);
                    const currentPageSelectedCount = selectedStudents.filter(id => 
                      currentPageStudentIds.includes(id)
                    ).length;
                    return currentPageSelectedCount === paginatedStudents.length && paginatedStudents.length > 0;
                  })()}
                  onChange={handleSelectAll}
                  style={{ marginRight: '8px' }}
                />
              </th>
              <th 
                style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => handleSort('ranking')}
              >
                排名 {sortField === 'ranking' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>姓名</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>学号</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>班级</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>语文</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>数学</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>英语</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>物理</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>化学</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>生物</th>
              <th 
                style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => handleSort('totalScore')}
              >
                总分 {sortField === 'totalScore' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => handleSort('averageScore')}
              >
                平均分 {sortField === 'averageScore' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>分班状态</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student) => {
              const isSelected = selectedStudents.includes(student.id);
              
              return (
                <tr 
                  key={student.id} 
                  style={{ 
                    backgroundColor: isSelected ? '#eff6ff' : 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleStudentSelect(student.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: student.ranking <= 3 ? '#fbbf24' : '#e5e7eb',
                      color: student.ranking <= 3 ? 'white' : '#374151',
                      lineHeight: '24px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {student.ranking}
                    </span>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{student.name}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{student.studentId}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{student.class}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {getSubjectScore(student, 'chinese')}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {getSubjectScore(student, 'math')}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {getSubjectScore(student, 'english')}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {getSubjectScore(student, 'physics')}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {getSubjectScore(student, 'chemistry')}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {getSubjectScore(student, 'biology')}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    border: '1px solid #e5e7eb', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: student.totalScore >= 500 ? '#059669' : '#dc2626'
                  }}>
                    {student.totalScore}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    border: '1px solid #e5e7eb', 
                    textAlign: 'center',
                    color: student.averageScore >= 85 ? '#059669' : '#dc2626'
                  }}>
                    {student.averageScore}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {student.groupType ? (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: student.groupType === 'key' ? '#dcfce7' : '#dbeafe',
                        color: student.groupType === 'key' ? '#166534' : '#1d4ed8'
                      }}>
                        {student.groupType === 'key' ? '重点班' : '平行班'}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>未分班</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '20px'
      }}>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          共 {filteredStudents.length} 条，已选择 {selectedStudents.length} 条
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px' }}>每页</span>
          <select
            value={studentsPerPage}
            onChange={(e) => {
              setStudentsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span style={{ fontSize: '14px' }}>条</span>
          
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: currentPage === 1 ? '#f9fafb' : 'white',
                color: currentPage === 1 ? '#9ca3af' : '#374151',
                fontSize: '14px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              上一页
            </button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (page > totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: currentPage === page ? '#6366f1' : 'white',
                    color: currentPage === page ? 'white' : '#374151',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: currentPage === totalPages ? '#f9fafb' : 'white',
                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                fontSize: '14px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* 分班模态框 */}
      {showAdjustModal && (
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
            padding: '24px',
            borderRadius: '12px',
            width: '480px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
              🎯 智能分班 ({selectedStudents.length} 名学生)
            </h3>
            
            {/* 显示选中的学生 */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '12px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                选中的学生：
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                {selectedStudents.map(studentId => {
                  const student = students.find(s => s.id === studentId);
                  return student ? `${student.name}(${student.totalScore}分)` : '';
                }).filter(name => name).join('、')}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
                选择分班类型：
              </label>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="groupType"
                    value="normal"
                    checked={adjustGroupType === 'normal'}
                    onChange={(e) => setAdjustGroupType(e.target.value as 'normal' | 'key')}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ color: '#1d4ed8' }}>平行班</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="groupType"
                    value="key"
                    checked={adjustGroupType === 'key'}
                    onChange={(e) => setAdjustGroupType(e.target.value as 'normal' | 'key')}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ color: '#166534' }}>重点班</span>
                </label>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAdjustModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                取消
              </button>
              <button
                onClick={handleAdjustGroup}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                确认分班
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 自动分班组件 */}
      {showAutoClassification && (
        <Startfenban
          students={students}
          onClose={() => setShowAutoClassification(false)}
          onConfirm={handleAutoClassificationResult}
        />
      )}
    </div>
  );
}
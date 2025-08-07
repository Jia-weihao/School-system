'use client';

import React, { useState, useEffect } from 'react';

// 学生数据结构
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

interface StartfenbanProps {
  students: StudentGrade[];
  onClose: () => void;
  onConfirm: (updatedStudents: StudentGrade[]) => void;
}

export default function Startfenban({ students, onClose, onConfirm }: StartfenbanProps) {
  const [processing, setProcessing] = useState(false);
  const [processedStudents, setProcessedStudents] = useState<StudentGrade[]>([]);
  const [showResult, setShowResult] = useState(false);

  // 自动分班逻辑
  const performAutoClassification = () => {
    setProcessing(true);
    
    // 模拟分班处理过程
    setTimeout(() => {
      console.log('开始分班，原始学生数据数量:', students.length);
      console.log('开始分班，原始学生数据:', students);
      
      // 直接对传入的学生数据进行分班，不进行任何去重操作
      // 因为数据应该在父组件中已经是去重后的干净数据
      const classified = students.map(student => {
        // 只更新 groupType，保持其他数据完全不变
        const newGroupType = student.totalScore >= 500 ? 'key' as const : 'normal' as const;
        console.log(`学生 ${student.name} (${student.totalScore}分) 分配到: ${newGroupType === 'key' ? '重点班' : '平行班'}`);
        
        return {
          ...student,
          groupType: newGroupType
        };
      });
      
      console.log('分班后的数据数量:', classified.length);
      console.log('分班后的数据:', classified);
      
      // 验证数据完整性
      if (classified.length !== students.length) {
        console.error('警告：分班后数据数量发生变化！', {
          原始数量: students.length,
          分班后数量: classified.length
        });
      }
      
      setProcessedStudents(classified);
      setProcessing(false);
      setShowResult(true);
    }, 2000);
  };

  // 统计信息
  const getStats = (studentList: StudentGrade[]) => {
    const keyStudents = studentList.filter(s => s.groupType === 'key');
    const normalStudents = studentList.filter(s => s.groupType === 'normal');
    const unassigned = studentList.filter(s => !s.groupType);
    
    return {
      total: studentList.length,
      key: keyStudents.length,
      normal: normalStudents.length,
      unassigned: unassigned.length,
      keyStudents,
      normalStudents
    };
  };

  const originalStats = getStats(students);
  const processedStats = showResult ? getStats(processedStudents) : originalStats;

  // 确认分班
  const handleConfirm = () => {
    console.log('确认分班，传递的数据数量:', processedStudents.length);
    console.log('确认分班，传递的数据:', processedStudents);
    
    // 直接传递处理后的数据，不进行任何额外操作
    // 数据应该已经是正确和完整的
    onConfirm(processedStudents);
    onClose();
  };

  return (
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
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* 头部 */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#1f2937' 
              }}>
                🎯 智能自动分班
              </h2>
              <p style={{ 
                margin: '5px 0 0 0', 
                color: '#6b7280', 
                fontSize: '14px' 
              }}>
                基于总成绩自动分班：500分及以上进入重点班，500分以下进入平行班
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div style={{ padding: '24px' }}>
          {!processing && !showResult && (
            <div>
              {/* 分班前统计 */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>📊 当前状态</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    textAlign: 'center',
                    minWidth: '120px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151' }}>
                      {originalStats.total}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>总学生数</div>
                  </div>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    textAlign: 'center',
                    minWidth: '120px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                      {originalStats.unassigned}
                    </div>
                    <div style={{ fontSize: '12px', color: '#92400e' }}>待分班</div>
                  </div>
                </div>
              </div>

              {/* 分班规则说明 */}
              <div style={{ 
                backgroundColor: '#eff6ff', 
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>🎯 自动分班规则</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af' }}>
                  <li><strong>重点班</strong>：总成绩 ≥ 500分的学生</li>
                  <li><strong>平行班</strong>：总成绩 &lt; 500分的学生</li>
                  <li>系统将自动计算每位学生的总成绩并进行分班</li>
                </ul>
              </div>

              {/* 预览即将分班的学生 */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px', color: '#1f2937' }}>📋 学生成绩预览</h4>
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>姓名</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>总分</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>预分班级</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student.id}>
                          <td style={{ padding: '8px', fontSize: '14px' }}>{student.name}</td>
                          <td style={{ 
                            padding: '8px', 
                            textAlign: 'center', 
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: student.totalScore >= 500 ? '#059669' : '#dc2626'
                          }}>
                            {student.totalScore}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              backgroundColor: student.totalScore >= 500 ? '#dcfce7' : '#dbeafe',
                              color: student.totalScore >= 500 ? '#166534' : '#1d4ed8'
                            }}>
                              {student.totalScore >= 500 ? '重点班' : '平行班'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 开始分班按钮 */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={performAutoClassification}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  🚀 开始自动分班
                </button>
              </div>
            </div>
          )}

          {processing && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '6px solid #f3f4f6',
                borderTop: '6px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 24px'
              }} />
              <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>🎯 正在进行智能分班...</h3>
              <p style={{ color: '#6b7280', margin: 0 }}>系统正在根据成绩自动分配班级，请稍候</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {showResult && (
            <div>
              {/* 分班结果统计 */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>🎉 分班完成！</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#dcfce7',
                    borderRadius: '8px',
                    textAlign: 'center',
                    minWidth: '120px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
                      {processedStats.key}
                    </div>
                    <div style={{ fontSize: '12px', color: '#166534' }}>重点班</div>
                  </div>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '8px',
                    textAlign: 'center',
                    minWidth: '120px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8' }}>
                      {processedStats.normal}
                    </div>
                    <div style={{ fontSize: '12px', color: '#1d4ed8' }}>平行班</div>
                  </div>
                </div>
              </div>

              {/* 分班结果详情 */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {/* 重点班学生 */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      marginBottom: '12px', 
                      color: '#166534',
                      backgroundColor: '#dcfce7',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      margin: '0 0 12px 0'
                    }}>
                      🏆 重点班 ({processedStats.key}人)
                    </h4>
                    <div style={{ 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      border: '1px solid #bbf7d0',
                      borderRadius: '6px',
                      backgroundColor: '#f0fdf4'
                    }}>
                      {processedStats.keyStudents.map(student => (
                        <div key={student.id} style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid #bbf7d0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '14px', color: '#166534' }}>{student.name}</span>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: 'bold', 
                            color: '#059669' 
                          }}>
                            {student.totalScore}分
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 平行班学生 */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      marginBottom: '12px', 
                      color: '#1d4ed8',
                      backgroundColor: '#dbeafe',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      margin: '0 0 12px 0'
                    }}>
                      📚 平行班 ({processedStats.normal}人)
                    </h4>
                    <div style={{ 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      backgroundColor: '#eff6ff'
                    }}>
                      {processedStats.normalStudents.map(student => (
                        <div key={student.id} style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid #bfdbfe',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '14px', color: '#1d4ed8' }}>{student.name}</span>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: 'bold', 
                            color: '#2563eb' 
                          }}>
                            {student.totalScore}分
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '20px'
              }}>
                <button
                  onClick={onClose}
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
                  onClick={handleConfirm}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  ✅ 确认分班结果
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
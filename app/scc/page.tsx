'use client';

import React, { useState } from 'react';
import StudentSelectionForm from './StudentSelectionForm';
import { StudentData } from '../../services/studentApi';

export default function StudentSelectionPage() {
  const [showForm, setShowForm] = useState(true);
  const [selectedClasses, setSelectedClasses] = useState<boolean[]>(
    Array.from({ length: 12 }, () => false)
  );
  const [savedStudents, setSavedStudents] = useState<StudentData[]>([]);

  const handleBack = () => {
    setShowForm(false);
    console.log('用户点击了返回，当前选择的学生数量:', savedStudents.length);
  };

  const handleStudentsChange = (students: StudentData[]) => {
    setSavedStudents(students);
    console.log('学生选择更新:', students.length, '名学生');
  };

  const handleReturnToForm = () => {
    setShowForm(true);
  };

  if (!showForm) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>
            🎉 数据已保存成功！
          </h2>
          
          <div style={{ 
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #0ea5e9'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0369a1' }}>
              <strong>✅ 你已选择了 {savedStudents.length} 名学生</strong>
            </p>
            <p style={{ margin: '0', fontSize: '14px', color: '#0369a1' }}>
              数据已自动保存到本地存储，刷新页面后数据不会丢失
            </p>
          </div>

          {savedStudents.length > 0 && (
            <div style={{ 
              marginBottom: '30px',
              textAlign: 'left',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>选择的学生列表：</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {savedStudents.slice(0, 5).map((student, index) => (
                  <div key={student.id} style={{
                    padding: '8px 12px',
                    marginBottom: '8px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px'
                  }}>
                    {index + 1}. {student.name} - {student.studentId} - {student.class}
                  </div>
                ))}
                {savedStudents.length > 5 && (
                  <p style={{ 
                    margin: '10px 0 0 0', 
                    fontSize: '12px', 
                    color: '#6c757d',
                    fontStyle: 'italic'
                  }}>
                    ... 还有 {savedStudents.length - 5} 名学生
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleReturnToForm}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            📝 继续选择学生
          </button>
          
          <p style={{ 
            marginTop: '20px', 
            fontSize: '14px', 
            color: '#6c757d'
          }}>
            点击按钮后，你之前的所有选择都会保留！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StudentSelectionForm
        selectedClasses={selectedClasses}
        onStudentsChange={handleStudentsChange}
        onBack={handleBack}
      />
    </div>
  );
} 
import React from 'react';
import CourseSelectionForm from './CourseSelectionForm';

const CreateCourse: React.FC = () => {
  const handleFormCancel = () => {
    console.log('用户取消了选课设置');
    // 这里可以添加导航逻辑，例如返回上一页
  };

  const handleFormComplete = (data: any) => {
    console.log('选课设置完成:', data);
    // 这里可以添加提交数据到后端的逻辑
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: 'white',
      minHeight: '100vh'
    }}>
      <div style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        marginBottom: '20px',
        color: '#374151',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '10px'
      }}>
        选课设置 》创建选课
      </div>

      <CourseSelectionForm
        onCancel={handleFormCancel}
        onComplete={handleFormComplete}
      />
    </div>
  );
};

export default CreateCourse; 

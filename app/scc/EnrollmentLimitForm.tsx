import React, { useState, useEffect } from 'react';

interface CourseLimitData {
  [courseName: string]: {
    isUnlimited: boolean;
    limit: number;
  };
}

interface EnrollmentLimitFormProps {
  onDataChange?: (data: any) => void;
  initialData?: any;
  onPublish?: () => void;
}

const EnrollmentLimitForm: React.FC<EnrollmentLimitFormProps> = ({
  onDataChange,
  initialData = {},
  onPublish
}) => {
  const [courseLimits, setCourseLimits] = useState<CourseLimitData>({
    '语文': { isUnlimited: true, limit: 0 },
    '数学': { isUnlimited: true, limit: 0 },
    '英语': { isUnlimited: true, limit: 0 },
    '历史': { isUnlimited: true, limit: 0 },
    '政治': { isUnlimited: true, limit: 0 },
    '化学': { isUnlimited: true, limit: 0 },
    '物理': { isUnlimited: true, limit: 0 }
  });

  // 数据持久化
  useEffect(() => {
    const defaultLimits = {
      '语文': { isUnlimited: true, limit: 0 },
      '数学': { isUnlimited: true, limit: 0 },
      '英语': { isUnlimited: true, limit: 0 },
      '历史': { isUnlimited: true, limit: 0 },
      '政治': { isUnlimited: true, limit: 0 },
      '化学': { isUnlimited: true, limit: 0 },
      '物理': { isUnlimited: true, limit: 0 }
    };
    
    const savedData = localStorage.getItem('enrollmentLimitData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // 检查是否包含新的课程结构
        const savedLimits = parsed.courseLimits || {};
        const hasNewCourses = Object.keys(defaultLimits).every(course => course in savedLimits);
        
        if (hasNewCourses) {
          setCourseLimits(savedLimits);
        } else {
          // 如果保存的数据不包含新课程，使用默认值并更新存储
          setCourseLimits(defaultLimits);
          localStorage.setItem('enrollmentLimitData', JSON.stringify({ courseLimits: defaultLimits }));
        }
      } catch (error) {
        console.error('解析保存的数据失败，使用默认值:', error);
        setCourseLimits(defaultLimits);
      }
    } else {
      setCourseLimits(defaultLimits);
    }
  }, []);

  useEffect(() => {
    const data = {
      courseLimits
    };
    localStorage.setItem('enrollmentLimitData', JSON.stringify(data));
    if (onDataChange) {
      onDataChange(data);
    }
  }, [courseLimits, onDataChange]);

  // 处理限制类型切换
  const handleLimitTypeChange = (courseName: string, isUnlimited: boolean) => {
    setCourseLimits(prev => ({
      ...prev,
      [courseName]: {
        ...prev[courseName],
        isUnlimited,
        limit: isUnlimited ? 0 : prev[courseName].limit
      }
    }));
  };

  // 处理人数限制变更
  const handleLimitChange = (courseName: string, limit: number) => {
    setCourseLimits(prev => ({
      ...prev,
      [courseName]: {
        ...prev[courseName],
        limit: Math.max(0, limit)
      }
    }));
  };

  // 全部清除本页设置
  const handleClearAll = () => {
    setCourseLimits({
      '物理': { isUnlimited: true, limit: 0 },
      '化学': { isUnlimited: true, limit: 0 },
      '生物': { isUnlimited: true, limit: 0 },
      '历史': { isUnlimited: true, limit: 0 },
      '地理': { isUnlimited: true, limit: 0 },
      '物理_2': { isUnlimited: true, limit: 0 }
    });
  };

  // 发布功能
  const handlePublish = () => {
    if (onPublish) {
      onPublish();
    }
  };

  // 获取课程显示名称
  const getCourseDisplayName = (courseName: string) => {
    return courseName === '物理_2' ? '物理' : courseName;
  };

  // 渲染课程限制卡片
  const renderCourseCard = (courseName: string) => {
    const courseData = courseLimits[courseName];
    const displayName = getCourseDisplayName(courseName);

    return (
      <div
        key={courseName}
        style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#374151',
          textAlign: 'center'
        }}>
          {displayName}
        </h3>

        {/* 限制类型选择 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer',
            marginBottom: '12px'
          }}>
            <input
              type="radio"
              name={`${courseName}-type`}
              checked={courseData.isUnlimited}
              onChange={() => handleLimitTypeChange(courseName, true)}
              style={{ accentColor: '#6366f1' }}
            />
            <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>不限</span>
          </label>

          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer'
          }}>
            <input
              type="radio"
              name={`${courseName}-type`}
              checked={!courseData.isUnlimited}
              onChange={() => handleLimitTypeChange(courseName, false)}
              style={{ accentColor: '#6366f1' }}
            />
            <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>限选</span>
          </label>
        </div>

        {/* 人数输入 */}
        {!courseData.isUnlimited && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', color: '#374151' }}>限选</span>
            <input
              type="number"
              value={courseData.limit || ''}
              onChange={(e) => handleLimitChange(courseName, parseInt(e.target.value) || 0)}
              min="0"
              style={{
                width: '80px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                textAlign: 'center',
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '16px', color: '#374151' }}>人</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', minHeight: '500px' }}>
      {/* 顶部清除按钮 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#374151' }}>
          课程限选人数设置
        </h2>
        <button
          onClick={handleClearAll}
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
          ❌ 全部清除本页设置
        </button>
      </div>

      {/* 课程限制网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {Object.keys(courseLimits).map((courseName) => renderCourseCard(courseName))}
      </div>

      {/* 底部按钮 */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        justifyContent: 'center',
        paddingTop: '24px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          style={{
            padding: '12px 32px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          保存
        </button>
        
        <button
          onClick={handlePublish}
          style={{
            padding: '12px 32px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          发布
        </button>
      </div>
    </div>
  );
};

export default EnrollmentLimitForm; 
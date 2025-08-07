import React, { useState } from 'react';
import CourseDataView from './CourseDataView';

interface CourseDataSummaryProps {
  data: {
    formData: any;
    students: any[];
    courseSettings: any;
    coursePermissionData: any;
    enrollmentLimitData: any;
  };
  onBack?: () => void;
}

const CourseDataSummary: React.FC<CourseDataSummaryProps> = ({
  data,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('选课内容');

  // 格式化班级列表
  const getSelectedClasses = () => {
    if (!data.formData?.selectedClasses) return '';
    const classes: string[] = [];
    data.formData.selectedClasses.forEach((selected: boolean, index: number) => {
      if (selected) {
        classes.push(`高一${index + 1}班`);
      }
    });
    return classes.join('、');
  };

  // 格式化任务描述
  const getTaskDescription = () => {
    const classes = getSelectedClasses();
    return `${classes}`;
  };

  // 获取选课课程信息
  const getCourseGroups = () => {
    if (!data.courseSettings?.courses) return { groupA: [], groupB: [] };
    
    const courses = data.courseSettings.courses;
    const groupA = courses.filter((course: any, index: number) => index % 2 === 0);
    const groupB = courses.filter((course: any, index: number) => index % 2 === 1);
    
    return { groupA, groupB };
  };

  // 获取互斥课程
  const getMutuallyExclusiveCourses = () => {
    return data.courseSettings?.mutuallyExclusiveGroups?.map((group: any) => group.name).join('、') || '';
  };

  // 获取连选课程
  const getLinkedCourses = () => {
    return data.courseSettings?.linkedGroups?.map((group: any) => group.name).join('、') || '';
  };

  // 获取禁选组合
  const getForbiddenCombinations = () => {
    return data.courseSettings?.forbiddenGroups?.map((group: any) => group.name).join('、') || '';
  };

  // 获取限选人数信息
  const getEnrollmentLimits = () => {
    if (!data.enrollmentLimitData?.courseLimits) return '';
    
    const limits: string[] = [];
    Object.entries(data.enrollmentLimitData.courseLimits).forEach(([courseName, limitData]: [string, any]) => {
      const displayName = courseName === '物理_2' ? '物理' : courseName;
      if (limitData.isUnlimited) {
        limits.push(`${displayName}：不限`);
      } else {
        limits.push(`${displayName}：${limitData.limit}人`);
      }
    });
    return limits.join('；');
  };

  // 获取选课权限信息
  const getCoursePermissions = () => {
    if (!data.coursePermissionData?.coursePermissions) return '';
    
    const permissions: string[] = [];
    Object.entries(data.coursePermissionData.coursePermissions).forEach(([courseName, permissionData]: [string, any]) => {
      if (permissionData.hasPermission && permissionData.limitedStudents?.length > 0) {
        const studentNames = permissionData.limitedStudents.map((student: any) => student.name).join('、');
        permissions.push(`${courseName}：${studentNames}`);
      }
    });
    return permissions.join(' ▼\n');
  };

  // 渲染选课内容标签页
  const renderCourseContent = () => {
    const { groupA, groupB } = getCourseGroups();
    
    return (
      <div style={{ padding: '20px' }}>
        {/* 基本信息 */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#374151',
            borderLeft: '4px solid #6366f1',
            paddingLeft: '12px'
          }}>
            基本信息
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex' }}>
              <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px' }}>选课任务名称：</span>
              <span style={{ color: '#374151', fontSize: '14px' }}>{data.formData?.taskName || '选课任务1180'}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px' }}>学年学期：</span>
              <span style={{ color: '#374151', fontSize: '14px' }}>
                {data.formData?.academicYear || '2021-2022学年'}/{data.formData?.academicStage || '第一学期'}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex' }}>
              <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px' }}>学段：</span>
              <span style={{ color: '#374151', fontSize: '14px' }}>{data.formData?.academicStage || '高中'}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px' }}>年级：</span>
              <span style={{ color: '#374151', fontSize: '14px' }}>{data.formData?.grade || '高一'}</span>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>选课班级：</span>
              <span style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>
                {getSelectedClasses()}
              </span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>任务描述：</span>
              <span style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>
                {getTaskDescription()}
              </span>
            </div>
          </div>
        </div>

        {/* 选课设置 */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#374151',
            borderLeft: '4px solid #6366f1',
            paddingLeft: '12px'
          }}>
            选课设置
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>选课课程：</span>
              <div style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>
                <div>A组：{groupA.map((course: any) => course.name).join('、')}【本组应最少选1门，最多选1门】</div>
                <div style={{ marginTop: '4px' }}>B组：{groupB.map((course: any) => course.name).join('、')}【本组应最少选2门，最多选2门】</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex' }}>
              <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px' }}>选课时间：</span>
              <span style={{ color: '#374151', fontSize: '14px' }}>
                {data.courseSettings?.startDate || '2022-7-7'} 8:00——{data.courseSettings?.endDate || '2022-7-14'} 18:00
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>选课说明：</span>
              <span style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>
                {data.courseSettings?.courseDescription || '选课说明内容，选课说明内容选课说明内容选课说明内容选课说明内容，选课说明内容选课说明内容'}
              </span>
            </div>
          </div>

          {getMutuallyExclusiveCourses() && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex' }}>
                <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px' }}>互斥课程：</span>
                <span style={{ color: '#374151', fontSize: '14px' }}>{getMutuallyExclusiveCourses()}</span>
              </div>
            </div>
          )}

          {getLinkedCourses() && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex' }}>
                <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px' }}>连选课程：</span>
                <span style={{ color: '#374151', fontSize: '14px' }}>{getLinkedCourses()}</span>
              </div>
            </div>
          )}

          {getForbiddenCombinations() && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex' }}>
                <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px' }}>禁选组合：</span>
                <span style={{ color: '#374151', fontSize: '14px' }}>{getForbiddenCombinations()}</span>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex' }}>
              <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px' }}>限选人数：</span>
              <span style={{ color: '#374151', fontSize: '14px' }}>{getEnrollmentLimits()}</span>
            </div>
          </div>

          {getCoursePermissions() && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ minWidth: '120px', color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>选课权限：</span>
                <span style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                  {getCoursePermissions()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染选课数据标签页
  const renderCourseData = () => {
    return <CourseDataView />;
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      border: '1px solid #e5e7eb',
      minHeight: '600px',
      overflow: 'hidden'
    }}>
      {/* 标签页头部 */}
      <div style={{ 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div 
          onClick={() => setActiveTab('选课内容')}
          style={{
            padding: '16px 24px',
            cursor: 'pointer',
            borderBottom: activeTab === '选课内容' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === '选课内容' ? '#6366f1' : '#6b7280',
            fontWeight: activeTab === '选课内容' ? '600' : '500',
            fontSize: '14px'
          }}
        >
          选课内容
        </div>
        <div 
          onClick={() => setActiveTab('选课数据')}
          style={{
            padding: '16px 24px',
            cursor: 'pointer',
            borderBottom: activeTab === '选课数据' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === '选课数据' ? '#6366f1' : '#6b7280',
            fontWeight: activeTab === '选课数据' ? '600' : '500',
            fontSize: '14px'
          }}
        >
          选课数据
        </div>
      </div>

      {/* 标签页内容 */}
      <div style={{ minHeight: '500px' }}>
        {activeTab === '选课内容' ? renderCourseContent() : renderCourseData()}
      </div>

      {/* 底部按钮 */}
      {onBack && (
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <button
            onClick={onBack}
            style={{
              padding: '12px 32px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            返回设置
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseDataSummary; 
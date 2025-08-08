import React, { useState, useEffect } from 'react';
import CoursePermissionForm from './CoursePermissionForm';
import EnrollmentLimitForm from './EnrollmentLimitForm';

interface CourseData {
  id: number;
  name: string;
  group?: string;
}

interface CourseGroup {
  id: number;
  name: string;
  minSelect: number;
  maxSelect: number;
}

interface CourseSettingsFormProps {
  onDataChange?: (data: any) => void;
  initialData?: any;
}

const CourseSettingsForm: React.FC<CourseSettingsFormProps> = ({
  onDataChange,
  initialData = {}
}) => {
  // 左侧菜单项
  const menuItems = [
    { key: '选课课程', label: '选课课程', active: true },
    { key: '选课时间', label: '选课时间', active: false },
    { key: '互斥设置', label: '互斥设置', active: false },
    { key: '连选设置', label: '连选设置', active: false },
    { key: '禁选组合', label: '禁选组合', active: false },
    { key: '选课权限', label: '选课权限', active: false },
    { key: '限选人数', label: '限选人数', active: false }
  ];

  // 状态管理
  const [activeMenu, setActiveMenu] = useState('选课课程');
  const [overallMinSelect, setOverallMinSelect] = useState(1);
  const [overallMaxSelect, setOverallMaxSelect] = useState(3);
  const [groupMinSelect, setGroupMinSelect] = useState(1);
  const [groupMaxSelect, setGroupMaxSelect] = useState(2);
  const [courses, setCourses] = useState<CourseData[]>([
    { id: 1, name: '物理' },
    { id: 2, name: '化学' },
    { id: 3, name: '英语' }
  ]);
  const [groups, setGroups] = useState<CourseGroup[]>([]);

  // 添加课程模态框相关状态
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<CourseData[]>([]);
  const [selectedNewCourses, setSelectedNewCourses] = useState<number[]>([]);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<boolean[]>(Array.from({ length: 12 }, () => false));

  // 选课时间相关状态
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [submissionType, setSubmissionType] = useState('single'); // 'single' 或 'multiple'

  // 互斥设置相关状态
  const [mutuallyExclusiveGroups, setMutuallyExclusiveGroups] = useState<Array<{
    id: number;
    name: string;
    courses: string[];
  }>>([
    { id: 1, name: '物理-化学', courses: ['物理', '化学'] }
  ]);
  const [showAddMutualModal, setShowAddMutualModal] = useState(false);
  const [selectedMutualCourses, setSelectedMutualCourses] = useState<string[]>([]);

  // 连选设置相关状态
  const [linkedGroups, setLinkedGroups] = useState<Array<{
    id: number;
    name: string;
    courses: string[];
  }>>([
    { id: 1, name: '语文-数学', courses: ['语文', '数学'] }
  ]);
  const [showAddLinkedModal, setShowAddLinkedModal] = useState(false);
  const [selectedLinkedCourses, setSelectedLinkedCourses] = useState<string[]>([]);

  // 禁选组合相关状态
  const [forbiddenGroups, setForbiddenGroups] = useState<Array<{
    id: number;
    name: string;
    courses: string[];
  }>>([
    { id: 1, name: '历史-政治', courses: ['历史', '政治'] }
  ]);
  const [showAddForbiddenModal, setShowAddForbiddenModal] = useState(false);
  const [selectedForbiddenCourses, setSelectedForbiddenCourses] = useState<string[]>([]);

  // 选课权限和限选人数相关状态
  const [coursePermissionData, setCoursePermissionData] = useState<any>({});
  const [enrollmentLimitData, setEnrollmentLimitData] = useState<any>({});

  // 数据持久化
  useEffect(() => {
    const savedData = localStorage.getItem('courseSettingsData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setActiveMenu(parsed.activeMenu || '选课课程');
      setOverallMinSelect(parsed.overallMinSelect || 1);
      setOverallMaxSelect(parsed.overallMaxSelect || 3);
      setGroupMinSelect(parsed.groupMinSelect || 1);
      setGroupMaxSelect(parsed.groupMaxSelect || 2);
      setCourses(parsed.courses || [{ id: 1, name: '物理' }, { id: 2, name: '化学' }]);
      setGroups(parsed.groups || []);
      setStartDate(parsed.startDate || '');
      setEndDate(parsed.endDate || '');
      setCourseDescription(parsed.courseDescription || '');
      setSubmissionType(parsed.submissionType || 'single');
      setMutuallyExclusiveGroups(parsed.mutuallyExclusiveGroups || [{ id: 1, name: '物理-化学', courses: ['物理', '化学'] }]);
      setLinkedGroups(parsed.linkedGroups || [{ id: 1, name: '语文-数学', courses: ['语文', '数学'] }]);
      setForbiddenGroups(parsed.forbiddenGroups || [{ id: 1, name: '历史-政治', courses: ['历史', '政治'] }]);
      setCoursePermissionData(parsed.coursePermissionData || {});
      setEnrollmentLimitData(parsed.enrollmentLimitData || {});
    }
  }, []);

  useEffect(() => {
    const data = {
      activeMenu,
      overallMinSelect,
      overallMaxSelect,
      groupMinSelect,
      groupMaxSelect,
      courses,
      groups,
      startDate,
      endDate,
      courseDescription,
      submissionType,
      mutuallyExclusiveGroups,
      linkedGroups,
      forbiddenGroups,
      coursePermissionData,
      enrollmentLimitData
    };
    localStorage.setItem('courseSettingsData', JSON.stringify(data));
    if (onDataChange) {
      onDataChange(data);
    }
  }, [activeMenu, overallMinSelect, overallMaxSelect, groupMinSelect, groupMaxSelect, courses, groups, startDate, endDate, courseDescription, submissionType, mutuallyExclusiveGroups, linkedGroups, forbiddenGroups, coursePermissionData, enrollmentLimitData, onDataChange]);

  // 生成可选课程数据
  const generateAvailableCourses = () => {
    const allCourses = [
      '语文', '数学', '英语', '历史', '化学', '物理', '政治'
    ];

    const availableCoursesData: CourseData[] = allCourses.map((name, index) => ({
      id: 100 + index,
      name
    }));

    // 过滤掉已添加的课程
    const existingNames = courses.map(c => c.name);
    return availableCoursesData.filter(course => !existingNames.includes(course.name));
  };

  // 打开添加课程模态框
  const handleAddCourse = () => {
    setShowAddCourseModal(true);
    setAvailableCourses(generateAvailableCourses());
  };

  // 关闭添加课程模态框
  const handleCloseAddCourseModal = () => {
    setShowAddCourseModal(false);
    setCourseSearchTerm('');
    setSelectedSubjects(Array.from({ length: 12 }, () => false));
    setSelectedNewCourses([]);
  };

  // 确认添加课程
  const handleConfirmAddCourses = () => {
    const coursesToAdd = availableCourses.filter(course => 
      selectedNewCourses.includes(course.id)
    );
    
    setCourses(prev => [...prev, ...coursesToAdd]);
    handleCloseAddCourseModal();
  };

  // 删除课程
  const handleDeleteCourse = (courseId: number) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
  };

  // 删除所有课程
  const handleDeleteAllCourses = () => {
    if (window.confirm('确定要删除所有课程吗？')) {
      setCourses([]);
    }
  };

  // 添加分组
  const handleAddGroup = () => {
    const groupName = prompt('请输入分组名称：');
    if (groupName && groupName.trim()) {
      const newGroup: CourseGroup = {
        id: Date.now(),
        name: groupName.trim(),
        minSelect: 1,
        maxSelect: 2
      };
      setGroups(prev => [...prev, newGroup]);
    }
  };

  // 互斥设置相关处理函数
  const handleOpenAddMutualModal = () => {
    setShowAddMutualModal(true);
    setSelectedMutualCourses([]);
  };

  const handleCloseAddMutualModal = () => {
    setShowAddMutualModal(false);
    setSelectedMutualCourses([]);
  };

  const handleMutualCourseToggle = (courseName: string) => {
    setSelectedMutualCourses(prev => {
      if (prev.includes(courseName)) {
        return prev.filter(name => name !== courseName);
      } else {
        return [...prev, courseName];
      }
    });
  };

  const handleConfirmAddMutual = () => {
    if (selectedMutualCourses.length >= 2) {
      const newGroup = {
        id: Date.now(),
        name: selectedMutualCourses.join('-'),
        courses: selectedMutualCourses
      };
      setMutuallyExclusiveGroups(prev => [...prev, newGroup]);
      handleCloseAddMutualModal();
    }
  };

  const handleDeleteMutualGroup = (groupId: number) => {
    setMutuallyExclusiveGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const handleBatchDeleteMutual = () => {
    setMutuallyExclusiveGroups([]);
  };

  // 连选设置相关处理函数
  const handleOpenAddLinkedModal = () => {
    setShowAddLinkedModal(true);
    setSelectedLinkedCourses([]);
  };

  const handleCloseAddLinkedModal = () => {
    setShowAddLinkedModal(false);
    setSelectedLinkedCourses([]);
  };

  const handleLinkedCourseToggle = (courseName: string) => {
    setSelectedLinkedCourses(prev => {
      if (prev.includes(courseName)) {
        return prev.filter(name => name !== courseName);
      } else {
        return [...prev, courseName];
      }
    });
  };

  const handleConfirmAddLinked = () => {
    if (selectedLinkedCourses.length >= 2) {
      const newGroup = {
        id: Date.now(),
        name: selectedLinkedCourses.join('-'),
        courses: selectedLinkedCourses
      };
      setLinkedGroups(prev => [...prev, newGroup]);
      handleCloseAddLinkedModal();
    }
  };

  const handleDeleteLinkedGroup = (groupId: number) => {
    setLinkedGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const handleBatchDeleteLinked = () => {
    setLinkedGroups([]);
  };

  // 禁选组合相关处理函数
  const handleOpenAddForbiddenModal = () => {
    setShowAddForbiddenModal(true);
    setSelectedForbiddenCourses([]);
  };

  const handleCloseAddForbiddenModal = () => {
    setShowAddForbiddenModal(false);
    setSelectedForbiddenCourses([]);
  };

  const handleForbiddenCourseToggle = (courseName: string) => {
    setSelectedForbiddenCourses(prev => {
      if (prev.includes(courseName)) {
        return prev.filter(name => name !== courseName);
      } else {
        return [...prev, courseName];
      }
    });
  };

  const handleConfirmAddForbidden = () => {
    if (selectedForbiddenCourses.length >= 2) {
      const newGroup = {
        id: Date.now(),
        name: selectedForbiddenCourses.join('-'),
        courses: selectedForbiddenCourses
      };
      setForbiddenGroups(prev => [...prev, newGroup]);
      handleCloseAddForbiddenModal();
    }
  };

  const handleDeleteForbiddenGroup = (groupId: number) => {
    setForbiddenGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const handleBatchDeleteForbidden = () => {
    setForbiddenGroups([]);
  };

  // 渲染左侧菜单
  const renderLeftMenu = () => {
    return (
      <div style={{
        width: '200px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '0',
        height: 'fit-content'
      }}>
        {/* 选课课程标题 */}
        <div style={{
          padding: '16px',
          backgroundColor: '#6366f1',
          color: 'white',
          borderRadius: '8px 8px 0 0',
          fontWeight: '600',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          选课课程
          <span>▼</span>
        </div>

        {/* 菜单项 */}
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={() => setActiveMenu(item.key)}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              backgroundColor: activeMenu === item.key ? '#eff6ff' : 'transparent',
              color: activeMenu === item.key ? '#2563eb' : '#6b7280',
              fontSize: '14px',
              borderBottom: '1px solid #f3f4f6',
              transition: 'all 0.2s'
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    );
  };

  // 渲染选课课程内容
  const renderCourseContent = () => {
    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>选课课程</h3>
        
        {/* 整体选课限制 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '14px', color: '#374151' }}>本次选课最少选</span>
            <input
              type="number"
              value={overallMinSelect}
              onChange={(e) => setOverallMinSelect(parseInt(e.target.value) || 1)}
              style={{
                width: '80px',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                textAlign: 'center'
              }}
              min="1"
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>门，最多选择</span>
            <input
              type="number"
              value={overallMaxSelect}
              onChange={(e) => setOverallMaxSelect(parseInt(e.target.value) || 3)}
              style={{
                width: '80px',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                textAlign: 'center'
              }}
              min="1"
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>门。</span>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px'
          }}>
            <span style={{ fontSize: '14px', color: '#374151' }}>本组应选：最少</span>
            <input
              type="number"
              value={groupMinSelect}
              onChange={(e) => setGroupMinSelect(parseInt(e.target.value) || 1)}
              style={{
                width: '80px',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                textAlign: 'center'
              }}
              min="1"
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>门，最多</span>
            <input
              type="number"
              value={groupMaxSelect}
              onChange={(e) => setGroupMaxSelect(parseInt(e.target.value) || 2)}
              style={{
                width: '80px',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                textAlign: 'center'
              }}
              min="1"
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>门。</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '20px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleDeleteAllCourses}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🗑 全部删除
          </button>
        </div>

        {/* 课程列表 */}
        <div style={{ marginBottom: '20px' }}>
          {courses.map((course, index) => (
            <div
              key={course.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                marginBottom: '8px',
                border: '1px solid #e9ecef'
              }}
            >
              <span style={{ fontSize: '14px', color: '#495057' }}>{course.name}</span>
              <button
                onClick={() => handleDeleteCourse(course.id)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  color: '#6366f1',
                  border: '1px solid #6366f1',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🗑 删除
              </button>
            </div>
          ))}
        </div>

        {/* 添加按钮 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={handleAddCourse}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: '#2563eb',
              border: '1px dashed #2563eb',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            ➕ 添加课程
          </button>

          <button
            onClick={handleAddGroup}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: '#2563eb',
              border: '1px dashed #2563eb',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            ➕ 添加分组
          </button>
        </div>

        {/* 保存按钮 */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button
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
            保存
          </button>
        </div>
      </div>
    );
  };

  // 渲染选课时间内容
  const renderTimeContent = () => {
    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>选课时间</h3>
        
        {/* 选课时间设置 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '14px', color: '#374151', minWidth: '80px' }}>选课时间</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* 选课说明 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            color: '#374151',
            fontWeight: '500'
          }}>
            <span style={{ color: '#ef4444', marginRight: '4px' }}>*</span>
            选课说明
          </label>
          <textarea
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
            placeholder="请输入选课说明"
            rows={6}
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* 选课设置 */}
        <div style={{ marginBottom: '40px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '16px', 
            fontSize: '14px', 
            color: '#374151',
            fontWeight: '500'
          }}>
            <span style={{ color: '#ef4444', marginRight: '4px' }}>*</span>
            选课设置
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: submissionType === 'single' ? '#eff6ff' : 'white'
            }}>
              <input
                type="radio"
                name="submissionType"
                value="single"
                checked={submissionType === 'single'}
                onChange={(e) => setSubmissionType(e.target.value)}
                style={{ 
                  marginRight: '12px',
                  accentColor: '#6366f1'
                }}
              />
              <div>
                <div style={{ fontWeight: '500', fontSize: '14px', color: '#374151' }}>
                  单次提交 (勾选后学生在选课时间内只能提交一次)
                </div>
              </div>
            </label>

            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: submissionType === 'multiple' ? '#eff6ff' : 'white'
            }}>
              <input
                type="radio"
                name="submissionType"
                value="multiple"
                checked={submissionType === 'multiple'}
                onChange={(e) => setSubmissionType(e.target.value)}
                style={{ 
                  marginRight: '12px',
                  accentColor: '#6366f1'
                }}
              />
              <div>
                <div style={{ fontWeight: '500', fontSize: '14px', color: '#374151' }}>
                  重复提交 (勾选后学生在选课时间内可重复提交选课结果)
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 保存按钮 */}
        <div style={{ textAlign: 'center' }}>
          <button
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
            保存
          </button>
        </div>
      </div>
    );
  };

  // 渲染互斥设置内容
  const renderMutualContent = () => {
    const allCourseNames = ['语文', '数学', '英语', '历史', '政治', '化学', '物理'];
    
    return (
      <div style={{ padding: '20px' }}>
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
            onClick={handleOpenAddMutualModal}
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
            ➕ 创建互斥课程
          </button>
          
          <button
            onClick={handleBatchDeleteMutual}
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
        </div>

        {/* 互斥课程组合列表 */}
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
          {/* 表头 */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '40px 1fr 100px',
            backgroundColor: '#e2e8f0',
            padding: '12px 16px',
            fontWeight: '600',
            fontSize: '14px',
            color: '#374151'
          }}>
            <div style={{ textAlign: 'center' }}>
              <input type="checkbox" style={{ accentColor: '#6366f1' }} />
            </div>
            <div>互斥课程</div>
            <div style={{ textAlign: 'center' }}>操作</div>
          </div>

          {/* 数据行 */}
          {mutuallyExclusiveGroups.map((group, index) => (
            <div 
              key={group.id}
              style={{ 
                display: 'grid',
                gridTemplateColumns: '40px 1fr 100px',
                padding: '12px 16px',
                backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc',
                borderBottom: index < mutuallyExclusiveGroups.length - 1 ? '1px solid #e5e7eb' : 'none',
                alignItems: 'center'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <input type="checkbox" style={{ accentColor: '#6366f1' }} />
              </div>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                {group.name}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => handleDeleteMutualGroup(group.id)}
                  style={{
                    color: '#6366f1',
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

          {mutuallyExclusiveGroups.length === 0 && (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '14px'
            }}>
              暂无互斥课程设置
            </div>
          )}
        </div>

        {/* 保存按钮 */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
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
            保存
          </button>
        </div>
      </div>
    );
  };

  // 渲染连选设置内容
  const renderLinkedContent = () => {
    return (
      <div style={{ padding: '20px' }}>
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
            onClick={handleOpenAddLinkedModal}
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
            ➕ 创建连选课程
          </button>
          
          <button
            onClick={handleBatchDeleteLinked}
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
        </div>

        {/* 连选课程组合列表 */}
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
          {/* 表头 */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '40px 1fr 100px',
            backgroundColor: '#e2e8f0',
            padding: '12px 16px',
            fontWeight: '600',
            fontSize: '14px',
            color: '#374151'
          }}>
            <div style={{ textAlign: 'center' }}>
              <input type="checkbox" style={{ accentColor: '#6366f1' }} />
            </div>
            <div>连选课程</div>
            <div style={{ textAlign: 'center' }}>操作</div>
          </div>

          {/* 数据行 */}
          {linkedGroups.map((group, index) => (
            <div 
              key={group.id}
              style={{ 
                display: 'grid',
                gridTemplateColumns: '40px 1fr 100px',
                padding: '12px 16px',
                backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc',
                borderBottom: index < linkedGroups.length - 1 ? '1px solid #e5e7eb' : 'none',
                alignItems: 'center'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <input type="checkbox" style={{ accentColor: '#6366f1' }} />
              </div>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                {group.name}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => handleDeleteLinkedGroup(group.id)}
                  style={{
                    color: '#6366f1',
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

          {linkedGroups.length === 0 && (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '14px'
            }}>
              暂无连选课程设置
            </div>
          )}
        </div>

        {/* 保存按钮 */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
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
            保存
          </button>
        </div>
      </div>
    );
  };

  // 渲染禁选组合内容
  const renderForbiddenContent = () => {
    return (
      <div style={{ padding: '20px' }}>
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
            onClick={handleOpenAddForbiddenModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ➕ 创建禁选组合课程
          </button>
          
          <button
            onClick={handleBatchDeleteForbidden}
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
        </div>

        {/* 禁选课程组合列表 */}
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
          {/* 表头 */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '40px 1fr 100px',
            backgroundColor: '#e2e8f0',
            padding: '12px 16px',
            fontWeight: '600',
            fontSize: '14px',
            color: '#374151'
          }}>
            <div style={{ textAlign: 'center' }}>
              <input type="checkbox" style={{ accentColor: '#dc2626' }} />
            </div>
            <div>禁选课程</div>
            <div style={{ textAlign: 'center' }}>操作</div>
          </div>

          {/* 数据行 */}
          {forbiddenGroups.map((group, index) => (
            <div 
              key={group.id}
              style={{ 
                display: 'grid',
                gridTemplateColumns: '40px 1fr 100px',
                padding: '12px 16px',
                backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc',
                borderBottom: index < forbiddenGroups.length - 1 ? '1px solid #e5e7eb' : 'none',
                alignItems: 'center'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <input type="checkbox" style={{ accentColor: '#dc2626' }} />
              </div>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                {group.name}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => handleDeleteForbiddenGroup(group.id)}
                  style={{
                    color: '#dc2626',
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

          {forbiddenGroups.length === 0 && (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '14px'
            }}>
              暂无禁选组合设置
            </div>
          )}
        </div>

        {/* 保存按钮 */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            style={{
              padding: '12px 32px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            保存
          </button>
        </div>
      </div>
    );
  };

  // 渲染选课权限内容
  const renderPermissionContent = () => {
    return (
      <CoursePermissionForm
        onDataChange={setCoursePermissionData}
        initialData={coursePermissionData}
      />
    );
  };

  // 渲染限选人数内容
  const renderEnrollmentLimitContent = () => {
    return (
      <EnrollmentLimitForm
        onDataChange={setEnrollmentLimitData}
        initialData={enrollmentLimitData}
        onPublish={() => {
          // 收集所有数据并触发父组件的完成回调
          const allData = {
            coursePermissionData,
            enrollmentLimitData,
            formData: {
              overallMinSelect,
              overallMaxSelect,
              courses,
              groups,
              startDate,
              endDate,
              courseDescription,
              submissionType,
              mutuallyExclusiveGroups,
              linkedGroups,
              forbiddenGroups
            }
          };
          
          console.log('发布选课设置', allData);
          
          // 保存到localStorage供数据汇总页面使用
          localStorage.setItem('publishedCourseData', JSON.stringify(allData));
          
          alert('选课设置已发布成功！即将显示数据汇总页面。');
        }}
      />
    );
  };

  // 渲染其他菜单内容（占位符）
  const renderOtherContent = () => {
    return (
      <div style={{ 
        padding: '60px 20px', 
        textAlign: 'center', 
        color: '#6b7280',
        fontSize: '16px'
      }}>
        {activeMenu} 功能开发中...
      </div>
    );
  };

  // 过滤可选课程
  const filteredAvailableCourses = availableCourses.filter(course =>
    course.name.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

  // 生成头像颜色
  const getCourseColor = (name: string) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '20px',
      padding: '20px',
      minHeight: '500px'
    }}>
      {/* 左侧菜单 */}
      {renderLeftMenu()}

      {/* 右侧内容区域 */}
      <div style={{
        flex: 1,
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        minHeight: '500px'
      }}>
        {activeMenu === '选课课程' ? renderCourseContent() : 
         activeMenu === '选课时间' ? renderTimeContent() : 
         activeMenu === '互斥设置' ? renderMutualContent() :
         activeMenu === '连选设置' ? renderLinkedContent() :
         activeMenu === '禁选组合' ? renderForbiddenContent() :
         activeMenu === '选课权限' ? renderPermissionContent() :
         activeMenu === '限选人数' ? renderEnrollmentLimitContent() :
         renderOtherContent()}
      </div>

      {/* 添加课程模态框 */}
      {showAddCourseModal && (
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
            maxWidth: '800px',
            height: '70%',
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
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>添加课程</h3>
              <button
                onClick={handleCloseAddCourseModal}
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
              {/* 左侧：课程列表 */}
              <div style={{ flex: 2 }}>
                {/* 搜索 */}
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    value={courseSearchTerm}
                    onChange={(e) => setCourseSearchTerm(e.target.value)}
                    placeholder="请输入课程名称搜索"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                                 {/* 课程网格 */}
                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: 'repeat(3, 1fr)',
                   gap: '16px',
                   maxHeight: '400px',
                   overflowY: 'auto',
                   justifyItems: 'center'
                 }}>
                  {filteredAvailableCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => {
                        if (selectedNewCourses.includes(course.id)) {
                          setSelectedNewCourses(prev => prev.filter(id => id !== course.id));
                        } else {
                          setSelectedNewCourses(prev => [...prev, course.id]);
                        }
                      }}
                                             style={{
                         padding: '20px',
                         border: selectedNewCourses.includes(course.id) ? '2px solid #6366f1' : '1px solid #e9ecef',
                         borderRadius: '12px',
                         textAlign: 'center',
                         cursor: 'pointer',
                         backgroundColor: selectedNewCourses.includes(course.id) ? '#eff6ff' : 'white',
                         transition: 'all 0.2s',
                         minWidth: '120px',
                         boxShadow: selectedNewCourses.includes(course.id) ? '0 4px 12px rgba(99, 102, 241, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                       }}
                    >
                                             <div
                         style={{
                           width: '50px',
                           height: '50px',
                           borderRadius: '50%',
                           backgroundColor: getCourseColor(course.name),
                           color: 'white',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           fontSize: '20px',
                           fontWeight: 'bold',
                           margin: '0 auto 12px',
                           boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                         }}
                       >
                         {course.name.charAt(0)}
                       </div>
                       <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>{course.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 右侧：已选课程 */}
              <div style={{ flex: 1, borderLeft: '1px solid #e9ecef', paddingLeft: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                    已选课程 ({selectedNewCourses.length})
                  </h4>
                </div>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {selectedNewCourses.map(courseId => {
                    const course = availableCourses.find(c => c.id === courseId);
                    if (!course) return null;
                    
                    return (
                      <div key={course.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px',
                        marginBottom: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: getCourseColor(course.name),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            marginRight: '8px'
                          }}
                        >
                          {course.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, fontWeight: '500' }}>{course.name}</div>
                        <button
                          onClick={() => setSelectedNewCourses(prev => prev.filter(id => id !== course.id))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '16px'
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
                onClick={handleCloseAddCourseModal}
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
                onClick={handleConfirmAddCourses}
                disabled={selectedNewCourses.length === 0}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  backgroundColor: selectedNewCourses.length > 0 ? '#6366f1' : '#6c757d',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: selectedNewCourses.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                确定 ({selectedNewCourses.length})
              </button>
            </div>
          </div>
                    </div>
          )}

          {/* 添加互斥课程组合模态框 */}
          {showAddMutualModal && (
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
                width: '600px',
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
                    添加互斥课程
                  </h3>
                  <button
                    onClick={handleCloseAddMutualModal}
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

                {/* 模态框内容 */}
                <div style={{ display: 'flex', height: '500px' }}>
                  {/* 左侧：课程列表 */}
                  <div style={{ flex: 2, padding: '20px', borderRight: '1px solid #e5e7eb' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                      选择课程 (至少选择2门课程)
                    </h4>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {['语文', '数学', '英语', '历史'].map((courseName) => (
                        <div
                          key={courseName}
                          onClick={() => handleMutualCourseToggle(courseName)}
                          style={{
                            padding: '16px',
                            border: selectedMutualCourses.includes(courseName) ? '2px solid #6366f1' : '1px solid #e9ecef',
                            borderRadius: '8px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: selectedMutualCourses.includes(courseName) ? '#eff6ff' : 'white',
                            transition: 'all 0.2s',
                            boxShadow: selectedMutualCourses.includes(courseName) ? '0 4px 12px rgba(99, 102, 241, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: getCourseColor(courseName),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            margin: '0 auto 8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                          }}>
                            {courseName.charAt(0)}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                            {courseName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 右侧：已选课程预览 */}
                  <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8fafc' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                      已选课程 ({selectedMutualCourses.length})
                    </h4>
                    
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {selectedMutualCourses.length === 0 ? (
                        <div style={{ 
                          padding: '20px', 
                          textAlign: 'center', 
                          color: '#6b7280', 
                          fontSize: '14px' 
                        }}>
                          请选择课程
                        </div>
                      ) : (
                        selectedMutualCourses.map((courseName, index) => (
                          <div
                            key={courseName}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px',
                              marginBottom: '8px',
                              backgroundColor: 'white',
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: getCourseColor(courseName),
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {courseName.charAt(0)}
                            </div>
                            <span style={{ fontSize: '14px', color: '#374151' }}>{courseName}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {selectedMutualCourses.length >= 2 && (
                      <div style={{ 
                        marginTop: '16px', 
                        padding: '12px', 
                        backgroundColor: '#dcfce7', 
                        borderRadius: '6px',
                        border: '1px solid #bbf7d0'
                      }}>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                          互斥组合名称:
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}>
                          {selectedMutualCourses.join('-')}
                        </div>
                      </div>
                    )}
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
                    onClick={handleCloseAddMutualModal}
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
                    onClick={handleConfirmAddMutual}
                    disabled={selectedMutualCourses.length < 2}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: selectedMutualCourses.length >= 2 ? '#6366f1' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: selectedMutualCourses.length >= 2 ? 'pointer' : 'not-allowed',
                      fontWeight: '500'
                    }}
                  >
                    确定
                  </button>
                </div>
              </div>
                         </div>
           )}

          {/* 添加连选课程组合模态框 */}
          {showAddLinkedModal && (
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
                width: '600px',
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
                    添加连选课程
                  </h3>
                  <button
                    onClick={handleCloseAddLinkedModal}
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

                {/* 模态框内容 */}
                <div style={{ display: 'flex', height: '500px' }}>
                  {/* 左侧：课程列表 */}
                  <div style={{ flex: 2, padding: '20px', borderRight: '1px solid #e5e7eb' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                      选择课程 (至少选择2门课程)
                    </h4>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {['政治', '化学', '物理', '英语'].map((courseName) => (
                        <div
                          key={courseName}
                          onClick={() => handleLinkedCourseToggle(courseName)}
                          style={{
                            padding: '16px',
                            border: selectedLinkedCourses.includes(courseName) ? '2px solid #10b981' : '1px solid #e9ecef',
                            borderRadius: '8px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: selectedLinkedCourses.includes(courseName) ? '#ecfdf5' : 'white',
                            transition: 'all 0.2s',
                            boxShadow: selectedLinkedCourses.includes(courseName) ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: getCourseColor(courseName),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            margin: '0 auto 8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                          }}>
                            {courseName.charAt(0)}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                            {courseName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 右侧：已选课程预览 */}
                  <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8fafc' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                      已选课程 ({selectedLinkedCourses.length})
                    </h4>
                    
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {selectedLinkedCourses.length === 0 ? (
                        <div style={{ 
                          padding: '20px', 
                          textAlign: 'center', 
                          color: '#6b7280', 
                          fontSize: '14px' 
                        }}>
                          请选择课程
                        </div>
                      ) : (
                        selectedLinkedCourses.map((courseName, index) => (
                          <div
                            key={courseName}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px',
                              marginBottom: '8px',
                              backgroundColor: 'white',
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: getCourseColor(courseName),
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {courseName.charAt(0)}
                            </div>
                            <span style={{ fontSize: '14px', color: '#374151' }}>{courseName}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {selectedLinkedCourses.length >= 2 && (
                      <div style={{ 
                        marginTop: '16px', 
                        padding: '12px', 
                        backgroundColor: '#dcfce7', 
                        borderRadius: '6px',
                        border: '1px solid #bbf7d0'
                      }}>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                          连选组合名称:
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}>
                          {selectedLinkedCourses.join('-')}
                        </div>
                      </div>
                    )}
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
                    onClick={handleCloseAddLinkedModal}
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
                    onClick={handleConfirmAddLinked}
                    disabled={selectedLinkedCourses.length < 2}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: selectedLinkedCourses.length >= 2 ? '#10b981' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: selectedLinkedCourses.length >= 2 ? 'pointer' : 'not-allowed',
                      fontWeight: '500'
                    }}
                  >
                    确定
                  </button>
                </div>
              </div>
                         </div>
           )}

          {/* 添加禁选组合课程模态框 */}
          {showAddForbiddenModal && (
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
                width: '600px',
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
                    添加禁选组合课程
                  </h3>
                  <button
                    onClick={handleCloseAddForbiddenModal}
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

                {/* 模态框内容 */}
                <div style={{ display: 'flex', height: '500px' }}>
                  {/* 左侧：课程列表 */}
                  <div style={{ flex: 2, padding: '20px', borderRight: '1px solid #e5e7eb' }}>
                    <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
                      从下列课程中选择多门课程组成选课组
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '12px',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {['语文', '数学', '英语', '历史'].map((courseName) => (
                        <label
                          key={courseName}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            border: selectedForbiddenCourses.includes(courseName) ? '2px solid #dc2626' : '1px solid #e9ecef',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: selectedForbiddenCourses.includes(courseName) ? '#fef2f2' : 'white',
                            transition: 'all 0.2s',
                            boxShadow: selectedForbiddenCourses.includes(courseName) ? '0 4px 12px rgba(220, 38, 38, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedForbiddenCourses.includes(courseName)}
                            onChange={() => handleForbiddenCourseToggle(courseName)}
                            style={{
                              accentColor: '#dc2626',
                              width: '16px',
                              height: '16px'
                            }}
                          />
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: getCourseColor(courseName),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                          }}>
                            {courseName.charAt(0)}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                            {courseName}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 右侧：已选课程预览 */}
                  <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8fafc' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                      已选课程 ({selectedForbiddenCourses.length})
                    </h4>
                    
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {selectedForbiddenCourses.length === 0 ? (
                        <div style={{ 
                          padding: '20px', 
                          textAlign: 'center', 
                          color: '#6b7280', 
                          fontSize: '14px' 
                        }}>
                          请选择课程
                        </div>
                      ) : (
                        selectedForbiddenCourses.map((courseName, index) => (
                          <div
                            key={courseName}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px',
                              marginBottom: '8px',
                              backgroundColor: 'white',
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: getCourseColor(courseName),
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {courseName.charAt(0)}
                            </div>
                            <span style={{ fontSize: '14px', color: '#374151' }}>{courseName}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {selectedForbiddenCourses.length >= 2 && (
                      <div style={{ 
                        marginTop: '16px', 
                        padding: '12px', 
                        backgroundColor: '#fef2f2', 
                        borderRadius: '6px',
                        border: '1px solid #fecaca'
                      }}>
                        <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
                          禁选组合名称:
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}>
                          {selectedForbiddenCourses.join('-')}
                        </div>
                      </div>
                    )}
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
                    onClick={handleCloseAddForbiddenModal}
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
                    onClick={handleConfirmAddForbidden}
                    disabled={selectedForbiddenCourses.length < 2}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: selectedForbiddenCourses.length >= 2 ? '#dc2626' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: selectedForbiddenCourses.length >= 2 ? 'pointer' : 'not-allowed',
                      fontWeight: '500'
                    }}
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default CourseSettingsForm; 
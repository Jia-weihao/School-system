import React, { useState, useEffect } from 'react';

interface CourseTask {
  id: number;
  name: string;
  createDate: string;
  grade: string;
  classes: string;
  status: string;
  createTime: string;
}

interface CourseStats {
  courseName: string;
  total: number;
  grade1: number;
  grade2: number;
  grade3: number;
}

interface StudentStats {
  name: string;
  total: number;
  grade1: number;
  grade2: number;
  grade3: number;
}

interface CourseDataViewProps {
  onBack?: () => void;
}

const CourseDataView: React.FC<CourseDataViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('选课任务');
  const [selectedFilters, setSelectedFilters] = useState({
    物理: true,
    化学: true,
    生物: false,
    历史: false,
    政治: false,
    地理: false
  });

  // 生成随机学生姓名
  const generateRandomName = () => {
    const surnames = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡'];
    const maleNames = ['伟', '强', '磊', '军', '洋', '勇', '杰', '峰', '超', '辉', '鹏', '涛', '明', '华', '建'];
    const femaleNames = ['丽', '娜', '敏', '静', '秀', '芳', '艳', '莉', '红', '梅', '琳', '雪', '燕', '玲', '佳'];
    
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const isMale = Math.random() > 0.5;
    const namePool = isMale ? maleNames : femaleNames;
    const givenName = namePool[Math.floor(Math.random() * namePool.length)];
    
    return surname + givenName;
  };

  // 生成随机课程任务数据
  const generateCourseTasks = (): CourseTask[] => {
    const classes = ['一班', '二班', '三班'];
    const courseOptions = ['化学、物理、生物', '历史、政治、地理', '物理、化学、历史', '生物、政治、地理'];
    
    return Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      name: generateRandomName(),
      createDate: '2022/01/23',
      grade: classes[Math.floor(Math.random() * classes.length)],
      classes: courseOptions[Math.floor(Math.random() * courseOptions.length)],
      status: '选课',
      createTime: '2022-07-14 09:14:24'
    }));
  };

  // 模拟选课任务数据
  const [courseTasks] = useState<CourseTask[]>(generateCourseTasks());

  // 模拟课程统计数据
  const [courseStats] = useState<CourseStats[]>([
    { courseName: '物理', total: 120, grade1: 34, grade2: 23, grade3: 23 },
    { courseName: '历史', total: 150, grade1: 34, grade2: 23, grade3: 23 },
    { courseName: '化学', total: 260, grade1: 34, grade2: 23, grade3: 23 },
    { courseName: '生物', total: 110, grade1: 34, grade2: 23, grade3: 23 },
    { courseName: '政治', total: 140, grade1: 34, grade2: 23, grade3: 23 },
    { courseName: '地理', total: 180, grade1: 34, grade2: 23, grade3: 23 }
  ]);

  // 模拟学生统计数据
  const [studentStats] = useState<StudentStats[]>([
    { name: '物理生', total: 43, grade1: 12, grade2: 34, grade3: 23 },
    { name: '物理政', total: 54, grade1: 12, grade2: 34, grade3: 23 },
    { name: '物理地', total: 34, grade1: 12, grade2: 34, grade3: 23 },
    { name: '物理地', total: 43, grade1: 12, grade2: 34, grade3: 23 },
    { name: '物理政', total: 54, grade1: 12, grade2: 34, grade3: 23 },
    { name: '物理地', total: 54, grade1: 12, grade2: 34, grade3: 23 },
    { name: '历史生', total: 43, grade1: 12, grade2: 34, grade3: 23 },
    { name: '历史政', total: 54, grade1: 12, grade2: 34, grade3: 23 },
    { name: '历史地', total: 54, grade1: 12, grade2: 34, grade3: 23 },
    { name: '历史地', total: 43, grade1: 12, grade2: 34, grade3: 23 },
    { name: '历史政', total: 54, grade1: 12, grade2: 34, grade3: 23 },
    { name: '历史地', total: 54, grade1: 12, grade2: 34, grade3: 23 }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  // 处理筛选器变化
  const handleFilterChange = (course: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [course]: !prev[course as keyof typeof prev]
    }));
  };

  // 获取筛选后的课程统计数据
  const getFilteredCourseStats = () => {
    return courseStats.filter(stat => selectedFilters[stat.courseName as keyof typeof selectedFilters]);
  };

  // 获取当前页的任务
  const getCurrentPageTasks = () => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    return courseTasks.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(courseTasks.length / tasksPerPage);

  // 渲染选课任务列表
  const renderTaskList = () => {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {/* 工具栏 */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            ➕ 新增选课任务
          </button>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            🗑️ 批量删除
          </button>
        </div>

        {/* 搜索栏 */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input 
            placeholder="请输入姓名"
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              width: '200px'
            }}
          />
          <select style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            width: '120px'
          }}>
            <option>一班</option>
          </select>
          <select style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            width: '100px'
          }}>
            <option>任务</option>
          </select>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            查询
          </button>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            重置
          </button>
          <a href="#" style={{ fontSize: '14px', color: '#6366f1', textDecoration: 'none' }}>⬇️ 导出选课数据</a>
        </div>

        {/* 表格 */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                  序号
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                  姓名
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                  学号
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                  班级
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                  已选课程
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                  选课时间
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {getCurrentPageTasks().map((task, index) => (
                <tr key={task.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                    {(currentPage - 1) * tasksPerPage + index + 1}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                    {task.name}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                    {task.createDate}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                    {task.grade}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                    {task.classes}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                    {task.createTime}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button style={{
                      color: '#6366f1',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textDecoration: 'underline'
                    }}>
                      选课
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            共 {courseTasks.length} 条，每页 {tasksPerPage} 条
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: currentPage === 1 ? '#9ca3af' : '#374151',
                fontSize: '14px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              首页
            </button>
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: currentPage === 1 ? '#9ca3af' : '#374151',
                fontSize: '14px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              上一页
            </button>
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '6px 12px',
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
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                fontSize: '14px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              下一页
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                fontSize: '14px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              尾页
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染数据统计
  const renderDataStats = () => {
    const filteredStats = getFilteredCourseStats();
    const maxValue = Math.max(...filteredStats.map(stat => stat.total));

    return (
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
        {/* 工具栏 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            数据下载
          </button>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            批量下载
          </button>
        </div>

        {/* 筛选器 */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151', borderLeft: '4px solid #6366f1', paddingLeft: '12px' }}>
            课程统计
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {Object.entries(selectedFilters).map(([course, selected]) => (
              <label key={course} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => handleFilterChange(course)}
                  style={{ accentColor: '#6366f1' }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>{course}</span>
              </label>
            ))}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <button style={{
              padding: '6px 16px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              筛选
            </button>
            <button style={{
              padding: '6px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              重置
            </button>
          </div>
        </div>

        {/* 柱状图 */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'end', gap: '40px', height: '300px', padding: '20px 0' }}>
            {filteredStats.map((stat, index) => (
              <div key={stat.courseName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: '60px',
                  height: `${(stat.total / maxValue) * 200}px`,
                  backgroundColor: '#6366f1',
                  borderRadius: '4px 4px 0 0',
                  marginBottom: '8px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '8px'
                }}>
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>
                    {stat.total}
                  </span>
                </div>
                <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                  {stat.courseName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 课程统计表格 */}
        <div style={{ marginBottom: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}></th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>物理</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>历史</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>化学</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>生物</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>政治</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>地理</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb', fontWeight: '600' }}>高一一班（人数）</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>12</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>34</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>23</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>23</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>13</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>34</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb', fontWeight: '600' }}>高一二班（人数）</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>12</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>34</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>23</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>23</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>13</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>34</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb', fontWeight: '600' }}>高一三班（人数）</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>12</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>34</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>23</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>23</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>13</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>34</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 学生统计 */}
        <div>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151', borderLeft: '4px solid #6366f1', paddingLeft: '12px' }}>
            学生统计
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>各大类</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>高一一班</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>高一二班</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>高一三班</th>
              </tr>
            </thead>
            <tbody>
              {studentStats.map((stat, index) => (
                <tr key={index}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb', fontWeight: '600' }}>
                    {stat.name}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>
                    {stat.grade1}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>
                    {stat.grade2}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>
                    {stat.grade3}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 标签页头部 */}
      <div style={{ 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div 
          onClick={() => setActiveTab('选课任务')}
          style={{
            padding: '16px 24px',
            cursor: 'pointer',
            borderBottom: activeTab === '选课任务' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === '选课任务' ? '#6366f1' : '#6b7280',
            fontWeight: activeTab === '选课任务' ? '600' : '500',
            fontSize: '14px'
          }}
        >
          选课任务
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
      <div>
        {activeTab === '选课任务' ? renderTaskList() : renderDataStats()}
      </div>

      {/* 返回按钮 */}
      {onBack && (
        <div style={{ 
          padding: '20px 0', 
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
            返回
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseDataView; 
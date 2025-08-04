'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './setting.module.css';

// 定义设置数据类型
interface Setting {
  _id: string;
  name: string;
  academicYear: string;
  semester: string;
  target: string;
  time: string;
  status: string | number;
}

// 编辑表单数据类型
interface EditFormData {
  name: string;
  academicYear: string;
  semester: string;
  target: string;
  time: string;
}

export default function CourseSelectionSetting() {
  const [searchForm, setSearchForm] = useState({
    courseName: '',
    semester: '全部',
    status: '全部'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '',
    academicYear: '',
    semester: '',
    target: '',
    time: ''
  });
  const router = useRouter();

  // API基础URL
  const API_BASE_URL = 'http://localhost:3000/api/setting';

  // 获取所有设置
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSettings(data);
      setTotalCount(data.length);
      setError(null);
      return data; // 返回获取到的数据
    } catch (err) {
      console.error('获取设置失败:', err);
      setError('获取数据失败，请检查网络连接');
      throw err; // 抛出错误以便在调用处捕获
    } finally {
      setLoading(false);
    }
  };

  // 创建新设置
  const createSetting = async (settingData: Omit<Setting, '_id'>) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newSetting = await response.json();
      setSettings(prev => [...prev, newSetting]);
      return newSetting;
    } catch (err) {
      console.error('创建设置失败:', err);
      throw err;
    }
  };

  // 更新设置
  const updateSetting = async (id: string, settingData: Partial<Setting>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedSetting = await response.json();
      setSettings(prev => prev.map(setting => 
        setting._id === id ? updatedSetting : setting
      ));
      return updatedSetting;
    } catch (err) {
      console.error('更新设置失败:', err);
      throw err;
    }
  };

  // 删除设置
  const deleteSetting = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setSettings(prev => prev.filter(setting => setting._id !== id));
    } catch (err) {
      console.error('删除设置失败:', err);
      throw err;
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    fetchSettings();
  }, []);

  // 处理搜索
  const handleSearch = () => {
    console.log('搜索条件:', searchForm);
    
    // 从后端获取所有数据，然后在前端进行筛选
    fetchSettings()
      .then((allData) => {
        // 在获取到最新数据后进行筛选
        const filteredSettings = allData.filter((setting: Setting) => {
          // 选课名称筛选（如果输入了名称则进行筛选，否则不筛选）
          const nameMatch = !searchForm.courseName || 
            setting.name.toLowerCase().includes(searchForm.courseName.toLowerCase());
          
          // 学期筛选（如果选择了特定学期则进行筛选，否则不筛选）
          const semesterMatch = searchForm.semester === '全部' || 
            setting.semester === searchForm.semester;
          
          // 状态筛选（如果选择了特定状态则进行筛选，否则不筛选）
          const statusText = getStatusText(setting.status);
          const statusMatch = searchForm.status === '全部' || 
            statusText === searchForm.status;
          
          // 所有条件都满足才返回true
          return nameMatch && semesterMatch && statusMatch;
        });
        
        // 更新显示的数据
        setSettings(filteredSettings);
      })
      .catch(err => {
        console.error('搜索失败:', err);
        alert('搜索失败，请重试');
      });
  };

  // 重置搜索
  const handleReset = () => {
    // 重置搜索表单
    setSearchForm({
      courseName: '',
      semester: '全部',
      status: '全部'
    });
    
    // 重新获取所有数据
    fetchSettings()
      .catch(err => {
        console.error('重置失败:', err);
        alert('重置失败，请重试');
      });
  };

  // 新增任务
  const handleNewTask = () => {
    // 导航到创建新任务的页面
    router.push('/scc/create');
  };

  // 开始编辑任务
  const handleStartEdit = (setting: Setting) => {
    setEditingId(setting._id);
    setEditFormData({
      name: setting.name,
      academicYear: setting.academicYear,
      semester: setting.semester,
      target: setting.target,
      time: setting.time
    });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // 保存编辑
  const handleSaveEdit = (id: string) => {
    updateSetting(id, editFormData)
      .then(() => {
        console.log('任务更新成功');
        setEditingId(null); // 退出编辑模式
      })
      .catch(err => {
        console.error('更新任务失败:', err);
        alert('更新任务失败');
      });
  };

  // 处理表单字段变化
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 编辑任务
  const handleEdit = (id: string) => {
    const setting = settings.find(s => s._id === id);
    if (setting) {
      const newName = prompt('请输入新的任务名称:', setting.name);
      if (newName && newName !== setting.name) {
        updateSetting(id, { name: newName })
          .then(() => {
            console.log('任务更新成功');
          })
          .catch(err => {
            console.error('更新任务失败:', err);
            alert('更新任务失败');
          });
      }
    }
  };

  // 删除任务
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      deleteSetting(id)
        .then(() => {
          console.log('任务删除成功');
        })
        .catch(err => {
          console.error('删除任务失败:', err);
          alert('删除任务失败');
        });
    }
  };

  // 发布任务
  const handlePublish = (id: string) => {
    updateSetting(id, { status: 1 }) // 1 表示 "未开始"
      .then(() => {
        console.log('任务发布成功');
      })
      .catch(err => {
        console.error('发布任务失败:', err);
        alert('发布任务失败');
      });
  };

  // 完成任务
  const handleComplete = (id: string) => {
    updateSetting(id, { status: 4 }) // 4 表示 "已完成"
      .then(() => {
        console.log('任务完成');
      })
      .catch(err => {
        console.error('完成任务失败:', err);
        alert('完成任务失败');
      });
  };

  // 获取状态颜色
  const getStatusColor = (status: string | number) => {
    // 状态码映射
    const statusMap: Record<string | number, string> = {
      '0': '未发布',
      '1': '未开始',
      '2': '进行中',
      '3': '已结束',
      '4': '已完成'
    };

    // 将状态码转换为文本
    const statusText = typeof status === 'number' ? statusMap[status] : (statusMap[status] || status);
    
    switch (statusText) {
      case '未发布':
        return styles.statusUnpublished;
      case '未开始':
        return styles.statusNotStarted;
      case '进行中':
        return styles.statusInProgress;
      case '已结束':
        return styles.statusEnded;
      case '已完成':
        return styles.statusCompleted;
      default:
        return styles.statusDefault;
    }
  };

  // 获取状态文本
  const getStatusText = (status: string | number) => {
    const statusMap: Record<string | number, string> = {
      '0': '未发布',
      '1': '未开始',
      '2': '进行中',
      '3': '已结束',
      '4': '已完成'
    };
    
    return typeof status === 'number' ? statusMap[status] : (statusMap[status] || status.toString());
  };

  // 渲染操作按钮
  const renderOperationButtons = (setting: Setting) => {
    // 如果当前行正在编辑中，显示保存和取消按钮
    if (editingId === setting._id) {
      return (
        <>
          <button className={styles.operationBtn} onClick={() => handleSaveEdit(setting._id)}>保存</button>
          <button className={styles.operationBtn} onClick={handleCancelEdit}>取消</button>
        </>
      );
    }

    // 获取状态文本
    const statusText = getStatusText(setting.status);
    
    switch (statusText) {
      case '未发布':
        return (
          <>
            <button className={styles.operationBtn} onClick={() => handleStartEdit(setting)}>编辑</button>
            <button className={styles.operationBtn} onClick={() => handleDelete(setting._id)}>删除</button>
            <button className={styles.operationBtn} onClick={() => handlePublish(setting._id)}>发布</button>
          </>
        );
      case '未开始':
        return (
          <>
            <button className={styles.operationBtn}>查看选课数据</button>
            <button className={styles.operationBtn} onClick={() => handleDelete(setting._id)}>删除</button>
          </>
        );
      case '进行中':
        return (
          <>
            <button className={styles.operationBtn}>查看选课数据</button>
            <button className={styles.operationBtn} onClick={() => handleDelete(setting._id)}>删除</button>
            <button className={styles.operationBtn} onClick={() => handleComplete(setting._id)}>完成任务</button>
          </>
        );
      case '已结束':
      case '已完成':
        return (
          <>
            <button className={styles.operationBtn}>查看选课数据</button>
            <button className={styles.operationBtn} onClick={() => handleDelete(setting._id)}>删除</button>
          </>
        );
      default:
        return null;
    }
  };

  // 格式化时间显示
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('zh-CN');
    } catch {
      return timeString;
    }
  };

  // 渲染表格单元格
  const renderCell = (setting: Setting, field: keyof Setting) => {
    // 如果当前行正在编辑中且字段可编辑
    if (editingId === setting._id && field !== '_id' && field !== 'status') {
      if (field === 'time') {
        // 时间输入框
        return (
          <input
            type="datetime-local"
            name={field}
            value={editFormData[field as keyof EditFormData]}
            onChange={handleEditFormChange}
            className={styles.editInput}
          />
        );
      } else if (field === 'semester') {
        // 学期下拉框
        return (
          <select
            name={field}
            value={editFormData[field]}
            onChange={handleEditFormChange}
            className={styles.editSelect}
          >
            {semesterOptions.filter(option => option !== '全部').map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      } else if (field === 'academicYear') {
        // 学年下拉框
        return (
          <select
            name={field}
            value={editFormData[field]}
            onChange={handleEditFormChange}
            className={styles.editSelect}
          >
            {academicYearOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      } else {
        // 文本输入框
        return (
          <input
            type="text"
            name={field}
            value={editFormData[field as keyof EditFormData]}
            onChange={handleEditFormChange}
            className={styles.editInput}
          />
        );
      }
    }

    // 非编辑状态，显示普通文本
    if (field === 'time') {
      return formatTime(setting[field] as string);
    } else if (field === 'status') {
      return (
        <span className={`${styles.statusBadge} ${getStatusColor(setting[field])}`}>
          {getStatusText(setting[field])}
        </span>
      );
    }
    
    return setting[field];
  };

  // 定义学期选项
  const semesterOptions = [
    '全部',
    '2021-2022第一学期',
    '2021-2022第二学期',
    '2022-2023第一学期',
    '2022-2023第二学期',
    '2023-2024第一学期',
    '2023-2024第二学期',
    '2024-2025第一学期',
    '2024-2025第二学期'
  ];

  // 定义学年选项
  const academicYearOptions = [
    '2021-2022学年',
    '2022-2023学年',
    '2023-2024学年',
    '2024-2025学年'
  ];

  if (loading && settings.length === 0) {
    return (
      <div className={styles.courseSelectionSetting}>
        <div className={styles.pageTitle}>
          <h1>选课设置</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          加载中...
        </div>
      </div>
    );
  }

  if (error && settings.length === 0) {
    return (
      <div className={styles.courseSelectionSetting}>
        <div className={styles.pageTitle}>
          <h1>选课设置</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          {error}
          <br />
          <button onClick={fetchSettings}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.courseSelectionSetting}>
      {/* 页面标题 */}
      <div className={styles.pageTitle}>
        <h1>选课设置</h1>
      </div>

      {/* 搜索筛选区域 */}
      <div className={styles.searchSection}>
        <div className={styles.searchForm}>
          <div className={styles.formItem}>
            <label>选课名称：</label>
            <input
              type="text"
              placeholder="请输入选课名称"
              value={searchForm.courseName}
              onChange={(e) => setSearchForm({...searchForm, courseName: e.target.value})}
            />
          </div>
          <div className={styles.formItem}>
            <label>学期：</label>
            <select
              value={searchForm.semester}
              onChange={(e) => setSearchForm({...searchForm, semester: e.target.value})}
            >
              {semesterOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className={styles.formItem}>
            <label>状态：</label>
            <select
              value={searchForm.status}
              onChange={(e) => setSearchForm({...searchForm, status: e.target.value})}
            >
              <option value="全部">全部</option>
              <option value="未发布">未发布</option>
              <option value="未开始">未开始</option>
              <option value="进行中">进行中</option>
              <option value="已结束">已结束</option>
              <option value="已完成">已完成</option>
            </select>
          </div>
        </div>
        <div className={styles.searchButtons}>
          <button className={styles.searchBtn} onClick={handleSearch}>查询</button>
          <button className={styles.resetBtn} onClick={handleReset}>重置</button>
        </div>
      </div>

      {/* 操作按钮区域 */}
      <div className={styles.actionSection}>
        <button className={styles.actionBtn} onClick={handleNewTask}>
          ➕ 新增任务
        </button>
      </div>

      {/* 表格区域 */}
      <div className={styles.tableSection}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>序号</th>
              <th>选课任务名称</th>
              <th>学年</th>
              <th>学期</th>
              <th>选课对象</th>
              <th>选课时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((setting, index) => (
              <tr key={setting._id} className={editingId === setting._id ? styles.editingRow : ''}>
                <td>{index + 1}</td>
                <td>{renderCell(setting, 'name')}</td>
                <td>{renderCell(setting, 'academicYear')}</td>
                <td>{renderCell(setting, 'semester')}</td>
                <td>{renderCell(setting, 'target')}</td>
                <td>{renderCell(setting, 'time')}</td>
                <td>{renderCell(setting, 'status')}</td>
                <td className={styles.operationCell}>
                  {renderOperationButtons(setting)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页区域 */}
      <div className={styles.paginationSection}>
        <div className={styles.paginationInfo}>
          <span>共{totalCount}条</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={10}>每页 10 条</option>
            <option value={20}>每页 20 条</option>
            <option value={50}>每页 50 条</option>
          </select>
        </div>
        <div className={styles.paginationControls}>
          <button className={styles.pageBtn} disabled={currentPage === 1}>
            &lt;
          </button>
          <button className={`${styles.pageBtn} ${currentPage === 1 ? styles.active : ''}`}>
            1
          </button>
          <button className={`${styles.pageBtn} ${currentPage === 2 ? styles.active : ''}`}>
            2
          </button>
          <button className={`${styles.pageBtn} ${currentPage === 3 ? styles.active : ''}`}>
            3
          </button>
          <button className={`${styles.pageBtn} ${currentPage === 4 ? styles.active : ''}`}>
            4
          </button>
          <button className={`${styles.pageBtn} ${currentPage === 5 ? styles.active : ''}`}>
            5
          </button>
          <button className={styles.pageBtn}>
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
} 
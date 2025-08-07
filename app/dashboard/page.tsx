'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import BigScreenDashboard from './BigScreenDashboard';
import LoginForm from '../../components/LoginForm';
import { useAuth } from '../../context/AuthContext';
import CourseSelectionSetting from '../scc/setting';
import CreateCourse from '../scc/create';
import Fenban from '../sccfb/fenban';


import ResourceManagement from '../../components/ResourceManagement';
import Information from '@/components/Information';
import Teachers from '@/components/Teachers';
import api from '../tools/api';
import axios from 'axios';
import Student from '@/components/Student';
import ClassManagement from '../../components/ClassManagement';

// nty的modify.tsx导入图片批改组件
import Modify from '../nty/modify';
// nty的correct.tsx导入组件
import Correct, { AnimatedNumber } from '../nty/correct';
import State from '../nty/state'
import Statistics from '../nty/Statistics'


// mkh
import SubjectConfig from '../mkh/subjectConfig';
import SYearConfig from '../mkh/sYearConfig';
import LessonConfig from '../mkh/lessonConfig';


export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState('教务管理');
  const [activeSubmenu, setActiveSubmenu] = useState('基础信息管理');

  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    // 添加调试信息
    console.log('Dashboard页面状态:', { user, loading });

    // 如果未登录且不在加载状态，重定向到登录页面
    if (!loading && !user) {
      console.log('未检测到登录用户，重定向到登录页');
      router.replace('/login');
    }
  }, [loading, user, router]);

  // Define menu items with their permissions
  const allMenuItems = [
    {
      name: '首页',
      icon: '🏠',
      roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director', 'teacher'],
    },
    //贾维浩
    {
      name: '教务管理',
      icon: '📚',
      roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director', 'teacher'],
      submenu: [
        { name: '基础信息管理', roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director'] },
        { name: '教师管理', roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director'] },
        { name: '学生管理', roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director'] },
        { name: '班级管理', roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director'] }
      ],
    },
    //许宇航
    {
      name: '资源管理',
      icon: '📦',
      roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director', 'teacher'],
      submenu: [
        { name: '教学资源管理', roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director', 'teacher'] },
        { name: '课外资源管理', roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director', 'teacher'] },
        { name: '资源类型管理', roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director', 'teacher'] }
      ]
    },
    {
      name: '走班排课',
      icon: '🚶‍♂️',
      roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director'],
      submenu:[
        {name:'选课设置',roles:['principal','academic_director','academic_staff','teaching_director','teacher']},
        {name:'智能分班',roles:['principal','academic_director','academic_staff','teaching_director','teacher']},
        {name:'走班排课',roles:['principal','academic_director','academic_staff','teaching_director','teacher']}
      ]
    },
    //nty
    {
      name: '作业管理',
      icon: '📝',
      roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director', 'teacher'],
      submenu: [
        { name: '学生成绩', roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director', 'teacher'] },
        { name: '作业统计', roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director', 'teacher'] },
        { name: '学生状态', roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director', 'teacher'] },
        { name: '学生作业批改', roles: ['principal', 'academic_director', 'academic_staff', 'teaching_director', 'teacher'] }
      ]
    },
    {
      name: '配置管理',
      icon: '⚙️',
      roles: ['principal'],
      submenu: [
        { name: '学年学科配置', roles: ['principal'] },
        { name: '学年学期配置', roles: ['principal'] },
        { name: '教案模板配置', roles: ['principal'] },
      ],
    },
    {
      name: '系统管理',
      icon: '🔧',
      roles: ['principal'],
    },
  ];

  // Filter menu items based on user role
  const menuItems =
    user && user.role
      ? allMenuItems
        .filter(item => item.roles.includes(user.role.name))
        .map(item => {
          // Also filter submenu items based on user role
          if (item.submenu) {
            return {
              ...item,
              submenu: item.submenu.filter(subItem => subItem.roles.includes(user.role.name)),
            };
          }
          return item;
        })
      : [];

  // 获取教师总人数
  const [teacherTotal, setTeacherTotal] = useState<number>(0);
  const getTeacherCount = async () => {
    try {
      const res = await axios.get<{ total: number }>(`${api}/api/teacher`);
      setTeacherTotal(res.data.total);

    } catch (error) {
      console.error('获取教师总人数失败:', error);
    }
  };
  useEffect(() => {
    getTeacherCount();
  }, []);
  const getContentData = () => {
    switch (activeSubmenu) {
      //贾维浩
      case '学生管理':
        return {
          title: '学生学籍信息',
          content: <Student />,
        };
      //贾维浩
      case '教师管理':
        return {
          title: '教师信息管理',
          data: {
            教师总数: `${teacherTotal}人`,
            高级教师: `${teacherTotal * 0.2}人`,
            中级教师: `${teacherTotal * 0.3}人`,
            初级教师: `${teacherTotal * 0.5}人`,
            平均年龄: '35岁',
          },
          content: <Teachers />,
        };
      //贾维浩
      case '班级管理':
        return {
          title: '班级信息管理',
          content: <ClassManagement />,
        };
        //许宇航
      case '教学资源管理':
        return {
          title: '教学资源管理',
          data: {},
          hasResourceManagement: true,
          resourceType: 'teaching' as const
        };
      //许宇航
      case '课外资源管理':
        return {
          title: '课外资源管理',
          data: {},
          hasResourceManagement: true,
          resourceType: 'extracurricular' as const
        };
      //许宇航
      case '资源类型管理':
        return {
          title: '资源类型管理',
          data: {},
          hasResourceManagement: true,
          resourceType: 'type' as const
        };
      //nty
      case '学生成绩':
        return {
          title: '学生成绩管理',
          data: {},
          hasImportExport: true,
          isGradesList: true,

        };
      //nty
      case '作业统计':
        return {
          title: '作业统计记录',
          data: {},
          AnimatedNumber:true,
        };
      //nty
      case '学生状态':
        return {
          title: '学生状态管理',
          data: {},
          studentState:true,
        };
      //nty
      case '学生作业批改':
        return {
          title: '学生作业批改',
          data: {},
          hasImageCorrection: true,
        };
      // mkh
      case '学年学科配置':
        return {
          title: '学年学科配置',
          data: {},
          content: <SubjectConfig />,
        };
      case '学年学期配置':
        return {
          title: '学年学期配置',
          data: {},
          content: <SYearConfig />,
        };
      case '教案模板配置':
        return {
          title: '教案模板配置',
          data: {},
          content: <LessonConfig />,
        };
      default:
        return {
          data: {},
          title: '基础信息管理',
          content: <Information />,
        };
    }
  };



  const contentData = getContentData();
  // const settingDate = getSettingDate()

  // Loading screen while checking auth
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px',
          }}
        ></div>
        <p>正在加载...</p>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className={styles.dashboard}>
      {/* 侧边栏 */}
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <span>学校管理系统LOGO</span>
        </div>
        <nav className={styles.navigation}>
          {menuItems.map((item, index) => (
            <div key={index} className={styles.menuItem}>
              <div
                className={`${styles.menuButton} ${activeMenu === item.name ? styles.active : ''}`}
                onClick={() => {
                  setActiveMenu(item.name);
                  if (item.submenu && item.submenu.length > 0) {
                    // 默认选择第一个子菜单
                    setActiveSubmenu(item.submenu[0].name);
                  } else {
                    setActiveSubmenu('');
                  }
                }}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuText}>{item.name}</span>
              </div>
              {item.submenu && activeMenu === item.name && (
                <div className={styles.submenu}>
                  {item.submenu.map((subItem, subIndex) => (
                    <div
                      key={subIndex}
                      className={`${styles.submenuItem} ${activeSubmenu === subItem.name ? styles.active : ''}`}
                      onClick={() => setActiveSubmenu(subItem.name)}
                    >
                      {subItem.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* 公共区域主内容区 */}
      <div className={styles.mainContent}>
        {/* 顶部导航栏 */}
        <div className={styles.topBar}>
          <div className={styles.breadcrumb}>
            <span>{activeMenu}</span>
            {activeSubmenu && (
              <>
                <span className={styles.separator}> / </span>
                <span>{activeSubmenu}</span>
              </>
            )}
          </div>
          <div className={styles.userInfo}>
            <button className={styles.logoutButton} onClick={logout}>
              退出登录
            </button>
            <span>
              {user?.name} (
              {user?.role?.name === 'principal'
                ? '校长'
                : user?.role?.name === 'academic_director'
                  ? '教务主任'
                  : user?.role?.name === 'academic_staff'
                    ? '普通教务'
                    : user?.role?.name === 'teaching_director'
                      ? '教学主任'
                      : '老师'}
              )
            </span>
            <div className={styles.avatar}>👤</div>
          </div>
        </div>

        {/* 内容区域 */}
        <div>
          {activeMenu === '首页' || activeMenu === '数据管理' ? (
            <BigScreenDashboard />
          ) : activeSubmenu === '走班排课' ? (
            <CourseSelectionSetting />
          ) : activeSubmenu === '选课设置' ? (
            <CreateCourse />
          ) :activeSubmenu === '智能分班' ? (
            <Fenban />
          )
           : (
            <div className={styles.contentPanel}>
              {/* 贾维浩数据展示区域 */}
              {contentData.data && (
                <div className={styles.dataGrid}>
                  {Object.entries(contentData.data).map(([key, value], index) => (
                    <div key={key} className={styles.dataCard}>
                      <div className={styles.dataLabel}>{key}</div>
                      <div className={styles.dataValue}>
                        <AnimatedNumber value={value} delay={index * 200} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {contentData.content}


              {/* nty学生成绩管理 */}
              {contentData.isGradesList && (
                <div className={styles.imageCorrectionSection}>
                  <h3>学生成绩管理</h3>
                  <Correct />
                </div>
              )}

              {/* nty学生成绩管理 */}
              {contentData.AnimatedNumber && (
                <div className={styles.imageCorrectionSection}>
                  <h3>学生作业统计</h3>
                  <Statistics />
                </div>
              )}

              {/* nty学生状态管理 */}
              {contentData.studentState && (
                <div className={styles.imageCorrectionSection}>
                  <h3>学生状态统计</h3>
                  <State />
                </div>
              )}

              {/* nty图片批改功能 */}
              {contentData.hasImageCorrection && (
                <div >
                  <Modify />
                </div>
              )}

              {/* 许宇航资源管理功能 */}
              {contentData.hasResourceManagement && (
                <div className={styles.resourceManagementSection}>
                  <ResourceManagement type={contentData.resourceType} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

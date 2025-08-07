'use client';
import { useState, useEffect } from 'react';
import styles from './state.module.css';
import { getAllStudents, StudentGrade } from '../../services/studentService';
import * as echarts from 'echarts';

// 学生状态枚举
enum StudentStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  AVERAGE = 'average',
  POOR = 'poor',
  FAILING = 'failing'
}

// 学生状态信息接口
interface StudentStatusInfo {
  id: number;
  name: string;
  status: StudentStatus;
  averageScore: number;
  weakSubjects: string[];
  strongSubjects: string[];
  improvement: number; // 相对于班级平均分的差值
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// 状态统计接口
interface StatusStats {
  excellent: number;
  good: number;
  average: number;
  poor: number;
  failing: number;
  total: number;
}

export default function StudentState() {
  const [studentData, setStudentData] = useState<StudentGrade[]>([]);
  const [statusData, setStatusData] = useState<StudentStatusInfo[]>([]);
  const [statusStats, setStatusStats] = useState<StatusStats>({
    excellent: 0,
    good: 0,
    average: 0,
    poor: 0,
    failing: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'risk'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 获取学生数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const students = await getAllStudents();
        setStudentData(students);
        analyzeStudentStatus(students);
      } catch (err) {
        setError('获取学生数据失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 分析学生状态
  const analyzeStudentStatus = (students: StudentGrade[]) => {
    if (!students.length) return;

    // 计算班级平均分
    const classAverage = students.reduce((sum, student) => {
      const avg = (student.math + student.chinese + student.english + 
                  student.physics + student.chemistry + student.biology) / 6;
      return sum + avg;
    }, 0) / students.length;

    const statusInfo: StudentStatusInfo[] = students.map((student, index) => {
      const subjects = {
        '数学': student.math,
        '语文': student.chinese,
        '英语': student.english,
        '物理': student.physics,
        '化学': student.chemistry,
        '生物': student.biology
      };

      const averageScore = Object.values(subjects).reduce((a, b) => a + b, 0) / 6;
      const improvement = averageScore - classAverage;

      // 找出薄弱科目（低于60分）
      const weakSubjects = Object.entries(subjects)
        .filter(([_, score]) => score < 60)
        .map(([subject, _]) => subject);

      // 找出优势科目（高于80分）
      const strongSubjects = Object.entries(subjects)
        .filter(([_, score]) => score >= 80)
        .map(([subject, _]) => subject);

      // 确定学生状态
      let status: StudentStatus;
      let riskLevel: 'low' | 'medium' | 'high';
      
      if (averageScore >= 90) {
        status = StudentStatus.EXCELLENT;
        riskLevel = 'low';
      } else if (averageScore >= 80) {
        status = StudentStatus.GOOD;
        riskLevel = 'low';
      } else if (averageScore >= 70) {
        status = StudentStatus.AVERAGE;
        riskLevel = 'medium';
      } else if (averageScore >= 60) {
        status = StudentStatus.POOR;
        riskLevel = 'high';
      } else {
        status = StudentStatus.FAILING;
        riskLevel = 'high';
      }

      // 生成建议
      const recommendations = generateRecommendations(status, weakSubjects, strongSubjects, averageScore);

      return {
        id: index + 1,
        name: student.name,
        status,
        averageScore,
        weakSubjects,
        strongSubjects,
        improvement,
        riskLevel,
        recommendations
      };
    });

    setStatusData(statusInfo);

    // 计算状态统计
    const stats = statusInfo.reduce((acc, student) => {
      acc[student.status]++;
      acc.total++;
      return acc;
    }, {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
      failing: 0,
      total: 0
    });

    setStatusStats(stats);
  };

  // 生成建议
  const generateRecommendations = (
    status: StudentStatus, 
    weakSubjects: string[], 
    strongSubjects: string[], 
    averageScore: number
  ): string[] => {
    const recommendations: string[] = [];

    switch (status) {
      case StudentStatus.EXCELLENT:
        recommendations.push('保持优秀状态，可以考虑挑战更高难度的题目');
        if (strongSubjects.length > 0) {
          recommendations.push(`继续发挥${strongSubjects.join('、')}的优势`);
        }
        break;
      case StudentStatus.GOOD:
        recommendations.push('成绩良好，继续努力向优秀迈进');
        if (weakSubjects.length > 0) {
          recommendations.push(`重点关注${weakSubjects.join('、')}的提升`);
        }
        break;
      case StudentStatus.AVERAGE:
        recommendations.push('成绩中等，需要制定明确的提升计划');
        if (weakSubjects.length > 0) {
          recommendations.push(`急需加强${weakSubjects.join('、')}的学习`);
        }
        break;
      case StudentStatus.POOR:
        recommendations.push('成绩偏低，建议寻求老师和同学的帮助');
        recommendations.push('制定详细的学习计划，逐步提升');
        break;
      case StudentStatus.FAILING:
        recommendations.push('成绩不及格，需要立即采取行动');
        recommendations.push('建议参加补习班或一对一辅导');
        recommendations.push('家长需要密切关注学习情况');
        break;
    }

    return recommendations;
  };

  // 获取状态显示文本
  const getStatusText = (status: StudentStatus): string => {
    const statusMap = {
      [StudentStatus.EXCELLENT]: '优秀',
      [StudentStatus.GOOD]: '良好',
      [StudentStatus.AVERAGE]: '中等',
      [StudentStatus.POOR]: '偏低',
      [StudentStatus.FAILING]: '不及格'
    };
    return statusMap[status];
  };

  // 获取状态颜色
  const getStatusColor = (status: StudentStatus): string => {
    const colorMap = {
      [StudentStatus.EXCELLENT]: '#52c41a',
      [StudentStatus.GOOD]: '#1890ff',
      [StudentStatus.AVERAGE]: '#faad14',
      [StudentStatus.POOR]: '#fa8c16',
      [StudentStatus.FAILING]: '#f5222d'
    };
    return colorMap[status];
  };

  // 获取风险等级颜色
  const getRiskColor = (riskLevel: 'low' | 'medium' | 'high'): string => {
    const colorMap = {
      low: '#52c41a',
      medium: '#faad14',
      high: '#f5222d'
    };
    return colorMap[riskLevel];
  };

  // 筛选和排序数据
  const filteredAndSortedData = statusData
    .filter(student => {
      const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'score':
          comparison = a.averageScore - b.averageScore;
          break;
        case 'risk':
          const riskOrder = { low: 1, medium: 2, high: 3 };
          comparison = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // 状态分布图表
  useEffect(() => {
    if (statusStats.total > 0) {
      const chartDom = document.getElementById('statusChart');
      if (chartDom) {
        const myChart = echarts.init(chartDom);
        const option = {
          title: {
            text: '学生状态分布',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left'
          },
          series: [
            {
              name: '学生状态',
              type: 'pie',
              radius: '50%',
              data: [
                { value: statusStats.excellent, name: '优秀', itemStyle: { color: '#52c41a' } },
                { value: statusStats.good, name: '良好', itemStyle: { color: '#1890ff' } },
                { value: statusStats.average, name: '中等', itemStyle: { color: '#faad14' } },
                { value: statusStats.poor, name: '偏低', itemStyle: { color: '#fa8c16' } },
                { value: statusStats.failing, name: '不及格', itemStyle: { color: '#f5222d' } }
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
        myChart.setOption(option);

        return () => {
          myChart.dispose();
        };
      }
    }
  }, [statusStats]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>学生状态管理</h2>
      
      {/* 统计卡片 */}
      <div className={styles.statsCards}>
        <div className={styles.statCard} style={{ borderLeft: '4px solid #52c41a' }}>
          <div className={styles.statTitle}>优秀学生</div>
          <div className={styles.statValue}>{statusStats.excellent}人</div>
          <div className={styles.statPercent}>
            {statusStats.total > 0 ? ((statusStats.excellent / statusStats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className={styles.statCard} style={{ borderLeft: '4px solid #1890ff' }}>
          <div className={styles.statTitle}>良好学生</div>
          <div className={styles.statValue}>{statusStats.good}人</div>
          <div className={styles.statPercent}>
            {statusStats.total > 0 ? ((statusStats.good / statusStats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className={styles.statCard} style={{ borderLeft: '4px solid #faad14' }}>
          <div className={styles.statTitle}>中等学生</div>
          <div className={styles.statValue}>{statusStats.average}人</div>
          <div className={styles.statPercent}>
            {statusStats.total > 0 ? ((statusStats.average / statusStats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className={styles.statCard} style={{ borderLeft: '4px solid #fa8c16' }}>
          <div className={styles.statTitle}>偏低学生</div>
          <div className={styles.statValue}>{statusStats.poor}人</div>
          <div className={styles.statPercent}>
            {statusStats.total > 0 ? ((statusStats.poor / statusStats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className={styles.statCard} style={{ borderLeft: '4px solid #f5222d' }}>
          <div className={styles.statTitle}>不及格学生</div>
          <div className={styles.statValue}>{statusStats.failing}人</div>
          <div className={styles.statPercent}>
            {statusStats.total > 0 ? ((statusStats.failing / statusStats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className={styles.chartSection}>
        <div id="statusChart" style={{ width: '100%', height: '400px' }}></div>
      </div>

      {/* 筛选和搜索 */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label>状态筛选：</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">全部</option>
            <option value="excellent">优秀</option>
            <option value="good">良好</option>
            <option value="average">中等</option>
            <option value="poor">偏低</option>
            <option value="failing">不及格</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label>搜索学生：</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="输入学生姓名"
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>排序方式：</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'name' | 'score' | 'risk')}
            className={styles.filterSelect}
          >
            <option value="score">按成绩</option>
            <option value="name">按姓名</option>
            <option value="risk">按风险等级</option>
          </select>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className={styles.filterSelect}
          >
            <option value="desc">降序</option>
            <option value="asc">升序</option>
          </select>
        </div>
      </div>

      {/* 学生状态列表 */}
      <div className={styles.studentList}>
        {filteredAndSortedData.map((student) => (
          <div key={student.id} className={styles.studentCard}>
            <div className={styles.studentHeader}>
              <div className={styles.studentName}>{student.name}</div>
              <div className={styles.studentScore}>
                平均分: {student.averageScore.toFixed(1)}
              </div>
            </div>
            
            <div className={styles.studentInfo}>
              <div className={styles.statusBadge} style={{ backgroundColor: getStatusColor(student.status) }}>
                {getStatusText(student.status)}
              </div>
              <div className={styles.riskBadge} style={{ backgroundColor: getRiskColor(student.riskLevel) }}>
                {student.riskLevel === 'low' ? '低风险' : 
                 student.riskLevel === 'medium' ? '中风险' : '高风险'}
              </div>
              <div className={styles.improvement}>
                相对班级平均: {student.improvement > 0 ? '+' : ''}{student.improvement.toFixed(1)}分
              </div>
            </div>

            {student.weakSubjects.length > 0 && (
              <div className={styles.subjectInfo}>
                <span className={styles.subjectLabel}>薄弱科目:</span>
                <span className={styles.weakSubjects}>{student.weakSubjects.join('、')}</span>
              </div>
            )}

            {student.strongSubjects.length > 0 && (
              <div className={styles.subjectInfo}>
                <span className={styles.subjectLabel}>优势科目:</span>
                <span className={styles.strongSubjects}>{student.strongSubjects.join('、')}</span>
              </div>
            )}

            <div className={styles.recommendations}>
              <div className={styles.recommendationTitle}>建议:</div>
              <ul className={styles.recommendationList}>
                {student.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedData.length === 0 && (
        <div className={styles.noData}>
          没有找到符合条件的学生
        </div>
      )}
    </div>
  );
}
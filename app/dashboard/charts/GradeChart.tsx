'use client';
import React from 'react';
import styles from '../dashboard.module.css';

interface Student {
  id: number;
  name: string;
  math: number;
  chinese: number;
  english: number;
  physics: number;
  chemistry: number;
  biology: number;
}

interface GradeChartProps {
  data: Student[];
}

// 柱状图组件
export const GradeChart: React.FC<GradeChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3>成绩柱状图</h3>
        <div className={styles.noData}>暂无数据</div>
      </div>
    );
  }

  // 计算各科目平均分
  const subjects = ['数学', '语文', '英语', '物理', '化学', '生物'];
  const subjectKeys = ['math', 'chinese', 'english', 'physics', 'chemistry', 'biology'] as const;
  
  const averages = subjects.map((subject, index) => {
    const key = subjectKeys[index];
    const total = data.reduce((sum, student) => sum + student[key], 0);
    return {
      subject,
      average: Math.round((total / data.length) * 10) / 10
    };
  });

  const maxScore = Math.max(...averages.map(item => item.average));

  return (
    <div className={styles.chartContainer}>
      <h3>各科目平均分</h3>
      <div className={styles.barChart}>
        {averages.map((item, index) => (
          <div key={index} className={styles.barItem}>
            <div className={styles.barLabel}>{item.subject}</div>
            <div className={styles.barWrapper}>
              <div 
                className={styles.bar}
                style={{
                  height: `${(item.average / maxScore) * 200}px`,
                  backgroundColor: `hsl(${200 + index * 30}, 70%, 50%)`
                }}
              >
                <span className={styles.barValue}>{item.average}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 饼图组件
export const GradeDistributionChart: React.FC<GradeChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3>成绩分布饼图</h3>
        <div className={styles.noData}>暂无数据</div>
      </div>
    );
  }

  // 计算成绩分布
  const getGradeLevel = (average: number) => {
    if (average >= 90) return '优秀';
    if (average >= 80) return '良好';
    if (average >= 70) return '中等';
    if (average >= 60) return '及格';
    return '不及格';
  };

  const distribution = data.reduce((acc, student) => {
    const average = (student.math + student.chinese + student.english + 
                    student.physics + student.chemistry + student.biology) / 6;
    const level = getGradeLevel(average);
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = data.length;
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
  const levels = ['优秀', '良好', '中等', '及格', '不及格'];

  return (
    <div className={styles.chartContainer}>
      <h3>成绩分布</h3>
      <div className={styles.pieChart}>
        <div className={styles.pieContainer}>
          {levels.map((level, index) => {
            const count = distribution[level] || 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={level} className={styles.pieSegment}>
                <div 
                  className={styles.pieColor}
                  style={{ backgroundColor: colors[index] }}
                ></div>
                <span className={styles.pieLabel}>
                  {level}: {count}人 ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
        <div className={styles.pieVisual}>
          <div className={styles.pieCircle}>
            {levels.map((level, index) => {
              const count = distribution[level] || 0;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div
                  key={level}
                  className={styles.pieSlice}
                  style={{
                    backgroundColor: colors[index],
                    width: `${Math.max(percentage, 5)}%`,
                    opacity: count > 0 ? 1 : 0.3
                  }}
                  title={`${level}: ${count}人 (${Math.round(percentage)}%)`}
                >
                  {percentage > 10 && <span>{Math.round(percentage)}%</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
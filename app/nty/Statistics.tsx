'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './statistics.module.css';
import { Select, Form } from 'antd';
import * as echarts from 'echarts';

// 数字动画组件
const AnimatedNumber = ({ value, duration = 2000, delay = 0 }: { value: string | number, duration?: number, delay?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    const animate = () => {
      const startTime = Date.now();
      const startValue = displayValue;
      const targetValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;

      const updateValue = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 使用缓动函数
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (targetValue - startValue) * easeOutQuart;

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(updateValue);
        }
      };

      requestAnimationFrame(updateValue);
    };

    animate();
  }, [value, duration, isVisible]);

  // 格式化显示值
  const formattedValue = () => {
    if (typeof value === 'string' && value.includes('%')) {
      return `${displayValue.toFixed(0)}%`;
    }
    return displayValue.toFixed(0);
  };

  return <span>{formattedValue()}</span>;
};

// 作业量柱状图组件
const HomeworkBarChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // 如果已经有图表实例，先销毁
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // 创建新的图表实例
      chartInstance.current = echarts.init(chartRef.current);

      // 设置图表选项
      chartInstance.current.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: ['06-27', '06-28', '06-29', '06-30', '07-01', '07-02', '07-03'],
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '作业量'
          }
        ],
        series: [
          {
            name: '作业量',
            type: 'bar',
            barWidth: '60%',
            data: [20000, 25000, 20000, 25000, 25000, 22000, 22000],
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      });

      // 响应窗口大小变化
      const handleResize = () => {
        chartInstance.current?.resize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, []);

  return <div ref={chartRef} className={styles.chartContainer}></div>;
};

// 正确率折线图组件
const AccuracyLineChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // 如果已经有图表实例，先销毁
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // 创建新的图表实例
      chartInstance.current = echarts.init(chartRef.current);

      // 设置图表选项
      chartInstance.current.setOption({
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['06-27', '06-28', '06-29', '06-30', '07-01', '07-02', '07-03']
        },
        yAxis: {
          type: 'value',
          name: '正确率(%)',
          min: 0,
          max: 100
        },
        series: [
          {
            name: '正确率',
            type: 'line',
            smooth: true,
            data: [70, 75, 85, 80, 70, 72, 85],
            itemStyle: {
              color: '#67C23A'
            },
            lineStyle: {
              color: '#67C23A'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(103, 194, 58, 0.3)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(103, 194, 58, 0.1)'
                  }
                ]
              }
            }
          }
        ]
      });

      // 响应窗口大小变化
      const handleResize = () => {
        chartInstance.current?.resize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, []);

  return <div ref={chartRef} className={styles.chartContainer}></div>;
};

// 作业时间折线图组件
const TimeLineChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // 如果已经有图表实例，先销毁
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // 创建新的图表实例
      chartInstance.current = echarts.init(chartRef.current);

      // 设置图表选项
      chartInstance.current.setOption({
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['06-27', '06-28', '06-29', '06-30', '07-01', '07-02', '07-03']
        },
        yAxis: {
          type: 'value',
          name: '平均时间(分钟)'
        },
        series: [
          {
            name: '平均时间',
            type: 'line',
            smooth: true,
            data: [25, 32, 35, 38, 30, 35, 40],
            itemStyle: {
              color: '#E6A23C'
            },
            lineStyle: {
              color: '#E6A23C'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(230, 162, 60, 0.3)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(230, 162, 60, 0.1)'
                  }
                ]
              }
            }
          }
        ]
      });

      // 响应窗口大小变化
      const handleResize = () => {
        chartInstance.current?.resize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, []);

  return <div ref={chartRef} className={styles.chartContainer}></div>;
};

// 主组件
export default function Statistics() {
  const [activeTab, setActiveTab] = useState('homework');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>作业统计</h2>
      </div>

      {/* 筛选区域 */}
      <div className={styles.filterSection}>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>学校</span>
          <Select defaultValue="小学" style={{ width: 120 }}>
            <Select.Option value="小学">小学</Select.Option>
            <Select.Option value="初中">初中</Select.Option>
            <Select.Option value="高中">高中</Select.Option>
          </Select>
        </div>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>年级</span>
          <Select defaultValue="一年级" style={{ width: 120 }}>
            <Select.Option value="一年级">一年级</Select.Option>
            <Select.Option value="二年级">二年级</Select.Option>
            <Select.Option value="三年级">三年级</Select.Option>
          </Select>
        </div>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>班级</span>
          <Select defaultValue="一班" style={{ width: 120 }}>
            <Select.Option value="一班">一班</Select.Option>
            <Select.Option value="二班">二班</Select.Option>
            <Select.Option value="三班">三班</Select.Option>
          </Select>
        </div>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>学科</span>
          <Select defaultValue="语文" style={{ width: 120 }}>
            <Select.Option value="语文">语文</Select.Option>
            <Select.Option value="数学">数学</Select.Option>
            <Select.Option value="英语">英语</Select.Option>
          </Select>
        </div>
      </div>

      {/* 统计概览 */}
      <div className={styles.statsOverview}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>学生人数</div>
          <div className={styles.statValue}>
            <AnimatedNumber value={3500} duration={1000} />
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>作业总量</div>
          <div className={styles.statValue}>
            <AnimatedNumber value={234400} duration={1000} />
          </div>
          <div className={styles.statSubValue}>
            已完成 <AnimatedNumber value={234400} duration={1000} /> 全部
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>平均用时</div>
          <div className={styles.statValue}>
            <AnimatedNumber value={35} duration={1000} />分钟
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>平均准度</div>
          <div className={styles.statValue}>
            <AnimatedNumber value={0.68} duration={1000} />
          </div>
        </div>
      </div>

      {/* 图表选项卡 */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'homework' ? styles.active : ''}`}
          onClick={() => setActiveTab('homework')}
        >
          作业量
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'accuracy' ? styles.active : ''}`}
          onClick={() => setActiveTab('accuracy')}
        >
          正确率
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'time' ? styles.active : ''}`}
          onClick={() => setActiveTab('time')}
        >
          作业时间
        </button>
      </div>

      {/* 图表区域 */}
      <div className={styles.chartSection}>
        <div className={styles.chartTitle}>
          {activeTab === 'homework' && '每日作业量统计'}
          {activeTab === 'accuracy' && '每日正确率统计'}
          {activeTab === 'time' && '每日作业时间统计'}
        </div>
        {activeTab === 'homework' && <HomeworkBarChart />}
        {activeTab === 'accuracy' && <AccuracyLineChart />}
        {activeTab === 'time' && <TimeLineChart />}
      </div>

      {/* 昨日数据统计 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitle}>昨日数据统计</div>
        <div className={styles.statsOverview}>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>发布作业数量</div>
            <div className={styles.statValue}>
              <AnimatedNumber value={218} duration={1000} />
              <span style={{ color: '#67C23A', fontSize: '14px', marginLeft: '5px' }}>↑3%</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>完成作业数量</div>
            <div className={styles.statValue}>
              <AnimatedNumber value={218} duration={1000} />
              <span style={{ color: '#67C23A', fontSize: '14px', marginLeft: '5px' }}>↑3%</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>正确率</div>
            <div className={styles.statValue}>
              <AnimatedNumber value={218} duration={1000} />
              <span style={{ color: '#67C23A', fontSize: '14px', marginLeft: '5px' }}>↑3%</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>平均用时</div>
            <div className={styles.statValue}>
              <AnimatedNumber value={23} duration={1000} />分钟
              <span style={{ color: '#67C23A', fontSize: '14px', marginLeft: '5px' }}>↑3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作区 */}
      <div className={styles.footer}>
        <div>
          <button className={`${styles.actionButton} ${styles.exportButton}`}>
            导出统计报告
          </button>
        </div>
      </div>
    </div>
  );
}

// 导出组件
export { AnimatedNumber };
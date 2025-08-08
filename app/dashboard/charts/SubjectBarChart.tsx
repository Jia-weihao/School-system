'use client';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function SubjectBarChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const chart = echarts.init(ref.current);
      chart.setOption({
        title: { text: '学科备课数量统计', left: 'center', textStyle: { color: '#7ecfff', fontWeight: 'bold', fontSize: 18, textShadowColor: '#1976d2', textShadowBlur: 8 } },
        tooltip: { trigger: 'axis' },
        legend: { data: ['教师', '学案', '课件'], top: 30, textStyle: { color: '#fff' } },
        yAxis: { type: 'category', data: ['语文', '数学', '英语', '物理', '化学', '生物', '政治'], axisLabel: { color: '#fff' } },
        xAxis: { type: 'value', axisLabel: { color: '#fff' } },
        series: [
          { name: '教师', type: 'bar', data: [320, 302, 301, 334, 390, 330, 320], itemStyle: { color: '#4fc3f7' } },
          { name: '学案', type: 'bar', data: [120, 132, 101, 134, 90, 230, 210], itemStyle: { color: '#7ecfff' } },
          { name: '课件', type: 'bar', data: [220, 182, 191, 234, 290, 330, 310], itemStyle: { color: '#fbc02d' } },
        ],
        grid: { left: 60, right: 20, top: 60, bottom: 30 },
        backgroundColor: 'transparent',
      });
      return () => chart.dispose();
    }
  }, []);
  return <div ref={ref} style={{ width: '100%', height: 260 }} />;
} 
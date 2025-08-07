'use client';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function MultiLineChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const chart = echarts.init(ref.current);
      chart.setOption({
        title: { text: '各课程活跃度趋势分析', left: 'center', textStyle: { color: '#7ecfff', fontWeight: 'bold', fontSize: 18, textShadowColor: '#1976d2', textShadowBlur: 8 } },
        tooltip: { trigger: 'axis' },
        legend: { data: ['语文', '数学', '英语', '物理'], top: 30, textStyle: { color: '#fff' } },
        xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月'], axisLabel: { color: '#fff' } },
        yAxis: { type: 'value', axisLabel: { color: '#fff' } },
        series: [
          { name: '语文', type: 'line', data: [120, 132, 101, 134, 90], lineStyle: { color: '#4fc3f7' }, itemStyle: { color: '#4fc3f7' } },
          { name: '数学', type: 'line', data: [220, 182, 191, 234, 290], lineStyle: { color: '#7ecfff' }, itemStyle: { color: '#7ecfff' } },
          { name: '英语', type: 'line', data: [150, 232, 201, 154, 190], lineStyle: { color: '#fbc02d' }, itemStyle: { color: '#fbc02d' } },
          { name: '物理', type: 'line', data: [320, 332, 301, 334, 390], lineStyle: { color: '#e57373' }, itemStyle: { color: '#e57373' } },
        ],
        grid: { left: 40, right: 20, top: 60, bottom: 30 },
        backgroundColor: 'transparent',
      });
      return () => chart.dispose();
    }
  }, []);
  return <div ref={ref} style={{ width: '100%', height: 260 }} />;
} 
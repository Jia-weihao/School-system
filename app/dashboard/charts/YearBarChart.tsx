'use client';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function YearBarChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const chart = echarts.init(ref.current);
      chart.setOption({
        title: { text: '年级备课数量统计', left: 'center', textStyle: { color: '#7ecfff', fontWeight: 'bold', fontSize: 18, textShadowColor: '#1976d2', textShadowBlur: 8 } },
        tooltip: { trigger: 'axis' },
        legend: { data: ['已完成', '未完成'], top: 30, textStyle: { color: '#fff' } },
        xAxis: { type: 'category', data: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级'], axisLabel: { color: '#fff' } },
        yAxis: { type: 'value', axisLabel: { color: '#fff' } },
        series: [
          { name: '已完成', type: 'bar', stack: 'total', data: [320, 332, 301, 334, 390, 330, 320], itemStyle: { color: '#4fc3f7' } },
          { name: '未完成', type: 'bar', stack: 'total', data: [120, 132, 101, 134, 90, 230, 210], itemStyle: { color: '#fbc02d' } },
        ],
        grid: { left: 40, right: 20, top: 60, bottom: 30 },
        backgroundColor: 'transparent',
      });
      return () => chart.dispose();
    }
  }, []);
  return <div ref={ref} style={{ width: '100%', height: 260 }} />;
} 
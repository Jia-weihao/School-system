'use client';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function LineChart() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const chart = echarts.init(ref.current);
      chart.setOption({
        title: { text: '近7天学生活跃度', textStyle: { color: '#7ecfff', fontWeight: 'bold', fontSize: 18, textShadowColor: '#1976d2', textShadowBlur: 8 } },
        xAxis: {
          type: 'category',
          data: ['06-27', '06-28', '06-29', '06-30', '07-01', '07-02', '07-03'],
          axisLabel: { color: '#fff' },
        },
        yAxis: { type: 'value', axisLabel: { color: '#fff' } },
        series: [
          {
            data: [80, 90, 70, 85, 95, 100, 88],
            type: 'line',
            smooth: true,
            lineStyle: { color: '#7ecfff' },
            itemStyle: { color: '#7ecfff' },
          },
        ],
        grid: { left: 40, right: 20, top: 40, bottom: 30 },
        backgroundColor: 'transparent',
      });
      return () => chart.dispose();
    }
  }, []);

  return <div ref={ref} style={{ width: '100%', height: 300 }} />;
} 
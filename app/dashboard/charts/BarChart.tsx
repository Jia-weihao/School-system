'use client';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function BarChart() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const chart = echarts.init(ref.current);
      chart.setOption({
        title: { text: '月度学生数量', left: 'center', textStyle: { color: '#7ecfff', fontWeight: 'bold', fontSize: 18, textShadowColor: '#1976d2', textShadowBlur: 8 } },
        xAxis: { data: ['1月', '2月', '3月', '4月', '5月'], axisLabel: { color: '#fff' } },
        yAxis: { axisLabel: { color: '#fff' } },
        series: [{ type: 'bar', data: [120, 200, 150, 80, 70], itemStyle: { color: '#3398DB' } }],
        grid: { left: 40, right: 20, top: 40, bottom: 30 },
        backgroundColor: 'transparent',
      });
      return () => chart.dispose();
    }
  }, []);

  return <div ref={ref} style={{ width: '100%', height: 300 }} />;
} 
'use client';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function PieChart() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const chart = echarts.init(ref.current);
      chart.setOption({
        title: { text: '学生男女比例', left: 'center', textStyle: { color: '#7ecfff', fontWeight: 'bold', fontSize: 18, textShadowColor: '#1976d2', textShadowBlur: 8 } },
        tooltip: { trigger: 'item' },
        legend: { bottom: 10, left: 'center', textStyle: { color: '#fff' } },
        series: [
          {
            name: '性别',
            type: 'pie',
            radius: '60%',
            data: [
              { value: 256, name: '男生' },
              { value: 256, name: '女生' },
            ],
            label: { color: '#fff' },
          },
        ],
        backgroundColor: 'transparent',
      });
      return () => chart.dispose();
    }
  }, []);

  return <div ref={ref} style={{ width: '100%', height: 300 }} />;
} 
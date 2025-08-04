'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './correct.module.css';
// import { useAuth } from '../../context/AuthContext';
import ButtonPermission from '../../components/ButtonPermission';
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

  const formatValue = (val: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return `${val.toFixed(1)}%`;
    }
    if (typeof value === 'string' && value.includes('人')) {
      return `${Math.round(val)}人`;
    }
    if (typeof value === 'string' && value.includes('分')) {
      return `${val.toFixed(1)}分`;
    }
    return Math.round(val).toLocaleString();
  };

  return (
    <span className={`${styles.animatedNumber} ${isVisible ? styles.visible : ''}`}>
      {formatValue(displayValue)}
    </span>
  );
};

// 成绩分布图表组件 - 使用 ECharts
const GradeDistributionChart = ({ data }: { data: any[] }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 如果没有数据，不初始化图表
    if (!data || data.length === 0) return;

    // 计算分数段分布
    const ranges = [
      { label: '90-100分', min: 90, max: 100, color: '#4CAF50' },
      { label: '80-89分', min: 80, max: 89, color: '#2196F3' },
      { label: '70-79分', min: 70, max: 79, color: '#FF9800' },
      { label: '60-69分', min: 60, max: 69, color: '#FF5722' },
      { label: '60分以下', min: 0, max: 59, color: '#F44336' }
    ];

    // 使用数学平均分计算分布
    const subjects = ['math', 'chinese', 'english', 'physics', 'chemistry', 'biology'];
    const distribution = ranges.map(range => {
      const count = data.filter(student => {
        const avgScore = subjects.reduce((sum, subject) => sum + student[subject], 0) / subjects.length;
        return avgScore >= range.min && avgScore <= range.max;
      }).length;

      return {
        ...range,
        count,
        percentage: (count / data.length) * 100
      };
    });

    // 初始化图表
    if (chartRef.current) {
      // 如果已经有图表实例且未被销毁，先销毁
      if (chartInstance.current && !chartInstance.current.isDisposed()) {
        chartInstance.current.dispose();
      }

      // 创建新的图表实例
      chartInstance.current = echarts.init(chartRef.current);

      // 设置图表选项
      chartInstance.current.setOption({
        title: {
          text: '成绩分布统计',
          left: 'center',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params: any) {
            return `${params.name}<br/>学生数量: ${params.value}人<br/>占比: ${params.data.percentage.toFixed(1)}%`;
          }
        },
        legend: {
          orient: 'horizontal',
          bottom: 10,
          left: 'center',
          data: distribution.map(item => item.label)
        },
        series: [
          {
            name: '成绩分布',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {c}人 ({d}%)'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            data: distribution.map(item => ({
              value: item.count,
              name: item.label,
              percentage: item.percentage,
              itemStyle: {
                color: item.color
              }
            }))
          }
        ],
        backgroundColor: 'transparent',
        animation: true
      });

      // 响应窗口大小变化
      const handleResize = () => {
        chartInstance.current?.resize();
      };
      window.addEventListener('resize', handleResize);

      // 清理函数
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartInstance.current) {
          chartInstance.current.dispose();
          chartInstance.current = null;
        }
      };
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.noData}>暂无数据</div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
    </div>
  );
};

// 科目成绩对比图表 - 使用 ECharts
const GradeChart = ({ data }: { data: any[] }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 如果没有数据，不初始化图表
    if (!data || data.length === 0) return;

    const subjects = [
      { key: 'math', name: '数学', color: '#FF6B6B' },
      { key: 'chinese', name: '语文', color: '#4ECDC4' },
      { key: 'english', name: '英语', color: '#45B7D1' },
      { key: 'physics', name: '物理', color: '#96CEB4' },
      { key: 'chemistry', name: '化学', color: '#FFEAA7' },
      { key: 'biology', name: '生物', color: '#DDA0DD' }
    ];

    const stats = subjects.map((subject) => {
      const key = subject.key;
      const scores = data.map((student: any) => student[key]);
      const total = scores.reduce((sum: number, score: number) => sum + score, 0);
      const average = total / scores.length;
      const highest = Math.max(...scores);
      const lowest = Math.min(...scores);

      return {
        ...subject,
        average: average.toFixed(1),
        highest,
        lowest,
        total: scores.length
      };
    });

    // 初始化图表
    if (chartRef.current) {
      // 如果已经有图表实例，先销毁
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }

      // 创建新的图表实例
      chartInstance.current = echarts.init(chartRef.current);

      // 设置图表选项
      chartInstance.current.setOption({
        title: {
          text: '各科目平均分对比',
          left: 'center',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params: any) {
            const data = params[0].data;
            return `${data.name}<br/>平均分: ${data.value}分<br/>最高分: ${data.highest}分<br/>最低分: ${data.lowest}分<br/>参与人数: ${data.total}人`;
          }
        },
        xAxis: {
          type: 'category',
          data: stats.map(item => item.name),
          axisLabel: {
            interval: 0,
            rotate: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '分数',
          min: 0,
          max: 100,
          interval: 10
        },
        series: [
          {
            name: '平均分',
            type: 'bar',
            barWidth: '50%',
            data: stats.map(item => ({
              value: parseFloat(item.average),
              name: item.name,
              highest: item.highest,
              lowest: item.lowest,
              total: item.total,
              itemStyle: {
                color: item.color
              }
            })),
            label: {
              show: true,
              position: 'top',
              formatter: '{c}分'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        backgroundColor: 'transparent',
        animation: true
      });

      // 响应窗口大小变化
      const handleResize = () => {
        chartInstance.current?.resize();
      };
      window.addEventListener('resize', handleResize);

      // 清理函数
      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.noData}>暂无数据</div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
    </div>
  );
};

// 数据导入导出功能
const handleImportData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls,.csv';

  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          // 处理CSV文件
          if (file.name.endsWith('.csv')) {
            const csvContent = event.target?.result as string;
            const rows = csvContent.split('\n');
            const headers = rows[0].split(',');
            
            // 验证CSV格式是否正确
            const requiredHeaders = ['姓名', '数学', '语文', '英语', '物理', '化学', '生物'];
            const isValidFormat = requiredHeaders.every(header => headers.includes(header));
            
            if (!isValidFormat) {
              alert('CSV格式不正确，请使用正确的模板');
              return;
            }
            
            // 解析数据行
            const students: StudentGrade[] = [];
            for (let i = 1; i < rows.length; i++) {
              if (!rows[i].trim()) continue; // 跳过空行
              
              const values = rows[i].split(',');
              if (values.length !== headers.length) continue; // 跳过格式不正确的行
              
              // 创建学生对象
              const student: any = {};
              headers.forEach((header, index) => {
                const value = values[index].trim();
                switch (header) {
                  case '姓名':
                    student.name = value;
                    break;
                  case '数学':
                    student.math = parseInt(value, 10);
                    break;
                  case '语文':
                    student.chinese = parseInt(value, 10);
                    break;
                  case '英语':
                    student.english = parseInt(value, 10);
                    break;
                  case '物理':
                    student.physics = parseInt(value, 10);
                    break;
                  case '化学':
                    student.chemistry = parseInt(value, 10);
                    break;
                  case '生物':
                    student.biology = parseInt(value, 10);
                    break;
                }
              });
              
              // 验证必填字段
              if (student.name && !isNaN(student.math) && !isNaN(student.chinese) && 
                  !isNaN(student.english) && !isNaN(student.physics) && 
                  !isNaN(student.chemistry) && !isNaN(student.biology)) {
                students.push(student);
              }
            }
            
            if (students.length === 0) {
              alert('没有有效的学生数据');
              return;
            }
            
            // 确认导入
            if (window.confirm(`确定要导入 ${students.length} 条学生成绩数据吗？`)) {
              try {
                // 调用API批量创建学生
                const token = localStorage.getItem('token');
                if (!token) {
                  alert('请先登录');
                  return;
                }
                
                const response = await fetch(`https://47.76.85.140/api/students/batch`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(students),
                });
                
                if (!response.ok) {
                  throw new Error(`导入失败: ${response.status}`);
                }
                
                const result = await response.json();
                
                // 更新本地数据
                setStudentData(prevData => [...prevData, ...result.data]);
                alert(`成功导入 ${result.data.length} 条学生成绩数据`);
              } catch (error) {
                console.error('导入数据错误:', error);
                alert('导入失败，请稍后重试');
              }
            }
          } else {
            // 其他格式文件
            alert('目前只支持CSV格式，请使用CSV模板');
          }
        } catch (error) {
          console.error('文件解析错误:', error);
          alert('文件格式不正确，请检查后重试');
        }
      };
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
        alert('目前只支持CSV格式，请使用CSV模板');
      }
    }
  };

  input.click();
};

// Excel导出功能
const handleExportExcel = (data: any[]) => {
  if (!data || data.length === 0) {
    alert('没有数据可导出');
    return;
  }

  // 创建CSV格式的数据
  const headers = ['姓名', '数学', '语文', '英语', '物理', '化学', '生物', '平均分'];
  const csvContent = [
    headers.join(','),
    ...data.map((student: any) => {
      const avg = ((student.math + student.chinese + student.english +
        student.physics + student.chemistry + student.biology) / 6).toFixed(1);
      return [
        student.name,
        student.math,
        student.chinese,
        student.english,
        student.physics,
        student.chemistry,
        student.biology,
        avg
      ].join(',');
    })
  ].join('\n');

  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `学生成绩表_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 释放URL对象
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

// PDF导出功能
const handleExportPDF = (data: any[]) => {
  if (!data || data.length === 0) {
    alert('没有数据可以导出');
    return;
  }

  // 创建一个新窗口用于打印
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('无法打开打印窗口');
    return;
  }
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>学生成绩报告</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { margin: 20px 0; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>学生成绩报告</h1>
        <p>生成时间: ${new Date().toLocaleString()}</p>
      </div>
      <div class="summary">
        <h3>统计摘要</h3>
        <p>总学生数: ${data.length}人</p>
        <p>平均分: ${(data.reduce((sum: number, student: any) =>
    sum + (student.math + student.chinese + student.english +
      student.physics + student.chemistry + student.biology) / 6, 0) / data.length).toFixed(1)}分</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>数学</th>
            <th>语文</th>
            <th>英语</th>
            <th>物理</th>
            <th>化学</th>
            <th>生物</th>
            <th>平均分</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((student: any) => {
        const avg = ((student.math + student.chinese + student.english +
          student.physics + student.chemistry + student.biology) / 6).toFixed(1);
        return `
              <tr>
                <td>${student.name}</td>
                <td>${student.math}</td>
                <td>${student.chinese}</td>
                <td>${student.english}</td>
                <td>${student.physics}</td>
                <td>${student.chemistry}</td>
                <td>${student.biology}</td>
                <td>${avg}</td>
              </tr>
            `;
      }).join('')}
        </tbody>
      </table>
      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()">打印</button>
        <button onclick="window.close()">关闭</button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

// 模板下载功能
const handleDownloadTemplate = () => {
  const templateData = [
    ['姓名', '数学', '语文', '英语', '物理', '化学', '生物'],
    ['张三', '95', '88', '92', '87', '90', '85'],
    ['李四', '78', '85', '80', '82', '79', '88'],
    ['示例学生', '90', '85', '88', '92', '87', '89']
  ];

  const csvContent = templateData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', '学生成绩导入模板.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 导出组件和功能函数以便在其他文件中使用
export { AnimatedNumber, GradeDistributionChart, GradeChart, handleImportData, handleExportExcel, handleExportPDF, handleDownloadTemplate };

// 定义 Correct 组件的 props 类型
interface CorrectProps {
  gradesList?: any[]; // 可选参数，允许外部传入成绩列表数据
}

import { getAllStudents, updateStudent, deleteStudent, createStudent, StudentGrade } from '../../services/studentService';
import { saveAs } from 'file-saver';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';

export default function Correct({ gradesList: externalGradesList }: CorrectProps) {
  const [chartType, setChartType] = useState('both');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // 使用后端API数据或外部传入的数据
  const [studentData, setStudentData] = useState<StudentGrade[]>(externalGradesList || []);
  
  // 计算每个学生的平均分
  const [averageScores, setAverageScores] = useState<{[key: number]: string}>({});
  
  // 计算统计数据
  const [statsData, setStatsData] = useState({
    highestAvg: '0.0',
    lowestAvg: '0.0',
    classAvg: '0.0',
    topSubject: ''
  });
  
  // 智能分析函数
  const analyzeGrades = async () => {
    if (!studentData || studentData.length === 0) {
      alert('没有学生数据可供分析');
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    
    try {
      // 准备分析数据
      const analysisData = {
        totalStudents: studentData.length,
        classAverage: statsData.classAvg,
        highestAverage: statsData.highestAvg,
        lowestAverage: statsData.lowestAvg,
        topSubject: statsData.topSubject,
        students: studentData.map(student => ({
          name: student.name,
          math: student.math,
          chinese: student.chinese,
          english: student.english,
          physics: student.physics,
          chemistry: student.chemistry,
          biology: student.biology,
          average: student.id ? (averageScores[student.id] || '0.0') : '0.0'
        }))
      };
      
      // 调用硅基流动API - 流式输出
      console.log('开始调用硅基流动API...');
      
      // 初始化流式报告
      setAnalysisResult({
        fullReport: '分析报告生成中...\n\n',
        generatedTime: new Date().toLocaleString()
      });
      
      try {
        const controller = new AbortController();
        const response = await fetch('https://api.siliconflow.cn/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-mlkyjbhzdzpxqptuvwvqgfaxziyygjemyvoklagvoezttbla'
          },
          body: JSON.stringify({
            model: 'Qwen/QwQ-32B',
            messages: [
              {
                role: 'system',
                content: '你是一名教育数据分析专家，请根据提供的学生成绩数据生成一份详细的分析报告。报告应包括班级整体情况、优秀学生分析、成绩较差学生分析、挂科预警以及提升建议等内容。'
              },
              {
                role: 'user',
                content: JSON.stringify(analysisData)
              }
            ],
            max_tokens: 2048,
            temperature: 0.7,
            stream: true // 启用流式输出
          }),
          signal: controller.signal,
        });
        
        if (!response.ok) {
          throw new Error(`服务器错误: ${response.status} ${response.statusText}`);
        }
        
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('无法获取响应流');
        }
        
        const decoder = new TextDecoder();
        let fullReport = '分析报告生成中...\n\n';
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          // 处理流式数据，寻找data: 开头的行
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim().startsWith('data: ')) {
              const data = line.replace('data: ', '').trim();
              if (data === '[DONE]') break;
              
              try {
                const json = JSON.parse(data);
                if (json.choices && json.choices.length > 0 && json.choices[0].delta?.content) {
                  fullReport += json.choices[0].delta.content;
                  setAnalysisResult((prev: any) => ({
                    ...prev,
                    fullReport
                  }));
                }
              } catch (e) {
                console.error('解析流式数据失败:', e);
              }
            }
          }
        }
        
        // 完成后更新最终报告
        setAnalysisResult((prev: any) => ({
          ...prev,
          fullReport: fullReport.replace('分析报告生成中...\n\n', ''),
          generatedTime: new Date().toLocaleString()
        }));
        console.log('API调用成功，流式输出完成');
      } catch (streamError) {
        console.error('流式API调用失败:', streamError);
        throw streamError;
      }
    } catch (err: any) {
      console.error('分析失败:', err);
      // 显示更详细的错误信息
      let errorMessage = '分析失败: ';
      if (err.response) {
        // 服务器返回了错误响应
        errorMessage += `服务器错误 ${err.response.status}: ${err.response.data?.error?.message || JSON.stringify(err.response.data)}`;
      } else if (err.request) {
        // 请求已发送但未收到响应
        if (err.code === 'ECONNABORTED') {
          errorMessage += '请求超时，请稍后重试或检查网络连接';
        } else {
          errorMessage += '未收到服务器响应，请检查网络连接';
        }
      } else {
        // 设置请求时发生错误
        errorMessage += err.message || '未知错误';
      }
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };
  
;
  
  // 智能分析结果组件
  // 生成分析报告PDF的功能
  const generateAnalysisPDF = () => {
    if (!analysisResult) {
      alert('没有分析报告可以导出');
      return;
    }

    // 创建一个新窗口用于打印
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('无法打开打印窗口');
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>智能成绩分析报告</title>
        <style>
          body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 20px; }
          h1, h2, h3 { color: #333; }
          .report-container { max-width: 800px; margin: 0 auto; }
          .report-header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #ddd; padding-bottom: 15px; }
          .report-content { line-height: 1.6; }
          .report-time { color: #666; font-size: 14px; text-align: right; margin-bottom: 20px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <h1>智能成绩分析报告</h1>
            <div class="report-time">生成时间: ${analysisResult.generatedTime}</div>
          </div>
          <div class="report-content">
            ${analysisResult.fullReport.replace(/\n/g, '<br/>')}
          </div>
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()">打印</button>
            <button onclick="window.close()">关闭</button>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const AnalysisResult = () => {
    if (!analysisResult) {
      return (
        <div className={styles.analysisResult}>
          <p className={styles.noAnalysis}>点击"智能分析"按钮生成成绩分析报告</p>
        </div>
      );
    }
    
    return (
      <div className={styles.analysisResult}>
        <div className={styles.analysisHeader}>
          <h3 className={styles.analysisTitle}>智能成绩分析报告</h3>
          <button 
            onClick={generateAnalysisPDF} 
            className={styles.exportPDFButton} 
          >
            📄 导出PDF
          </button>
        </div>

        {/* 处理特殊字符后的分析报告 */}
        <div 
          className={styles.analysisContent} 
          dangerouslySetInnerHTML={{ 
            __html: analysisResult.fullReport
              .replace(/\n/g, '<br/>')
              .replace(/#+/g, ' ') // 替换#号
              .replace(/\*\*\*\*/g, '优秀') // 替换四个星号
              .replace(/[\*#]+/g, '') // 移除其他星号和#号
          }}
        />
        <div className={styles.analysisTime}>生成时间: {analysisResult.generatedTime}</div>
      </div>
    );
  };
  
  
  // 从API获取学生数据
  useEffect(() => {
    // 如果已经有外部传入的数据，则不需要从API获取
    if (externalGradesList && externalGradesList.length > 0) {
      return;
    }
    
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllStudents();
        setStudentData(data);
      } catch (err) {
        console.error('获取学生数据失败:', err);
        setError('获取学生数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [externalGradesList]);
  
  // 当学生数据变化时，重新计算平均分
  useEffect(() => {
    // 计算每个学生的平均分
    const newAverages: {[key: number]: string} = {};
    const allAverages: number[] = [];
    
    studentData.forEach(student => {
      // 如果后端已经计算了averageScore，则直接使用
      if (student.averageScore) {
        newAverages[student.id!] = student.averageScore;
        allAverages.push(parseFloat(student.averageScore));
      } else {
        // 否则前端计算
        const avg = ((student.math + student.chinese + student.english +
          student.physics + student.chemistry + student.biology) / 6);
        newAverages[student.id!] = avg.toFixed(1);
        allAverages.push(avg);
      }
    });
    
    setAverageScores(newAverages);
    
    // 更新统计数据
    if (allAverages.length > 0) {
      // 计算最高、最低和班级平均分
      const highestAvg = Math.max(...allAverages).toFixed(1);
      const lowestAvg = Math.min(...allAverages).toFixed(1);
      const classAvg = (allAverages.reduce((sum, avg) => sum + avg, 0) / allAverages.length).toFixed(1);
      
      // 计算最高分科目
      const subjects = ['math', 'chinese', 'english', 'physics', 'chemistry', 'biology'] as const;
      const subjectNames = ['数学', '语文', '英语', '物理', '化学', '生物'];
      const subjectAverages = subjects.map(subject => {
        const total = studentData.reduce((sum, student) => sum + (student as any)[subject], 0);
        return total / studentData.length;
      });
      const maxIndex = subjectAverages.indexOf(Math.max(...subjectAverages));
      
      setStatsData({
        highestAvg,
        lowestAvg,
        classAvg,
        topSubject: subjectNames[maxIndex]
      });
    }
  }, [studentData]);
  
  // 使用计算好的学生数据
  const gradesList = studentData;
  
  // 处理学生删除
  const handleDeleteStudent = async (studentId: string) => {
    if (!studentId) return;
    
    if (window.confirm('确定要删除这名学生的成绩记录吗？')) {
      try {
        await deleteStudent(studentId);
        // 更新本地数据
        setStudentData(prevData => prevData.filter(student => student._id !== studentId));
      } catch (err) {
        console.error('删除学生失败:', err);
        alert('删除失败，请稍后重试');
      }
    }
  };
  
  // 处理学生编辑
  const handleEditStudent = async (studentId: string, updatedFields: Partial<StudentGrade>) => {
    if (!studentId) return;
    
    try {
      const updatedStudent = await updateStudent(studentId, updatedFields);
      // 更新本地数据
      setStudentData(prevData => 
        prevData.map(student => 
          student._id === studentId ? { ...student, ...updatedStudent } : student
        )
      );
    } catch (err) {
      console.error('更新学生失败:', err);
      alert('更新失败，请稍后重试');
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.actionButtons}>
        <button onClick={handleImportData} className={styles.actionButton}>
          📥 导入数据
        </button>
        <button onClick={() => handleExportExcel(gradesList)} className={styles.actionButton}>
          📤 导出Excel
        </button>
        <button onClick={() => handleExportPDF(gradesList)} className={styles.actionButton}>
          📄 导出PDF
        </button>
        <button onClick={handleDownloadTemplate} className={styles.actionButton}>
          📋 下载模板
        </button>
        <button 
          onClick={analyzeGrades} 
          className={styles.actionButton} 
          disabled={analyzing || !studentData.length}
        >
          {analyzing ? '分析中...' : '🧠 智能分析'}
        </button>
      </div>
      <div className={styles.content}>



        {/* 成绩列表和图表 */}
        <div className={styles.gradesSection}>
          {/* 成绩表格 */}
          <div className={styles.gradesTable}>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>数学</th>
                    <th>语文</th>
                    <th>英语</th>
                    <th>物理</th>
                    <th>化学</th>
                    <th>生物</th>
                    <th>平均分</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {gradesList.map((student: any) => (
                    <tr
                      key={student.id}
                      className={selectedStudent === student.id ? styles.selectedRow : ''}
                      onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                    >
                      <td>{student.name}</td>
                      <td>{student.math}</td>
                      <td>{student.chinese}</td>
                      <td>{student.english}</td>
                      <td>{student.physics}</td>
                      <td>{student.chemistry}</td>
                      <td>{student.biology}</td>
                      <td className={styles.averageScore}>{averageScores[student.id] || '0.0'}分</td>
                      <td>
                        <ButtonPermission
                          resource="button"
                          action="edit_academic_info"
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            // 随机更新一个科目的分数
                            const subjects = ['math', 'chinese', 'english', 'physics', 'chemistry', 'biology'];
                            const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
                            const newScore = Math.floor(Math.random() * 30) + 70; // 70-99之间的随机分数
                            
                            // 如果有_id（后端数据），则调用API更新
                            if (student._id) {
                              handleEditStudent(student._id, { [randomSubject]: newScore });
                            } else {
                              // 否则只更新本地数据（适用于外部传入的数据）
                              const updatedStudentData = studentData.map(s => {
                                if (s.id === student.id) {
                                  return { ...s, [randomSubject]: newScore };
                                }
                                return s;
                              });
                              
                              // 更新学生数据，这将触发useEffect重新计算平均分
                              setStudentData(updatedStudentData);
                            }
                          }}
                        >
                          编辑
                        </ButtonPermission>
                        <ButtonPermission
                          resource="button"
                          action="delete_academic_info"
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            // 如果有_id（后端数据），则调用API删除
                            if (student._id) {
                              handleDeleteStudent(student._id);
                            } else {
                              // 否则只从本地数据中删除（适用于外部传入的数据）
                              setStudentData(prevData => prevData.filter(s => s.id !== student.id));
                            }
                          }}
                        >
                          删除
                        </ButtonPermission>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 图表展示区域 */}
          <div className={styles.chartsContainer}>
            <div className={styles.chartControls}>
              <h3>数据可视化</h3>
              <div className={styles.chartTypeSelector}>
                <button
                  className={`${styles.chartTypeButton} ${chartType === 'bar' ? styles.active : ''}`}
                  onClick={() => setChartType('bar')}
                >
                  📊 柱状图
                </button>
                <button
                  className={`${styles.chartTypeButton} ${chartType === 'pie' ? styles.active : ''}`}
                  onClick={() => setChartType('pie')}
                >
                  🥧 饼图
                </button>
                <button
                  className={`${styles.chartTypeButton} ${chartType === 'both' ? styles.active : ''}`}
                  onClick={() => setChartType('both')}
                >
                  📈 综合视图
                </button>
              </div>
            </div>
            <div className={styles.chartDisplayArea}>
              {(chartType === 'bar' || chartType === 'both') && (
                <GradeChart data={gradesList} />
              )}
              {(chartType === 'pie' || chartType === 'both') && (
                <GradeDistributionChart data={gradesList} />
              )}
            </div>
          </div>

          {/* 统计信息 */}
          <div className={styles.statisticsPanel}>
            <h3>统计分析</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>最高平均分</div>
                <div className={styles.statValue}>
                  <AnimatedNumber value={`${statsData.highestAvg}分`} duration={1000} />
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>最低平均分</div>
                <div className={styles.statValue}>
                  <AnimatedNumber value={`${statsData.lowestAvg}分`} duration={1000} />
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>班级平均分</div>
                <div className={styles.statValue}>
                  <AnimatedNumber value={`${statsData.classAvg}分`} duration={1000} />
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>最高分科目</div>
                <div className={styles.statValue}>
                  {statsData.topSubject}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 智能分析结果区域 */}
        <div className={styles.analysisSection}>
          <h3>智能成绩分析</h3>
          <AnalysisResult />
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
function setStudentData(arg0: (prevData: any) => any[]) {
  throw new Error('Function not implemented.');
}


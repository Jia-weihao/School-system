'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './create.module.css';
      import API_BASE_URL from '../tools/api';
export default function CreateCourseSelection() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    academicYear: '2021-2022学年',
    semester: '2021-2022学年第一学期',
    schoolLevel: '高中',
    grade: '高一',
    classes: {
      '一班': false,
      '二班': false,
      '三班': false,
      '四班': false,
      '五班': false,
      '六班': false,
      '七班': false,
      '八班': false,
      '九班': false,
      '十班': false,
      '十一班': false,
      '十二班': false
    },
    description: ''
  });

  // 学年选项
  const academicYearOptions = [
    '2021-2022学年',
    '2022-2023学年',
    '2023-2024学年',
    '2024-2025学年'
  ];

  // 学期选项
  const semesterOptions = [
    '2021-2022学年第一学期',
    '2021-2022学年第二学期',
    '2022-2023学年第一学期',
    '2022-2023学年第二学期',
    '2023-2024学年第一学期',
    '2023-2024学年第二学期',
    '2024-2025学年第一学期',
    '2024-2025学年第二学期'
  ];

  // 学校级别选项
  const schoolLevelOptions = ['小学', '初中', '高中'];

  // 年级选项映射
  const gradeOptionsMap = {
    '小学': ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    '初中': ['初一', '初二', '初三'],
    '高中': ['高一', '高二', '高三']
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理复选框变化
  const handleCheckboxChange = (className: string) => {
    setFormData(prev => ({
      ...prev,
      classes: {
        ...prev.classes,
        [className]: !prev.classes[className as keyof typeof prev.classes]
      }
    }));
  };

  // 处理学校级别变化，重置年级
  const handleSchoolLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      schoolLevel: value,
      grade: gradeOptionsMap[value as keyof typeof gradeOptionsMap][0]
    }));
  };

  // 处理取消
  const handleCancel = () => {
    router.back();
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 构建选课对象列表
      const selectedClasses = Object.entries(formData.classes)
        .filter(([_, isSelected]) => isSelected)
        .map(([className]) => className);
      
      // 构建目标字符串，例如：一班、二班、八班
      const targetString = selectedClasses.join('、');
      
      // 构建要发送到后端的数据
      const taskData = {
        name: formData.name,
        academicYear: formData.academicYear,
        semester: formData.semester,
        target: targetString || `${formData.grade}全部班级`,
        time: new Date().toISOString(),
        status: 0, // 0 表示 "未发布"
        description: formData.description
      };
      
      // 导入API基础URL

      // 发送到后端API
      const response = await fetch(`${API_BASE_URL}/api/setting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 创建成功，返回列表页
      alert('选课任务创建成功！');
      router.push('/scc/setting');
      
    } catch (error) {
      console.error('创建任务失败:', error);
      alert('创建任务失败，请重试');
    }
  };

  return (
    <div className={styles.createPage}>
      <div className={styles.breadcrumb}>
        <span>选课设置</span> / <span>创建选课</span>
      </div>
      
      <div className={styles.stepIndicator}>
        <div className={styles.stepActive}>
          <span className={styles.stepNumber}>1</span>
          <span className={styles.stepText}>基本信息</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={styles.step}>
          <span className={styles.stepNumber}>2</span>
          <span className={styles.stepText}>选课学生</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={styles.step}>
          <span className={styles.stepNumber}>3</span>
          <span className={styles.stepText}>选课设置</span>
        </div>
      </div>
      
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.required}>选课任务名称</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="请输入选课任务名称"
              required
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.required}>学年学期</label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              className={styles.formSelect}
            >
              {academicYearOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.required}>学期</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className={styles.formSelect}
            >
              {semesterOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.required}>学段</label>
            <select
              name="schoolLevel"
              value={formData.schoolLevel}
              onChange={handleSchoolLevelChange}
              className={styles.formSelect}
            >
              {schoolLevelOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.required}>年级</label>
            <select
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              className={styles.formSelect}
            >
              {gradeOptionsMap[formData.schoolLevel as keyof typeof gradeOptionsMap].map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.required}>选课班级</label>
            <div className={styles.checkboxGroup}>
              {Object.keys(formData.classes).map(className => (
                <label key={className} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.classes[className as keyof typeof formData.classes]}
                    onChange={() => handleCheckboxChange(className)}
                    className={styles.checkbox}
                  />
                  {className}
                </label>
              ))}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>任务描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="请输入任务描述"
              className={styles.formTextarea}
            />
          </div>
          
          <div className={styles.formActions}>
            <button type="button" onClick={handleCancel} className={styles.cancelBtn}>
              取消
            </button>
            <button type="submit" className={styles.submitBtn}>
              下一步
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
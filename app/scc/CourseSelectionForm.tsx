import React, { useState, useEffect } from 'react';
import StudentSelectionForm from './StudentSelectionForm';
import CourseSettingsForm from './CourseSettingsForm';
import CourseDataSummary from './CourseDataSummary';
import { StudentData } from '../../services/studentApi';

interface FormData {
  taskName: string;
  academicYear: string;
  academicStage: string;
  grade: string;
  selectedClasses: boolean[];
  description: string;
}

interface CourseSelectionFormProps {
  onCancel?: () => void;
  onComplete?: (data: FormData) => void;
  initialData?: Partial<FormData>;
}

const CourseSelectionForm: React.FC<CourseSelectionFormProps> = ({
  onCancel,
  onComplete,
  initialData = {}
}) => {
  // 状态管理
  const [currentStep, setCurrentStep] = useState(1);
  const [showDataSummary, setShowDataSummary] = useState(false);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [courseSettings, setCourseSettings] = useState<any>({});
  const [formData, setFormData] = useState<FormData>({
    taskName: '',
    academicYear: '2021-2022学年/第一学期',
    academicStage: '高中',
    grade: '高一',
    selectedClasses: Array.from({ length: 12 }, (_, i) => i % 2 === 0), // 奇数班默认选中
    description: '',
    ...initialData
  });

  // 数据持久化
  useEffect(() => {
    const savedData = localStorage.getItem('courseSelectionData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(prev => ({ ...prev, ...parsed.formData }));
      setCurrentStep(parsed.currentStep || 1);
      setStudents(parsed.students || []);
      setCourseSettings(parsed.courseSettings || {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('courseSelectionData', JSON.stringify({
      formData,
      currentStep,
      students,
      courseSettings
    }));
  }, [formData, currentStep, students, courseSettings]);

  // 处理表单数据变化
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理班级选择
  const handleClassToggle = (index: number) => {
    const newSelectedClasses = [...formData.selectedClasses];
    newSelectedClasses[index] = !newSelectedClasses[index];
    handleInputChange('selectedClasses', newSelectedClasses);
  };

  // 下一步
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      // 显示数据汇总页面
      setShowDataSummary(true);
    }
  };

  // 显示数据汇总
  const handleShowDataSummary = () => {
    setShowDataSummary(true);
  };

  // 返回设置
  const handleBackToSettings = () => {
    setShowDataSummary(false);
  };

  // 上一步
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 取消
  const handleCancel = () => {
    setCurrentStep(1);
    setFormData({
      taskName: '',
      academicYear: '2021-2022学年/第一学期',
      academicStage: '高中',
      grade: '高一',
      selectedClasses: Array.from({ length: 12 }, (_, i) => i % 2 === 0),
      description: ''
    });
    localStorage.removeItem('courseSelectionData');
    if (onCancel) {
      onCancel();
    }
  };

  // 渲染步骤指示器
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: '基本信息' },
      { number: 2, title: '选课学生' },
      { number: 3, title: '选课设置' }
    ];

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '40px',
        backgroundColor: '#f8f9ff',
        padding: '20px',
        borderRadius: '12px'
      }}>
        {steps.map((step, index) => (
          <div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: currentStep >= step.number ? '#6366f1' : '#e5e7eb',
              color: currentStep >= step.number ? 'white' : '#9ca3af',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {step.number}
            </div>
            <span style={{
              marginLeft: '8px',
              color: currentStep >= step.number ? '#6366f1' : '#9ca3af',
              fontWeight: currentStep === step.number ? 'bold' : 'normal'
            }}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div style={{
                width: '60px',
                height: '2px',
                backgroundColor: currentStep > step.number ? '#6366f1' : '#e5e7eb',
                margin: '0 20px'
              }} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // 渲染第一步：基本信息
  const renderStep1 = () => {
    const classNames = [
      '一班', '二班', '三班', '四班', '五班', '六班',
      '七班', '八班', '九班', '十班', '十一班', '十二班'
    ];

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#374151'
          }}>
            <span style={{ color: '#ef4444', marginRight: '4px' }}>*</span>
            选课任务名称
          </label>
          <input
            type="text"
            value={formData.taskName}
            onChange={(e) => handleInputChange('taskName', e.target.value)}
            placeholder="请输入选课任务名称"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#374151'
          }}>
            <span style={{ color: '#ef4444', marginRight: '4px' }}>*</span>
            学年学期
          </label>
          <select
            value={formData.academicYear}
            onChange={(e) => handleInputChange('academicYear', e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white'
            }}
          >
            <option value="2021-2022学年/第一学期">2021-2022学年/第一学期</option>
            <option value="2021-2022学年/第二学期">2021-2022学年/第二学期</option>
            <option value="2022-2023学年/第一学期">2022-2023学年/第一学期</option>
            <option value="2022-2023学年/第二学期">2022-2023学年/第二学期</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#374151'
          }}>
            <span style={{ color: '#ef4444', marginRight: '4px' }}>*</span>
            学段
          </label>
          <select
            value={formData.academicStage}
            onChange={(e) => handleInputChange('academicStage', e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white'
            }}
          >
            <option value="高中">高中</option>
            <option value="初中">初中</option>
            <option value="小学">小学</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#374151'
          }}>
            <span style={{ color: '#ef4444', marginRight: '4px' }}>*</span>
            年级
          </label>
          <select
            value={formData.grade}
            onChange={(e) => handleInputChange('grade', e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white'
            }}
          >
            <option value="高一">高一</option>
            <option value="高二">高二</option>
            <option value="高三">高三</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: '500',
            color: '#374151'
          }}>
            <span style={{ color: '#ef4444', marginRight: '4px' }}>*</span>
            选课班级
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: '12px',
            maxWidth: '600px'
          }}>
            {classNames.map((className, index) => (
              <label key={index} style={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                backgroundColor: formData.selectedClasses[index] ? '#eff6ff' : 'white'
              }}>
                <input
                  type="checkbox"
                  checked={formData.selectedClasses[index]}
                  onChange={() => handleClassToggle(index)}
                  style={{ 
                    marginRight: '8px',
                    accentColor: '#6366f1'
                  }}
                />
                <span style={{ fontSize: '14px' }}>{className}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#374151'
          }}>
            任务描述
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="请输入任务描述"
            rows={6}
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>
      </div>
    );
  };

  // 渲染第二步：选课学生
  const renderStep2 = () => {
    return (
      <StudentSelectionForm
        selectedClasses={formData.selectedClasses}
        onStudentsChange={setStudents}
        initialStudents={students}
      />
    );
  };

  // 渲染第三步：选课设置
  const renderStep3 = () => {
    return (
      <CourseSettingsForm
        onDataChange={setCourseSettings}
        initialData={courseSettings}
      />
    );
  };

  // 如果显示数据汇总，渲染汇总组件
  if (showDataSummary) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <CourseDataSummary
          data={{
            formData,
            students,
            courseSettings,
            coursePermissionData: courseSettings.coursePermissionData || {},
            enrollmentLimitData: courseSettings.enrollmentLimitData || {}
          }}
          onBack={handleBackToSettings}
        />
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '30px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      {renderStepIndicator()}

      <div style={{ minHeight: '500px' }}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '16px',
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          onClick={handleCancel}
          style={{
            padding: '10px 24px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white',
            color: '#374151',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          取消
        </button>
        
        {currentStep > 1 && (
          <button
            onClick={handlePrev}
            style={{
              padding: '10px 24px',
              border: '1px solid #6366f1',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#6366f1',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            上一步
          </button>
        )}
        
        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            disabled={!formData.taskName.trim()}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: formData.taskName.trim() ? '#6366f1' : '#d1d5db',
              color: 'white',
              fontSize: '14px',
              cursor: formData.taskName.trim() ? 'pointer' : 'not-allowed',
              fontWeight: '500'
            }}
          >
            下一步
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#6366f1',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            完成
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseSelectionForm; 
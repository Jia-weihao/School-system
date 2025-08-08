'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Row, Col, Space, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 设置 dayjs 中文语言
dayjs.locale('zh-cn');

import {
  getSubResourceTypes,
  getGrades,
  getSubjects,
  getTextbookVersions,
  getVolumes,
  getAuditStatuses,
  getTargetAudiences,
  getDifficultyLevels,
  type SubResourceType,
  type Grade,
  type Subject,
  type TextbookVersion,
  type Volume,
  type AuditStatus,
  ResourceType,
  Chapter,
  getResourceTypes,
  getChapters} from '../src/services/resourceService';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface ResourceSearchFormProps {
  form: any;
  onSearch: (values: any) => void;
  onReset: () => void;
  type?: 'teaching' | 'extracurricular' | 'type';
}

const ResourceSearchForm: React.FC<ResourceSearchFormProps> = ({
  form,
  onSearch,
  onReset,
  type = 'teaching'
}) => {
  // 状态管理
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [textbookVersions, setTextbookVersions] = useState<TextbookVersion[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [auditStatuses, setAuditStatuses] = useState<AuditStatus[]>([]);
  const [loading, setLoading] = useState(false);

  // 监听学科和册别变化，动态加载章节
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedVolume, setSelectedVolume] = useState<string>('');

  // 加载基础数据
  useEffect(() => {
    loadBasicData();
  }, []);

  // 当学科或册别改变时，重新加载章节
  useEffect(() => {
    if (selectedSubject || selectedVolume) {
      loadChapters(selectedSubject, selectedVolume);
    }
  }, [selectedSubject, selectedVolume]);

  const loadBasicData = async () => {
    setLoading(true);
    try {
      const [
        resourceTypesRes,
        gradesRes,
        subjectsRes,
        textbookVersionsRes,
        volumesRes,
        auditStatusesRes
      ] = await Promise.all([
        getResourceTypes(),
        getGrades(),
        getSubjects(),
        getTextbookVersions(),
        getVolumes(),
        getAuditStatuses()
      ]);

      if (resourceTypesRes.success) {
        setResourceTypes(resourceTypesRes.data);
      }
      if (gradesRes.success) {
        setGrades(gradesRes.data);
      }
      if (subjectsRes.success) {
        setSubjects(subjectsRes.data);
      }
      if (textbookVersionsRes.success) {
        setTextbookVersions(textbookVersionsRes.data);
      }
      if (volumesRes.success) {
        setVolumes(volumesRes.data);
      }
      if (auditStatusesRes.success) {
        setAuditStatuses(auditStatusesRes.data);
      }
    } catch (error) {
      message.error('加载基础数据失败');
      console.error('加载基础数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async (subjectId?: string, volumeId?: string) => {
    try {
      const response = await getChapters(subjectId, volumeId, {});
      if (response.success) {
        setChapters(response.data);
      }
    } catch (error) {
      console.error('加载章节失败:', error);
    }
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    // 清空章节选择
    form.setFieldsValue({ chapterId: undefined });
  };

  const handleVolumeChange = (value: string) => {
    setSelectedVolume(value);
    // 清空章节选择
    form.setFieldsValue({ chapterId: undefined });
  };

  const handleReset = () => {
    setSelectedSubject('');
    setSelectedVolume('');
    setChapters([]);
    onReset();
  };

  const renderTeachingFields = () => (
    <>
      <Col span={8}>
        <Form.Item label="资源名称" name="name">
          <Input placeholder="输入关键字搜索" allowClear />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="资源类型" name="typeId">
          <Select placeholder="请选择资源类型" allowClear loading={loading}>
            {Array.isArray(resourceTypes) && resourceTypes.map(type => (
              <Option key={type._id} value={type._id}>
                {type.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="年级" name="gradeId">
          <Select placeholder="请选择年级" allowClear loading={loading}>
            {Array.isArray(grades) && grades.map(grade => (
              <Option key={grade._id} value={grade._id}>
                {grade.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="学科" name="subjectId">
          <Select
            placeholder="请选择学科"
            allowClear
            loading={loading}
            onChange={handleSubjectChange}
          >
            {Array.isArray(subjects) && subjects.map(subject => (
              <Option key={subject._id} value={subject._id}>
                {subject.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="教材版本" name="textbookVersionId">
          <Select placeholder="请选择教材版本" allowClear loading={loading}>
            {Array.isArray(textbookVersions) && textbookVersions.map(version => (
              <Option key={version._id} value={version._id}>
                {version.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="册别" name="volumeId">
          <Select
            placeholder="请选择册别"
            allowClear
            loading={loading}
            onChange={handleVolumeChange}
          >
            {Array.isArray(volumes) && volumes.map(volume => (
              <Option key={volume._id} value={volume._id}>
                {volume.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="章节" name="chapterId">
          <Select placeholder="请选择章节" allowClear>
            {chapters.map(chapter => (
              <Option key={chapter._id} value={chapter._id}>
                {chapter.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="审核状态" name="auditStatusId">
          <Select placeholder="请选择审核状态" allowClear loading={loading}>
            {Array.isArray(auditStatuses) && auditStatuses.map(status => (
              <Option key={status._id} value={status._id}>
                {status.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="创建时间" name="dateRange">
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>
    </>
  );

  const renderExtracurricularFields = () => (
    <>
      <Col span={8}>
        <Form.Item label="资源名称" name="name">
          <Input placeholder="请输入资源名称" allowClear />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="资源类型" name="typeId">
          <Select placeholder="请选择资源类型" allowClear loading={loading}>
            {resourceTypes.map(type => (
              <Option key={type._id} value={type._id}>
                {type.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="年级" name="gradeId">
          <Select placeholder="请选择年级" allowClear loading={loading}>
            {grades.map(grade => (
              <Option key={grade._id} value={grade._id}>
                {grade.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="学科" name="subjectId">
          <Select placeholder="请选择学科" allowClear loading={loading}>
            {subjects.map(subject => (
              <Option key={subject._id} value={subject._id}>
                {subject.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="审核状态" name="auditStatusId">
          <Select placeholder="请选择审核状态" allowClear loading={loading}>
            {auditStatuses.map(status => (
              <Option key={status._id} value={status._id}>
                {status.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="创建时间" name="dateRange">
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>
    </>
  );

  const renderTypeFields = () => (
    <>
      <Col span={8}>
        <Form.Item label="类型名称" name="name">
          <Input placeholder="输入关键字搜索" allowClear />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label="创建时间" name="dateRange">
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>
    </>
  );

  const handleSearch = (values: any) => {
    // 处理日期范围
    if (values.dateRange) {
      values.startDate = values.dateRange[0]?.format('YYYY-MM-DD');
      values.endDate = values.dateRange[1]?.format('YYYY-MM-DD');
      delete values.dateRange;
    }
    onSearch(values);
  };

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={handleSearch}
      style={{ marginBottom: 20 }}
    >
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        {type === 'teaching' && renderTeachingFields()}
        {type === 'extracurricular' && renderExtracurricularFields()}
        {type === 'type' && renderTypeFields()}
      </Row>
      <Row style={{ marginTop: 16, width: '100%' }}>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginRight: 8 }}
            loading={loading}
          >
            查询
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ResourceSearchForm;
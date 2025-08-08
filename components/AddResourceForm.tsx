'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, Row, Col, DatePicker, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import {
    getGrades, getSubjects, getTextbookVersions, getVolumes, getChapters,
    getResourceTypes, getSubResourceTypes, getAuditStatuses, getResourceStatuses, getPermissionTypes,
    type Grade, type Subject, type TextbookVersion, type Volume, type MainResourceType, type SubResourceType,
    type AuditStatus, type ResourceStatus, type PermissionType
} from '../src/services/resourceService';

const { Option } = Select;
const { TextArea } = Input;

// 表单数据类型定义
interface FormValues {
    resourceName: string;
    description?: string;
    grade: string;
    year: Dayjs;
    subject: string;
    version: string;
    volume: string;
    resourceType: string;
    courseCatalog?: string;
    statusId: string;
    approvalStatusId: string;
    permissionTypeId: string;
}

interface AddResourceFormProps {
    onSubmit?: (data: FormValues) => void;
    onBack?: () => void;
    onCancel?: () => void;
}

const AddResourceForm: React.FC<AddResourceFormProps> = ({
    onSubmit,
    onBack,
    onCancel
}) => {
    const [form] = Form.useForm<FormValues>();
    const [loading, setLoading] = useState(false);

    // 基础数据状态
    const [mainResourceTypes, setMainResourceTypes] = useState<MainResourceType[]>([]);
    // 删除子资源类型状态
    // const [subResourceTypes, setSubResourceTypes] = useState<SubResourceType[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [versions, setVersions] = useState<TextbookVersion[]>([]);
    const [volumes, setVolumes] = useState<Volume[]>([]);
    const [auditStatuses, setAuditStatuses] = useState<AuditStatus[]>([]);
    const [resourceStatuses, setResourceStatuses] = useState<ResourceStatus[]>([]);
    const [permissionTypes, setPermissionTypes] = useState<PermissionType[]>([]);

    // 动态数据状态
    const [courseCatalog, setCourseCatalog] = useState<Array<{ _id: string; name: string }>>([]);

    // 加载状态
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [loadingBasicData, setLoadingBasicData] = useState(true);

    // 获取子资源类型的函数

    // 获取基础数据
    const fetchBasicData = async () => {
        try {
            console.log('🔥 开始获取基础数据...');

            // 获取资源类型
            const resourceTypesRes = await getResourceTypes();
            console.log('资源类型响应:', resourceTypesRes);

            if (resourceTypesRes?.success && Array.isArray(resourceTypesRes.data)) {
                setMainResourceTypes(resourceTypesRes.data);
                console.log('设置资源类型成功:', resourceTypesRes.data);
            } else {
                console.warn('资源类型数据格式异常:', resourceTypesRes);
                setMainResourceTypes([]);
            }

            // 获取年级
            const gradesRes = await getGrades();
            console.log('年级响应:', gradesRes);

            if (gradesRes?.success && Array.isArray(gradesRes.data)) {
                setGrades(gradesRes.data);
                console.log('设置年级成功:', gradesRes.data);
            } else {
                console.warn('年级数据格式异常:', gradesRes);
                setGrades([]);
            }

            // 获取学科
            const subjectsRes = await getSubjects();
            console.log('学科响应:', subjectsRes);

            if (subjectsRes?.success && Array.isArray(subjectsRes.data)) {
                setSubjects(subjectsRes.data);
                console.log('设置学科成功:', subjectsRes.data);
            } else {
                console.warn('学科数据格式异常:', subjectsRes);
                setSubjects([]);
            }

            // 获取版本
            const versionsRes = await getTextbookVersions();
            console.log('版本响应:', versionsRes);

            if (versionsRes?.success && Array.isArray(versionsRes.data)) {
                setVersions(versionsRes.data);
                console.log('设置版本成功:', versionsRes.data);
            } else {
                console.warn('版本数据格式异常:', versionsRes);
                setVersions([]);
            }

            // 获取册次
            const volumesRes = await getVolumes();
            console.log('册次响应:', volumesRes);

            if (volumesRes?.success && Array.isArray(volumesRes.data)) {
                setVolumes(volumesRes.data);
                console.log('设置册次成功:', volumesRes.data);
            } else {
                console.warn('册次数据格式异常:', volumesRes);
                setVolumes([]);
            }

            // 获取审核状态
            const auditStatusesRes = await getAuditStatuses();
            console.log('审核状态响应:', auditStatusesRes);

            if (auditStatusesRes?.success && Array.isArray(auditStatusesRes.data)) {
                setAuditStatuses(auditStatusesRes.data);
                console.log('设置审核状态成功:', auditStatusesRes.data);
            } else {
                console.warn('审核状态数据格式异常:', auditStatusesRes);
                setAuditStatuses([]);
            }

            // 获取资源状态
            const resourceStatusesRes = await getResourceStatuses();
            console.log('资源状态响应:', resourceStatusesRes);

            if (resourceStatusesRes?.success && Array.isArray(resourceStatusesRes.data)) {
                setResourceStatuses(resourceStatusesRes.data);
                console.log('设置资源状态成功:', resourceStatusesRes.data);
            } else {
                console.warn('资源状态数据格式异常:', resourceStatusesRes);
                setResourceStatuses([]);
            }

            // 获取权限类型
            const permissionTypesRes = await getPermissionTypes();
            console.log('权限类型响应:', permissionTypesRes);

            if (permissionTypesRes?.success && Array.isArray(permissionTypesRes.data)) {
                setPermissionTypes(permissionTypesRes.data);
                console.log('设置权限类型成功:', permissionTypesRes.data);
            } else {
                console.warn('权限类型数据格式异常:', permissionTypesRes);
                setPermissionTypes([]);
            }

            // 设置表单默认值
            const defaultValues: Partial<FormValues> = {
                year: dayjs()
            };

            // 设置默认选项
            if (gradesRes?.data?.[0]) defaultValues.grade = gradesRes.data[0]._id;
            if (subjectsRes?.data?.[0]) defaultValues.subject = subjectsRes.data[0]._id;
            if (versionsRes?.data?.[0]) defaultValues.version = versionsRes.data[0]._id;
            if (volumesRes?.data?.[0]) defaultValues.volume = volumesRes.data[0]._id;

            // 设置默认资源类型（查找"教学资源"）
            if (resourceTypesRes?.data?.length > 0) {
                const teachingType = resourceTypesRes.data.find((type: MainResourceType) => type.name === '教学资源');
                if (teachingType) {
                    defaultValues.resourceType = teachingType._id;
                    // 删除获取子资源类型的调用
                    // fetchSubResourceTypes(teachingType._id);
                } else if (resourceTypesRes.data[0]) {
                    defaultValues.resourceType = resourceTypesRes.data[0]._id;
                    // 删除获取子资源类型的调用
                    // fetchSubResourceTypes(resourceTypesRes.data[0]._id);
                }
            }

            // 设置默认状态（查找"启用"状态）
            if (resourceStatusesRes?.data?.length > 0) {
                const activeStatus = resourceStatusesRes.data.find((status: ResourceStatus) => status.name === '启用' || status.name === '正常');
                if (activeStatus) defaultValues.statusId = activeStatus._id;
            }

            // 设置默认审核状态（查找"待审核"状态）
            if (auditStatusesRes?.data?.length > 0) {
                const pendingStatus = auditStatusesRes.data.find((status: AuditStatus) => status.name === '待审核');
                if (pendingStatus) defaultValues.approvalStatusId = pendingStatus._id;
            }

            // 设置默认权限类型（查找"公开"权限）
            if (permissionTypesRes?.data?.length > 0) {
                const publicPermission = permissionTypesRes.data.find((perm: PermissionType) => perm.name === '公开' || perm.name === '所有人');
                if (publicPermission) defaultValues.permissionTypeId = publicPermission._id;
            }

            form.setFieldsValue(defaultValues);

        } catch (error) {
            console.error('获取基础数据失败:', error);
            message.error('获取基础数据失败');

            // 确保状态为空数组，防止undefined错误
            setMainResourceTypes([]);
            // 删除子资源类型状态设置
            // setSubResourceTypes([]);
            setGrades([]);
            setSubjects([]);
            setVersions([]);
            setVolumes([]);
            setAuditStatuses([]);
            setResourceStatuses([]);
            setPermissionTypes([]);
        } finally {
            setLoadingBasicData(false);
        }
    };

    // 根据选择条件获取章节数据
    const fetchChapters = useCallback(async (formValues?: any) => {
        const currentValues = formValues || form.getFieldsValue();
        const { grade, subject, version, volume } = currentValues;

        console.log('fetchChapters 被调用，当前表单值:', { grade, subject, version, volume });

        if (grade && subject && version && volume) {
            setLoadingChapters(true);
            console.log('开始获取章节数据，参数:', {
                gradeId: grade,
                subjectId: subject,
                versionId: version,
                volumeId: volume
            });

            try {
                const chaptersRes = await getChapters(subject, volume, {
                    gradeId: grade,
                    subjectId: subject,
                    versionId: version,
                    volumeId: volume
                });

                console.log('章节数据响应:', chaptersRes);

                if (chaptersRes?.success && Array.isArray(chaptersRes.data)) {
                    setCourseCatalog(chaptersRes.data);
                    console.log('设置章节数据成功:', chaptersRes.data);
                } else {
                    console.warn('章节数据格式异常:', chaptersRes);
                    setCourseCatalog([]);
                }
            } catch (error) {
                console.error('获取章节数据失败:', error);
                setCourseCatalog([]);
            } finally {
                setLoadingChapters(false);
            }
        } else {
            console.log('条件不满足，清空章节数据');
            setCourseCatalog([]);
        }
    }, []);

    // 表单值变化处理 - 简化版本
    const handleFormValuesChange = useCallback((changedValues: any, allValues: any) => {
        console.log('表单值变化:', changedValues, allValues);

        // 删除主资源类型变化时的子资源类型处理
        // if (changedValues.resourceType) {
        //     fetchSubResourceTypes(changedValues.resourceType);
        //     form.setFieldsValue({ subResourceType: undefined });
        // }

        // 当关键字段变化时，重新获取章节数据
        if (changedValues.grade || changedValues.subject || changedValues.version || changedValues.volume) {
            setTimeout(() => {
                fetchChapters(allValues);
            }, 500);
        }
    }, [fetchChapters, form]);

    // 组件初始化时获取基础数据
    useEffect(() => {
        fetchBasicData();
    }, []);

    // 当基础数据加载完成后，设置表单默认值
    useEffect(() => {
        if (!loadingBasicData) {
            fetchChapters();
        }
    }, [loadingBasicData, fetchChapters]);

    // 表单提交 - 简化版本
    const handleSubmit = async (values: any) => {
        console.log('🔥 表单提交开始');
        console.log('🔥 表单值:', values);

        try {
            setLoading(true);
            console.log('🔥 设置 loading 为 true');

            // 处理年份数据
            const yearValue = values.year ? (dayjs.isDayjs(values.year) ? values.year.format('YYYY') : values.year) : '';

            // 改为普通JSON提交，不使用FormData
            const submitData = {
                resourceName: values.resourceName || '',
                description: values.description || '',
                mainTypeId: values.resourceType || '',
                gradeId: values.grade || '',
                year: yearValue,
                subjectId: values.subject || '',
                versionId: values.version || '',
                volumeId: values.volume || '',
                chapter: values.courseCatalog || '',
                courseCatalog: values.courseCatalog || '',
                statusId: values.statusId || '',
                approvalStatusId: values.approvalStatusId || '',
                permissionTypeId: values.permissionTypeId || ''
            };

            console.log('🔥 发送到后端的数据:', submitData);

            const response = await axios.post('https://school.blxg.asia/api/resource/teaching', submitData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });

            console.log('🔥 API响应结果:', response.data);

            if (response.data.success) {
                console.log('🔥 提交成功！');
                message.success('教学资源添加成功！');
                form.resetFields();

                if (onBack) {
                    setTimeout(() => {
                        onBack();
                    }, 1500);
                }

                if (onSubmit) {
                    onSubmit(values);
                }
            } else {
                console.log('🔥 后端返回失败:', response.data.message);
                message.error(response.data.message || '添加失败');
            }
        } catch (error: any) {
            console.error('🔥 提交失败详细信息:', error);
            if (error.response) {
                console.error('🔥 服务器错误响应:', error.response.data);
                message.error(`提交失败: ${error.response.data.message || error.response.statusText}`);
            } else if (error.request) {
                console.error('🔥 网络错误:', error.request);
                message.error('无法连接到后端服务器，请确保后端服务正在运行');
            } else {
                console.error('🔥 请求配置错误:', error.message);
                message.error(`提交失败: ${error.message}`);
            }
        } finally {
            console.log('🔥 重置 loading 状态');
            setLoading(false);
        }
    };

    if (loadingBasicData) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div>正在加载基础数据...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {/* 面包屑导航 */}
            <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                教学资源管理 &gt; 新增教学资源
            </div>

            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px' }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    onValuesChange={handleFormValuesChange}
                >
                    {/* 第一行：年级、年份 */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="*年级"
                                name="grade"
                                rules={[{ required: true, message: '请选择年级' }]}
                            >
                                <Select placeholder="请选择年级">
                                    {Array.isArray(grades) && grades.map(grade => (
                                        <Option key={grade._id} value={grade._id}>{grade.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="*年份"
                                name="year"
                                rules={[{ required: true, message: '请选择年份' }]}
                            >
                                <DatePicker
                                    picker="year"
                                    placeholder="请选择年份"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 第二行：学科、版本 */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="*学科"
                                name="subject"
                                rules={[{ required: true, message: '请选择学科' }]}
                            >
                                <Select placeholder="请选择学科">
                                    {Array.isArray(subjects) && subjects.map(subject => (
                                        <Option key={subject._id} value={subject._id}>{subject.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="*版本"
                                name="version"
                                rules={[{ required: true, message: '请选择版本' }]}
                            >
                                <Select placeholder="请选择版本">
                                    {Array.isArray(versions) && versions.map(version => (
                                        <Option key={version._id} value={version._id}>{version.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 第三行：册次、资源类型 */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="*册次"
                                name="volume"
                                rules={[{ required: true, message: '请选择册次' }]}
                            >
                                <Select placeholder="请选择册次">
                                    {Array.isArray(volumes) && volumes.map(volume => (
                                        <Option key={volume._id} value={volume._id}>{volume.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="*资源类型"
                                name="resourceType"
                                rules={[{ required: true, message: '请选择资源类型' }]}
                            >
                                <Select placeholder="请选择资源类型">
                                    {Array.isArray(mainResourceTypes) && mainResourceTypes.map(type => (
                                        <Option key={type._id} value={type._id}>{type.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 删除第四行：子资源类型、文件上传 */}
                    {/* 
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="*子资源类型"
                                name="subResourceType"
                                rules={[{ required: true, message: '请选择子资源类型' }]}
                            >
                                <Select placeholder="请选择子资源类型">
                                    {Array.isArray(subResourceTypes) && subResourceTypes.map(subType => (
                                        <Option key={subType._id} value={subType._id}>{subType.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="*资源文件"
                                name="file"
                                rules={[{ required: true, message: '请上传资源文件' }]}
                            >
                                <Input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3,.zip,.rar" />
                            </Form.Item>
                        </Col>
                    </Row>
                    */}

                    {/* 第五行：课程目录 */}
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label="课程目录"
                                name="courseCatalog"
                            >
                                <Select
                                    placeholder={
                                        loadingChapters
                                            ? "正在加载课程目录..."
                                            : courseCatalog.length === 0
                                                ? "请先选择年级、学科、版本、册次后自动加载课程目录"
                                                : "请选择课程目录"
                                    }
                                    loading={loadingChapters}
                                    disabled={courseCatalog.length === 0 && !loadingChapters}
                                    allowClear
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                                    }
                                    notFoundContent={
                                        loadingChapters ? "加载中..." : "暂无课程目录数据"
                                    }
                                >
                                    {courseCatalog.map(chapter => (
                                        <Option key={chapter._id} value={chapter._id}>{chapter.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 第六行：资源名称 */}
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label="*资源名称"
                                name="resourceName"
                                rules={[{ required: true, message: '请输入资源名称' }]}
                            >
                                <Input placeholder="请输入资源名称" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 第七行：资源描述 */}
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label="资源描述"
                                name="description"
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="请输入资源描述（可选）"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 第八行：状态字段 */}
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="*资源状态"
                                name="statusId"
                                rules={[{ required: true, message: '请选择资源状态' }]}
                            >
                                <Select placeholder="请选择资源状态">
                                    {Array.isArray(resourceStatuses) && resourceStatuses.map(status => (
                                        <Option key={status._id} value={status._id}>{status.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="*审核状态"
                                name="approvalStatusId"
                                rules={[{ required: true, message: '请选择审核状态' }]}
                            >
                                <Select placeholder="请选择审核状态">
                                    {Array.isArray(auditStatuses) && auditStatuses.map(status => (
                                        <Option key={status._id} value={status._id}>{status.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="*权限类型"
                                name="permissionTypeId"
                                rules={[{ required: true, message: '请选择权限类型' }]}
                            >
                                <Select placeholder="请选择权限类型">
                                    {Array.isArray(permissionTypes) && permissionTypes.map(perm => (
                                        <Option key={perm._id} value={perm._id}>{perm.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 提交按钮 */}
                    <Row gutter={16}>
                        <Col span={24} style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Button
                                type="default"
                                onClick={onCancel || onBack}
                                style={{ marginRight: '10px' }}
                            >
                                <ArrowLeftOutlined /> 取消
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                添加资源
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
};

export default AddResourceForm;
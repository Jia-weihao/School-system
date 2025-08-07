import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Pagination, message,Spin, Checkbox, InputNumber } from 'antd';
import axios from 'axios';
import api from '../app/tools/api';
import { Table, TableProps, Modal } from 'antd';

// 定义班级数据类型
interface Class { 
  _id: string;
  name: string;
  grade: string;
  section: string;
  headTeacher: string;
  studentCount: number;
  classType: string;
}

// 定义搜索表单类型
interface SearchFormValues {
  name: string;
  grade: string;
  section: string;
  classType: string;
}

// 定义响应数据类型
interface ClassesResponse {
  data: Class[];
  total: number;
}

export default function ClassManagement() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(10);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [classList, setClassList] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // 获取班级列表
  const getClassList = async () => {
    setLoading(true);
    try {
      const params = {
        pageSize: pageSize,
        pageNum: pageNum,
        name: form.getFieldValue('name'),
        grade: form.getFieldValue('grade'),
        section: form.getFieldValue('section'),
        classType: form.getFieldValue('classType'),
      };

      const res = await axios.get<ClassesResponse>(`${api}/api/class`, { params });
      setClassList(res.data.data);
      setTotal(res.data.total);
      messageApi.success('获取班级列表成功');
    } catch (error) {
      messageApi.error('获取班级列表失败');
      console.error('获取班级列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化和分页/排序变化时获取数据
  useEffect(() => {
    // 添加一个延迟，避免重复调用
    const timer = setTimeout(() => {
      getClassList();
    }, 100);

    // 清除定时器
    return () => clearTimeout(timer);
  }, [pageNum, pageSize]);

  // 搜索表单提交
  const onFinish = (values: SearchFormValues) => {
    setPageNum(1); // 重置页码
    getClassList(); // 重新获取数据
  };

  // 重置搜索表单
  const onReset = () => {
    form.resetFields();
    setPageNum(1);
    getClassList();
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await axios.post(`${api}/api/class/del`, { _id: id });
      messageApi.success('删除班级成功');
      getClassList(); // 刷新列表
    } catch (error) {
      messageApi.error('删除班级失败');
      console.error('删除班级失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理批量升级
  const handleBatchUpgrade = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('请选择要升级的班级');
      return;
    }

    try {
      setLoading(true);
      // 确保请求包含认证token
const token = localStorage.getItem('token');
await axios.post(`${api}/api/class/batch-upgrade`, { ids: selectedRowKeys }, {
  headers: { 'Authorization': `Bearer ${token}` }
});
      messageApi.success(`成功升级 ${selectedRowKeys.length} 个班级`);
      setSelectedRowKeys([]);
      getClassList();
    } catch (error) {
      messageApi.error('批量升级失败');
      console.error('批量升级失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: '_id',
      key: '_id',
      render: (text: string, record: Class, index: number) => (
        <>{index + 1 + (pageNum - 1) * pageSize}</>
      ),
    },
    {
      title: '班级',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: '学段',
      dataIndex: 'school',
      key: 'school',
    },
    {
      title: '班主任',
      dataIndex: 'headTeacher',
      key: 'headTeacher',
    },
    {
      title: '学生人数',
      dataIndex: 'studentCount',
      key: 'studentCount',
    },
    {
      title: '班级类型',
      dataIndex: 'classType',
      key: 'classType',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Class) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button danger size="small" onClick={() => handleDelete(record._id)}>删除</Button>
        </div>
      ),
    },
  ];

  // 表格配置
  const tableProps: TableProps<Class> = {
    columns,
    dataSource: classList,
    rowKey: '_id',
    rowSelection: {
      selectedRowKeys,
      onChange: (keys) => setSelectedRowKeys(keys as string[]),
    },
    pagination: false,
    bordered: true,
    style: {
      marginBottom: '16px',
      backgroundColor: '#fff',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    },
    loading,
  };
  // 添加班级
  const [form2] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
   const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    onHandleFinish()
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const onHandleFinish = async ()=>{
    try {
      setLoading(true);
      await axios.post(`${api}/api/class/add`, form2.getFieldsValue());
      messageApi.success('添加班级成功');
      getClassList(); // 刷新列表
      setIsModalOpen(false);
    } catch (error) {
      messageApi.error('添加班级失败');
      console.error('添加班级失败:', error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div style={{ padding: '24px', backgroundColor: '#f7f7f7' }}>
      {contextHolder}
        <Modal
        title="添加班级"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
         <Form onFinish={onHandleFinish} form={form2}>
          <Form.Item name="name" label="班级">
            <Input placeholder="请输入班级" />
          </Form.Item>
          <Form.Item name="grade" label="年级">
            <Select placeholder="请选择年级">
              <Select.Option value="一年级">一年级</Select.Option>
              <Select.Option value="二年级">二年级</Select.Option>
              <Select.Option value="三年级">三年级</Select.Option>
              <Select.Option value="四年级">四年级</Select.Option>
              <Select.Option value="五年级">五年级</Select.Option>
              <Select.Option value="六年级">六年级</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="section" label="学段">
            <Select placeholder="请选择学段">
              <Select.Option value="小学">小学</Select.Option>
              <Select.Option value="初中">初中</Select.Option>
              <Select.Option value="高中">高中</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="headTeacher" label="班主任">
            <Input placeholder="请输入班主任" />
          </Form.Item>
          <Form.Item name="classType" label="班级类型">
            <Select placeholder="请选择班级类型">
              <Select.Option value="重点班">重点班</Select.Option>
              <Select.Option value="实验班">实验班</Select.Option>
              <Select.Option value="普通班">普通班</Select.Option>
              <Select.Option value="新学道测试学院">新学道测试学院</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="studentCount" label="学生人数">
            <InputNumber placeholder="请输入学生人数" />
          </Form.Item>
         </Form>
      </Modal>
      {/* 搜索区域 */}
      <Form
        form={form}
        layout="inline"
        onFinish={onFinish}
        style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', backgroundColor: '#fff', padding: '16px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}
      >
        <Form.Item name="name" label="班级">
          <Input placeholder="请输入班级" />
        </Form.Item>

        <Form.Item name="section" label="学段">
          <Select placeholder="请选择学段">
            <Select.Option value="小学">小学</Select.Option>
            <Select.Option value="初中">初中</Select.Option>
            <Select.Option value="高中">高中</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="grade" label="年级">
          <Select placeholder="请选择年级">
            <Select.Option value="一年级">一年级</Select.Option>
            <Select.Option value="二年级">二年级</Select.Option>
            <Select.Option value="三年级">三年级</Select.Option>
            <Select.Option value="四年级">四年级</Select.Option>
            <Select.Option value="五年级">五年级</Select.Option>
            <Select.Option value="六年级">六年级</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="classType" label="班级类型">
          <Select placeholder="请选择班级类型">
            <Select.Option value="重点班">重点班</Select.Option>
            <Select.Option value="实验班">实验班</Select.Option>
            <Select.Option value="普通班">普通班</Select.Option>
            <Select.Option value="新学道测试学院">新学道测试学院</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">查询</Button>
        </Form.Item>

        <Form.Item>
          <Button onClick={onReset}>重置</Button>
        </Form.Item>
      </Form>

      {/* 批量操作区域 */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '16px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button type="primary" onClick={handleBatchUpgrade} disabled={selectedRowKeys.length === 0}>
            批量升级
          </Button>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>新增班级</Button>
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>共 {total} 条</div>
      </div>


      {/* 表格区域 */}
      <Table {...tableProps} />

      {/* 分页区域 */}
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#fff', padding: '16px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
        <Pagination
          current={pageNum}
          pageSize={pageSize}
          total={total}
          onChange={(page, pageSize) => {
            setPageNum(page);
            setPageSize(pageSize);
          }}
          showSizeChanger
          showQuickJumper
        />
      </div>
    </div>
  );
}
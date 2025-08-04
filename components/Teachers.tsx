import React, { useEffect, useState } from 'react';
import styles from '../app/styles/teachers.module.css';
import { Form, Input, Button, Select, Pagination, message, Modal, Upload, Spin } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import ExcelExport from '@/app/tools/ExportExcel';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Dropdown, Menu } from 'antd';
import type { MenuProps } from 'antd';
import type { UploadProps } from 'antd';
import api from "../app/tools/api"
const { Option } = Select;
type Teacher = {
  name: string;
  sex: string;
  cardCate: string;
  cardNum: number;
  school: string;
  phone: number;
  email: string;
  start: Date;
  status: boolean;
  _id: string;
};
interface TeacherFormValues {
  name: string;
  sex: string;
  cardCate: string;
  cardNum: number;
  school: string;
  phone: number;
  email: string;
  start: Date;
  status: boolean;
}
interface TeachersResponse {
  data: Teacher[];
  total: number;
}
const templateHeaders = [
  { key: 'name', displayName: '姓名' },
  { key: 'sex', displayName: '性别' },
  { key: 'cardCate', displayName: '证件类型' },
  { key: 'cardNum', displayName: '证件号码' },
  { key: 'school', displayName: '就职学校' },
  { key: 'phone', displayName: '联系方式' },
  { key: 'email', displayName: '邮箱' },
  { key: 'status', displayName: '任职状态' },
  { key: 'cate', displayName: '岗位' },
  { key: 'subject', displayName: '学科' },
];
export default function Teachers() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const onFinish = (values: TeacherFormValues) => {
    setPageNum(1); // 重置页码为1
    getTeacherList(); // 获取教师列表
  };
  let [pageSize, setPageSize] = React.useState(10);
  let [pageNum, setPageNum] = React.useState(1);
  let [total, setTotal] = React.useState(0);
  const [teacherList, setTeacherList] = React.useState<Teacher[]>([]);
  const [loading, setLoading] = React.useState(false);
  const getTeacherList = async () => {
    setLoading(true);
    try {
      let params = {
        pageSize: pageSize,
        pageNum: pageNum,
        name: form.getFieldValue('name'),
        cardNum: form.getFieldValue('cardNum'),
        cate: form.getFieldValue('cate'),
        subject: form.getFieldValue('subject'),
        status: form.getFieldValue('status'),
      };
      let res = await axios.get<TeachersResponse>(`${api}/api/teacher`, { params });
      setTeacherList(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      messageApi.error('获取教师列表失败');
      console.error('获取教师列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getTeacherList();
  }, [pageNum, pageSize]);
  const handleDel = async (id: string) => {
    setLoading(true);
    try {
      await axios.post(`${api}/api/teacher/del`, { _id: id });
      messageApi.info('删除成功');

      await getTeacherList(); // 刷新列表
      if (teacherList.length === 1 && pageNum > 1) {
      setPageNum(1);
      // 重新请求第一页数据
      setTimeout(() => {
        getTeacherList();
      }, 0);
    }
    } catch (error) {
      messageApi.error('删除教师失败');
      console.error('删除教师失败:', error);
    }
    finally {
      setLoading(false);
    }
  };

  //新增教师对话框区域
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form2.resetFields(); // 重置表单
  };
  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      await axios.post(`${api}/api/teacher/add`, values);
      messageApi.success('新增教师成功');
      setIsModalOpen(false);
      getTeacherList(); // 刷新列表
      form2.resetFields(); // 重置表单
    } catch (error) {
      messageApi.error('新增教师失败');
    }
    finally {
      setLoading(false);
    }
  };
  const userHeaders = [
    { key: 'name', displayName: '姓名' },
    { key: 'sex', displayName: '性别' },
    { key: 'cardCate', displayName: '证件类型' },
    { key: 'cardNum', displayName: '证件号码' },
    { key: 'start', displayName: '入职日期' },
    { key: 'school', displayName: '就职学校' },
    { key: 'phone', displayName: '联系方式' },
    { key: 'email', displayName: '邮箱' },
    { key: 'status', displayName: '任职状态' },
    { key: 'cate', displayName: '岗位' },
    { key: 'subject', displayName: '学科' },
  ];

  const downloadTemplate = () => {
    // 创建工作簿
    const wb = XLSX.utils.book_new();

    // 创建一个空数据数组，只保留表头
    const emptyData = [{}];

    // 将表头映射到Excel格式
    const formattedData = emptyData.map(() => {
      const item: Record<string, string> = {};
      templateHeaders.forEach(header => {
        item[header.displayName] = ''; // 空值
      });
      return item;
    });

    // 将数据转换为工作表
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '教师导入模板');

    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `教师导入模板_${dayjs().format('YYYYMMDD')}.xlsx`);
  };
  const handleMenuClick: MenuProps['onClick'] = e => {
    switch (e.key) {
      case '1':
        // 处理Excel导入
        break;
      case '2':
        // 处理CSV导入
        downloadTemplate(); // 下载导入模板
        break;
      default:
        break;
    }
  };
  const props: UploadProps = {
    name: 'file',
    action: `${api}/api/teacher/import`,
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
    if (info.file.status === 'uploading') {
      setLoading(true);
    }
    if (info.file.status === 'done') {
      // 判断后端实际返回的成功标志
      if (info.file.response?.code === 200) { // 或你使用的成功状态码
        messageApi.info('导入成功');
        getTeacherList()
        // 执行成功回调（如刷新列表等）
      } else {
        // 虽然HTTP状态是200，但业务逻辑失败
        message.error(info.file.response?.msg || '处理失败');
        info.file.status = 'error'; // 手动标记为错误状态
      }
      setLoading(false);
    } else if (info.file.status === 'error') {
      message.error(
        info.file.response?.msg || 
        info.file.error?.message || 
        '上传失败'
      );
      setLoading(false);
    }
  },
    beforeUpload: async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(sheet);

    // 获取所有身份证号
    const cardNums = excelData.map((item: any) => item['证件号码']);
    // 检查重复
    const hasDuplicate = cardNums.length !== new Set(cardNums).size;
    if (hasDuplicate) {
        messageApi.info("excel身份证号重复，无法导入！请检查后再导入！");
      return Upload.LIST_IGNORE;
    }

      const existRes = await axios.post(`${api}/api/teacher/checkCardNums`, { cardNums });
// 类型断言，假设后端返回 { existNums: string[] }
const existNums = (existRes.data as { existNums: string[] }).existNums;
if (existNums && existNums.length > 0) {
  messageApi.info("数据库中身份证号已经存在，无法导入！请检查后再导入！");
  return Upload.LIST_IGNORE;
}

    return true;
  },
  };
  const items: MenuProps['items'] = [
    {
      label: <Upload {...props}>Excel导入</Upload>,
      key: '1',
    },
    {
      label: '下载导入模板',
      key: '2',
    },
  ];
  const [form2] = Form.useForm();
  return (
    <div className={styles.container}>
      {contextHolder}
      <div className={styles.topBar}>
        <Form layout='inline' className={styles.searchForm} form={form} onFinish={onFinish}>
          <Form.Item label='姓名' name='name'>
            <Input />
          </Form.Item>
          <Form.Item label='证件号码' name='cardNum'>
            <Input />
          </Form.Item>
          <Form.Item label='岗位' name='cate'>
            <Select style={{ width: 150 }}>
              <Select.Option value='任课老师'>任课老师</Select.Option>
              <Select.Option value='教务老师'>教务老师</Select.Option>
              <Select.Option value='辅导老师'>辅导老师</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label='学科' name='subject'>
            <Select style={{ width: 150 }}>
              <Select.Option value='全部'>全部</Select.Option>
              <Select.Option value='语文'>语文</Select.Option>
              <Select.Option value='数学'>数学</Select.Option>
              <Select.Option value='英语'>英语</Select.Option>
              <Select.Option value='政法'>政法</Select.Option>
              <Select.Option value='毛概'>毛概</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label='任职状态' name='status'>
            <Select
              style={{ width: 120 }}
              options={[
                { value: '全部', label: '全部' },
                { value: '在职', label: '在职' },
                { value: '离职', label: '离职' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              提交
            </Button>
            <Button onClick={() => form.resetFields()}>重置</Button>
          </Form.Item>
        </Form>
      </div>
      <div className={styles.buttonGroup}>
        <Dropdown
          menu={{ items, onClick: handleMenuClick }}
          trigger={['hover']} // 设置为悬停触发
          placement='bottomLeft' // 菜单弹出位置
        >
          <Button type='primary'>导入教师</Button>
        </Dropdown>
        <ExcelExport
          apiUrl={`${api}/api/teacher/export`}
          buttonText='导出教师名单'
          filename='教师名单'
          method='get'
          beforeExport={async () => {
            // 可以在这里添加一些导出前的逻辑
            console.log('准备导出教师名单');
          }}
          requestParams={{}}
          onSuccess={data => {
            console.log('导出成功:', data);
          }}
          onError={error => {
            console.error('导出失败:', error);
          }}
          buttonProps={{ type: 'primary' }}
          headers={userHeaders} // 使用定义的表头
        />
        <Button type='primary' onClick={showModal}>
          新增教师
        </Button>
      </div>
      <Spin
  spinning={loading}
  tip="数据加载中，请稍候..."
  size="large"
  className={styles.spin}
>
        <table border={1} cellSpacing={0} className={styles.table}>
          <thead>
            <tr>
              <th>序号</th>
              <th>姓名</th>
              <th>性别</th>
              <th>证件类型</th>
              <th>证件号码</th>
              <th>就职学校</th>
              <th>联系方式</th>
              <th>邮箱</th>
              <th>创建时间</th>
              <th>任职状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {teacherList.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.sex}</td>
                <td>{item.cardCate}</td>
                <td>{item.cardNum}</td>
                <td>{item.school}</td>
                <td>{item.phone}</td>
                <td>{item.email}</td>
                <td>{dayjs(item.start).format('YYYY-MM-DD')}</td>
                <td>{item.status ? '在职' : '离职'}</td>
                <td>
                  <Button
                    type='link'
                    danger
                    onClick={() => {
                      // 删除操作
                      handleDel(item._id);
                    }}
                  >
                    删除
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Spin>
      <Pagination
        style={{ position: 'absolute', bottom: 0, right: '50%' }}
        defaultCurrent={pageNum}
        total={total}
        onChange={(page, pageSize) => {
          setPageNum(page); // 更新页码
          setPageSize(pageSize); // 更新每页条数
        }}
      />
      <Modal
        title='新增教师'
        open={isModalOpen}
        onOk={() => {
          form2.submit();
        }}
        onCancel={handleCancel}
      >
        <Form labelCol={{ span: 6 }} form={form2} onFinish={handleFinish}>
          <Form.Item label='姓名' name='name' rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label='性别' name='sex' rules={[{ required: true, message: '请输入性别' }]}>
            <Select style={{ width: 150 }}>
              <Select.Option value='男'>男</Select.Option>
              <Select.Option value='女'>女</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label='证件类型' name='cardCate' rules={[{ required: true, message: '请输入证件类型' }]}>
            <Select style={{ width: 150 }}>
              <Select.Option value='身份证'>身份证</Select.Option>
              <Select.Option value='护照'>护照</Select.Option>
              <Select.Option value='军官证'>军官证</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label='证件号码' name='cardNum' rules={[{ required: true, message: '请输入证件号码' }]}>
            <Input />
          </Form.Item>
          <Form.Item label='就职学校' name='school' rules={[{ required: true, message: '请输入就职学校' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label='联系方式'
            name='phone'
            rules={[
              { required: true, message: '请输入联系方式' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='邮箱'
            name='email'
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label='任职状态' name='status' rules={[{ required: true, message: '请选择任职状态' }]}>
            <Select style={{ width: 150 }}>
              <Select.Option value={'在职'}>在职</Select.Option>
              <Select.Option value={'离职'}>离职</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import styles from '../app/styles/information.module.css';
import axios from 'axios';
import  api  from '../app/tools/api';
import { Button, Checkbox, Form, Input, Select, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import type { FormProps } from 'antd';
type SchoolInfo = {
  name?: string;
  cate?: string;
  addrress?: string;
  person?: string;
  phone?: string;
  img?: string;
};
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}
const { Option } = Select;
export default function Information() {
  const [school, setSchool] = useState<SchoolInfo>({});
  const [editState, setEditState] = useState(false);
  const getSchoolInfo = async () => {
    try {
      const res = await axios.get<ApiResponse<SchoolInfo>>(`${api}/school`);
      setSchool(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getSchoolInfo();
  }, []);
  type FieldType = {
    name?: string;
    person?: string;
    phone?: string;
    cate?: string;
    address?: string;
    img?: string;
  };

  // 上传图片
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };
  const onFinish: FormProps<FieldType>['onFinish'] = async values => {
    const data = {
      ...values,
      img: fileList[0]?.response?.data,
    };
    let res = await axios.post(`${api}/school`, data);
    if (res.status === 200) {
      setEditState(false);
      getSchoolInfo();
    }
  };
  return (
    <div className={styles.container}>
      {editState ? (
        <>
          <Form
            labelCol={{ span: 8 }}
            style={{ maxWidth: 800 }}
            initialValues={school}
            autoComplete='off'
            onFinish={onFinish}
          >
            <Form.Item<FieldType> label='学校名称' name='name' rules={[{ required: true, message: '请输入学校名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item<FieldType> label='类型' name='cate' rules={[{ required: true, message: '请输入学校类型' }]}>
              <Select placeholder='主体分类' allowClear>
                <Option value='公办'>公办</Option>
                <Option value='民办'>民办</Option>
                <Option value='中外合作'>中外合作</Option>
              </Select>
            </Form.Item>
            <Form.Item<FieldType>
              label='学校地址'
              name='address'
              rules={[{ required: true, message: '请输入学校地址' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<FieldType>
              label='学校联系人'
              name='person'
              rules={[{ required: true, message: '请输入学校联系人' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<FieldType> label='联系方式' name='phone' rules={[{ required: true, message: '请输入联系方式' }]}>
              <Input />
            </Form.Item>

            <Form.Item<FieldType> label='学校图片' name='img'>
              <Upload
                action={`${api}/uploads`}
                listType='picture-card'
                fileList={fileList}
                onChange={onChange}
              >
                {fileList.length < 1 && '+ Upload'}
              </Upload>
            </Form.Item>
            <Form.Item label={null}>
              <Button type='primary' htmlType='submit'>
                确认
              </Button>
              <Button
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  setEditState(false);
                }}
              >
                取消
              </Button>
            </Form.Item>
          </Form>
        </>
      ) : (
        <>
          <div className={styles.left}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td>学校名称</td>
                  <td>{school.name}</td>
                </tr>
                <tr>
                  <td>类型</td>
                  <td>{school.cate}</td>
                </tr>
                <tr>
                  <td>学校地址</td>
                  <td>{school.addrress}</td>
                </tr>
                <tr>
                  <td>学校联系人</td>
                  <td>{school.person}</td>
                </tr>
                <tr>
                  <td>联系方式</td>
                  <td>{school.phone}</td>
                </tr>
                <tr>
                  <td>
                    <button
                      style={{ padding: '10px 15px', borderRadius: '5px', backgroundColor: 'rgb(0, 0, 255)' }}
                      onClick={() => {
                        setEditState(true);
                      }}
                    >
                      编辑
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <img src={school?.img} alt='' style={{ width: '300px', height: '300px' }} />
          </div>
        </>
      )}
    </div>
  );
}

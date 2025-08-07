import styles from './sYearConfig.module.css';
import { useEffect, useState } from 'react';
import { Input, Button, Modal, DatePicker, message, Popconfirm, Pagination } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import API_BASE_URL from '../tools/api';
const { RangePicker } = DatePicker;
const { Search } = Input;

export default function SYearConfig() {
  const [modalOpen, setModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [sYearList, setSYearList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(2); // 每页显示2条数据

  // 表单数据状态
  const [formData, setFormData] = useState({
    yearName: '',
    terms: [
      { termName: '', startDate: null, endDate: null },
      { termName: '', startDate: null, endDate: null }
    ]
  });

  // 添加新学期
  const addNewTerm = () => {
    setFormData({
      ...formData,
      terms: [...formData.terms, { termName: '', startDate: null, endDate: null }]
    });
  };

  // 删除学期
  const removeTerm = (index: number) => {
    // 不允许删除前两个默认学期
    if (index < 2) return;

    const newTerms = [...formData.terms];
    newTerms.splice(index, 1);
    setFormData({
      ...formData,
      terms: newTerms
    });
  };

  const onSearch = (e: any) => {
    // console.log(e);
    setSearch(e);
    // 重置分页到第一页
    setCurrentPage(1);
    getSyear()
  }

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  }

  // 处理表单输入变化
  const handleYearNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      yearName: e.target.value
    });
  }

  const handleTermNameChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerms = [...formData.terms];
    newTerms[index] = { ...newTerms[index], termName: e.target.value };
    setFormData({
      ...formData,
      terms: newTerms
    });
  }

  const handleDateChange = (index: number, dates: any) => {
    if (dates) {
      const newTerms = [...formData.terms];
      newTerms[index] = {
        ...newTerms[index],
        startDate: dates[0],
        endDate: dates[1]
      };
      setFormData({
        ...formData,
        terms: newTerms
      });
    }
  }

  // 处理表单提交
  const handleSubmit = async () => {
    // 验证表单数据
    if (!formData.yearName) {
      messageApi.open({
        type: 'warning',
        content: '请输入学年名称',
      });
      return;
    }

    // 至少需要一个有效的学期
    const hasValidTerm = formData.terms.some(term =>
      term.termName && term.startDate && term.endDate
    );

    if (!hasValidTerm) {
      messageApi.open({
      type: 'warning',
      content: '请至少填写一个完整的学期信息',
    });
      return;
    }

    try {
      // 如果是编辑模式
      if (editingId) {
        await axios.post(`${API_BASE_URL}/api/configuration/updateSyear`, { id: editingId, ...formData });
        messageApi.open({
          type: 'success',
          content: '更新学年成功',
        });
      } else {
        // 新增模式
        await axios.post(`${API_BASE_URL}/api/configuration/addSyear`, formData);
        messageApi.open({
          type: 'success',
          content: '添加学年成功',
        });
      }

      // 刷新数据
      getSyear();

      // 关闭对话框
      setModalOpen(false);

      // 重置表单和编辑状态
      setEditingId(null);
      setFormData({
        yearName: '',
        terms: [
          { termName: '', startDate: null, endDate: null },
          { termName: '', startDate: null, endDate: null }
        ]
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: '操作失败，请重试',
      });
    }
  }

  // 获取学年
  const getSyear = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/configuration/getSyear`, { search });
      // console.log((res.data as any).data);
      setSYearList((res.data as any).data);
      // 重置分页到第一页
      setCurrentPage(1);
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: '获取学年数据失败',
      });
    }
  }

  // 编辑学年
  const handleEdit = (year: any) => {
    console.log(year)
    setEditingId(year._id);

    // 准备表单数据
    const termsData = year.terms.map((term: any) => ({
      termName: term.termName,
      startDate: term.startDate ? new Date(term.startDate) : null,
      endDate: term.endDate ? new Date(term.endDate) : null
    }));

    // 如果学期少于2个，补充空学期
    while (termsData.length < 2) {
      termsData.push({ termName: '', startDate: null, endDate: null });
    }

    setFormData({
      yearName: year.yearName,
      terms: termsData
    });

    setModalOpen(true);
  }

  // 删除学年
  const handleDelete = async (id: string) => {
    try {
      // console.log(id)
      await axios.post(`${API_BASE_URL}/api/configuration/deleteSyear`, { id });
      messageApi.open({
        type: 'success',
        content: '删除学年成功',
      });
      getSyear(); // 刷新数据
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: '删除失败，请重试',
      });
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    } catch (e) {
      return dateString.substring(0, 10);
    }
  }

  useEffect(() => {
    getSyear();
  },[])

  return (
    <div>
      {contextHolder}
      {/* 搜索框 */}
      <div className={styles.title}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 10 }}>学年</span>
          <Search
            style={{ width: 250 }}
            placeholder="请输入学年"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(e) => onSearch(e)}
            enterButton />
        </div>
        <Button type="primary" style={{ marginTop: 20 }} onClick={() => onSearch(search)}>查询</Button>
      </div>
      {/* 表格数据 */}
      <div className={styles.container}>
        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div
            style={{ cursor: 'pointer', color: '#1890FF', display: 'flex', alignItems: 'center' }}
            onClick={() => setModalOpen(true)}>
            <PlusOutlined style={{ marginRight: '4px' }} />
            <span>新增学年学期</span>
          </div>


        </div>

        {/* 数据渲染 */}
        <div style={{ width: '100%' }}>
          {/* 表头 */}
          <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', padding: '10px 0', fontWeight: 'bold' }}>
            <div style={{ flex: '2', paddingLeft: '10px' }}>学年学期</div>
            <div style={{ flex: '2', textAlign: 'center' }}>时间</div>
            <div style={{ flex: '1', textAlign: 'center' }}>操作</div>
          </div>

          {/* 数据行 */}
          {sYearList
            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
            .map((year: any, index: number) => {
              // 计算实际索引，用于显示序号
              const actualIndex = (currentPage - 1) * pageSize + index;
              return (
                <div key={actualIndex}>
                  {/* 学年行 */}
                  <div style={{ display: 'flex', padding: '15px 0', alignItems: 'center', position: 'relative', borderBottom: index === Math.min(pageSize, sYearList.length - (currentPage - 1) * pageSize) - 1 && (!year.terms || year.terms.length === 0) ? '1px solid #f0f0f0' : 'none' }}>
                    <div style={{ flex: '2', paddingLeft: '10px', display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#FFAB00',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: '10px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {actualIndex + 1}
                      </div>
                      <span style={{ fontWeight: '500' }}>{year.yearName}</span>
                    </div>
                    <div style={{ flex: '2', textAlign: 'center', color: '#666' }}>
                      {year.startDate && year.endDate ? `${formatDate(year.startDate)} - ${formatDate(year.endDate)}` : ''}
                    </div>
                    <div style={{ flex: '1', textAlign: 'center' }}>
                      <Button type="link" style={{ color: '#1890FF', padding: '0 5px' }} onClick={() => handleEdit(year)}>编辑</Button>
                      <Popconfirm
                        title="确定要删除这个学年吗？"
                        description="删除后将无法恢复，包括所有关联的学期数据。"
                        onConfirm={() => handleDelete(year._id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="link" style={{ color: '#FF4D4F', padding: '0 5px' }}>删除</Button>
                      </Popconfirm>
                    </div>
                  </div>

                  {/* 学期行 */}
                  {year.terms && year.terms.map((term: any, termIndex: number) => (
                    <div key={`term-${actualIndex}-${termIndex}`}
                      style={{
                        display: 'flex',
                        padding: '12px 0',
                        paddingLeft: '44px',
                        borderTop: termIndex === 0 ? '1px solid #f0f0f0' : 'none',
                        borderBottom: termIndex === year.terms.length - 1 ? '1px solid #f0f0f0' : 'none',
                        backgroundColor: '#FAFAFA'
                      }}
                    >
                      <div style={{ flex: '2', paddingLeft: '10px', color: '#666' }}>{term.termName}</div>
                      <div style={{ flex: '2', textAlign: 'center', color: '#666' }}>
                        {term.startDate && term.endDate ? `${formatDate(term.startDate)} - ${formatDate(term.endDate)}` : ''}
                      </div>
                      <div style={{ flex: '1' }}></div>
                    </div>
                  ))}
                </div>
              );
            })}
        </div>
        {/* 分页组件 */}
          {sYearList.length > 0 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={sYearList.length}
                onChange={handlePageChange}
                showTotal={(total) => `共 ${total} 条数据`}
              />
            </div>
          )}
      </div>
      {/* 对话 */}
      <Modal
        centered
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditingId(null);
          setFormData({
            yearName: '',
            terms: [
              { termName: '', startDate: null, endDate: null },
              { termName: '', startDate: null, endDate: null }
            ]
          });
        }}
        width={600}
        title={<div style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>{editingId ? '编辑学年学期' : '新增学年学期'}</div>}
        maskClosable={false}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)} style={{ marginRight: '8px' }}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            确定
          </Button>,
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '15px', borderLeft: '3px solid #1890ff', paddingLeft: '10px' }}>学年</h3>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ width: '80px', textAlign: 'right', marginRight: '10px', color: '#333', fontWeight: 500 }}>学年名称：</span>
              <Input
                placeholder="请输入学年名称"
                style={{ width: 350, height: '32px', borderRadius: '4px' }}
                value={formData.yearName}
                onChange={handleYearNameChange}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '15px', borderLeft: '3px solid #1890ff', paddingLeft: '10px' }}>学期</h3>

            <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ width: '80px', textAlign: 'right', marginRight: '10px', color: '#333' }}>学期名称：</span>
                <Input
                  placeholder="请输入学期名称"
                  style={{ width: 350, height: '32px', borderRadius: '4px' }}
                  value={formData.terms[0].termName}
                  onChange={(e) => handleTermNameChange(0, e)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '80px', textAlign: 'right', marginRight: '10px', color: '#333' }}>学期时间：</span>
                <RangePicker
                  style={{ width: 350, height: '32px', borderRadius: '4px' }}
                  onChange={(dates) => handleDateChange(0, dates)}
                  placeholder={['开始日期', '结束日期']}
                />
              </div>
            </div>

            <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ width: '80px', textAlign: 'right', marginRight: '10px', color: '#333' }}>学期名称：</span>
                <Input
                  placeholder="请输入学期名称"
                  style={{ width: 350, height: '32px', borderRadius: '4px' }}
                  value={formData.terms[1].termName}
                  onChange={(e) => handleTermNameChange(1, e)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '80px', textAlign: 'right', marginRight: '10px', color: '#333' }}>学期时间：</span>
                <RangePicker
                  style={{ width: 350, height: '32px', borderRadius: '4px' }}
                  onChange={(dates) => handleDateChange(1, dates)}
                  placeholder={['开始日期', '结束日期']}
                />
              </div>
            </div>
          </div>

          {/* 添加更多学期按钮 */}
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Button
              type="dashed"
              onClick={addNewTerm}
              icon={<PlusOutlined />}
              style={{ width: '60%', borderColor: '#1890ff', color: '#1890ff' }}
            >
              新增学期
            </Button>
          </div>

          {/* 动态渲染额外添加的学期 */}
           {formData.terms.slice(2).map((term, index) => (
             <div key={index + 2} style={{ background: '#f9f9f9', padding: '16px', borderRadius: '4px', marginBottom: '16px', position: 'relative' }}>
               <Button
                 type="text"
                 danger
                 icon={<DeleteOutlined />}
                 style={{ position: 'absolute', top: '8px', right: '8px' }}
                 onClick={() => removeTerm(index + 2)}
               />
               <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                 <span style={{ width: '80px', textAlign: 'right', marginRight: '10px', color: '#333' }}>学期名称：</span>
                 <Input
                   placeholder="请输入学期名称"
                   style={{ width: 350, height: '32px', borderRadius: '4px' }}
                   value={term.termName}
                   onChange={(e) => handleTermNameChange(index + 2, e)}
                 />
               </div>
               <div style={{ display: 'flex', alignItems: 'center' }}>
                 <span style={{ width: '80px', textAlign: 'right', marginRight: '10px', color: '#333' }}>学期时间：</span>
                 <RangePicker
                   style={{ width: 350, height: '32px', borderRadius: '4px' }}
                   onChange={(dates) => handleDateChange(index + 2, dates)}
                   placeholder={['开始日期', '结束日期']}
                 />
               </div>
             </div>
           ))}
        </div>
      </Modal>
    </div>
  )
}

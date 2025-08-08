import styles from './lessonConfig.module.css';
import { useEffect, useState } from 'react';
import { Input, Button, message, Switch, Table, Modal } from 'antd';
import axios from 'axios';
import API_BASE_URL from '../tools/api';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
const { Search } = Input;

// Tiptap编辑器组件
const TiptapEditor = ({ content, onUpdate }: { content: string, onUpdate: (html: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    // 解决SSR水合不匹配问题
    immediatelyRender: false,
  });

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: '4px', minHeight: '300px' }}>
      <div style={{ borderBottom: '1px solid #d9d9d9', padding: '8px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          style={{
            fontWeight: editor?.isActive('bold') ? 'bold' : 'normal',
            border: 'none',
            background: 'none',
            cursor: 'pointer'
          }}
        >
          B
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          style={{
            fontStyle: editor?.isActive('italic') ? 'italic' : 'normal',
            border: 'none',
            background: 'none',
            cursor: 'pointer'
          }}
        >
          I
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          style={{
            border: 'none',
            background: editor?.isActive('bulletList') ? '#f0f0f0' : 'none',
            cursor: 'pointer'
          }}
        >
          • 列表
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          style={{
            border: 'none',
            background: editor?.isActive('orderedList') ? '#f0f0f0' : 'none',
            cursor: 'pointer'
          }}
        >
          1. 有序列表
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          style={{
            border: 'none',
            background: editor?.isActive('blockquote') ? '#f0f0f0' : 'none',
            cursor: 'pointer'
          }}
        >
          引用
        </button>
      </div>
      <div style={{ padding: '10px', maxHeight: '400px', overflowY: 'auto' }}>
        <EditorContent editor={editor} style={{ outline: 'none', border: 'none', boxShadow: 'none' }} />
      </div>
    </div>
  );
};

export default function LessonConfig() {
  const [messageApi, contextHolder] = message.useMessage();
  const [search, setSearch] = useState('');
  const [lessonList, setLessonList] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [isAdd, setIsAdd] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('教案');
  const [editorContent, setEditorContent] = useState('<p>请输入文字</p>');

  // 搜索功能
  const onSearch = (e: any) => {
    // console.log(e);
    setSearch(e);
    // 这里可以添加实际的搜索逻辑
    getLesson();
  }

  // 获取教案列表（示例函数）
  const getLesson = async () => {
    try {
      // 这里可以添加实际的API调用
      const res = await axios.post(`${API_BASE_URL}/api/configuration/getLesson`, { search });
      setLessonList((res.data as any).data || []);
      // console.log(res.data)
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: '获取教案数据失败',
      });
    }
  }

  useEffect(() => {
    // 初始加载数据
    getLesson();


  }, []);

  // 处理状态切换
  const handleStatusChange = async (checked: boolean, record: any) => {
    // console.log(checked, record)
    try {
      // 这里可以添加实际的API调用来更新状态
      await axios.post(`${API_BASE_URL}/api/configuration/updateLessonStatus`, { id: record._id });
      messageApi.success('状态更新成功');
      getLesson(); // 重新获取数据
    } catch (error) {
      messageApi.error('状态更新失败');
    }
  };

  // 显示删除确认对话框
  const showDeleteConfirm = (record: any) => {
    setCurrentRecord(record);
    setIsDeleteModalOpen(true);
  };

  // 处理删除操作
  const handleDelete = async () => {
    if (!currentRecord) return;

    try {
      // 向后端发送删除请求，传递record._id
      await axios.post(`${API_BASE_URL}/api/configuration/deleteLesson`, { id: currentRecord._id });
      messageApi.success('删除成功');
      setIsDeleteModalOpen(false);
      getLesson(); // 重新获取数据
    } catch (error) {
      messageApi.error('删除失败');
    }
  };

  // 取消删除
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCurrentRecord(null);
  };

  // 显示预览模态框
  const showPreviewModal = (record: any) => {
    setCurrentRecord(record);
    // console.log(record)
    setIsPreviewModalOpen(true);
  };

  // 关闭预览模态框
  const handleCancelPreview = () => {
    setIsPreviewModalOpen(false);
    setCurrentRecord(null);
  };

  // 显示编辑模态框
  const showEditModal = (record: any) => {
    // console.log(record.content)
    setCurrentRecord(record);
    setTemplateName(record.name);
    setTemplateType(record.type);
    setEditorContent(record.content);
    setIsEditModalOpen(true);
  };

  // 关闭编辑模态框
  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setCurrentRecord(null);
    // 重置表单
    setTemplateName('');
    setTemplateType('教案');
    setEditorContent('<p>请输入文字</p>');
  };

  // 提交编辑
  const handleEditSubmit = async () => {
    // 表单验证
    if (!templateName.trim()) {
      messageApi.error('请输入模板名称');
      return;
    }

    try {
      // 向后端发送更新请求
      await axios.post(`${API_BASE_URL}/api/configuration/updateLesson`, {
        id: currentRecord._id,
        name: templateName,
        type: templateType,
        content: editorContent
      });

      messageApi.success('更新成功');
      setIsEditModalOpen(false);
      setCurrentRecord(null);
      // 重置表单
      setTemplateName('');
      setTemplateType('教案');
      setEditorContent('<p>请输入文字</p>');
      // 刷新列表
      getLesson();
    } catch (error) {
      messageApi.error('更新失败');
      console.error('更新模板失败:', error);
    }
  };

  // 保存模板
  const handleSaveTemplate = async () => {
    // 表单验证
    if (!templateName.trim()) {
      messageApi.error('请输入模板名称');
      return;
    }

    try {
      // 向后端发送保存请求
      await axios.post(`${API_BASE_URL}/api/configuration/addLesson`, {
        name: templateName,
        type: templateType,
        content: editorContent,
        status: false // 默认为非默认模板
      });

      messageApi.success('保存成功');
      setIsAdd(false);
      // 重置表单
      setTemplateName('');
      setTemplateType('教案');
      setEditorContent('<p>请输入文字</p>');
      // 刷新列表
      getLesson();
    } catch (error) {
      messageApi.error('保存失败');
      console.error('保存模板失败:', error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_: any, record: any) => (
        <Switch
          checked={record.status}
          onChange={(checked) => handleStatusChange(checked, record)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {record.status ? (
            <Button type="link" style={{ color: '#1890ff', padding: 0 }}>默认模板</Button>
          ) : (
            <Button type="link" style={{ color: '#1890ff', padding: 0 }}>设为默认模板</Button>
          )}
          <Button type="link" style={{ color: '#1890ff', padding: 0 }} onClick={() => showEditModal(record)}>编辑</Button>
          <Button type="link" style={{ color: '#ff4d4f', padding: 0 }} onClick={() => showDeleteConfirm(record)}>删除</Button>
          <Button type="link" style={{ color: '#1890ff', padding: 0 }} onClick={() => showPreviewModal(record)}>预览</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}

      {!isAdd ? <div>
        {/* 搜索框 */}
        <div className={styles.title}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 10 }}>教案</span>
            <Search
              style={{ width: 250 }}
              placeholder="请输入教案名称"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={(e) => onSearch(e)}
              enterButton />
          </div>
          <Button type="primary" style={{ marginTop: 20 }} onClick={() => onSearch(search)}>查询</Button>
        </div>

        {/* 表格数据 */}
        <div className={styles.container}>
          <div
            style={{ cursor: 'pointer', color: '#1890FF', display: 'flex', alignItems: 'center' }}
            onClick={() => setIsAdd(true)}>
            <span>新增教学模板</span>
          </div>
          <Table
            dataSource={lessonList}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </div>

        {/* 删除确认对话框 */}
        <Modal
          title="确认删除"
          open={isDeleteModalOpen}
          onOk={handleDelete}
          onCancel={handleCancelDelete}
          okText="确认"
          cancelText="取消"
        >
          <p>确定要删除该教案吗？此操作不可恢复。</p>
        </Modal>

        {/* 预览模态框 */}
        <Modal
          open={isPreviewModalOpen}
          onCancel={handleCancelPreview}
          footer={[
            <Button key="close" onClick={handleCancelPreview}>关闭</Button>
          ]}
          width={800}
        >
          <div className={styles.previewContainer}>
            <div className={styles.previewTitle}>{currentRecord?.name}</div>
            <div className={styles.previewContent}>
              <div className={styles.previewSection}>
                <div>[学情分析]</div>
                <div>(说明学生学习习惯知识之前已经具备的知识结构和学生学习习惯的个性差异)</div>
                <div>[单元重点]</div>
              </div>

              <div className={styles.previewSection}>
                <div>[教学目标]</div>
                <div>(说教教学要求，即说明本课时所要完成的教学任务，是一篇教材教学的行动纲要，要写得具体、明确)</div>
                <div>• 知识、资源</div>
                <div>[教学重点]</div>
                <div>(说明本所必须解决的关键性问题，是教材中为了达到教学目标而有重指导意义的内容)</div>
                <div>[教学难点]</div>
                <div>(说明本所必须解决的关键性问题，是教材中为了达到教学目标而有重指导意义的内容)</div>
              </div>

              <div className={styles.previewSection}>
                <div>[教法]</div>
              </div>
            </div>

            <div className={styles.previewActualContent} dangerouslySetInnerHTML={{ __html: currentRecord?.content || '' }}></div>
          </div>
        </Modal>

        {/* 编辑模态框 */}
        <Modal
          title="编辑教学模板"
          open={isEditModalOpen}
          onCancel={handleCancelEdit}
          footer={[
            <Button key="cancel" onClick={handleCancelEdit}>取消</Button>,
            <Button key="submit" type="primary" onClick={handleEditSubmit}>确定</Button>
          ]}
          width={800}
        >
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'red' }}>*</span>模板名称:
              </div>
              <Input
                placeholder="请输入模板名称"
                style={{ width: '100%' }}
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'red' }}>*</span>模板类型:
              </div>
              <select
                style={{ width: '100%', height: '32px', borderColor: '#d9d9d9', borderRadius: '4px', padding: '4px 11px' }}
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
              >
                <option value="教案">教案</option>
                <option value="导学案">导学案</option>
              </select>
            </div>
            <div>
              <div style={{ marginBottom: '8px' }}>编辑教案模板:</div>
              <div>{editorContent}</div>
              <TiptapEditor
                content={editorContent}
                onUpdate={(html) => setEditorContent(html)}
              />
            </div>
          </div>
        </Modal>
      </div>
        : <div>
          {/* 添加教案页面 */}
          <div className={styles.addContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>新增教学模板</span>
              <div>
                <Button onClick={() => setIsAdd(false)} style={{ marginRight: '10px' }}>取消</Button>
                <Button type="primary" onClick={handleSaveTemplate}>确定</Button>
              </div>
            </div>
            <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px', padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'red' }}>*</span>模板名称:
                </div>
                <Input
                  placeholder="请输入模板名称"
                  style={{ width: '100%' }}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'red' }}>*</span>模板类型:
                </div>
                <select
                  style={{ width: '100%', height: '32px', borderColor: '#d9d9d9', borderRadius: '4px', padding: '4px 11px' }}
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value)}
                >
                  <option value="教案">教案</option>
                  <option value="导学案">导学案</option>
                </select>
              </div>
              <div>
                <div style={{ marginBottom: '8px' }}>编辑教案模板:</div>
                <TiptapEditor
                  content={editorContent}
                  onUpdate={(html) => setEditorContent(html)}
                />
              </div>
            </div>
          </div>
        </div>}
    </div>
  )
}

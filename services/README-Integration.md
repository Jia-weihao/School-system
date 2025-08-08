

```bash
cd school-system-hou/hou
npm install
npm start
```

后端将在 `https://school.blxg.asia` 启动

### 2. 添加测试数据（可选）

```bash
cd school-system-hou/hou
node test-data.js
```




```bash
cd school-system/qian
npm install
npm run dev
```

前端将在 `http://localhost:3001` 启动


打开浏览器访问 `http://localhost:3001/sccznfb`
```javascript
{
  _id: String,           // MongoDB自动生成的ID
  name: String,          // 学生姓名（必填）
  isNumber: String,      // 学号（必填，唯一）
  class: String,         // 班级（必填）
  classcheng: String,    // 已选课程（默认：'化学、物理、生物'）
  groupType: String,     // 分组类型：'normal'(平行班) | 'key'(重点班) | null
  createdAt: Date,       // 创建时间
  updatedAt: Date        // 更新时间
}
```

- `GET /api/alist` - 获取所有学生数据
- `POST /api/alist` - 添加新学生
- `PUT /api/alist/:id` - 更新学生信息
- `DELETE /api/alist/:id` - 删除学生
- `PATCH /api/alist/batch-update-group` - 批量更新学生分组
- `GET /api/alist/group-stats` - 获取分组统计信息
 
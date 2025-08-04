'use client';

import { useState } from 'react';
import styles from './subjectConfig.module.css';

export default function SubjectConfig() {
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [configs, setConfigs] = useState<{grade: string, subject: string}[]>([]);

  const handleAdd = () => {
    if (grade && subject) {
      setConfigs([...configs, {grade, subject}]);
      setGrade('');
      setSubject('');
    }
  };

  const handleDelete = (index: number) => {
    const newConfigs = configs.filter((_, i) => i !== index);
    setConfigs(newConfigs);
  };

  const handleSave = () => {
    // TODO: 保存逻辑，例如调用API
    console.log('保存配置:', configs);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>学年学科配置</h2>
      <div className={styles.form}>
        <select value={grade} onChange={(e) => setGrade(e.target.value)} className={styles.select}>
          <option value="">年级</option>
          <option value="小学">小学</option>
          <option value="初中">初中</option>
          <option value="高中">高中</option>
        </select>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className={styles.select}>
          <option value="">学科</option>
          <option value="语文">语文</option>
          <option value="数学">数学</option>
          <option value="英语">英语</option>
          <option value="物理">物理</option>
          <option value="化学">化学</option>
          <option value="生物">生物</option>
          <option value="历史">历史</option>
          <option value="地理">地理</option>
          <option value="政治">政治</option>
        </select>
        <button onClick={handleAdd} className={styles.button}>添加</button>
        <button onClick={() => {setGrade(''); setSubject('');}} className={styles.button}>删除</button> {/* 假设是清空选择 */}
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>年级</th>
            <th>学科</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((config, index) => (
            <tr key={index}>
              <td>{config.grade}</td>
              <td>{config.subject}</td>
              <td>
                <button onClick={() => handleDelete(index)} className={styles.deleteButton}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.actions}>
        <button onClick={handleSave} className={styles.saveButton}>保存</button>
        <button onClick={() => setConfigs([])} className={styles.cancelButton}>取消</button>
      </div>
    </div>
  );
}

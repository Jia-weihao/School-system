'use client';
import React from 'react';
import styles from '../styles/bigScreen.module.css';
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';
import LineChart from './charts/LineChart';
import YearBarChart from './charts/YearBarChart';
import SubjectBarChart from './charts/SubjectBarChart';
import MultiLineChart from './charts/MultiLineChart';
export default function BigScreenDashboard() {
  return (
    <div className={styles.screenContainer}>
      {/* 顶部标题 */}
      <header className={styles.header}>
        <h1>新学道集团平台数据中心</h1>
        <span className={styles.time}>{new Date().toLocaleString()}</span>
      </header>

      {/* 统计卡片区 */}
      <section className={styles.cards}>
        <div className={styles.card}>学生总数<br /><b>512人</b></div>
        <div className={styles.card}>男生<br /><b>256人</b></div>
        <div className={styles.card}>女生<br /><b>256人</b></div>
        <div className={styles.card}>教师总数<br /><b>100人</b></div>
      </section>

      {/* 图表区 */}
      <main className={styles.chartsGrid}>
        <div className={styles.chartBox}><BarChart /></div>
        <div className={styles.chartBox}><PieChart /></div>
        <div className={styles.chartBox}><LineChart /></div>
      </main>
      <div className={styles.divider}></div>
      {/* 图表区 第二行 */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartBox}><YearBarChart /></div>
        <div className={styles.chartBox}><SubjectBarChart /></div>
        <div className={styles.chartBox}><MultiLineChart /></div>
      </div>
    </div>
  );
}
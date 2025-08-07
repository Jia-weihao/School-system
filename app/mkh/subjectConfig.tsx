'use client';

import React, { useEffect, useState } from 'react';
import { Button, message, Steps } from 'antd';
import styles from './subjectConfig.module.css';
import API_BASE_URL from '../tools/api';
import axios from 'axios';
import Step1 from './components/Step1';
import Step2 from './components/Step2';

export default function SubjectConfig() {

  const [current, setCurrent] = useState(0);
  const [periodList, setPeriodList] = useState([]);
  const [systemList, setSystemList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [num, setNum] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [isComplete, setIsComplete] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const getPeriod = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/configuration/getPeriod`);
    // 添加类型断言以解决 res.data 类型未知的问题
    setPeriodList((res.data as any).data);
  }

  const getSubject = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/configuration/getSubject`);
    setSubjectList((res.data as any).data);
    // console.log((res.data as any).data)
  }

  const getSystem = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/configuration/getSystem`);
    const systemData = (res.data as any).data;
    setSystemList(systemData);

    // 计算num1：grade=1且isselect=true的数据的num
    const grade1Selected = systemData.filter((item: any) => item.grade === 1 && item.isSelect === true);
    if (grade1Selected.length > 0) {
      setNum(grade1Selected[0].num);
    }
  }

  useEffect(() => {
    getPeriod();
    getSubject();
    getSystem();
  }, []);

  // 定义steps，将getPeriod函数传递给Step1组件
  const steps = [
    {
      title: '学段年级配置',
      content: <Step1 onPeriodChange={getPeriod} />,
    },
    {
      title: '学科配置',
      content: <Step2 />,
    },
  ];

  const next = () => {
    // 在点击下一步前先刷新一次数据，确保使用最新的periodList
    getPeriod();
    if (periodList.some((i: any) => i.isSelect == true)) {
      setCurrent(current + 1);
    } else {
      messageApi.open({
        type: 'warning',
        content: '请至少选择一个学段',
      });
    }
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const items = steps.map(item => ({ key: item.title, title: item.title }));

  return (
    <>
      {contextHolder}
      <div className={styles.container}>
        {isComplete ? <div>
          <div style={{ display: 'flex' }}>
            {/* 左侧 */}
            <div style={{ width: '150px', borderRight: '1px solid #dedede' }}>
              {/* 小学 */}
              {periodList.filter((i: any) => i.name === '小学').map((item: any) => (
                <div
                  key={item._id}
                  style={{ width: '100%', paddingLeft: '30px' }}>{item.name}</div>
              ))}
              {/* 小学二级 */}

              <div>
                {subjectList.slice(0, num).map((item: any) => (
                  <div
                    key={item._id}
                    style={{
                      width: '100%',
                      paddingLeft: '60px',
                      backgroundColor: selectedId === item._id ? '#e6f7ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedId(item._id)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>

              {/* 初中 */}
              {periodList.filter((i: any) => i.name === '初中').map((item: any) => (
                <div key={item._id} style={{ width: '100%', paddingLeft: '30px' }}>{item.name}</div>
              ))}
              {/* 初中二级 */}

              <div>
                {subjectList.slice(num, 9).map((item: any) => (
                  <div
                    key={item._id}
                    style={{
                      width: '100%',
                      paddingLeft: '60px',
                      backgroundColor: selectedId === item._id ? '#e6f7ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedId(item._id)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>

              {/* 高中 */}
              {periodList.filter((i: any) => i.name === '高中').map((item: any) => (
                <div key={item._id} style={{ width: '100%', paddingLeft: '30px' }}>{item.name}</div>
              ))}
              {/* 高中二级 */}

              <div>
                {subjectList.slice(9,12).map((item: any) => (
                  <div
                    key={item._id}
                    style={{
                      width: '100%',
                      paddingLeft: '60px',
                      backgroundColor: selectedId === item._id ? '#e6f7ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedId(item._id)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>

            </div>
            {/* 右侧 */}
            <div style={{ margin: "20px", width: '500px' }}>
              {subjectList.filter((i: any) => i._id === selectedId).map((item: any) => (
                <div key={item._id} style={{display: 'flex', flexWrap: 'wrap',width:'100%'}}>
                  <span style={{marginRight:20,display: item.isChinese ? 'block' : 'none'}} >语文</span>
                  <span style={{marginRight:20,display: item.isMath ? 'block' : 'none'}}>数学</span>
                  <span style={{marginRight:20,display: item.isEnglish ? 'block' : 'none'}}>英语</span>
                  <span style={{marginRight:20,display: item.isPE ? 'block' : 'none'}}>物理</span>
                  <span style={{marginRight:20,display: item.isPE1 ? 'block' : 'none'}}>化学</span>
                  <span style={{marginRight:20,display: item.isPE2 ? 'block' : 'none'}}>生物</span>
                  <span style={{marginRight:20,display: item.isPE3 ? 'block' : 'none'}}>地理</span>
                  <span style={{marginRight:20,display: item.isPE4 ? 'block' : 'none'}}>历史</span>
                  <span style={{marginRight:20,display: item.isPE5 ? 'block' : 'none'}}>政治</span>
                  <span style={{marginRight:20,display: item.isPE6 ? 'block' : 'none'}}>社会</span>
                  <span style={{marginRight:20,display: item.isPE7 ? 'block' : 'none'}}>音乐</span>
                  <span style={{marginRight:20,display: item.isPE8 ? 'block' : 'none'}}>体育</span>
                  <span style={{marginRight:20,display: item.isPE9 ? 'block' : 'none'}}>美术</span>
                  <span style={{marginRight:20,display: item.isPE10 ? 'block' : 'none'}}>计算机</span>
                  <span style={{marginRight:20,display: item.isPE11 ? 'block' : 'none'}}>信息技术</span>
                  <span style={{marginRight:20,display: item.isPE12 ? 'block' : 'none'}}>心理健康</span>
                </div>
              ))}
            </div>
          </div>
          <Button type="primary" onClick={() => {
            setIsComplete(false)
            setCurrent(0)}} style={{margin: 20}}>
            重新配置
          </Button>
        </div> :
          <div>
            <Steps current={current} items={items} />
            <div>{steps[current].content}</div>
            <div style={{ marginTop: 24 }}>
              {current < steps.length - 1 && (
                <Button type="primary" onClick={() => next()}>
                  下一步
                </Button>
              )}
              {current === steps.length - 1 && (
                <Button type="primary" onClick={() => {
                  setIsComplete(true)
                  getSubject()
                  getSystem()
                  setSelectedId(null)
                  }}>
                  完成
                </Button>
              )}
              {current > 0 && (
                <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                  上一步
                </Button>
              )}
            </div>
          </div>}
      </div>

    </>
  );
}

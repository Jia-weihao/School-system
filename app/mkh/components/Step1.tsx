import { useEffect, useState } from 'react';

import { Checkbox } from 'antd';
import axios from 'axios';
import API_BASE_URL from '@/app/tools/api';


export default function Step1({ onPeriodChange }: { onPeriodChange?: () => void }) {


  const [periodList, setPeriodList] = useState([]);
  const [systemList, setSystemList] = useState([]);

  // 获取学段
  const getPeriodList = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/configuration/getPeriod`);
    // 添加类型断言以解决 res.data 类型未知的问题
    setPeriodList((res.data as any).data);
  };
  // 获取学制
  const getSystemList = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/configuration/getSystem`);
    // 添加类型断言以解决 res.data 类型未知的问题
    setSystemList((res.data as any).data);
  };
  useEffect(() => {
    getPeriodList();
    getSystemList();
  }, []);

  const checkAll = periodList.length === periodList.filter((item: any) => item.isSelect).length;

  // 修改学年设置
  const changePeriod = async (id: string) => {
    await axios.post(`${API_BASE_URL}/api/configuration/UpdatePeriod`, {
      id,
    });
    await getPeriodList();
    // 通知父组件更新periodList数据
    if (onPeriodChange) {
      onPeriodChange();
    }
  };
  // 全选
  const changeAll = async () => {
    await axios.post(`${API_BASE_URL}/api/configuration/updateAll`, {
      value:checkAll,
    });
    await getPeriodList();
    // 通知父组件更新periodList数据
    if (onPeriodChange) {
      onPeriodChange();
    }
  };
  // 年级设置
  const changeSystem = async (id: string,grade: number) => {
    await axios.post(`${API_BASE_URL}/api/configuration/updateSystem`, {
      id,
      grade
    });
    getSystemList();
  };

  return (
    <div>
      <div style={{ margin: 20 }}>
        <span style={{ marginRight: 10 }}>学段设置</span>
        <Checkbox checked={checkAll} onClick={changeAll}>全选</Checkbox>
        {periodList.map((i: any) => (
          <Checkbox key={i._id} checked={i.isSelect} onClick={() => changePeriod(i._id)}>
            {i.name}
          </Checkbox>
        ))}
      </div>
      <div style={{ margin: 20, display: 'flex' }}>
        <span style={{ marginRight: 10 }}>年级设置</span>
        <div>

          {periodList.find((i: any) => i.name === '小学' && i.isSelect) && (
            <div>
              <span style={{ marginRight: 10 }}>小学</span>
              {systemList.filter((i: any) => i.grade == 1).map((i: any) => (
                <Checkbox key={i._id} checked={i.isSelect} onClick={() => changeSystem(i._id,1)}>{i.name} </Checkbox>
              ))}
            </div>
          )}


          {periodList.find((i: any) => i.name === '初中' && i.isSelect) && (
            <div style={{ marginTop: periodList.find((i: any) => i.name === '小学' && i.isSelect) ? 20 : 0 }}>
              <span style={{ marginRight: 10 }}>初中</span>
              {systemList.filter((i: any) => i.grade == 2).map((i: any) => (
                <Checkbox key={i._id} checked={i.isSelect} onClick={() => changeSystem(i._id,2)}>{i.name}</Checkbox>
              ))}
            </div>
          )}


          {periodList.find((i: any) => i.name === '高中' && i.isSelect) && (
            <div style={{ marginTop: (periodList.find((i: any) => i.name === '小学' && i.isSelect) || periodList.find((i: any) => i.name === '初中' && i.isSelect)) ? 20 : 0 }}>
              <span style={{ marginRight: 10 }}>高中</span>
                <Checkbox checked={true} disabled={true}>高一</Checkbox>
                <Checkbox checked={true} disabled={true}>高二</Checkbox>
                <Checkbox checked={true} disabled={true}>高三</Checkbox>
            </div>
          )}

          {periodList.filter((i: any) => i.isSelect).length === 0 && (
            <div style={{ color: '#999' }}>
              请先在学段设置中选择学段
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '@/app/tools/api';
import { Checkbox } from 'antd';
import { div } from 'framer-motion/client';

export default function Step2() {
  const [periodList, setPeriodList] = useState([]);
  const [systemList, setSystemList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const getPeriod = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/configuration/getPeriod`);
    // 添加类型断言以解决 res.data 类型未知的问题
    setPeriodList((res.data as any).data);
  }

  const [num, setNum] = useState(0);

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

  const getSubject = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/configuration/getSubject`);
    setSubjectList((res.data as any).data);
  }

  useEffect(() => {
    getPeriod();
    getSystem();
    getSubject();
  }, []);

  const changeSubject = async (id:string, value:string) => {
    await axios.post(`${API_BASE_URL}/api/configuration/updateSubject`, {
      id,
      value
    })
    getSubject();
  }

  return (
    <div style={{ display: 'flex' }}>
      {/* 左侧 */}
      <div style={{ width: '150px', borderRight: '1px solid #dedede' }}>
        {/* 小学 */}
        {periodList.filter((i: any) => i.isSelect && i.name === '小学').map((item: any) => (
          <div
            key={item._id}
            style={{ width: '100%', paddingLeft: '30px' }}>{item.name}</div>
        ))}
        {/* 小学二级 */}
        {periodList.filter((i: any) => i.isSelect && i.name === '小学').length ? (
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
        ) : null}
        {/* 初中 */}
        {periodList.filter((i: any) => i.isSelect && i.name === '初中').map((item: any) => (
          <div key={item._id} style={{ width: '100%', paddingLeft: '30px' }}>{item.name}</div>
        ))}
        {/* 初中二级 */}
        {periodList.filter((i: any) => i.isSelect && i.name === '初中').length ? (
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
        ):null}
        {/* 高中 */}
        {periodList.filter((i: any) => i.isSelect && i.name === '高中').map((item: any) => (
          <div key={item._id} style={{ width: '100%', paddingLeft: '30px' }}>{item.name}</div>
        ))}
        {/* 高中二级 */}
        {periodList.filter((i: any) => i.isSelect && i.name === '高中').length ? (
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
        ) : null}
      </div>
      {/* 右侧 */}
      <div style={{ margin: "20px", width: '500px' }}>
        {subjectList.filter((i: any) => i._id === selectedId).map((item: any) => (
          <div key={item._id}>
            <Checkbox checked={item.isChinese} onClick={() => changeSubject(item._id, 'isChinese')}>语文</Checkbox>
            <Checkbox checked={item.isMath} onClick={() => changeSubject(item._id, 'isMath')}>数学</Checkbox>
            <Checkbox checked={item.isEnglish} onClick={() => changeSubject(item._id, 'isEnglish')}>英语</Checkbox>
            <Checkbox checked={item.isPE} onClick={() => changeSubject(item._id, 'isPE')}>物理</Checkbox>
            <Checkbox checked={item.isPE1} onClick={() => changeSubject(item._id, 'isPE1')}>化学</Checkbox>
            <Checkbox checked={item.isPE2} onClick={() => changeSubject(item._id, 'isPE2')}>生物</Checkbox>
            <Checkbox checked={item.isPE3} onClick={() => changeSubject(item._id, 'isPE3')}>地理</Checkbox>
            <Checkbox checked={item.isPE4} onClick={() => changeSubject(item._id, 'isPE4')}>历史</Checkbox>
            <Checkbox checked={item.isPE5} onClick={() => changeSubject(item._id, 'isPE5')}>政治</Checkbox>
            <Checkbox checked={item.isPE6} onClick={() => changeSubject(item._id, 'isPE6')}>社会</Checkbox>
            <Checkbox checked={item.isPE7} onClick={() => changeSubject(item._id, 'isPE7')}>音乐</Checkbox>
            <Checkbox checked={item.isPE8} onClick={() => changeSubject(item._id, 'isPE8')}>体育</Checkbox>
            <Checkbox checked={item.isPE9} onClick={() => changeSubject(item._id, 'isPE9')}>美术</Checkbox>
            <Checkbox checked={item.isPE10} onClick={() => changeSubject(item._id, 'isPE10')}>计算机</Checkbox>
            <Checkbox checked={item.isPE11} onClick={() => changeSubject(item._id, 'isPE11')}>信息技术</Checkbox>
            <Checkbox checked={item.isPE12} onClick={() => changeSubject(item._id, 'isPE12')}>心理健康</Checkbox>
          </div>
        ))}
      </div>
    </div>
  );
}

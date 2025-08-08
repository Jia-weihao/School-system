import React from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Button } from 'antd';
import dayjs from 'dayjs';
interface ExportData {
  apiUrl: string;
  buttonText?: string;
  filename?: string;
  method?: 'get' | 'post';
  beforeExport?: () => any;
  requestParams?: Record<string, any>;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  buttonProps?: any;
  headers?: { key: string; displayName: string }[];
}
export default function ExportExcel({
  apiUrl,
  buttonText = '导出Excel',
  filename = 'data.xlsx',
  method = 'get',
  beforeExport,
  requestParams = {},
  onSuccess,
  onError,
  buttonProps = {},
  headers = [],
}: ExportData) {
  const handleExport = async () => {
    try {
      if (beforeExport) {
        await beforeExport();
      }
      const response = await axios({
        url: apiUrl,
        method: method,
        data: method.toLowerCase() === 'get' ? undefined : requestParams,
        params: method.toLowerCase() === 'get' ? requestParams : undefined,
        responseType: 'json',
      });
      const data = response.data.data;
      if (!Array.isArray(data)) {
        throw new Error('返回的数据不是数组格式');
      }

      // 创建工作簿
      const wb = XLSX.utils.book_new();
      const formattedData = data.map(item => {
        const newItem: Record<string, any> = {};
        headers.forEach(header => {
          let value = item[header.key];
          // 判断是否为日期字段并格式化
          if (header.key === 'start' && value) {
            value = dayjs(value).format('YYYY-MM-DD');
          }
          newItem[header.displayName] = value;
        });
        return newItem;
      });
      // 将数据转换为工作表
      const ws = XLSX.utils.json_to_sheet(formattedData);
      // 将工作表添加到工作簿
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `${filename}.xlsx`);

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
      console.error('导出失败:', error);
    }
  };
  return (
    <>
      <Button onClick={handleExport} {...buttonProps}>
        {buttonText}
      </Button>
    </>
  );
}

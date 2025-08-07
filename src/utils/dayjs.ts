import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// 扩展 dayjs 插件  
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// 设置默认语言为中文
dayjs.locale('zh-cn');

export default dayjs;
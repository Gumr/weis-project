import dayjs from 'dayjs';

const format = {
  date: (date: string | number, ft = 'YYYY-MM-DD HH:mm:ss') => {
    if (!date) return '无';
    return dayjs(Number(date)).format(ft);
  },
  week: (date: string | number) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return `周${days[dayjs(Number(date)).day()]}`;
  }
};

export default format;

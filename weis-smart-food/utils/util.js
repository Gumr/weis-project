/**
 * @description 静态日期操作类，封装系列日期操作方法
 * @description 输入时候月份自动减一，输出时候自动加一
 * @return {object} 返回操作方法
 * 完整日历方法 月历
 */
export let dateUtil = {
  /**
   * @description 数字操作，
   * @return {string} 返回处理后的数字
   */
  formatNum: function (n) {
    if (n < 10) return '0' + n;
    return n;
  },
  /**
   * @description将日期格式化为字符串
   * @return {string} 常用格式化字符串
   */
  format: function (date, f) {
    if (arguments.length < 2 && !date.getTime) {
      format = date;
      date = new Date();
    } else if (
      arguments.length == 2 &&
      typeof date === 'number' &&
      typeof f === 'string'
    ) {
      var d = new Date();
      d.setTime(date);
      date = d;
    }

    typeof f != 'string' && (f = 'Y年M月D日 H时F分S秒');
    return f.replace(/Y|y|M|m|D|d|H|h|F|f|S|s/g, function (a) {
      switch (a) {
        case 'y':
          return (date.getFullYear() + '').slice(2);
        case 'Y':
          return date.getFullYear();
        case 'm':
          return date.getMonth() + 1;
        case 'M':
          return dateUtil.formatNum(date.getMonth() + 1);
        case 'd':
          return date.getDate();
        case 'D':
          return dateUtil.formatNum(date.getDate());
        case 'h':
          return date.getHours();
        case 'H':
          return dateUtil.formatNum(date.getHours());
        case 'f':
          return date.getMinutes();
        case 'F':
          return dateUtil.formatNum(date.getMinutes());
        case 's':
          return date.getSeconds();
        case 'S':
          return dateUtil.formatNum(date.getSeconds());
      }
    });
  },
  // 20191230转换2019/12/30
  dateSwitch: function (date, symbol) {
    var normDate = date;
    normDate = normDate.substring(0, 4) + (symbol ? symbol : '/') + normDate.substring(4, 6) + (symbol ? symbol : '/') + normDate.substring(6, 8);
    return normDate
  }
};

export const formatDate = type => {
  return timestamp => {
    let ret = ''
    timestamp = Number(timestamp)
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    switch (type) {
      case 'Y-M-D':
        ret = [year, month, day].map(formatNumber).join('/')
        break
      case 'Y-M-D-Z':
        ret = `${year}年${month}月${day}日`
        break
      case 'Y-M-D h:m:s':
        ret = [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
        break
      case 'MD':
        ret = `${month}月${day}日`
        break
      case 'M/D':
        ret = `${month}/${day}`
        break
      case 'Y.M.D':
        ret = `${year}.${month}.${day}`
        break
    }
    return ret
  }
}

export function long2Timestamp(type = 0) { //默认计算0点的时间戳，24刚表示计算该天23:59:59
  return long => {
    long = String(long)
    const year = long.slice(0, 4)
    const month = long.slice(4, 6)
    const day = long.slice(6)
    let dateStr = type === 0 ? [year, month, day].map(formatNumber).join('/') : `${[year, month, day].map(formatNumber).join('/')} 23:59:59`
    return +new Date(dateStr)
  }
}

export const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export function Arabia_To_SimplifiedChinese(Num) {
  for (var i = Num.length - 1; i >= 0; i--) {
    Num = Num.replace(',', ''); //替换Num中的“,”
    Num = Num.replace(' ', ''); //替换Num中的空格
  }
  if (isNaN(Num)) {
    //验证输入的字符是否为数字
    //alert("请检查小写金额是否正确");
    return;
  }
  //字符处理完毕后开始转换，采用前后两部分分别转换
  var part = String(Num).split('.');
  var newchar = '';
  //小数点前进行转化
  for (var i = part[0].length - 1; i >= 0; i--) {
    if (part[0].length > 10) {
      //alert("位数过大，无法计算");
      return '';
    } //若数量超过拾亿单位，提示
    var tmpnewchar = '';
    var perchar = part[0].charAt(i);
    switch (perchar) {
      case '0':
        tmpnewchar = '零' + tmpnewchar;
        break;
      case '1':
        tmpnewchar = '一' + tmpnewchar;
        break;
      case '2':
        tmpnewchar = '二' + tmpnewchar;
        break;
      case '3':
        tmpnewchar = '三' + tmpnewchar;
        break;
      case '4':
        tmpnewchar = '四' + tmpnewchar;
        break;
      case '5':
        tmpnewchar = '五' + tmpnewchar;
        break;
      case '6':
        tmpnewchar = '六' + tmpnewchar;
        break;
      case '7':
        tmpnewchar = '七' + tmpnewchar;
        break;
      case '8':
        tmpnewchar = '八' + tmpnewchar;
        break;
      case '9':
        tmpnewchar = '九' + tmpnewchar;
        break;
    }
    switch (part[0].length - i - 1) {
      case 0:
        tmpnewchar = tmpnewchar;
        break;
      case 1:
        if (perchar != 0) tmpnewchar = tmpnewchar + '十';
        break;
      case 2:
        if (perchar != 0) tmpnewchar = tmpnewchar + '百';
        break;
      case 3:
        if (perchar != 0) tmpnewchar = tmpnewchar + '千';
        break;
      case 4:
        tmpnewchar = tmpnewchar + '万';
        break;
      case 5:
        if (perchar != 0) tmpnewchar = tmpnewchar + '十';
        break;
      case 6:
        if (perchar != 0) tmpnewchar = tmpnewchar + '百';
        break;
      case 7:
        if (perchar != 0) tmpnewchar = tmpnewchar + '千';
        break;
      case 8:
        tmpnewchar = tmpnewchar + '亿';
        break;
      case 9:
        tmpnewchar = tmpnewchar + '十';
        break;
    }
    newchar = tmpnewchar + newchar;
  }
  //替换所有无用汉字，直到没有此类无用的数字为止
  while (
    newchar.search('零零') != -1 ||
    newchar.search('零亿') != -1 ||
    newchar.search('亿万') != -1 ||
    newchar.search('零万') != -1
  ) {
    newchar = newchar.replace('零亿', '亿');
    newchar = newchar.replace('亿万', '亿');
    newchar = newchar.replace('零万', '万');
    newchar = newchar.replace('零零', '零');
  }
  //替换以“一十”开头的，为“十”
  if (newchar.indexOf('一十') == 0) {
    newchar = newchar.substr(1);
  }
  //替换以“零”结尾的，为“”
  if (newchar.lastIndexOf('零') == newchar.length - 1) {
    newchar = newchar.substr(0, newchar.length - 1);
  }
  return newchar;
}

// export function setTabBarData(ctx, data) {
//   if (typeof ctx.getTabBar === 'function') {
//     const tabBar = ctx.getTabBar();
//     if (tabBar) {
//       tabBar.setData(data)
//     }
//   }
// }

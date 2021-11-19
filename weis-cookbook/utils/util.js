const formatDate = type => {
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
    if(type === 'Y-M-D') {
      ret = [year, month, day].map(formatNumber).join('/')
    } else if(type === 'Y-M-D h:m:s') {
      ret = [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
    } else if(type === 'MD') {
      ret = `${month}月${day}日`
    } else if(type === 'M/D') {
      ret = `${month}/${day}`
    }
    return ret
  }
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function long2Timestamp(type = 0) { //默认计算0点的时间戳，24刚表示计算该天23:59:59
  return long => {
    long = String(long)
    const year = long.slice(0,4)
    const month = long.slice(4, 6)
    const day = long.slice(6)
    let dateStr = type === 0 ? [year, month, day].map(formatNumber).join('/') : `${[year, month, day].map(formatNumber).join('/')} 23:59:59`
    return +new Date(dateStr)
  }
}

//完成将 toChineseNum， 可以将数字转换成中文大写的表示，处理到万级别，例如 toChineseNum(12345)，返回 一万二千三百四十五。
const switch2Chinese = (num) => {
  let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']; //changeNum[0] = "零"
  let unit = ["", "十", "百", "千", "万"];
  num = parseInt(num);
  let getWan = (temp) => {
      let strArr = temp.toString().split("").reverse();
      let newNum = "";
      for (var i = 0; i < strArr.length; i++) {
          newNum = (i == 0 && strArr[i] == 0 ? "" : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? "" : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum;
      }
      newNum = newNum.replace(/一十/g, '十')
      return newNum;
  }
  let overWan = Math.floor(num / 10000);
  let noWan = num % 10000;
  if (noWan.toString().length < 4) noWan = "0" + noWan;
  return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
}

module.exports = {
  formatDate,
  long2Timestamp,
  switch2Chinese
}

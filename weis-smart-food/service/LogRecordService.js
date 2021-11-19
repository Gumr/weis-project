import request from '../utils/request';

const CLASS_NAME = 'LogRecord/'

const LogRecord = {
  // 记录日志
  saveRecord(data) {
    return request({
      method: `${CLASS_NAME}saveRecord`,
      data,
    })
  },

}

export default LogRecord;
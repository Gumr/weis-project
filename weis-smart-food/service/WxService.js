import {URL} from '../utils/request';
import LogRecord from './LogRecordService'

const WxService = {
    //获取code
    getCode(data) {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    if (res.code) {
                        LogRecord.saveRecord({
                            eventKey: '用户获取code',
                            eventValue: `${res.errMsg}--${res.code}`
                        })
                        return resolve(res);
                    } else {
                        LogRecord.saveRecord({
                            eventKey: '用户获取code',
                            eventValue: `${res.errMsg}--微信用户登录失败！`
                        })
                        return reject('微信用户登录失败！');
                    }
                },
                fail: (res) => {
                    LogRecord.saveRecord({
                        eventKey: '用户获取code',
                        eventValue: `${res.errMsg}--失败！`
                    })
                },
            });
        });
    },
    // 微信支付
    payment(obj) {
        let {
            timeStamp,
            nonceStr,
            packageStr,
            signType,
            paySign
        } = obj;
        return new Promise((resolve, reject) => {
            wx.requestPayment({
                timeStamp: timeStamp,
                nonceStr: nonceStr,
                package: packageStr,
                signType: signType,
                paySign: paySign,
                success: function (res) {
                    resolve(res);
                },
                fail: function (res) {
                    resolve(res);
                },
                complete: function (res) {},
            });
        });
    },
    uploadFile(url, filePath, formData = {}) {
        return new Promise((resolve, reject) => {
            // console.log(formData, 'uploadFile formData');
            url = url || `${URL['api']}/upload/image`;
            wx.uploadFile({
                url,
                filePath,
                name: 'file',
                formData,
                success: function (res) {
                    resolve(res);
                },
                fail: function (e) {
                    reject({
                        info: '文件上传失败',
                    });
                },
            });
        });
    }
}

export default WxService;
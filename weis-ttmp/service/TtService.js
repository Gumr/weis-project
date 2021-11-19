const TtService = {
    //获取code
    getCode(data) {
        return new Promise((resolve, reject) => {
            tt.login({
                success: (res) => {
                    if (res.code) {
                        return resolve(res);
                    } else {
                        return reject('微信用户登录失败！');
                    }
                },
            });
        });
    },
    // 支付
    payment(obj) {
        let {
            orderId,
            orderToken,
        } = obj;
        return new Promise((resolve, reject) => {
            tt.pay({
                orderInfo: {
                    order_id: orderId,
                    order_token: orderToken,
                },
                service: 5,
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
}

export default TtService;
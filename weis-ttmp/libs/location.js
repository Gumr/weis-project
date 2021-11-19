const QQMapWX = require('qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({
  key: 'OJOBZ-CYKL4-6MGU6-DOPEM-CWMFV-HQBOS' // 必填
});

// 经纬度转省市区
function toCity(latitude, longitude, callBack) {
  var that = this;
  // 定位自己的城市，需要引入第三方api
  //2、根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
  qqmapsdk.reverseGeocoder({
    location: {
      latitude: latitude,
      longitude: longitude
    },
    success: function (res) {
      callBack(res)
    },
    fail: function (res) {
      //定位失败
    }
  })
}

module.exports = {
  toCity: toCity
}
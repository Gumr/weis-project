const QQMapWX = require('qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({
  key: 'OJOBZ-CYKL4-6MGU6-DOPEM-CWMFV-HQBOS' // 必填
});



export function getCity(callBack, location) {
  wx.getLocation({
    type: 'gcj02',
    success: function (res) {
      const app = getApp();
      app.globalData.lat = res.latitude;
      app.globalData.lon = res.longitude;
      if (!location) {
        locationMt(res.latitude, res.longitude)
        callBack && callBack(res)
      } else if (location == 'address') {
        locationMt(res.latitude, res.longitude, callBack)
      } else if (location == 'present') {
        nearLocation(callBack)
      }
    },
    fail: function (res) {
      const app = getApp();
      if (app.globalData.lat && app.globalData.lon) {
        let res = {
          latitude: app.globalData.lat,
          longitude: app.globalData.lon,
        };
        if (!location) {
          locationMt(res.latitude, res.longitude)
          callBack && callBack(res)
        } else if (location == 'address') {
          locationMt(res.latitude, res.longitude, callBack)
        } else if (location == 'present') {
          nearLocation(callBack)
        }
      } else {
        wx.showModal({
          title: '获取位置失败',
          content: JSON.stringify(res),
          showCancel: false,
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: (result) => {
            if (result.confirm) {
              // 拒绝授权打开设置
              setting(callBack, location);
            }
          },
        });
      }
    }
  })
}

// 拒绝授权打开设置
function setting(callBack, location) {
  var _this = this;
  wx.getSetting({
    success: function (res) {
      var statu = res.authSetting;
      if (!statu['scope.userLocation']) {
        wx.showModal({
          title: '是否授权当前位置',
          content: '需要获取您的地理位置，请确认授权，否则部分功能将无法使用',
          showCancel: false,
          confirmColor: '#3CC51F',
          success: function (tip) {
            if (tip.confirm) {
              wx.openSetting({
                success: function (data) {
                  if (data.authSetting["scope.userLocation"] === true) {
                    wx.showToast({
                      title: '授权成功',
                      icon: 'success',
                      duration: 1000
                    })
                    //授权成功之后，再调用chooseLocation选择地方
                    wx.getLocation({
                      type: 'gcj02',
                      success: function (res) {
                        const app = getApp();
                        app.globalData.lat = res.latitude;
                        app.globalData.lon = res.longitude;
                        if (!location) {
                          locationMt(res.latitude, res.longitude)
                          callBack && callBack(res)
                        } else if (location == 'address') {
                          locationMt(res.latitude, res.longitude, callBack)
                        } else if (location == 'present') {
                          nearLocation(callBack)
                        }
                      },
                    })
                  } else {
                    const app = getApp();
                    const res = {
                      latitude: 22.541149,
                      longitude: 113.95355,
                    };
                    app.globalData.lat = res.latitude;
                    app.globalData.lon = res.longitude;
                    if (!location) {
                      locationMt(res.latitude, res.longitude)
                      callBack && callBack(res)
                    } else if (location == 'address') {
                      locationMt(res.latitude, res.longitude, callBack)
                    } else if (location == 'present') {
                      nearLocation(callBack)
                    }
                    wx.showToast({
                      title: '授权失败',
                      icon: 'error',
                      duration: 1000
                    })
                  }
                }
              })
            } else {
              wx.showToast({
                title: '授权失败',
                icon: 'error',
                duration: 1000
              })
            }
          }
        })
      } else {
        //用户已授权，但是获取地理位置失败，提示用户去系统设置中打开定位
        // wx.reLaunch({
        //   url: '/pages/exitMini/exitMini',
        // });
        const app = getApp();
        const res = {
          latitude: 22.541149,
          longitude: 113.95355,
        };
        app.globalData.lat = res.latitude;
        app.globalData.lon = res.longitude;
        if (!location) {
          locationMt(res.latitude, res.longitude)
          callBack && callBack(res)
        } else if (location == 'address') {
          locationMt(res.latitude, res.longitude, callBack)
        } else if (location == 'present') {
          nearLocation(callBack)
        }
      }
    },
    fail: function (res) {
      wx.showToast({
        title: '调用授权窗口失败',
        icon: 'success',
        duration: 1000
      })
    }
  })
}

// 城市定位
function locationMt(latitude, longitude, callBack) {
  var that = this;
  const app = getApp();
  // 定位自己的城市，需要引入第三方api
  //2、根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
  qqmapsdk.reverseGeocoder({
    location: {
      latitude: latitude,
      longitude: longitude
    },
    get_poi: 1,
    poi_options: 'policy=2;radius=100;page_size=1;page_index=1;address_format=short',
    success: function (res) {
      app.globalData.userAddr = res.result;
      callBack && callBack(res)
    },
    fail: function (res) {
      //定位失败
    }
  })
}

// 获取附近地址
function nearLocation(callBack) {
  var that = this;
  // 腾讯地图调用接口
  qqmapsdk.search({
    keyword: '写字楼',
    page_size: 20,
    success: function (res) {
      callBack(res);
    },
    fail: function (res) {
      callBack(res);
    },
    complete: function (res) {

    }
  })
}

//触发关键词输入提示事件
function getsuggest(callback, keyword, city, location = {}, ) {
  //调用关键词提示接口
  qqmapsdk.getSuggestion({
    //获取输入框值并设置keyword参数
    location: location && location.lat && location.lng ? `${location.lat},${location.lng}` : '',
    policy: 1,
    keyword: keyword, //用户输入的关键词，可设置固定值,如keyword:'KFC'
    region: city || '深圳', //设置城市名，限制关键词所示的地域范围，非必填参数
    success: function (res) { //搜索成功后的回调
      callback(res)
    },
    fail: function (error) {
      console.error(error);
    },
    complete: function (res) {

    }
  });
}

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
  getCity: getCity,
  setting: setting,
  locationMt: locationMt,
  nearLocation: nearLocation,
  getsuggest: getsuggest,
  toCity: toCity
}
// e:\project\weis-ttmp\weis-ttmp-nlm\weis-ttmp\pages\packOne\about\about\about.js
Page({
  data: {
    imgPrefix: 'https://prodstatic.weis1606.cn/api/ttmpFood/my/',
  },
  onLoad: function (options) {

  },
  about() {
    tt.navigateTo({
      url: '/pages/packOne/aboutWeis/aboutWeis',
    });
  },

  xy() {
    tt.navigateTo({
      url: '/pages/packOne/agreement/agreement',
    }); 
  },
})
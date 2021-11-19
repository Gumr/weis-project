// e:\project\weis-ttmp\weis-ttmp-nlm\weis-ttmp\pages\packOne\imgPage\imgPage.js
Page({
  data: {

  },
  onLoad: function (options) {
    if(options.img){
      this.setData({
        img: options.img
      })
    }else{
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.on('img', (data) => {
        this.setData({
          img: data.img
        })
      })
    }
  }
})
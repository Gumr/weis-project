import CookService from '../../service/CookService'
import {formatDate, long2Timestamp} from '../../utils/util'
import {getImageInfo} from '../../utils/basic'
import Sortable from '../../lib/sortable/sortable'
let sortable_mt = null
let sortable_sp = null
const cookService = new CookService()
const app = getApp()
const long2Timestamp0 = long2Timestamp()
const getDate = formatDate('Y-M-D')
const getMonthday = formatDate('MD')
// pages/uploadCook/uploadCook.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    category: [{
      id: '02',
      name: '蛋白质'
    }, {
      id: '01',
      name: '蔬菜'
    }, {
      id: '03',
      name: '碳水'
    }],
    quickConfig: [{
      id: 0,
      name: '盐'
    }, {
      id: 1,
      name: '糖'
    }, {
      id: 2,
      name: '蚝油'
    }, {
      id: 3,
      name: '生抽'
    }, {
      id: 4,
      name: '鸡精'
    }],
    sort: null, // 食谱类型，01素菜 02荤菜
    cookCover: {
      trCoverImageUrl: ''
    },
    cookName: null,
    cookStory: null,
    materials: [{
      seasoning: null,
      consumption: null
    }],
    violations: null, //上传结果有违禁词
    steps: [{
      stepInfo: '步骤1',
      stepImageUrl: null, 
      description: null,
      imgUploadType: 0 // 图片上传状态, 0未开始上传，1上传中，-1上传失败，2上传完成
    }],
    tips: null,
    coverImgInfo: {}, // 封面图片的宽高信息
    hasNull: true,
    uploadStatus: null, // 上传状态，null未开始上传，00开始上传 01上传成功 02存在敏感词 03上传失败
    uploadStatusText: '', //上传状态显示文本
    navBarHeight: null,
    quitFlag: false,
    sortTarget: -1, // 拖动目标
    materials_tranY: 0, // 拖动实时位置
    steps_tranY: 0, 
    preSortHeight: 0,
    pageMetaScrollTop: 0,
    isSorting: false,
    isStepSorting: false,
    popupCoverFlag: false,
    isFullScreen: false,
    videoPath: '',
    videoFrameImg: null,
    lhRatio: 1, // 视频长高比，高/长
    deleteFlag: false, // 删除封面图或视频弹窗
    dialogType: 1, // 1删除视频、2删除图片
    percentage: 0, // 图片上传进度
    imgUploadType: 0 // 图片上传状态, 0未开始上传，1上传中，-1上传失败，2上传完成
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      sort: wx.getStorageSync('cookCategory'),
      navBarHeight: app.globalData.navBarHeight,
      isFullScreen: app.globalData.isFullScreen,
      lhRatio: options.lhRatio
    })
    this.hasNull()
    if(options.id) {
      this.$id = options.id
      this.queryRecipesById()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const that = this
    setTimeout(() => {
      sortable_mt = new Sortable({
        context: that,
        list: 'materials',
        systemInfo: app.globalData.systemInfo,
        wrapDom: '.values > .wrap',
        itemDom: '.values > .wrap >.item',
        navBarHeight: app.globalData.navBarHeight
      })
      sortable_sp = new Sortable({
        context: that,
        list: 'steps',
        systemInfo: app.globalData.systemInfo,
        wrapDom: '.steps > .wrap',
        itemDom: '.steps > .wrap > .item',
        navBarHeight: app.globalData.navBarHeight
      })
    }, 500)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  selectCategory(e) {
    const {index}= e.currentTarget.dataset
    let {category} = this.data
    this.setData({
      sort: category[index].id
    })
  },
  queryRecipesById() {
    let {cookCover, cookName, cookStory, materials, steps, tips, sort} = this.data
    cookService.queryRecipesById({
      trId: this.$id
    }).then(res => {
      if(res.errCode === 0) {
        let {recipesDetail: {trPractice, trSeasoning, trCreateTime, trVideo, trCoverImageUrl, trName, trStory, trTip, trType, trCoverImageWide, trCoverImageHeight, trImages}} = res.obj
        trCreateTime = getDate(trCreateTime)
        this.setData({
          ['cookCover.trCoverImageUrl']: trCoverImageUrl,
          cookName: trName,
          cookStory: trStory,
          materials: JSON.parse(trSeasoning),
          steps: JSON.parse(trPractice),
          tips: trTip,
          sort: trType,
          videoPath: trVideo,
          videoFrameImg: trImages ? JSON.parse(trImages) : [],
          coverImgInfo: {
            trCoverImageWide: trCoverImageWide,
            trCoverImageHeight: trCoverImageHeight
          }
        }, () => {
          this.hasNull()
        })
      }
    })
  },
  quickAddOneMaterial(e) {
    const {index}= e.currentTarget.dataset
    let {materials, quickConfig} = this.data
    materials.push({
      seasoning: quickConfig[index].name,
      consumption: null
    })
    this.setData({
      materials
    }, () => {
      this.hasNull()
    })
  },
  addOneMaterial(){
    let {materials, isSorting} = this.data
    if(isSorting) return
    materials.push({
      seasoning: null,
      consumption: null
    })
    this.setData({
      materials
    }, () => {
      sortable_sp.resetDomInfo(this.$scrolltop)
      this.hasNull()
    })
  },
  addOneStep(){
    let {steps, isStepSorting} = this.data
    if(isStepSorting) return
    steps.push({
      stepInfo: `步骤${steps.length + 1}`,
      stepImageUrl: null, 
      description: null,
      imgUploadType: 0
    })
    this.setData({
      steps
    }, () => {
      this.hasNull()
    })
  },
  deleteOneMaterial(e) {
    const {index} = e.currentTarget.dataset
    let {materials, isSorting} = this.data
    if(isSorting) return
    materials.splice(index, 1)
    this.setData({
      materials
    },() => {
      this.hasNull()
    })
  },
  deleteOneStep(e) {
    const {isStepSorting} = this.data
    const {index} = e.currentTarget.dataset
    let {steps} = this.data
    if(isStepSorting) return
    steps.splice(index, 1)
    this.setData({
      steps
    },() => {
      this.hasNull()
    })
  },
  inputCookName(e) {
    const {value} = e.detail
    if(value.length > 20) {
      wx.showToast({
        title: '最多可输入20字',
        icon: 'none'
      })
      
    }
    this.setData({
      cookName: value.slice(0, 20)
    }, () => {
      this.hasNull()
    })
  },
  inputStory(e) {
    const {value} = e.detail
    // if(value.length > 200) {
    //   wx.showToast({
    //     title: '最多可输入200字',
    //     icon: 'none'
    //   })
    // }
    this.setData({
      cookStory: value.slice(0, 200)
    })
  },
  inputMaterial(e) {
    // type: 01调味料 02调味料用量
    const {index, type} = e.currentTarget.dataset
    const {value} = e.detail
    let {materials} = this.data
    materials[index][type] = value
    this.setData({
      materials
    }, () => {
      this.hasNull()
    })
  },
  inputStepDesc(e) {
    const {index} = e.currentTarget.dataset
    const {value} = e.detail
    let {steps} = this.data
    // if(value.length > 500) {
    //   wx.showToast({
    //     title: '最多可输入500字',
    //     icon: 'none'
    //   })
    // }
    steps[index].description = value.slice(0, 500)
      this.setData({
        steps
      }, () => {
        this.hasNull()
      })
  },
  inputTips(e) {
    const {value} = e.detail
    if(value.length > 200) {
      wx.showToast({
        title: '最多可输入200字',
        icon: 'none'
      })
    }
    this.setData({
      tips: value.slice(0, 200)
    })
  },
  handleStatus() {
    let {uploadStatus, cookCover, steps} = this.data
    if(uploadStatus === '01') {
      wx.navigateTo({
        url: `/pages/cookDetail/cookDetail?back=home&id=${this.$id}`
      })
    } else if(uploadStatus === '02') {
      const imgs = this.$tempimgs
      if(imgs && imgs.length > 0) {
        cookCover = [imgs[0]]
        steps.map((item, index)=> {
          item.stepImageUrl = [imgs[index]]
        })
      }
      this.setData({
        uploadStatus: null,
        cookCover,
        steps
      })
    } else {
      this.uploadCook()
    }
  },
  // 上传菜谱
  async uploadCook() {
    const {sort, cookCover, videoPath, cookName, cookStory, materials, steps, tips, coverImgInfo, isSorting, isStepSorting, hasNull, whichHasNull, videoFrameImg} = this.data
    if(isSorting || isStepSorting) {
      wx.showToast({
        title: '请完成排序',
        icon: 'none'
      })
      return
    }
    const data = {
      trType: sort,
      trName: cookName,
      trStory: cookStory,
      trSeasoning: materials,
      trPractice: steps,
      trTip: tips,
      trImages: videoFrameImg
    }
    if(hasNull) {
      wx.showToast({
        title: whichHasNull === 'cookCover' ? '请上传封面图' : whichHasNull === 'cookName' ? '请填写标题' : whichHasNull === 'materials' ? '请填写用料' : '请上传步骤',
        icon: 'none'
      })
    } else {
      this.setData({
        uploadStatus: '00'
      })
      try{
        data.trCoverImageUrl = cookCover.trCoverImageUrl
        data.trVideo = videoPath
        const {width, height} = await getImageInfo(data.trCoverImageUrl)
        data.trCoverImageWide = width
        data.trCoverImageHeight = height
        data.trPractice = steps
        if(this.$id) data.trId = this.$id
        cookService.uploadCook(data).then(res => {
          if(res.errCode === 0 && res.obj.id !== 0) {
            const {activityBean} = res.obj
            this.setData({
              uploadStatus: '01',
              uploadStatusText: activityBean ? `可在首页广场查看。我们将会在${getMonthday(long2Timestamp0(activityBean.taStartAudit))}-${getMonthday(long2Timestamp0(activityBean.taEndAudit))}审核，并且发布入选榜单` : '可在首页广场查看。'
            })
            !this.$id && (this.$id = res.obj.id)
          } else if(res.errCode === 1007) {
            let str = ''
            let violations = JSON.parse(res.errMsg.replace("\\\\", "")).join('、').split('、')
            violations.forEach((item, index) => {
              if(index <=3) str += `${item}、`
            })
            this.setData({
              uploadStatus: '02',
              violations: violations.length > 3 ? `${str.slice(0, -1)}等` : `${str.slice(0, -1)}`
            }, () => {
              this.setData({
                uploadStatusText: `菜谱中有违禁词${this.data.violations}，请修改后再上传`,
              })
            })
          } else {
            this.setData({
              uploadStatus: null,
              uploadStatusText: '可能网络有问题，请检查～'
            }, () => {
              wx.showToast({
                title: res.errMsg,
                icon: 'none'
              })
            })
          }
        })
      } catch(err) {
        console.log(err)
        this.setData({
          uploadStatus: '03'
        })
      }
    }
  },
  popupCover() {
    this.setData({
      popupCoverFlag: true
    })
  },
  async chooseStepImg(e) {
    const {index} = e.currentTarget.dataset
    let imgPath = ''
    let {steps} = this.data
    let img = await this.chooseimg().catch(err => {
      this.setData({
        steps
      })
    })
    if(img) {
      imgPath = await this.uploadFile(img[0], index).catch(err => {
        return
      })
      steps[index].stepImageUrl = imgPath
      this.setData({
        steps
      }, () => {
        this.hasNull()
      })
    }
  },
  async chooseCookCover() {
    let imgPath = ''
    this.setData({
      popupCoverFlag: false
    })
    let img = await this.chooseimg().catch(err => {
      console.log(err)
    })
    if(img) {
      imgPath= await this.uploadFile(img[0]).catch(err => {
        return
      })
      this.setData({
        cookCover: {
          trCoverImageUrl: imgPath
        }
      }, () => {
        this.hasNull()
      })
    }
  },
  // 选取待上传图片
  chooseimg() {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: res => {
          resolve(res.tempFilePaths)
        },
        fail: err => {
          reject(err.errMsg)
        }
      })
    })
  },
  // 选取视频
  uploadVideo() {
    this.setData({
      popupCoverFlag: false
    })
    wx.navigateTo({
      url: '/pages/basic/uploadVideo/uploadVideo'
    })
  },
  uploadFile(path, target = -1) { // target: -1表示上传封面图，0以上为步骤图
    return new Promise((resolve, reject) => {
      const key = `steps[${target}].imgUploadType`
      if(target === -1) {
        this.setData({
          imgUploadType: 1
        })
      } else {
        this.setData({
          [key]: 1
        })
      }
      let url = app.globalData.BASE_ENV === 'development' ? 'https://api1.weis1606.cn/upload/image' : 'https://prodapi1.weis1606.cn/upload/image'
      const uploaddata = {
        url: url,
        uploadflag: 'general',
        path
      }
      // 保存路径，上传出错后再次提交用
      this.$tempimgs = path
      const uploadTask = wx.uploadFile({
        url: uploaddata.url, 
        header: {
          token: wx.getStorageSync('token')
        },
        filePath: uploaddata.path,
        name: 'file',//这里根据自己的实际情况改
        formData: {
          flag: uploaddata.uploadflag
        },
        success: (res) => {
          wx.hideLoading()
          if(typeof res.data == 'string' && res.data.includes('413 Request Entity Too Large')) {
            wx.showToast({
              title: '图片过大~',
              icon: 'none'
            })
            this.setData({
              uploadStatus: null
            })
            if(target === -1) {
              this.setData({
                imgUploadType: -1
              })
            } else {
              this.setData({
                [key]: -1
              })
            }
          }
          if (JSON.parse(res.data).errCode !== 0) {
            reject('图片上传失败，请重试')
          } else {
            if(target === -1) {
              this.setData({
                imgUploadType: 2
              })
            } else {
              this.setData({
                [key]: 2
              })
            }
            resolve(JSON.parse(res.data).obj.imageUrl)
          }
        },
        fail: (res) => {
          console.log('fail:'+ res.errMsg);
          if(target === -1) {
            this.setData({
              imgUploadType: -1
            })
          } else {
            this.setData({
              [key]: -1
            })
          }
          reject(res.errMsg)
        }
      })
      uploadTask.onProgressUpdate(res => {
        this.setData({
          percentage: res.progress
        })
      })
    })
  },
  hasNull() {
    // 封面图、标题、用料、步骤为必填项
    let hasNull = false, whichHasNull = null
    const {cookCover, cookName, materials, steps} = this.data
    if(cookCover.length === 0) {
      hasNull = true
      whichHasNull = 'cookCover'
    } else if(!cookName) {
      hasNull = true
      whichHasNull = 'cookName'
    } else if(materials.filter(item => item.seasoning || item.consumption).length === 0 || materials.length === 0) {
      hasNull = true
      whichHasNull = 'materials'
    } else if(steps.filter(item => !item.stepImageUrl && !item.description).length > 0 || steps.length === 0) {
      hasNull = true
      whichHasNull = 'steps'
    }
    this.setData({
      hasNull,
      whichHasNull
    })
    // return hasNull
  },
  previewImage() {
    const {steps} = this.data
    const urls = steps.map(item =>item.stepImageUrl[0])
    wx.previewImage({
      current: urls[0], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  backEvent() {
    const {uploadStatus} = this.data
    if(uploadStatus === '01') {
      this.quitEvent()
    } else {
      this.setData({
        quitFlag: true
      })
    }
  },
  cancelEvent() {
    this.setData({
      quitFlag: false,
      popupCoverFlag: false,
      deleteFlag: false
    })
  },
  quitEvent() {
    let delta = 1
    const pages = getCurrentPages()
    pages.forEach((item, index) => {
      if(item.route.includes('index/index')) {
        delta = pages.length - 1 - index
      }
    })
    this.cancelEvent()
    wx.navigateBack({
      delta
    })
  },
  deleteCover() {
    const {videoPath} = this.data
    const dialogType = videoPath ? 1 : 2
    this.setData({
      dialogType,
      deleteFlag: true
    })
  },
  confirmDeleteCover() {
    this.setData({
      videoPath: '',
      ['cookCover.trCoverImageUrl']: ''
    }, () => {
      this.cancelEvent()
    })
  },
  changeCover() {
    wx.setStorageSync('videoFrameImg', this.data.videoFrameImg)
    wx.navigateTo({
      url: '/pages/basic/changeCover/changeCover'
    })
  },
  async toggleSortable(e) {
    let {materials, steps} = this.data
    const {type} = e.currentTarget.dataset
    wx.vibrateShort()
    switch(type) {
      case '01':
        var sortBoxHeight = await this.calcHeight('.values > .wrap')
        materials = materials.map((item, index) => {
          item.sortKey = index; // 初始化 sortKey 为当前项索引值
          item.tranY = `${Math.floor(item.sortKey / 1) * 100}%`;
          return item;
        })
        this.setData({
          materials,
          sortBoxHeight,
          isSorting: !this.data.isSorting
        })
        break
      case '02':
        var sortBoxHeight = await this.calcHeight('.steps > .wrap > .item > .section_sort')
        steps = steps.map((item, index) => {
          item.sortKey = index; // 初始化 sortKey 为当前项索引值
          item.tranY = `${Math.floor(item.sortKey / 1) * 100}%`;
          return item;
        })
        this.setData({
          steps,
          sortBoxHeight_steps: sortBoxHeight * steps.length,
          isStepSorting: !this.data.isStepSorting
        })
        break
    }
  },
  touchstart(e) {
    const {isSorting, isStepSorting} = this.data
    const {index, type} = e.currentTarget.dataset
    if((type === '01' && !isSorting) || (type === '02' && !isStepSorting)) return
    const targetInstance = type === '01' ? sortable_mt : sortable_sp
    // const targetInstance = type === '01' ? sortable_mt : sortable_sp
    targetInstance.start(e)
    this.setData({
      sortTarget: index
    })
  },
  touchmove(e) {
    const {isSorting, isStepSorting} = this.data
    const {type} = e.currentTarget.dataset
    if((type === '01' && !isSorting) || (type === '02' && !isStepSorting)) return
    const targetInstance = type === '01' ? sortable_mt : sortable_sp
    targetInstance.move(e)
    // let key = type === '01' ? 'materials' : 'steps'
    // let key_position = type === '01' ? 'position_mt' : 'position_sp'
    // this.setData({
    //   [key]: result.list,
    //   [key_position]: result.tranY
    // })
  },
  touchend(e) {
    const {isSorting, isStepSorting} = this.data
    const {type} = e.currentTarget.dataset
    if((type === '01' && !isSorting) || (type === '02' && !isStepSorting)) return
    const targetInstance = type === '01' ? sortable_mt : sortable_sp
    targetInstance.end(e)
    // let key = type === '01' ? 'materials' : 'steps'
    this.setData({
      sortTarget: -1
    })
  },
  onPageScroll(e) {
    this.$scrolltop = e.scrollTop
  },
  calcHeight(obj) {
    return new Promise((resolve, reject) => {
      let query = wx.createSelectorQuery()
      query.select(obj).boundingClientRect()
      query.exec((res) => {
        resolve(res[0].height)
      })
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})
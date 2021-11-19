// components/comment/comment.js
import CommentService from '../../service/CommentService'
const commentService = new CommentService()
import {formatDate} from '../../utils/util'
const getMonthday = formatDate('M/D')
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hasComments: {
      type: Boolean,
      value: false
    },
    cookid: {
      type: String,
      value: ''
    },
    commentTotal: {
      type: Number,
      value: 0
    },
    loginInfo: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    comments: [],
    replys: [],
    animationData: {},
    screenHeight: 0,
    navBarHeight: 0,
    showKbPublish: false,
    showComments: false,
    content: '', // 评论或回复的内容
    moreOperate: [{
      img: '/images/icon_delete2.png', 
      name: '删除',
      operate: '00'
    }, {
      img: '/images/icon_copy.png', 
      name: '复制',
      operate: '01'
    }],
    moreOperateFlag: false,
    placeholderTxt: '',
    cursorSpacing: 0,
    holdFlag: true,
    isFullScreen: false
  },
  ready() {
    const that = this
    this.$pageNo_reply = 1
    this.$pageNo_size = 10
    wx.getSystemInfo({
      success: (result)=>{
        var animation = wx.createAnimation({
          duration: 300,
          timingFunction: 'ease',
        })
        that.animation = animation
        that.setData({
          screenHeight: result.screenHeight,
          navBarHeight: app.globalData.navBarHeight,
          userInfo: app.globalData.userInfo && app.globalData.userInfo.userInfo,
          cursorSpacing: app.globalData.device === 'ios' ? 100 : 20,
          isFullScreen: app.globalData.isFullScreen
        })
        this.queryComments()
      }
    });
  },
  /**
   * 组件的方法列表
   */
  methods: {
    submitComment() {
      const type = this.$type // type: 0发表评论, 00父页面触发发表主评论，1回复主评论，2回复他人、id:type为0时,菜谱id，为1时主评论id、uid被回复用户id
      const {content, comments, userInfo: {uname, headImgUrl, uid}} = this.data
      const replyType = type === '1' ? '01' : type === '2' ? '02' : null
      if(!content) return
      app.checkLogin(async () => {
        const result = type === '0' || type === '00' ? await this.addComment() : await this.addReply(replyType)
        if(result <= 0) {
          wx.showToast({
            title: '网络故障，请稍候重试~',
            icon: 'none'
          })
        } else {
          if(type === '0' || type === '00') {
            let obj = {
              ...comments[0],
              displayReplys: [],
              remainReplys: [],
              id: result,
              comment: content,
              uid,
              uname,
              headImgUrl,
              likeNumber: 0,
              like: false,
              createTime: '今天'
            }
            comments.unshift(obj)
          } else {
            const replys = comments[this.$index].displayReplys
            let obj = {
              ...replys[0],
              id: result,
              content,
              uid,
              uname,
              likeNumber: 0,
              like: false,
              headImgUrl,
              replyUid: this.$uid,
              replyUname: this.$uname,
              createTime: '今天',
              replyType
            }
            replys.unshift(obj)
            // type === '1' ? replys.unshift(obj) : replys.push(obj)
            comments[this.$index].replys = replys
          }
          this.triggerEvent('refreshEvent')
          this.triggerEvent('hideKbPublish')
          this.setData({
            comments,
            holdFlag: false,
            content: '',
            showKbPublish: false
          }, async () => {
            wx.showToast({
              title: '发布成功',
              icon: 'none',
              duration: 800
            })
            this.$type === '00' && this.triggerEvent('scrollToComment')
          })
        }
      })
    },
    toggleCommentLike(e) {
      const {comments} = this.data
      const obj = e.currentTarget.dataset
      const {index, subindex, type} = obj
      const isLike = type === '1' ? comments[index].like : comments[index].displayReplys[subindex].like
      app.checkLogin(() => {
        if(!isLike) {
          this.addCommentLike({...obj}).then(res => {
            // type === '1' ? comments[index].likeNumber++ : comments[index].displayReplys[subindex].likeNumber++
            if(type === '1') {
              comments[index].likeNumber++
              comments[index].like = true
              comments[index].tclId = res
            } else {
              comments[index].displayReplys[subindex].likeNumber++
              comments[index].displayReplys[subindex].like = true
              comments[index].displayReplys[subindex].tclId = res
            }
            this.setData({
              comments
            })
          })
        } else {
          this.deleteCommentLike({...obj}).then(res => {
            // type === '1' ? comments[index].likeNumber-- : comments[index].displayReplys[subindex].likeNumber--
            if(type === '1') {
              comments[index].likeNumber--
              comments[index].like = false
            } else {
              comments[index].displayReplys[subindex].likeNumber--
              comments[index].displayReplys[subindex].like = false
            }
            this.setData({
              comments
            })
          })
        }
      })
    },
    // 点击展开更多
    async showMoreReplys(e) {
      const {comments} = this.data
      const {index, id} = e.currentTarget.dataset
      const current = comments[index]
      this.$pageNo_reply++
      const replys = await this.queryCommentReplyList(current)
      if(replys.length === 0) {
        current.showMoreReplys = false
      }
      current.remainReplys = current.remainReplys.concat(replys)
      current.displayReplys = current.displayReplys.concat(current.remainReplys.splice(0, 10))
      this.setData({
        comments
      })
    },
    showMoreOperate(e) {
      const {uname, uid, index, subindex, id, subid, type} = e.currentTarget.dataset
      const {userInfo} = app.globalData.userInfo
      const {moreOperate} = this.data
      app.checkLogin(() => {
        if(uname !== userInfo.uname) {
          moreOperate[0] = {
            img: '/images/icon_reply.png',
            name: '回复',
            operate: '02'
          }
        } else {
          moreOperate[0] = {
            img: '/images/icon_delete2.png',
            name: '删除',
            operate: '00'
          }
        }
        this.$type = type
        this.$id = id
        this.$subid = subid
        this.$uid = uid
        this.$uname = uname
        this.$index = index
        this.$subindex = subindex
        this.setData({
          moreOperate,
          moreOperateFlag: true
        })
      })
    },
    //回复、删除、复制
    moreOperateFn(e) {
      let {comments, placeholderTxt} = this.data
      const {operate} = e.currentTarget.dataset
      switch(operate) {
        case '00': // 删除
          this.deleteComment().then(res => {
            if(this.$type === '1') {
              comments.splice(this.$index, 1)
            } else {
              comments[this.$index].displayReplys.splice(this.$subindex, 1)
            }
            this.triggerEvent('refreshEvent')
            this.setData({
              moreOperateFlag: false,
              comments
            })
          })
          break
        case '01': // 复制
          const comment = this.$type === '1' ? comments[this.$index].comment : comments[this.$index].displayReplys[this.$subindex].content
          this.copyComment(comment)
          break
        case '02': // 回复
          placeholderTxt = this.$uname ?  `回复${this.$uname}` : '喜欢评论的人，做菜一定超好吃~'
          this.setData({
            moreOperateFlag: false,
            showKbPublish: true,
            placeholderTxt
          })
          break
      }
    },
    deleteComment() {
      return new Promise((resolve, reject) => {
        commentService.deleteCommentById({
          id: this.$type === '1' ? this.$id : this.$subid,
          trdId: this.properties.cookid,
          commentType: this.$type === '1' ? '01' : '02'
        }).then(res => {
          if(res.errCode === 0 && res.obj.result > 0) {
            resolve()
            return
          }
          wx.showToast({
            title: '出错了，请重试~',
            icon: 'none'
          })
          reject()
        })
      })
    },
    copyComment(data) {
      const that = this
      wx.setClipboardData({
        data: data,
        success (res) {
          wx.getClipboardData({
            success (res) {
              wx.showToast({
                title: '复制成功',
                icon: 'none'
              })
              that.setData({
                moreOperateFlag: false
              })
            }
          })
        }
      })
    },
    // 评论点赞
    addCommentLike({type, id, subid}) {
      return new Promise((resolve, reject) => {
        commentService.addCommentLike({
          tcId: type === '1' ? id : subid,
          commentType: type === '1' ? '01' : '02'
        }).then(res => {
          if(res.errCode === 0 && res.obj.result > 0) {
            resolve(res.obj.result)
            return
          }
          wx.showToast({
            title: '出错了，请重试~',
            icon: 'none'
          })
          reject()
        })
      })
    },
    // 取消点赞
    deleteCommentLike({type, tclid, subtclid}) {
      return new Promise((resolve, reject) => {
        commentService.deleteCommentLike({
          id: type === '1' ? tclid : subtclid
        }).then(res => {
          if(res.errCode === 0 && res.obj.result > 0) {
            resolve()
            return
          }
          wx.showToast({
            title: '出错了，请重试~',
            icon: 'none'
          })
          reject()
        })
      })
    },
    cancelMoreOperate() {
      this.setData({
        moreOperateFlag: false
      })
    },
    addComment() {
      return new Promise((resolve, reject) => {
        const {content, cookid} = this.data
        commentService.addComment({
          trdId: cookid,
          comment: content
        }).then(res => {
          if(res.errCode === 0) {
            const {id} = res.obj
            resolve(id)
            return
          }
          reject(res.errMsg)
        })
      })
    },
    addReply(replyType) {
      return new Promise((resolve, reject) => {
        const {content} = this.data
        commentService.addCommentReply({
          tcId: this.$id,
          replyUid: this.$uid,
          content,
          replyType
        }).then(res => {
          if(res.errCode === 0) {
            const {id} = res.obj
            resolve(id)
            return
          }
          reject(res.errMsg)
        })
      })
    },
    inputFn(e) {
      this.setData({
        content: e.detail.value
      })
    },
    animationTop() {
      const {comments, navBarHeight, screenHeight} = this.data
      const position = comments.length > 0 ? navBarHeight : (navBarHeight + screenHeight) / 2
      this.animation.top(position).step()
      this.setData({
        showComments: true,
        animationData:this.animation.export(),
        hasComments: comments.length > 0 ? true : false
      })
    },
    showKbPublishFn(e) {
      app.checkLogin(() => {
        let placeholderTxt = ''
        const {type, id, uid, uname, index, subindex} = e.currentTarget.dataset
        this.$type = type
        this.$id = id
        this.$uid = uid
        this.$uname = uname
        this.$index = index
        // this.$subindex = subindex
        placeholderTxt = uname ?  `回复${uname}` : '喜欢评论的人，做菜一定超好吃~'
        this.setData({
          showKbPublish: true,
          placeholderTxt
        })
      })
    },
    queryComments() {
      return new Promise(resolve => {
        commentService.queryCommentList({
          trdId: this.properties.cookid,
          pageNo: 1,
          pageSize: 10
        }).then(async res => {
          const {commentList} = res.obj
          if(commentList) {
            this.$isFirst = true
            const promiseList = commentList.map((item) => this.queryCommentReplyList(item))
            const replys = await Promise.all(promiseList)
            commentList.forEach((item, index) => {
              const firstReply  = replys[index].splice(0, 2)
              const now = getMonthday(+new Date())
              const createTime = getMonthday(item.createTime)
              item.createTime = now === createTime ? '今天' : createTime
              item.displayReplys = firstReply
              item.remainReplys = replys[index]
              // item.replys = firstReply
            })
            this.setData({
              comments: commentList
            })
            resolve(commentList)
          }
        })
      })
    },
    queryCommentReplyList(item) {
      return new Promise(resolve => {
        commentService.queryCommentReplyList({
          id: item.id,
          pageNo: this.$pageNo_reply,
          pageSize: this.$pageNo_size
        }).then(res => {
          if(res.errCode === 0) {
            const {commentReplyList} = res.obj
            if(commentReplyList.length > 2) {
              item.showMoreReplys = true
            }
            commentReplyList.forEach(item => {
              const now = getMonthday(+new Date())
              const createTime = getMonthday(item.createTime)
              item.createTime = now === createTime ? '今天' : createTime
            })
            resolve(commentReplyList)
            return
          }
        })
      })
    },
    hideOverlay() {
      this.setData({
        showKbPublish: false,
        moreOperateFlag: false
      })
      this.triggerEvent('hideKbPublish')
    }
  }
})

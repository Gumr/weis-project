import HandleResponse from './basic'
import {get, post} from '../utils/http'

export default class LoginService extends HandleResponse {
  // 用户授权
  userAuth(params) {
    return post({
      url: '/cn.weis.api.User/userAuth',
      data: {
        method: 'userAuth',
        params: [params]
      }
    })
  }

  // 手机号快捷登录
  getWxPhoneNum(params={}) {
    return post({
      url: '/cn.weis.api.User/getWxPhoneNum',
      data: {
        method: 'getWxPhoneNum',
        params: [params]
      },
    })
  }

  // 检测用户登录
  quietLogin(params={}) {
    return post({
      url: '/cn.weis.api.User/quietLogin',
      data: {
        method: 'quietLogin',
        params: [params]
      }
    })
  }

  /**
   * 获取首页banner图
   * params: {}
   */
  getBannerInfo(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Home/getBannerInfo',
      data: {
        method: 'getBannerInfo',
        params: [params]
      }
    })
  }

   /**
   * 查询用户信息
   * params: {}
   */
  queryUserInfo(params={}) {
    return post({
      url: '/cn.weis.api.User/queryUserInfo',
      data: {
        method: 'queryUserInfo',
        params: [params]
      }
    })
  }

  /**
   * 修改头像和昵称
   * @param {String} uname 新昵称
   * @param {String} headImgUrl 新头像
   * @param {String} autograph 简介
   */
  updateInfos(params) {
    return post({
      url: '/cn.weis.api.User/updateUserUnameAndHeadImgUrl',
      data: {
        method: 'updateUserUnameAndHeadImgUrl',
        params: [params]
      }
    })
  }

  /**
   * 修改个人数据
   * @param {String} motion || bodyfat || weight || height || birthday || sex
   */
  updateProfile(params) {
    return post({
      url: '/cn.weis.api.User/updateUserProfile',
      data: {
        method: "updateUserProfile",
        params: [params]
      }
    })
  }

  /**
   * 查看我的关注数量和粉丝数量
   * params: {}
   */
  queryMyFollowAndFansNumber(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Fans/queryMyFollowAndFansNumber',
      data: {
        method: 'queryMyFollowAndFansNumber',
        params: [params]
      }
    })
  }  

  /**
   * 添加一个分享菜谱记录
   * params: {String} trId:菜谱标识
   */
  addShareRecord(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/addShareRecord',
      data: {
        method: 'addShareRecord',
        params: [params]
      }
    })
  }  

  /**
   * 查看粉丝列表
   * params: {}
   */
  queryMyFansList(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Fans/queryMyFansList',
      data: {
        method: 'queryMyFansList',
        params: [params]
      }
    })
  } 

   /**
   * 查看我的关注列表
   * params: {}
   */
  queryMyFollowList(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Fans/queryMyFollowList',
      data: {
        method: 'queryMyFollowList',
        params: [params]
      }
    })
  } 

  /**
   * 添加/取消关注
   * params: {}
   */
  updateFollow(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Fans/updateFollow',
      data: {
        method: 'updateFollow',
        params: [params]
      }
    })
  } 

  /**
   * 添加/取消关注
   * @param {String} followUid 关注对象的uid
   * @param {String} flag 标识是关注列表还是粉丝列表,follow关注列表fans粉丝列表,不传默认粉丝列表
   */
  updateFollow(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Fans/updateFollow',
      data: {
        method: 'updateFollow',
        params: [params]
      }
    })
  } 
}
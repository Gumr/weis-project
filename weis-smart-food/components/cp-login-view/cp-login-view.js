// components/get_user_info.js
import {
	setStorage,
	getStorage
} from '../../utils/storage'
import apiRequest from '../../service/index';
import day from '../../libs/day'
const app = getApp();

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {

	},

	/**
	 * 组件的初始数据
	 */
	data: {
		showLoginPopup: false, //进入弹窗
		isOld: app.globalData.isOld,
	},

	ready: function () {
		this.init()
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		init() {
			const loginInfo = getStorage('loginInfo') || {}; //{"isAuthorized":true,"isLogin":true,"isPerProfile":true}
			this.setData({
				loginInfo,
				showLoginPopup: !(loginInfo.isAuthorized && loginInfo.isLogin)
			})
		},
		// 关闭弹窗
		close() {
			this.setData({
				showLoginPopup: false
			})
		},
		// 授权用户信息
		getUserInfo(e) {
			if (e.detail.errMsg == 'getUserInfo:fail auth deny') {
				return
			}
			var that = this;
			apiRequest.getCode().then((data) => {
				apiRequest.userAuth({
						code: data.code,
						rawData: e.detail.rawData,
						signature: e.detail.signature,
						encryptedData: e.detail.encryptedData,
						iv: e.detail.iv,
						inviteUid: app.globalData.inviteUid ? app.globalData.inviteUid : 0,
						aldId: app.globalData.aldId
					})
					.then(res => {
						if (res.obj.isAuthorized == true) {
							setStorage('token', res.obj.token);
							let loginInfo = {
								isAuthorized: res.obj.isAuthorized,
								isLogin: res.obj.isLogin,
								isPerProfile: res.obj.isPerProfile
							}
							setStorage('loginInfo', loginInfo).then(()=>{
								that.triggerEvent('updateSucc', {
									type: 1
								});
							})
							setStorage('userInfo', e.detail.userInfo)
							that.setData({
								loginInfo,
								showLoginPopup: (loginInfo.isAuthorized && loginInfo.isLogin) ? false : true
							})
						}
					})
					.catch(error => {

					})


			})

		},
		// 授权手机号
		getPhoneNumber(e) {
			if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
				return
			}
			var that = this;
			apiRequest.getCode().then((data) => {
				apiRequest.getWxPhoneNum({
						code: data.code,
						encryptedData: e.detail.encryptedData,
						iv: e.detail.iv,
						inviteUid: app.globalData.inviteUid ? app.globalData.inviteUid : 0,
						aldId: app.globalData.aldId
					})
					.then(res => {
						if (res.obj.isLogin == true) {
							setStorage('token', res.obj.token);
							let coupon = res.obj.coupon || [];
							coupon.forEach((item) => {
								item.tcuAmount = parseInt(item.tcuAmount);
								item.tcuEtime = day(Number(item.tcuEtime)).format('YYYY.MM.DD')
							})
							let loginInfo = {
								isAuthorized: res.obj.isAuthorized,
								isLogin: res.obj.isLogin,
								isPerProfile: res.obj.isPerProfile
							}
							setStorage('loginInfo', loginInfo).then(()=>{
								that.triggerEvent('updateSucc', {
									type: 2
								});
							})
							this.setData({
								loginInfo,
								coupon
							})
							if (coupon.length == 0) {
								this.setData({
									showLoginPopup: false
								})
							}
						}
					})
					.catch(error => {

					})

			})

		},
		goLogin(){
			this.setData({
				showLoginPopup: false
			})
			wx.navigateTo({
				url: '/pages/login/login',
			});
		},
	}
});
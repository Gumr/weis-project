// pages/mineBox/fatDetail/fatDetail.js
// import apiRequest from '../../../service/index';
import requests from '../../../service/index'
import day from '../../../libs/day'
import {
    isLoginClick,
    refreshStepData,
    getStepConfig,
    loginPromise,
    t,
    queryUserInfo
} from '../../../utils/common';
import Draw from '../../../utils/Draw';
import ShareImage from '../../../utils/ShareImage'
import {
    campStatus
} from '../../../utils/map'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        campStatus,
        showUnit: false,
        step: 1,
        title: '',
        closeImg: '',
        confirmText: '',
        // unitList: [],
        activeRankTab: '01',
        rankTabs: [{
                label: '个人排名',
                value: '01'
            },
            {
                label: '团队排名',
                value: '02'
            }
        ],
        activeTypeTab: '01',
        typeTabs: [{
                label: '过程积分榜',
                value: '01'
            },
            {
                label: '最终效果榜',
                value: '02'
            }
        ],
        myRank: null,
        rankList: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {

        this.id = options.id;

        this.setData({
            status: options.status,
            paddingBottom: getApp().globalData.isIpx ? 98 : 30,
            step: 1,
            title: '请选择分队',
            closeImg: '/images/icon_down.png',
            confirmText: '下一步',
        })

        this.stepConfig = getStepConfig()

        loginPromise.then((res) => {
            this.setData({
                uid: res.uid,
                inviteUid: options.invite ? options.invite : '',
            })
            this.getGroupRankList()
            this.ifLiked()
            this.getQrCode()
        })
    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: async function () {
        this.queryUserInfo()
        if (this.load) {
            this.getGroupRankList()
        } else {
            this.load = true
        }
        const config = await this.stepConfig
        await refreshStepData(config)
    },

    toRule() {
        let tclwRule = this.data.detail.tclwRule;
        if (!tclwRule) {
            return
        }
        wx.navigateTo({
            url: '/pages/mineBox/imgPage/imgPage',
            success: ({
                eventChannel
            }) => {
                eventChannel.emit('img', {
                    img: tclwRule
                })
            },
            fail: () => {},
            complete: () => {}
        });

    },

    getQrCode() {
        requests.getQrCode({
            targetPath: `/pages/mineBox/fatRank/fatRank?id=${this.id}&status=${this.data.status}&invite=${this.data.uid}`,
            targetAppid: 'wxb41830cd88835f5c',
            scene: this.id, //scene不同生成图片不同
        }).then((res) => {
            this.qrcode = res.obj.ImageUrl;
        })
    },


    queryUserInfo() {
        queryUserInfo().then((res) => {
            this.setData({
                userInfo: res.obj
            })
        })
    },

    // 报名
    signUp() {
        this.setData({
            showUnit: true
        })
    },

    // 查询有没有点赞
    ifLiked() {
        if (this.data.inviteUid && this.data.inviteUid != this.data.uid) {
            requests.ifLiked({
                beUid: this.data.inviteUid,
                type: '02',
                activityId: this.id,
            }).then((res) => {
                this.setData({
                    result: res.obj.result
                })
            })
        }
    },

    // 点赞
    like: isLoginClick(function () {

        requests.activityLike({
            beUid: this.data.inviteUid,
            type: '02',
            activityId: this.id,
            score: 1,
        }).then((res) => {
            if (res.errCode == 0) {
                wx.showToast({
                    title: '点赞成功',
                    icon: 'success',
                    image: '',
                    duration: 1500,
                    mask: false,
                    success: (result) => {

                    },
                    fail: () => {},
                    complete: () => {}
                });
                if (this.data.activeRankTab != '01' || this.data.activeTypeTab != '01') {
                    this.setData({
                        activeRankTab: '01',
                        activeTypeTab: '01'
                    })
                    this.getGroupRankList()
                } else {
                    this.getGroupRankList()
                }
                this.setData({
                    result: true
                })
            } else {
                wx.showToast({
                    title: res.errMsg,
                    icon: 'none',
                    image: '',
                    duration: 1500,
                    mask: false,
                    success: (result) => {

                    },
                    fail: () => {},
                    complete: () => {}
                });

            }
        })

    }),

    getGroupRankList() {
        const {
            activeRankTab,
            activeTypeTab
        } = this.data;
        requests.getGroupNewRankList({
            tclwrClwId: this.id,
            scoreType: activeTypeTab,
            range: activeRankTab
        }).then((res) => {
            if (res.errCode === 0) {
                const detail = res.obj.companyLoseWeightInfo
                detail.startDate = day(String(detail.tclwStartDate)).format('YYYY/MM/DD')
                detail.endDate = day(String(detail.tclwEndDate)).format('YYYY/MM/DD')
                // detail.$status = {
                //   '00': '已加入',
                //   '01': '报名中',
                //   '02': '准备开营',
                //   '03': '进行中',
                //   '04': '已结束'
                // }[detail.stt]
                function setValue(item) {
                    item.rankScore = (activeTypeTab === '02' ? Number(item.rankScore) * 2 : Number(item.rankScore))
                    const unit = (activeTypeTab === '02' ? '斤' : '分')
                    item.$value = item.rankScore + unit;
                    if (activeTypeTab === '02') {
                        item.rankPart = `${item.rankPart}%`
                    }
                    if (activeRankTab === '02') {
                        item.uname = `${item.uname}(${item.tclwrStep || 0}人)`
                    }
                    return item;
                }

                const list = res.obj.intakeScoreReposeList.map(setValue);

                // 邀请点赞
                if (this.data.inviteUid && this.data.inviteUid != this.data.uid && activeRankTab == '01' && activeTypeTab == '01') {
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].uid == this.data.inviteUid) {
                            let inviteObj = list[i];
                            this.setData({
                                inviteObj
                            })
                            break
                        }
                    }
                }


                this.setData({
                    detail,
                    myRank: res.obj.intakeScoreReposeUid ? {
                        ...setValue(res.obj.intakeScoreReposeUid),
                        next: true
                    } : null,
                    rankList: list,
                    // stt: res.obj.stt.stt,
                    status: (res.obj.stt && this.data.campStatus[res.obj.stt.stt]) || this.data.status
                })
            }
        })
    },
    rankTabTap: isLoginClick(function ({
        currentTarget
    }) {
        this.setData({
            activeRankTab: currentTarget.dataset.value
        })
        this.getGroupRankList();
    }),
    myRankClick: isLoginClick(function () {
        const {
            activeRankTab,
            activeTypeTab,
            myRank
        } = this.data;
        if (activeRankTab === '01') {
            wx.navigateTo({
                url: `/pages/mineBox/myRank/myRank`,
                success: ({
                    eventChannel
                }) => {
                    eventChannel.emit('data', {
                        type: activeTypeTab,
                        groupId: myRank.tclwrClwgId,
                        id: this.id,
                        value: myRank.$value,
                        rank: myRank.rankings
                    })
                }
            })
        }
        if (activeRankTab === '02') {
            wx.navigateTo({
                url: `/pages/mineBox/teamRank/teamRank`,
                success: ({
                    eventChannel
                }) => {
                    eventChannel.emit('data', {
                        type: activeTypeTab,
                        groupName: myRank.uname,
                        groupId: myRank.tclwrClwgId,
                        id: this.id,
                        value: myRank.rankScore,
                        rank: myRank.rankings,
                        rankPart: myRank.rankPart || 0,
                    })
                }
            })
        }
    }),
    typeTabTap: isLoginClick(function ({
        currentTarget
    }) {
        this.setData({
            activeTypeTab: currentTarget.dataset.value
        })
        this.getGroupRankList();
    }),
    // 确定
    onConfirm() {
        if (this.data.step == 1) {
            this.setData({
                step: 2,
                title: '请输入你当前体重',
                closeImg: '/images/icon_return.png',
                confirmText: '完成',
            })
            return;
        }
        if (this.data.step == 2) {
            this.setData({
                showUnit: false,
            })
        }
    },
    // 关闭
    onClose() {
        if (this.data.step == 1) {
            this.setData({
                showUnit: false
            })
            return;
        }
        if (this.data.step == 2) {
            this.setData({
                step: 1,
                title: '请选择分队',
                closeImg: '/images/icon_down.png',
                confirmText: '下一步',
            })
        }
    },
    // 活动规则
    activeRule() {
        wx.navigateTo({
            url: `/pages/mineBox/activeRule/activeRule`
        })
    },


    // 邀请
    invite() {
        this.setData({
            showShare: true
        })
    },

    cancel() {
        this.setData({
            showShare: false
        })
    },

    async saveShareTap() {
        if (this.sharing) return;
        this.cancel();
        wx.showLoading({
            title: '绘制中',
        })

        this.sharing = true;
        const imageUrl = (await this.drawShareImage()).tempFilePath;
        this.sharing = false;
        wx.hideLoading()
        const sharer = new ShareImage(imageUrl)
        sharer.save().then(sharer.preview.bind(sharer), sharer.preview.bind(sharer))
    },

    async drawShareImage() {
        const userInfo = this.data.userInfo;
        const ctx = this.ctx || (this.ctx = wx.createCanvasContext('share', this))
        const draw = new Draw(ctx)

        draw.drawView({
            left: t(0),
            top: t(0),
            width: Math.ceil(t(750)),
            height: Math.ceil(t(1624)),
        }, {
            backgroundColor: "#FE5E0F",
            border: 'none'
        })

        let bgimg = this.data.detail.tclwCoverImg;

        if (bgimg.indexOf('https') == -1) {
            bgimg = bgimg.replace(/^http/, "https");
        }

        await draw.drawImage(bgimg, {
            left: t(0),
            top: t(0),
            width: t(750),
            height: t(549),
        })

        bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/share_qiye_bj.png'

        await draw.drawImage(bgimg, {
            left: t(30),
            top: t(549),
            width: t(690),
            height: t(972),
        })

        bgimg = userInfo.headImgUrl;

        await draw.drawImage(bgimg, {
            left: t(90),
            top: t(639),
            width: t(88),
            height: t(88),
            borderRadius: t(44)
        })

        let uname = userInfo.uname;

        draw.drawText(uname, {
            left: t(198),
            top: t(669),
            height: Math.ceil(t(28)),
            width: Math.ceil(draw.textWidth(uname, t(28))),
        }, {
            fontSize: t(28),
            lineHeight: Math.ceil(t(28)),
            color: '#333333',
        })

        bgimg = "https://prodstatic.weis1606.cn/api/smartFood/share_%EF%BC%82.png";

        await draw.drawImage(bgimg, {
            left: t(87),
            top: t(787),
            width: t(58),
            height: t(46),
        })

        bgimg = "https://prodstatic.weis1606.cn/api/smartFood/share_%EF%BC%82_1.png";

        await draw.drawImage(bgimg, {
            left: t(605),
            top: t(997),
            width: t(58),
            height: t(46),
        })

        uname = '我正在参加减脂大赛';

        draw.drawText(uname, {
            left: (t(750) - draw.textWidth(uname, t(40))) / 2,
            top: t(855),
            height: Math.ceil(t(40)),
            width: Math.ceil(draw.textWidth(uname, t(40))),
        }, {
            fontSize: t(40),
            lineHeight: Math.ceil(t(40)),
            color: '#333333',
            fontWeight: 'bold'
        })

        uname = '需要你助我一臂之力';

        draw.drawText(uname, {
            left: t(195),
            top: t(935),
            height: Math.ceil(t(40)),
            width: Math.ceil(draw.textWidth(uname, t(40))),
        }, {
            fontSize: t(40),
            lineHeight: Math.ceil(t(40)),
            color: '#333333',
        })

        bgimg = "https://prodstatic.weis1606.cn/api/smartFood/share_qr_frame.png";

        await draw.drawImage(bgimg, {
            left: t(90),
            top: t(1241),
            width: t(240),
            height: t(240),
        })

        bgimg = this.qrcode;

        await draw.drawImage(bgimg, {
            left: t(90),
            top: t(1241),
            width: t(240),
            height: t(240),
        })


        uname = '扫描左方小程序码';

        draw.drawText(uname, {
            left: t(378),
            top: t(1297),
            height: Math.ceil(t(52)),
            width: Math.ceil(draw.textWidth(uname, t(28))),
        }, {
            fontSize: t(28),
            lineHeight: Math.ceil(t(52)),
            color: '#333333',
        })

        uname = '进来帮我点个赞吧';

        draw.drawText(uname, {
            left: t(378),
            top: t(1349),
            height: Math.ceil(t(52)),
            width: Math.ceil(draw.textWidth(uname, t(28))),
        }, {
            fontSize: t(28),
            lineHeight: Math.ceil(t(52)),
            color: '#333333',
        })

        bgimg = "https://prodstatic.weis1606.cn/api/smartFood/share_qiye_guajian.png";

        await draw.drawImage(bgimg, {
            left: t(0),
            top: t(1562),
            width: t(750),
            height: t(62),
        })


        return new Promise((resolve) => {
            draw.draw(false, () => {
                setTimeout(() => {
                    draw.canvasToTempFilePath({
                        width: 750,
                        height: 1624,
                        id: 'share'
                    }, this).then(resolve)
                }, 600)
            })
        })

    },

    inviteWechat() {
        this.setData({
            showShare: false
        })
    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            path: `/pages/mineBox/fatRank/fatRank?id=${this.id}&status=${this.data.status}&invite=${this.data.uid}`,
            title: '我正在参加减脂大赛，帮我点个赞吧',
            imageUrl: this.data.detail.tclwCoverImg
        }
    }
})
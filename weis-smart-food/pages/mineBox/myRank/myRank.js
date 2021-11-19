import day from '../../../libs/day'
import requests from '../../../service/index'
import { isDef, round, getStepConfig, refreshStepData, transformChartData } from '../../../utils/common'
let app =  getApp();

  
// pages/mineBox/myRank/myRank.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        todayData: {},
        id: null, // 营的id
        rank: null, // 排名
        type: null, // 排名类型
        value: null, // 得分
        todayValue: 0,
        tab: [{
            val: '今日饮食',
            tabType: '01'
        }, {
            val: '今日步数',
            tabType: '02'
        }, {
            val: '今日参与',
            tabType: '03'
        }],
        tabType: '01',
        isIpx: app.globalData.isIpx,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const eventChannel = this.getOpenerEventChannel()
        this.ondata = new Promise((resolve) => {
            eventChannel.on('data', (data) => {
                console.log(data)
                data.$typeLabel = {
                    '01': '管住嘴',
                    '02': '迈开腿',
                    '03': '热情参与',
                    '04': '减脂效果'
                }[data.type]
                this.setData(data)
                this.requestParams = {
                    tclwrClwgId: data.groupId,
                    scoreType: data.type,
                    range: '01',
                    tclwrClwId: data.id
                }

                resolve()
            })
        })

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: async function() {
        await this.ondata
        this.getData()
    },
    async getData() {
        this.queryUserGroupCorpScore()
        if (this.data.$typeLabel === '管住嘴') {
            this.getEChartOnePage()
        }
        if (this.data.$typeLabel === '迈开腿') { // type 02 记步排行
            const stepConfig = await getStepConfig()
            this.setData({
                openStep: stepConfig && stepConfig.tucStt === '01'
            })
            await refreshStepData(stepConfig)
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    tab(e) {
        let tab = this.data.tab;
        let index = e.currentTarget.dataset.index;
        this.setData({
            tabType: tab[index].tabType
        })
    },

    queryUserGroupCorpScore() {
        requests.queryUserGroupCorpScoreDetail(this.requestParams).then((res) => {
            // console.log(res)
            if (res.errCode === 0) {
                let obj = res.obj;
                // const resData = res.obj
                // this.scoreList = resData.groupScoreList
                // if (isDef(resData.tclwrWeightEnd && resData.tclwrWeightStart)) {
                //   const todayValue = round((resData.tclwrWeightEnd - resData.tclwrWeightStart) * 2, 1)
                //   const weightStart = (resData.tclwrWeightStart) * 2
                //   this.setData({
                //     todayValue,
                //     weightStart,
                //     weightRadio: round(todayValue / weightStart * 100, 1),
                //     weightEnd: (resData.tclwrWeightEnd) * 2,
                //     date: (resData.time ? day(String(resData.time)) : day()).format('MM月DD日')
                //   })
                // } else {
                //   this.setData({
                //     todayValue: resData.intakeScoreRepose.rankScore,
                //     todayStep: resData.todayStep
                //   })
                // }
                if (this.data.type == '01') {
                    let tab = [{
                        val: '今日饮食',
                        tabType: '01'
                    }, {
                        val: '今日步数',
                        tabType: '02'
                    }, {
                        val: '今日参与',
                        tabType: '03'
                    }];
                    tab[0].val = `${tab[0].val} ${obj.todayIntakeScore > 0 ? '+' : ''}${Number(obj.todayIntakeScore) || 0}`
                    tab[1].val = `${tab[1].val} ${obj.todayStepScore > 0 ? '+' : ''}${Number(obj.todayStepScore) || 0}`
                    tab[2].val = `${tab[2].val} +${(Number(obj.todayPartake['03']) || 0) + (Number(obj.todayPartake['02']) || 0) + (Number(obj.todayPartake['01']) || 0) + (Number(obj.todayPartake['04']) || 0) + (Number(obj.todayPartake['00']) || 0) }`
                    this.setData({
                        tab
                    })
                }
                if (this.data.type == '02') {
                    obj.tclwrWeightStart = (obj.tclwrWeightStart) * 2;
                    obj.tclwrWeightEnd = (obj.tclwrWeightEnd) * 2;
                    obj.intakeScoreRepose.rankScore = round(obj.intakeScoreRepose.rankScore*2,1)
                    // obj.reduceWeight = round((obj.tclwrWeightEnd - obj.tclwrWeightStart), 1);
                    // obj.weightRadio = round(obj.reduceWeight / obj.tclwrWeightStart * 100, 1);
                    obj.date = (obj.time ? day(String(obj.time)) : day()).format('MM月DD日')
                }
                this.setData({
                    obj
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },
    getEChartOnePage() {
        return requests.getEChartOnePage({
            pageNo: 1,
            pageSize: 1
        }).then((res) => {
            if (res.errCode === 0) {
                this.setData({
                    todayData: transformChartData(res.obj.page[0])
                })
            }
        })
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },
    weightTap() {
        wx.navigateTo({
            url: '/pages/packageDatum/markWeight/markWeight'
        })
    },
    orderTap() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },
    cardTap() {
        wx.navigateTo({
            url: '/pages/packageDiscover/dietCard/dietCard'
        })
    },
    back() {
        wx.navigateTo({
            url: '/pages/mineBox/inviteLike/inviteLike',
            success: ({ eventChannel }) => {
                eventChannel.emit('data', this.data.obj.todayLike)
            },
            fail: () => {},
            complete: () => {}
        });
          
    },
    stepTap() {
        wx.navigateTo({
            url: '/pages/packageDatum/markStep/markStep'
        })
    },
    totalScoreTap() {
        wx.navigateTo({
            url: '/pages/mineBox/scoreDetail/scoreDetail',
            success: ({ eventChannel }) => {
                eventChannel.emit('data', this.data.obj.todayTotalMap)
            }
        })
    },

    invite() {
        wx.navigateTo({
            url: '/pages/mineBox/inviteLike/inviteLike',
            success: ({ eventChannel }) => {
                eventChannel.emit('data', this.data.obj.todayLike)
            }
        })
    },
    // joinTap() {
    //   wx.navigateTo({
    //     url: '/pages/mineBox/todayJoin/todayJoin',
    //     success: ({ eventChannel }) => {
    //       eventChannel.emit('data', this.requestParams)
    //     }
    //   })
    // }
})
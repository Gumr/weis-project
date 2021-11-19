<template>
  <div class="page-container">
    <section>
      <h3>活动基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">活动名称：</span>
        <span>{{formData.name}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">活动周期：</span>
        <span>{{formData.period}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">活动码：</span>
        <span>{{formData.activityCode}}</span>
      </div>
    </section>
    <section>
      <h3>奖券配置</h3>
      <div class="section-item">
        <div class="coupon">
          <div class="coupon-item" v-for="(item, index) in formData.coupon" :key="index">
            <div class="c-item">
              <h4>{{item.couponName}}</h4>
            </div>
            <div class="c-item">
              <div>奖券类型：现金券</div>
               <div>张数：{{item.count > 114748364 ? '不限制张数' : (item.count == -1 ? '不限制张数' : item.count)}}</div>
            </div>
            <div class="c-item">
              <div>面额：{{item.tcsAmount}}元</div>
              <div>互斥条件：{{item.isReject == 1 ? '不可与维士红包叠加' : '可以与维士红包叠加'}}</div>
            </div>
            <div class="c-item">
              <div>生效日期：{{item.takeEffect == 0 ? '即时生效' : (item.takeEffect == 1 ? '次日生效' : item.takeEffect)}}</div>
              <div>失效日期：{{item.loseEfficacySign == '00' ? '模板有效期' : item.loseEfficacyData}}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section>
      <div class="section-item">
        <h3>发券规则</h3>
      </div>
      <div v-if="type == '00'">
        <div class="section-item" v-for="(item, index) in formData.acquireCondition" :key="index">
          <span class="section-label label-1">订单金额满：</span>
          <span style="margin-right: 10px;width: 80px;">{{item.condition}}元</span>
          <span class="section-label" style="margin-right: 20px;">赠送下单人奖券：{{item.couponIdUserName}}</span>
          <span class="section-label">张数：{{item.userCount}}</span>
        </div>
      </div>
      <div v-if="type == '01'">
        <div class="section-item" v-for="(item, index) in formData.acquireCondition" :key="index">
          <span class="section-label label-1" style="margin-right: 20px;margin-left: 90px">发放应用人群奖券：{{item.couponIdUserName}}</span>
          <span class="section-label">张数：{{item.userCount}}</span>
        </div>
      </div>
      <div v-if="type == '02'">
        <div class="section-item" v-for="(item, index) in formData.acquireCondition" :key="index">
          <span class="section-label label-1">订单预订天数：</span>
          <span style="margin-right: 10px;width: 80px;">{{item.condition}}天</span>
          <span class="section-label" style="margin-right: 20px;">赠送预订人奖券：{{item.couponIdUserName}}</span>
          <span class="section-label">张数：{{item.userCount}}</span>
        </div>
      </div>
      <div v-if="type == '03'">
        <div class="section-item" v-for="(item, index) in formData.acquireCondition" :key="index">
          <span class="section-label label-1">新人下：</span>
          <span style="margin-right: 10px;width: 80px;">{{item.condition}}单</span>
          <span class="section-label" style="margin-right: 20px;">赠送邀请人奖券：{{item.couponIdInviteName}}</span>
          <span class="section-label" style="margin-right: 120px;">张数：{{item.inviteCount}}</span>
          <span class="section-label" style="margin-right: 20px;">赠送新人奖券：{{item.couponIdUserName}}</span>
          <span class="section-label">张数：{{item.userCount}}</span>
        </div>
      </div>
      <div v-if="type == '04'">
        <div class="section-item" v-for="(item, index) in formData.acquireCondition" :key="index">
          <span class="section-label label-1" style="margin-right: 20px;margin-left: 90px">注册人手机授权后可收到券：{{item.couponIdUserName}}</span>
          <span class="section-label">张数：{{item.userCount}}</span>
        </div>
      </div>
    </section>
    <section>
      <h3>应用人群</h3>
      <div class="section-item">
        <span class="section-label label-1">应用人群</span>
        <span style="margin-right: 20px;">{{formData.userTypeStr}}</span>
        <div style="width: 800px;max-height: 300px;overflow: auto;">{{formData.userPhone.length ? formData.userPhone : '全部用户'}}</div>
      </div>
    </section>
    <section>
      <h3>是否短信通知</h3>
        <span class="section-label label-1">{{formData.informSign == '00' ?'是':'否'}}</span>
    </section>
    <section>
      <h3>投放端口</h3>
      <div class="section-item" v-for="(item ,index) in checkData" :key="index">
        <span class="section-label label-1" v-if="item.check">{{item.port}}：</span>
        <span v-if="item.check">{{item.label}}</span>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  components: {
  },
  data() {
    return {
      type: '',
      activityId: '',
      formData: {
        name: '',
        date: [],
        userType: '',
        period: '',
        userPhone: '',
        acquireCondition: [],
        coupon: [],
        port: [],
      },
      checkData: [
        {port: '饮食市场', label: '饮食小程序', value: '10', check: false},
        {port: '外卖市场', label: '数搭', value: '30', check: false},
        {port: '慢病市场', label: '糖三彩', value: '20', check: false},
      ],
    }
  },
  created() {
    this.activityId = this.$route.query.id;
    this.type = this.$route.query.type; // 00:下单发券，01:手动发券, 02:预定送券, 03: 新人下单送券
    this.getInfo();
  },
  methods: {
    getInfo() {
      this.$request('coupon.Hotlist/getActivityInfo', { activityId: this.activityId }).then(
        this.$rw((err, res) => {
          if (!err) {
            Object.assign(this.formData, res);
            this.formData.userPhone = this.formData.userPhone.join('，');
            this.formData.coupon.forEach(item => {
              item.type = 1;
              this.formData.acquireCondition.forEach(child => {
                if (child.guidInvite == item.guid) {
                  child.couponIdInviteName = item.couponName;
                }
                if (child.guidUser == item.guid) {
                  child.couponIdUserName = item.couponName;
                }
              });
            });
            res.port.forEach(port => {
              this.checkData.forEach(item => {
                if (item.value == port) {
                  item.check = true;
                }
              });
            });
          } else {
            this.$message({type: 'error', message: err.errMsg});
          }
        })
      );
    },
  }
}
</script>

<style lang="less" scoped>
 section {
   padding-top: 30px;
 }
.medium-input {
  width: 240px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}
.small-select {
  margin-left: 8px;
  width: 200px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  button {
    height: 30px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  min-width: 160px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3, h3 {
  margin-left: 22px;
}
.coupon {
  margin-left: 100px;
  min-height: 10px;
  width: 920px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  .coupon-item {
    width: 450px;
    min-height: 130px;
    border: 1px solid #CCCCCC;
    margin-bottom: 20px;
    padding: 10px 0;
    box-sizing: border-box;
  }
  .c-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    padding: 0 10px;
    box-sizing: border-box;
    span {
      margin-right: 10px;
      color: #409EFF;
      cursor: pointer;
      &:last-child {
        margin: 0;
      }
    }
  }
}
</style>

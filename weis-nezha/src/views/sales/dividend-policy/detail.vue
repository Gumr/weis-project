<template>
  <div class="page-container">
    <ReturnButton back />
    <section>
      <h2>基础配置</h2>
      <div class="section-item">
        <span class="section-label label-1">名称</span>
        <span class="medium-input">{{ policy.policyName }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">政策有效期</span>
        <span>{{ policy.beginTime }}</span>
        <span>-</span>
        <span>{{ policy.endTime }}</span>
        <!-- <el-date-picker
          v-model="validDate"
          start-placeholder="请输入开始时间"
          end-placeholder="请输入结束时间"
          type="daterange"
        ></el-date-picker> -->
      </div>
      <div class="section-item">
        <span class="section-label label-1">关系持续时间</span>
        <span>
          <span class="medium-input">{{ policy.durationTime }}</span>
          <span>
            个月
          </span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">状态</span>
        <span>{{ policyStateFormatter(policy.state) }}</span>
      </div>
    </section>
    <!-- <section>
      <h2>首次消费奖励</h2>
      <div class="section-item">
        <span class="section-label label-2">奖励条件</span>
        <span class="section-label label-2">午餐</span>
        <span class="section-label label-2">晚餐</span>
      </div>
      <div class="section-item">
        <span class="section-label label-2">奖励规则</span>
        <span class="section-label label-2">直接客户经理</span>
        <span class="section-label label-2">固定金额</span>
        <span>
          <span class="small-input">{{ policy.firstAward }}</span>
          <span>元</span>
        </span>
      </div>
    </section> -->
    <section>
      <h2>消费分佣配置</h2>
      <div class="section-item">
        <span class="section-label label-2">奖励规则</span>
        <span class="section-label label-2">直级客户经理</span>
        <span class="section-label label-2">提成比例</span>
        <span
          >微信支付金额<span class="small-input">{{
            policy.spendDirectBrokerWx
          }}</span
          >%</span
        >
        <span class="section-label label-3"
          >本金余额支付金额<span class="small-input">{{
            policy.spendDirectBrokerBalance
          }}</span
          >%</span
        >
      </div>
      <div class="section-item">
        <span class="section-label label-2" style="margin-left: 100px;"
          >上级客户经理</span
        >
        <span class="section-label label-2">提成比例</span>
        <span
          >微信支付金额<span class="small-input">{{
            policy.spendSuperiorBrokerWx
          }}</span
          >%</span
        >
        <span class="section-label label-3"
          >本金余额支付金额<span class="small-input">{{
            policy.spendSuperiorBrokerBalance
          }}</span
          >%</span
        >
      </div>
    </section>
    <section>
      <h2>充值分佣配置</h2>
      <div class="section-item">
        <span class="section-label label-2">奖励规则</span>
        <span class="section-label label-2">直级客户经理</span>
        <span class="section-label label-2">提成比例</span>
        <span
          >微信支付金额<span class="small-input">{{
            policy.rechargeDirectBrokerWx
          }}</span
          >%</span
        >
      </div>
      <div class="section-item">
        <span class="section-label label-2" style="margin-left: 100px;"
          >上级客户经理</span
        >
        <span class="section-label label-2">提成比例</span>
        <span
          >微信支付金额<span class="small-input">{{
            policy.rechargeSuperiorBrokerWx
          }}</span
          >%</span
        >
      </div>
    </section>
  </div>
</template>

<script>
import ReturnButton from '@/components/ReturnButton.vue';

export default {
  components: {
    ReturnButton
  },
  created() {
    if (this.$route.query.id) {
      this.getDetailData();
    }
  },
  data() {
    return {
      policy: {
        state: '00',
        policyName: '',
        beginTime: '',
        endTime: '',
        durationTime: '',
        firstAward: '',
        spendDirectBrokerWx: '',
        spendDirectBrokerBalance: '',
        spendSuperiorBrokerWx: '',
        spendSuperiorBrokerBalance: '',
        rechargeDirectBrokerWx: '',
        rechargeSuperiorBrokerWx: ''
      }
    };
  },
  methods: {
    policyStateFormatter(state) {
      return {
        '00': '无效',
        '01': '启用'
      }[state];
    },
    getDetailData() {
      this.$request('Channel/queryPolicyDetail', {
        policyId: this.$route.query.id
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.policy = data.obj.detailVo;
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.medium-input {
  width: 240px;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 12px 0;
}

.btn-footer {
  text-align: center;
}

.label-1 {
  width: 160px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3 {
  margin-left: 22px;
}
</style>

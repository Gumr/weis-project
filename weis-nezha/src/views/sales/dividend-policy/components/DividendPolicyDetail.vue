<template>
  <div class="page-container">
    <ReturnButton back />
    <section>
      <h2>基础配置</h2>
      <div class="section-item">
        <span class="section-label label-1">名称</span>
        <el-input clearable v-model="policy.policyName" class="medium-input"></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">政策有效期</span>
        <el-date-picker
          v-model="validDate"
          start-placeholder="请输入开始时间"
          end-placeholder="请输入结束时间"
          type="daterange"
          :picker-options="validDateOptions"
        ></el-date-picker>
      </div>
      <div class="section-item">
        <span class="section-label label-1">关系持续时间</span>
        <span>
          <el-input
            class="medium-input"
            clearable
            v-model="policy.durationTime"
            @keydown="catchNonIntKeydown"
          ></el-input>
          <span>个月</span>
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
          <el-input
            clearable
            v-model="policy.firstAward"
            @keydown="catchNonIntKeydown"
            class="small-input"
          ></el-input>
          <span>元</span>
        </span>
      </div>
    </section>-->
    <section>
      <h2>消费分佣配置</h2>
      <div class="section-item">
        <span class="section-label label-2">奖励规则</span>
        <span class="section-label label-2">直级客户经理</span>
        <span class="section-label label-2">提成比例</span>
        <span>
          微信支付金额
          <el-input
            v-model="policy.spendDirectBrokerWx"
            clearable
            class="small-input"
            @input="val => handlePercentInput(val, 'spendDirectBrokerWx')"
            @keydown="catchNonNumberKeydown"
          ></el-input>%
        </span>
        <span class="section-label label-3">
          本金余额支付金额
          <el-input
            v-model="policy.spendDirectBrokerBalance"
            clearable
            class="small-input"
            @input="val => handlePercentInput(val, 'spendDirectBrokerBalance')"
            @keydown="catchNonNumberKeydown"
          ></el-input>%
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-2" style="margin-left: 100px;">上级客户经理</span>
        <span class="section-label label-2">提成比例</span>
        <span>
          微信支付金额
          <el-input
            v-model="policy.spendSuperiorBrokerWx"
            clearable
            class="small-input"
            @input="val => handlePercentInput(val, 'spendSuperiorBrokerWx')"
            @keydown="catchNonNumberKeydown"
          ></el-input>%
        </span>
        <span class="section-label label-3">
          本金余额支付金额
          <el-input
            v-model="policy.spendSuperiorBrokerBalance"
            clearable
            class="small-input"
            @input="
              val => handlePercentInput(val, 'spendSuperiorBrokerBalance')
            "
            @keydown="catchNonNumberKeydown"
          ></el-input>%
        </span>
      </div>
    </section>
    <section>
      <h2>充值分佣配置</h2>
      <div class="section-item">
        <span class="section-label label-2">奖励规则</span>
        <span class="section-label label-2">直级客户经理</span>
        <span class="section-label label-2">提成比例</span>
        <span>
          微信支付金额
          <el-input
            v-model="policy.rechargeDirectBrokerWx"
            clearable
            class="small-input"
            @input="val => handlePercentInput(val, 'rechargeDirectBrokerWx')"
            @keydown="catchNonNumberKeydown"
          ></el-input>%
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-2" style="margin-left: 100px;">上级客户经理</span>
        <span class="section-label label-2">提成比例</span>
        <span>
          微信支付金额
          <el-input
            v-model="policy.rechargeSuperiorBrokerWx"
            clearable
            class="small-input"
            @input="val => handlePercentInput(val, 'rechargeSuperiorBrokerWx')"
            @keydown="catchNonNumberKeydown"
          ></el-input>%
        </span>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" @click="confirmClick">确定</el-button>
      <el-button @click="cancelClick">取消</el-button>
    </footer>
  </div>
</template>

<script>
import { transformDaterange } from '@/utils/transform';
import ReturnButton from '@/components/ReturnButton.vue';
import { validArray } from '@/utils/common';
import {
  catchNonIntKeydown,
  catchNonNumberKeydown
} from '@/utils/event-catcher';

function fixOne(val) {
  val = val.match(/^[0-9]+\.?[0-9]?/);

  return (val && val[0]) || '';
}

const StateMap = {
  '00': '无效',
  '01': '启用',
  '02': '待生效'
};

export default {
  components: {
    ReturnButton
  },
  props: ['status'],
  watch: {
    validDate(val) {
      if (validArray(val)) {
        const [beginTime, endTime] = transformDaterange(val);
        this.policy.beginTime = beginTime.format('YYYY-MM-DD');
        this.policy.endTime = endTime.format('YYYY-MM-DD');
      } else {
        this.policy.beginTime = '';
        this.policy.endTime = '';
      }
    }
  },
  data() {
    return {
      validDate: [],
      validDateOptions: {
        disabledDate: date => date < Date.now()
      },
      policy: {
        state: '01',
        policyName: '',
        beginTime: '',
        endTime: '',
        durationTime: '',
        // firstAward: '',
        spendDirectBrokerWx: '',
        spendDirectBrokerBalance: '',
        spendSuperiorBrokerWx: '',
        spendSuperiorBrokerBalance: '',
        rechargeDirectBrokerWx: '',
        rechargeSuperiorBrokerWx: '',
      }
    };
  },
  methods: {
    cancelClick() {
      this.$router.back();
    },
    queryCurrentPolicy() {
      this.$request('Channel/queryCurPolicy')
        .then(({ data }) => {
          if (data.errCode === 0) {
            data = data.obj;

            const hasPolicyInfo = data.policyInfo && Object.keys(data.policyInfo).length > 0;

            this.policy.state = hasPolicyInfo ? '02' : '01';

            if (hasPolicyInfo) {
              let { endTime, beginTime } = data.policyInfo;
              beginTime = this.$day(beginTime);
              endTime = this.$day(endTime);
              this.validDateOptions.disabledDate = date => date < Date.now() || (beginTime <= date && date <= endTime);
            }
          }
        });
    },
    policyStateFormatter(state) {
      return StateMap[state];
    },
    validatePolicy() {
      const { policy } = this;
      return Object.keys(policy).every(key => Boolean(policy[key]));
    },
    confirmClick() {
      const valid = this.validatePolicy();
      if (valid) {
        this.createPolicy();
      } else {
        this.$message({
          type: 'error',
          message: '请填写完整政策信息'
        });
      }
    },
    createPolicy() {
      this.$request('Channel/addPolicy', this.policy).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            message: '添加政策成功',
            type: 'success'
          });

          this.$router.back();
        }

        this.$errorNotify(data);
      });
    },
    handlePercentInput(val, key) {
      val = fixOne(val);

      this.policy[key] = val;
    },
    catchNonIntKeydown,
    catchNonNumberKeydown
  },
  created() {
    this.queryCurrentPolicy();
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

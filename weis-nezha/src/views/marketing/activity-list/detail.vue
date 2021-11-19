<template>
  <div class="page-container">
    <section>
      <h2>基础配置</h2>
      <el-form ref="baseForm" label-width="80px" status-icon>
        <el-form-item label="活动名称" prop="name">
          <span>{{ act.taAname }} </span>
        </el-form-item>
        <el-form-item label="起始时间" prop="date">
          <span>{{ act.taStatime }}</span>
          <span>-</span>
          <span>{{ act.taEndtime }}</span>
        </el-form-item>
      </el-form>
      <div>
        <span class="base-item-label">活动周期</span>
        <span>{{ act.taPeriod }}</span>
        <span>天</span>
      </div>
    </section>
    <section>
      <h2>充值配置</h2>
      <div
        class="display-flex pay-item-wrap"
        v-for="(item, index) in act.discounts"
        :key="index"
      >
        <div class="display-flex pay-item">
          <span class="pay-item-label" style="margin-right: 8px;"
            >充值金额</span
          >
          <span class="pay-item-label">{{ item.ssection }}</span>
          <span class="pay-item-label" style="margin: 0 8px;">{{
            "<= 值 <"
          }}</span>
          <span class="pay-item-label">{{ item.esection }}</span>
        </div>
        <div class="display-flex pay-item">
          <span class="pay-item-label" style="margin-right: 8px;"
            >赠送比例</span
          >
          <span class="pay-item-label pay-num-label">{{ item.donation }}</span>
          <span class="pay-item-label">%</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>

export default {
  components: {
  },
  created() {
    if (this.$route.query.id) {
      this.getActivityData();
    }
  },
  data() {
    return {
      act: {},
    };
  },
  methods: {
    getActivityData() {
      this.$request('BusinessActivities/getActivityInfo', {
        id: this.$route.query.id
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.act = data.obj;
          this.act.taEndtime = this.$day(Number(`${this.act.taEndtime}000`)).format('YYYY-MM-DD');
          this.act.taStatime = this.$day(Number(`${this.act.taStatime}000`)).format('YYYY-MM-DD');
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../../styles/base.less";

.pay-item {
  margin: 0 12px;
}

.pay-item-label {
  white-space: nowrap;
  line-height: 40px;
}

.pay-num-label {
  color: @danger-color;
}

.pay-item-wrap {
  margin: 12px 0;
}

.base-item-label {
  display: inline-block;
  width: 68px;
  font-size: 14px;
  padding-right: 12px;
  text-align: right;
}

.btn-footer {
  margin: 12px 0;
  text-align: center;
}
</style>

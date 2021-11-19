<template>
  <div class="page-container">
    <div class="section-item">
      <span class="section-label label-1">运费补差订单号：</span>
      <span>{{baseInfo.orderNum}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">订单编号：</span>
      <span style="width: 500px;">
        <span
          style="color: #66b1ff;cursor: pointer;margin-right: 20px;"
          @click="toDetail(item)"
          v-for="(item, index) in baseInfo.newChangeOrder[0].orders"
          :key="index"
        >{{item}}</span>
      </span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">初始地址：</span>
      <span>{{baseInfo.oldChangeOrder.length ? baseInfo.oldChangeOrder[0].receivingAddress : '无'}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">现地址：</span>
      <span>{{baseInfo.newChangeOrder.length ? baseInfo.newChangeOrder[0].receivingAddress : '无'}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">补差金额：</span>
      <span>{{baseInfo.amount}}</span>
    </div>
  </div>
</template>

<script>
  export default {
    components: {
    },
    data() {
      return {
        loading: false,
        primaryKey: '',
        baseInfo: {
          freightNum: '',
          orderNum: '',
          oldChangeOrder: [{receivingAddress: ''}],
          newChangeOrder: [{receivingAddress: ''}],
          amount: ''
        }
      }
    },
    created() {
      this.primaryKey = this.$route.query.id;
      this.getInfo();
    },
    methods: {
      async getInfo() {
        const res = await this.$http('FreightPriceSpread/freightInfo', {primaryKey: this.primaryKey});
        if (!res.errMsg) {
          Object.assign(this.baseInfo, res.obj);
        } else {
          this.$msg(res.errMsg, 'error');
        }
      },
      toDetail(id) {
        this.$router.push({
          path: `/business/dish/order-list/detail`,
          query: {
            id,
          }
        });
      }
    }
  }
</script>

<style lang="less" scoped>
</style>

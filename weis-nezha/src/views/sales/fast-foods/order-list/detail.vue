<template>
  <div class="page-container">
    <section>
      <h3>基本信息</h3>
      <div class="section-item">
        <span class="section-label label-1">订单编码：</span>
        <span class="section-label lablel-2">{{baseInfo.orderId}}</span>
        <span class="section-label label-1">订单类型：</span>
        <span>{{baseInfo.orderTypeDesc}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">下单时间：</span>
        <span class="section-label lablel-2">{{baseInfo.ctime}}</span>
        <span class="section-label label-1">支付时间：</span>
        <span>{{baseInfo.payTime}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">下单人ID：</span>
        <span class="section-label lablel-2">{{baseInfo.uid}}</span>
        <span class="section-label label-1">下单人昵称：</span>
        <span>{{baseInfo.uname}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">下单人角色：</span>
        <span class="section-label lablel-2">{{baseInfo.roleDesc}}</span>
        <span class="section-label label-1">员工姓名：</span>
        <span>{{baseInfo.corpUserName}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">下单人企业：</span>
        <span class="section-label lablel-2">{{baseInfo.corpName}}</span>
        <span class="section-label label-1">当前状态：</span>
        <span>{{baseInfo.sttDesc}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">配送地址：</span>
        <span class="section-label lablel-2">{{baseInfo.address}}</span>
        <span class="section-label label-1">配送加热点：</span>
        <span>{{baseInfo.heatPointName}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">承包人：</span>
        <span class="section-label lablel-2">{{baseInfo.weisName}}</span>
        <span class="section-label label-1">承包人手机：</span>
        <span>{{baseInfo.weisPhone}}</span>
      </div>
    </section>
    <section>
      <h3>金额信息</h3>
      <div class="section-item">
        <span class="section-label label-1">订单商品金额：</span>
        <span class="section-label lablel-2">{{baseInfo.accountsPrice}}</span>
        <span class="section-label label-1">实际支付金额：</span>
        <span class="section-label lablel-2">{{baseInfo.actualPrice}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">折扣力度：</span>
        <span class="section-label lablel-2">{{baseInfo.discount}}</span>
        <span class="section-label label-1">配送费：</span>
        <span>{{baseInfo.deliveryPrice}}</span>
      </div>
      <div class="section-item">       
        <span class="section-label label-1">补贴金额：</span>
        <span>{{baseInfo.couponAmount}}</span>
      </div>
    </section>
    <section>
      <h3>商品信息</h3>
      <div class="section-item">
        <span class="section-label label-1">套餐菜品：</span>
        <BasePageTable
          :data="baseInfo.skuInfo"
          :visible="false"
          border>
          <el-table-column
            v-for="col in tableCol"
            :key="col.prop"
            v-bind="col"
          ></el-table-column>
        </BasePageTable>
      </div>
    </section>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
export default {
  components: {
    BasePageTable
  },
  data() {
    return {
      orderId: '',
      baseInfo: {},
      tableCol: [
        { label: '序号', type: 'index', width: '80' },
        { label: '商品名称', prop: 'comboName', width: '120' },
        { label: '内容', prop: 'comboContent', width: '120' },
        { label: '数量', prop: 'num', width: '120' },
        { label: '单价', prop: 'price', width: '120' },
        { label: '总价', prop: 'totalPrice', width: '120' },
      ],
    }
  },
  created() {
    this.orderId = this.$route.query.id;
    this.getInfo();
  },
  methods: {
    async getInfo() {
      const res = await this.$http('groupmeal.Order/queryOrderById', { orderId: this.orderId });
      this.baseInfo = res.obj;
    }
  }
}
</script>

<style lang="less" scoped>
.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  min-height: 30px;
  flex-wrap: wrap;
  button {
    height: 38px;
    line-height: 5px;
  }
}
.section-label {
  display: inline-block;
}
.actions-wrap {
  text-align: center;
}



.display-flex p:first-child {
  margin-right: 4%;
}
.label-1 {
  width: 150px;
  text-align-last: right;
}
.lablel-2{
  width: 350px;
  margin-right: 30px;
}
</style>

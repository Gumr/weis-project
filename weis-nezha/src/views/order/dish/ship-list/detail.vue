<template>
  <div class="page-container">
    <section>
      <h3>配送单信息</h3>
      <div class="section-item">
        <span class="section-label label-1">配送单ID：{{infolist.shipOrderId}}</span>
        <span class="section-label label-1">关联支付单ID：{{infolist.payNum}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">包含餐单数：{{infolist.orderNum}}</span>
        <span class="section-label label-1">
          餐单明细：
          <span style="color: #409EFF;cursor: pointer;" @click="shipInfo">明细</span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">当前状态：{{infolist.orderStt}}</span>
      </div>
    </section>
    <section>
      <h3>配送信息</h3>
      <div class="section-item">
        <span class="section-label label-1">收货人姓名：{{infolist.uname}}</span>
        <span class="section-label label-1">收货人手机：{{infolist.phone}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">配送日期：{{infolist.shipTime}}</span>
        <span class="section-label label-1" style="width: 600px;">配送地址：{{infolist.shipAddres}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">送餐加热点：{{infolist.heatedPoint}}</span>
        <span class="section-label label-1">加热点店长手机：{{infolist.heatedPointPhone}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">配送类型：{{infolist.shipType}}</span>
        <span class="section-label label-1">配送公司：{{infolist.shipCompany}}</span>
      </div>
    </section>
    <section>
      <h3>配送支付信息</h3>
      <div class="section-item">
        <span class="section-label label-1">配送费：{{infolist.shipPrice}}</span>
        <span class="section-label label-1">最终补差金额：{{infolist.operationPrice}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">实际支付配送费：{{infolist.actualPrice}}</span>
      </div>
    </section>
    <section>
      <h3>关联运费补差信息</h3>
      <BasePageTable :data="infolist.changeOrder" :visible="false" border>
        <el-table-column label="序号" type="index" width="50"></el-table-column>
        <el-table-column label="补差单号" prop="changeNum"></el-table-column>
        <el-table-column label="补差配送单号" prop="orderNum"></el-table-column>
        <el-table-column label="补差金额" prop="changePrice"></el-table-column>
        <el-table-column label="支付方式" prop="payType"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ row }">
            <span style="color: #409EFF;cursor: pointer;" @click="toChangeList(row.changeId)">详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </section>
    <ConfirmDialog
      v-model="box"
      :title="title"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="false"
      @on-confirm="onConfirm"
    >
      <BasePageTable :data="tableData" :visible="false" border>
        <el-table-column label="序号" type="index" width="50"></el-table-column>
        <el-table-column label="餐单号" prop="orderId">
          <template v-slot="{ row }">
            <span
              style="color: #409EFF;cursor: pointer;"
              @click="toOrderList(row.orderId)"
            >{{row.orderId}}</span>
          </template>
        </el-table-column>
        <el-table-column label="餐别" prop="category"></el-table-column>
        <el-table-column label="当前状态" prop="orderStt"></el-table-column>
        <el-table-column label="用餐日期" prop="shipTime"></el-table-column>
        <el-table-column label="收货人姓名" prop="uname"></el-table-column>
        <el-table-column label="收货人手机" prop="phone"></el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import BasePageTable from '@/components/BasePageTable.vue';
export default {
  components: {
    ConfirmDialog,
    BasePageTable
  },
  data() {
    return {
      box: false,
      title: '',
      infolist: {},
      tableData: [],
    }
  },
  created() {
    this.getInfo()
  },
  methods: {
    async getInfo() {
      const res = await this.$http('OrderManage/getShipOrderInfo', {shipOrderId: this.$route.query.shipOrderId});
      this.infolist = res.obj;
    },
    async shipInfo() {
      const res = await this.$http('OrderManage/getOrderForShipOrder', {shipOrderId: this.$route.query.shipOrderId});
      this.tableData = res.obj;
      this.title = '餐单明细';
      this.box = true;
    },
    onConfirm() {
      this.box = false;
    },
    toOrderList(orderId) {
      this.$router.push({
        path: `/business/dish/order-list/detail`,
        query: {
          id: orderId,
        }
      });
    },
    toChangeList(id) {
      this.$router.push({
        path: `/business/dish/freight-price/detail`,
        query: {
          id: id,
        }
      });
    }
  }
}
</script>

<style lang="less" scoped>
.label-1 {
  text-align-last: left;
  text-indent: 50px;
  min-width: 450px;
}
</style>

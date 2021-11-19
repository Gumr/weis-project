<template>
  <div class="page-container">
    <section>
      <h3>支付单信息</h3>
      <div class="section-item">
        <span class="section-label label-1">支付单ID：{{infolist.payNum}}</span>
        <span class="section-label label-2"></span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">包含配送单数：{{infolist.distributionCount}}</span>
        <span class="section-label label-1">
          配送单明细：
          <span style="color: #409EFF;cursor: pointer;" @click="shipInfo">明细</span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">餐单数：{{infolist.menuCount}}</span>
        <span class="section-label label-1">
          餐单明细：
          <span style="color: #409EFF;cursor: pointer;" @click="transferInfo">明细</span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">当前状态：{{infolist.orderStt}}</span>
        <span class="section-label lablel-2"></span>
      </div>
    </section>
    <section>
      <h3>支付信息</h3>
      <div class="section-item">
        <span class="section-label label-1">支付人昵称：{{infolist.uname}}</span>
        <span class="section-label label-1">支付人手机：{{infolist.phone}}</span>
        <span></span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">支付时间：{{infolist.payTime}}</span>
        <span class="section-label label-1">订单金额：{{infolist.orderAmount}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">最终配送费：{{infolist.distributionAmount}}</span>
        <span class="section-label label-1">合计应付：{{infolist.oughtAmount}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">折扣金额：{{infolist.discount}}</span>
        <span class="section-label label-1">优惠券抵扣：{{infolist.couponAmount}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">实际支付金额：{{infolist.actualAmount}}</span>
      </div>
    </section>
    <section>
      <h3>关联餐单退单信息</h3>
      <BasePageTable :data="infolist.orderRefund" :visible="false" border>
        <el-table-column label="序号" type="index" width="50"></el-table-column>
        <el-table-column label="退款单号" prop="refundNum"></el-table-column>
        <el-table-column label="餐单号" prop="orderNum"></el-table-column>
        <el-table-column label="退单金额" prop="refundPrice"></el-table-column>
        <el-table-column label="退单类型" prop="refundTypeStr"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ row }">
            <span
              style="color: #409EFF;cursor: pointer;"
              @click="toRefundList(row.refundId, row.refundType)"
            >详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </section>
    <section>
      <h3>关联运费单退单信息</h3>
      <BasePageTable :data="infolist.orderShipRefund" :visible="false" border>
        <el-table-column label="序号" type="index" width="50"></el-table-column>
        <el-table-column label="退款单号" prop="refundNum"></el-table-column>
        <el-table-column label="运费单单号" prop="orderNum"></el-table-column>
        <el-table-column label="退单金额" prop="refundPrice"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ row }">
            <span style="color: #409EFF;cursor: pointer;" @click="toShipList(row.shipNum)">详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
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
        <el-table-column label="配送单号" prop="orderId" key="orderId_ship" v-if="title == '配送单明细'">
          <template v-slot="{ row }">
            <span
              style="color: #409EFF;cursor: pointer;"
              @click="toShipList(row.orderId)"
            >{{row.orderId}}</span>
          </template>
        </el-table-column>
        <el-table-column label="当前状态" prop="orderStt" key="orderStt_ship" v-if="title == '配送单明细'"></el-table-column>
        <el-table-column label="收货人姓名" prop="uname" key="uname_ship" v-if="title == '配送单明细'"></el-table-column>
        <el-table-column label="收货人手机" prop="phone" key="phone_ship" v-if="title == '配送单明细'"></el-table-column>
        <!-- 餐单 -->
        <el-table-column label="餐单号" prop="orderId" key="orderId_pay" v-if="title == '餐单明细'">
          <template v-slot="{ row }">
            <span
              style="color: #409EFF;cursor: pointer;"
              @click="toOrderList(row.orderId)"
            >{{row.orderId}}</span>
          </template>
        </el-table-column>
        <el-table-column label="餐别" prop="category" key="category_pay" v-if="title == '餐单明细'"></el-table-column>
        <el-table-column label="当前状态" prop="orderStt" key="orderStt_pay" v-if="title == '餐单明细'"></el-table-column>
        <el-table-column label="用餐日期" prop="shipTime" key="shipTime_pay" v-if="title == '餐单明细'"></el-table-column>
        <el-table-column label="收货人姓名" prop="uname" key="uname_pay" v-if="title == '餐单明细'"></el-table-column>
        <el-table-column label="收货人手机" prop="phone" key="phone_pay" v-if="title == '餐单明细'"></el-table-column>
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
      const res = await this.$http('OrderManage/getPayOrderInfo', {payNum: this.$route.query.payNum});
      this.infolist = res.obj;
    },
    async shipInfo() {
      this.title = '配送单明细';
      this.box = true;
      const res = await this.$http('OrderManage/getOrderForShip', {payNum: this.$route.query.payNum});
      this.tableData = res.obj;
    },
    async transferInfo() {
      this.title = '餐单明细';
      this.box = true;
      const res = await this.$http('OrderManage/getOrderForTransfer', {payNum: this.$route.query.payNum});
      this.tableData = res.obj;
    },
    onConfirm() {
      this.box = false;
    },
    toShipList(orderId) {
      this.$router.push({
        path: `/business/dish/ship-list/detail`,
        query: {
          shipOrderId: orderId,
        }
      });
    },
    toOrderList(orderId) {
      this.$router.push({
        path: `/business/dish/order-list/detail`,
        query: {
          id: orderId,
        }
      });
    },
    toRefundList(id, type) {
      this.$router.push({
        path: `/business/dish/refund-list/after-sales`,
        query: {
          id: id,
          status: 0,
          type
        }
      });
    },
    toChangeList(id) {
      this.$router.push({
        path: `/business/dish/freight-list/detail`,
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

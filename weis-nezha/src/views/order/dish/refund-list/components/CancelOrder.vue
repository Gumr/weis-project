<template>
  <div class="page-container">
    <section class="page-section">
      <h3 class="section-title">取消订单基本信息</h3>
      <table
        class="el-table el-table--border el-table__body"
        border="0"
        cellpadding="0"
        cellspacing="0"
      >
        <tbody>
          <tr class="el-table__row">
            <td>申请人</td>
            <td>{{ order.uname }}</td>
            <td>手机号</td>
            <td>{{ order.phone }}</td>
          </tr>
          <tr class="el-table__row">
            <td>对应加热点</td>
            <td>{{ order.heatingPoint }}</td>
            <td>负责人电话</td>
            <td>{{ order.shopPhone }}</td>
          </tr>
          <tr class="el-table__row">
            <td>申请时间</td>
            <td>{{ order.ctime }}</td>
            <td>退单类型</td>
            <td>{{ formatReturnType(order.refundType) }}</td>
          </tr>
          <tr class="el-table__row">
            <td>退款方式</td>
            <td colspan="3">{{ order.backWay }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="page-section">
      <h3 class="section-title">原订单基本信息</h3>
      <table
        class="el-table el-table--border el-table__body"
        border="0"
        cellpadding="0"
        cellspacing="0"
      >
        <tbody>
          <tr class="el-table__row">
            <td>配送单编码</td>
            <td>{{ order.orderId }}</td>
            <td>关联点餐订单编码</td>
            <td>{{ order.shipOrderId }}</td>
          </tr>
          <tr class="el-table__row">
            <td>订单菜品金额</td>
            <td>{{ order.orderAmount }}元</td>
            <td>配送费</td>
            <td>{{ order.shipFee }}元</td>
          </tr>
          <tr class="el-table__row">
            <td>合计应付</td>
            <td>{{ order.totalAmount }}元</td>
            <td>实付</td>
            <td>{{ order.actualAmount }}元</td>
          </tr>
          <tr class="el-table__row">
            <td>支付方式</td>
            <td>{{ order.payWay }}</td>
            <td>支付明细</td>
            <td>
              <span style="margin-right: 12px;">本金支付:{{ order.rechargeAmount || 0 }}</span>
              <span>赠送金支付:{{ order.discountAmount || 0 }}</span>
            </td>
          </tr>

          <tr class="el-table__row">
            <td>下单人ID</td>
            <td>{{ order.uid }}</td>
            <td>下单人手机</td>
            <td>{{ order.uphone }}</td>
          </tr>
          <tr class="el-table__row">
            <td>配送时间</td>
            <td>{{ order.shipTime }}</td>
            <td>收货地址</td>
            <td>{{ order.address }}</td>
          </tr>
          <tr class="el-table__row">
            <td>配送单类别</td>
            <td>{{ order.category }}</td>
            <td>配送单状态</td>
            <td>{{ order.shipStt }}</td>
          </tr>
        </tbody>
      </table>

      <div>
        <h4>商品详情</h4>
        <el-table :data="order.orderSku" border>
          <el-table-column v-for="col in skuCols" v-bind="col" :key="col.prop"></el-table-column>
        </el-table>
      </div>
    </section>

    <section class="page-section">
      <h3 class="section-title">退单费用</h3>
      <table
        class="el-table el-table--border el-table__body"
        border="0"
        cellpadding="0"
        cellspacing="0"
      >
        <tbody>
          <tr class="el-table__row">
            <td>本金</td>
            <td>{{ order.rechargeAmount || 0 }}元</td>
            <td>赠送金</td>
            <td>{{ order.discountAmount || 0 }}元</td>
          </tr>
          <tr class="el-table__row">
            <td>合计</td>
            <td colspan="3">{{ order.refundTotal || 0 }}元</td>
          </tr>
        </tbody>
      </table>
    </section>

    <footer class="btn-footer" v-if="mode === 'review'">
      <el-button type="success" @click="successClick">通过退款</el-button>
      <el-button type="warning" @click="rejectClick">驳回退款</el-button>
    </footer>

    <ConfirmDialog
      v-model="rejectVisible"
      title="确认驳回"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="handleRejectConfirm"
    >
      <el-input ref="reject" type="textarea" v-model="rejectMessage" :rows="4" maxlength="50"></el-input>
    </ConfirmDialog>
  </div>
</template>

<script>
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { categoryMap, returnTypeMap } from '@/utils/data-map';

export default {
  components: {
    ConfirmDialog
  },
  props: ['id', 'mode'],
  data() {
    return {
      type: '',
      rejectVisible: false,
      rejectMessage: '',
      skuCols: [{
        label: '序号',
        type: 'index'
      }, {
        label: '菜品编码',
        prop: 'sku'
      }, {
        label: '菜品名称',
        prop: 'skuname'
      }, {
        label: '餐别',
        prop: 'category',
        formatter: row => categoryMap[row.category]
      }, {
        label: '送餐日期',
        prop: 'shipDate',
        formatter: () => this.order.shipTime
      }, {
        label: '规格',
        prop: 'quality'
      }, {
        label: '订货量',
        prop: 'number'
      }, {
        label: '单价（元）',
        prop: 'price'
      }, {
        label: '订单金额',
        prop: 'total',
        formatter: row => +row.price * row.number
      }],
      order: {}
    };
  },
  methods: {
    formatReturnType(type) {
      return returnTypeMap[type];
    },
    successClick() {
      this.$request('refund.Refund/auditRefund', {
        torlId: this.id,
        opType: '10'
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: 'success',
            message: '通过退款成功'
          });

          this.$router.back();
        }
      });
    },
    rejectClick() {
      this.rejectMessage = '';
      this.rejectVisible = true;

      this.$nt(() => {
        this.$refs.reject.focus();
      });
    },
    handleRejectConfirm() {
      if (!this.rejectMessage) {
        this.$message({
          type: 'error',
          message: '请输入驳回原因'
        });
        return;
      }

      this.rejectOrder();
    },
    rejectOrder(done) {
      this.$request('refund.Refund/auditRefund', {
        torlId: this.id,
        opType: '20',
        reason: this.rejectMessage
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: 'success',
            message: '驳回退款成功'
          });
          this.$nt(() => {
            setTimeout(() => {
              done();
            }, 800);
          })
          this.$router.back();
        } else {
          done();
        }
      });
    },
    getOrderData() {
      this.$request('refund.Refund/queryRefundDetail', {
        torlId: this.id,
        torlType: this.type
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.order = data.obj.detailVo;
        }
      });
    }
  },
  created() {
    const { query } = this.$route;
    this.type = query && query.type;
    this.getOrderData();
  }
};
</script>

<style lang="less" scoped>
@import "../../../../../styles/base.less";

.el-table__row td {
  padding-left: 8px;
}

.page-section {
  margin: 14px 0;
}

.section-title {
  text-align: center;
  margin: 0;
  padding: 1em;
  background-color: @level4-border;
}

.btn-footer {
  margin: 12px 0;
  text-align: center;
}
</style>

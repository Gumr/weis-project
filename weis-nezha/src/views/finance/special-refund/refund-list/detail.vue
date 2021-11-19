<template>
  <div class="page-container">

    <section>
      <h3>基础信息</h3>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>配送单编码：</span>
          <span>{{ orderbasics.tdotOrderId }}</span>
        </el-col>
        <el-col :span="8">
          <span>关联点餐订单编码：</span>
          <span>{{ orderbasics.tdotSoid }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>下单人ID：</span>
          <span>{{ orderbasics.tdotUid }}</span>
        </el-col>
        <el-col :span="8">
          <span>下单人姓名：</span>
          <span>{{ orderbasics.uname }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>下单人手机：</span>
          <span>{{ orderbasics.phone }}</span>
        </el-col>
        <el-col :span="8">
          <span>订单类别：</span>
          <span>{{ orderbasics.tdotDistributionMode }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>餐别：</span>
          <span>{{ orderbasics.tdotCategory }}</span>
        </el-col>
        <el-col :span="8">
          <span>当前状态：</span>
          <span>{{ orderbasics.tdotOrderStt }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>所属加热点：</span>
          <span>{{ orderbasics.thpName }}</span>
        </el-col>
        <el-col :span="8">
          <span>店长电话：</span>
          <span>{{ orderbasics.thpShopTel }}</span>
        </el-col>
      </el-row>
    </section>

    <el-divider></el-divider>

    <section>
      <h3>配送/自取信息</h3>
      <el-row class="el-row">
        <el-col>
          <span>自取人昵称：</span>
          <span>{{ orderbasics.uname }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>收货人姓名：</span>
          <span>{{ orderbasics.tdotConsignee }}</span>
        </el-col>
        <el-col :span="8">
          <span>收货人手机：</span>
          <span>{{ orderbasics.tdotContactNumber }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>收货日期：</span>
          <span>{{ orderbasics.tdotDate }}</span>
        </el-col>
        <el-col :span="8">
          <span>期望收货时间：</span>
          <span>{{ orderbasics.tdotMealTakingTime }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row">
        <el-col>
          <span>收货地址：</span>
          <span>{{
            orderbasics.tdotDistributionModeNum === "0"
              ? orderbasics.tdotReceivingAddress
              : orderbasics.thpShopAddress
          }}</span>
        </el-col>
      </el-row>
    </section>

    <el-divider></el-divider>

    <section>
      <h3>支付信息</h3>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>订单菜品金额：</span>
          <span>{{ orderPay.tdotOrderPrice }}</span>
        </el-col>
        <el-col :span="8">
          <span>配送费：</span>
          <span>{{ orderPay.tdotFoodDeliveryPrice }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>使用券：</span>
          <span style="margin-right: 12px;">{{ orderPay.tcuName }}</span>
          <span>券面金额{{ orderPay.tcuAmount }}</span>
        </el-col>
        <el-col :span="8">
          <span>抵扣金额：</span>
          <span>{{ orderPay.tdotCouponAmount }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>合计应付：</span>
          <span>{{ orderPay.tdotAccountsPay }}</span>
        </el-col>
        <el-col :span="8">
          <span>折扣：</span>
          <span>{{ orderPay.tdotDiscount }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>实际支付：</span>
          <span>{{ orderPay.tdotActualPrice }}</span>
        </el-col>
        <el-col :span="8">
          <span>支付方式：</span>
          <span>{{ orderPay.tdotPayWay }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col>
          <span>支付金额：</span>
          <span style="margin-right: 12px;">
            <span>本金支付:</span>
            <span>{{ orderPay.tdotPaidPrincipal }}</span>
          </span>
          <span>
            <span>赠送金支付:</span>
            <span>{{ orderPay.tdotPaidGiftPrice }}</span>
          </span>
        </el-col>
      </el-row>
    </section>

    <el-divider></el-divider>

    <section>
      <h3>分佣信息</h3>
      <el-row class="el-row">
        <el-col :span="8"
          ><span>所属客户经理姓名：</span
          ><span>{{ orderPay.counselorName }}</span></el-col
        >
        <el-col :span="8"
          ><span>客户经理ID：</span
          ><span>{{ orderPay.counselorId }}</span></el-col
        >
        <el-col :span="8"
          ><span>分佣金额：</span
          ><span>{{ orderPay.royaltyIncome }}</span></el-col
        >
      </el-row>
      <el-row class="el-row">
        <el-col :span="8"
          ><span>上级客户经理姓名：</span
          ><span>{{ orderPay.parentCounselorName }}</span></el-col
        >
        <el-col :span="8"
          ><span>客户经理ID：</span
          ><span>{{ orderPay.parentCounselorId }}</span></el-col
        >
        <el-col :span="8"
          ><span>分佣金额：</span
          ><span>{{ orderPay.parentRoyaltyIncome }}</span></el-col
        >
      </el-row>
    </section>

    <el-divider></el-divider>

    <section>
      <h3>商品详情</h3>
      <el-table ref="table" :data="orderdetail" border stripe>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="菜品编码" prop="tfsCid"></el-table-column>
        <el-table-column label="菜品名称" prop="tfsSkuname" align="center">
        </el-table-column>
        <el-table-column label="规格" prop="tfsQuality" width="160">
          <template v-slot="{ row }">
            {{ row.tfsQuality + row.tfsUnit }}/份
          </template>
        </el-table-column>
        <el-table-column
          label="订货量"
          prop="tdodNum"
          align="center"
        ></el-table-column>
        <el-table-column label="单价(元)" prop="tdodPrice"></el-table-column>
        <el-table-column
          label="订单金额"
          prop="tdodTotalPrice"
        ></el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script>
import { dinnerOptions } from '@/utils/data-map';

export default {
  components: {
  },
  props: {
    routeQuery: {
      type: Object
    }
  },
  created() {
    this.getload();
  },
  data() {
    return {
      orderbasics: {},
      orderPay: {},
      orderdetail: [],
      catalogOptions: [
        {
          label: '营养素',
          value: '1'
        },
        {
          label: '食物',
          value: '2'
        }
      ],
      dinnerOptions
    };
  },
  methods: {
    getload() {
      this.$request('refund.SpecialRefund/get', {
        orderId: this.$route.query.id
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.orderbasics = res.orderbasics;
            this.orderPay = res.orderPay;
            this.orderdetail = res.orderdetail;
          }
        })
      );
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../../../styles/base";

.actions-wrap {
  text-align: center;
}

.step-bar-wrap {
  padding: 24px 18px;
  background-color: @level4-border;
}

.display-flex p:first-child {
  margin-right: 4%;
}

.el-row {
  margin: 12px 0;
  padding-left: 10%;
}
</style>

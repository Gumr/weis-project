<template>
  <div class="page-container">
    <section>
      <h3>基础信息</h3>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>餐单编码：</span>
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
          <span>{{ orderbasics.uname }}(历史下单数{{ historyNum }})</span>
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
          <span>订单端口：</span>
          <span>{{ orderbasics.source }}</span>
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
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>当前状态：</span>
          <span>{{ orderbasics.tdotOrderStt }}</span>
        </el-col>
        <el-col :span="8">
          <span>下单人来源：</span>
          <span>{{ orderbasics.channel }}</span>
        </el-col>
      </el-row>
      <el-row
        class="el-row"
        :gutter="20"
        v-if="orderbasics.tdotPlanName != 'null' && orderbasics.tdotPlanName"
      >
        <el-col :span="8">
          <span>玩法：</span>
          <span>{{ orderbasics.tdotPlanName }}</span>
        </el-col>
      </el-row>
    </section>
    <el-divider></el-divider>
    <section>
      <h3>配送/自取信息</h3>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
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
      <el-row class="el-row" :gutter="20" v-if="freight.freightNum">
        <el-col>
          <span>当前运费补差单：</span>
          <span>{{ freight.freightNum }}</span>
          <span
            style="cursor: pointer; color: #409eff; margin-left: 10px"
            @click="toDetail"
            >详情</span
          >
        </el-col>
      </el-row>
      <el-row class="el-row">
        <el-col>
          <span>收货地址：</span>
          <span>
            {{
              orderbasics.tdotDistributionModeNum == '0'
                ? orderbasics.tdotReceivingAddress
                : orderbasics.tdotDistributionModeNum == '2'
                ? orderbasics.tdotReceivingAddress
                : orderbasics.thpShopAddress
            }}
          </span>
        </el-col>
      </el-row>
    </section>

    <el-divider></el-divider>

    <section>
      <h3>支付信息</h3>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>餐单菜品合计金额：</span>
          <span>{{ orderPay.tdotOrderPrice }}</span>
        </el-col>
        <el-col :span="8">
          <span>关联配送单支付金额：</span>
          <span>{{ orderPay.tdotFoodDeliveryPrice }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>预订奖励金额：</span>
          <span style="margin-right: 12px">{{
            orderPay.tdotAdvanceRewards
          }}</span>
        </el-col>
        <el-col :span="8">
          <span>折扣抵扣金额：</span>
          <span>{{ orderPay.tdotDiscountAmount }}</span>
        </el-col>

        <!-- <el-col :span="8">
          <span>餐单的配送金额：</span>
          <span>{{ orderPay.disPrice }}</span>
        </el-col> -->
        <!-- <el-col :span="8">
          <span>补差金额：</span>
          <span>{{ freight.amount }}</span>
        </el-col>-->
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>优惠券抵扣金额：</span>
          <span>{{ orderPay.tdotCouponAmount }}</span>
        </el-col>
        <el-col :span="8">
          <span>维士红包抵扣金额：</span>
          <span>{{ orderPay.tdotRedAmount }}</span>
        </el-col>

        <!-- <el-col :span="8">
          <span>餐单的配送本金金额：</span>
          <span>{{ orderPay.disPrincipalPrice }}</span>
        </el-col> -->
      </el-row>
      <el-row class="el-row" :gutter="20">
        <!-- <el-col :span="8">
          <span>餐单的配送赠送金额：</span>
          <span>{{ orderPay.disGiftPrice }}</span>
        </el-col> -->
      </el-row>
      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>使用券:</span>
          <span>{{ orderPay.tcuName }} {{ orderPay.tcuAmount }}</span>
        </el-col>
        <el-col :span="8">
          <span>实付金额（不含配送费）：</span>
          <span>{{ orderPay.tdotActualPrice }}</span>
        </el-col>
      </el-row>

      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>享受折扣:</span>
          <span>{{ orderPay.tdotDiscount }}</span>
        </el-col>

        <el-col :span="8">
          <span>实付本金（不含配送费）：</span>
          <span>{{ orderPay.tdotPaidPrincipal }}</span>
        </el-col>
      </el-row>

      <el-row class="el-row" :gutter="20">
        <el-col :span="8">
          <span>支付方式:</span>
          <span>{{ orderPay.tdotPayWay }}</span>
        </el-col>
        <el-col :span="8">
          <span>实付赠送金（不含配送费）：</span>
          <span>{{ orderPay.tdotPaidGiftPrice }}</span>
        </el-col>
      </el-row>

      <el-row class="el-row" :gutter="20"> </el-row>
    </section>

    <el-divider></el-divider>

    <section>
      <h3>分佣信息</h3>
      <el-row class="el-row">
        <el-col :span="8">
          <span>所属客户经理姓名：</span>
          <span>{{ orderPay.counselorName }}</span>
        </el-col>
        <el-col :span="8">
          <span>客户经理ID：</span>
          <span>{{ orderPay.counselorId }}</span>
        </el-col>
        <el-col :span="8">
          <span>分佣金额：</span>
          <span>{{ orderPay.royaltyIncome }}</span>
        </el-col>
      </el-row>
      <el-row class="el-row">
        <el-col :span="8">
          <span>上级客户经理姓名：</span>
          <span>{{ orderPay.parentCounselorName }}</span>
        </el-col>
        <el-col :span="8">
          <span>客户经理ID：</span>
          <span>{{ orderPay.parentCounselorId }}</span>
        </el-col>
        <el-col :span="8">
          <span>分佣金额：</span>
          <span>{{ orderPay.parentRoyaltyIncome }}</span>
        </el-col>
      </el-row>
    </section>

    <el-divider></el-divider>

    <section>
      <h3>商品详情</h3>
      <el-table ref="table" :data="orderdetail" border stripe>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="菜品编码" prop="tfsCid"></el-table-column>
        <el-table-column
          label="菜品名称"
          prop="tfsSkuname"
          align="center"
        ></el-table-column>
        <el-table-column label="规格" prop="tfsQuality" width="160">
          <template v-slot="{ row }"
            >{{ row.tfsQuality + row.tfsUnit }}/份</template
          >
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
    <ConfirmDialog
      v-model="hasDialog"
      title="详情"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <BasePageTable height="200" :visible="false" :data="tableData" border>
        <el-table-column label="序号" type="index" width="50"></el-table-column>
        <el-table-column label="单号" prop="freightNum"></el-table-column>
        <el-table-column label="操作" fixed="right" align="center">
          <template v-slot="{ row }">
            <span class="brand-color cursor-pointer" @click="toDetailPage(row)"
              >详情</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { dinnerOptions } from '@/utils/data-map'

export default {
  components: {
    ConfirmDialog,
    BasePageTable,
  },
  props: {
    routeQuery: {
      type: Object,
    },
  },
  created() {
    this.getload()
  },
  data() {
    return {
      hasDialog: false,
      historyNum: '',
      freight: {},
      tocid: [],
      orderbasics: {},
      orderPay: {},
      orderdetail: [],
      catalogOptions: [
        {
          label: '营养素',
          value: '1',
        },
        {
          label: '食物',
          value: '2',
        },
      ],
      dinnerOptions,
      tableData: [],
    }
  },
  methods: {
    async getload() {
      const res = await this.$http('OrderManage/orderDetailsInfo', {
        orderId: this.$route.query.id,
      })
      if (!res.errMsg) {
        this.orderbasics = res.obj.orderbasics
        this.orderPay = res.obj.orderPay
        this.orderdetail = res.obj.orderdetail
        this.freight = res.obj.freight || {}
        this.historyNum = res.obj.historyNum
        res.obj.tocid.forEach((item) => {
          Object.entries(item).forEach((item) => {
            this.tocid.push({ freightNum: item[1], primaryKey: item[0] })
          })
        })
      }
    },
    async toDetail() {
      this.tableData = this.tocid
      this.hasDialog = true
    },
    toDetailPage(row) {
      this.$router.push({
        path: `/business/dish/freight-list/detail`,
        query: {
          id: row.primaryKey,
        },
      })
    },
    onconfirm() {
      this.hasDialog = false
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../styles/base';

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
  padding-left: 30px;
  font-size: 14px;
}
</style>

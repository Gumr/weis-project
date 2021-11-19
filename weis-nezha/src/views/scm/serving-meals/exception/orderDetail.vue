<template>
  <div class="page-container">
    <section>
      <h3>订单详情</h3>
      <div>
        <div class="display-flex">
          <p class="label-1">
            <span>配送单编码：</span> <span>{{ baseInfo.tdotOrderId }}</span>
          </p>
          <p class="label-1">
            <span>关联点餐订单编码：</span><span>{{ baseInfo.tdotSoid }} </span>
          </p>
        </div>
        <div class="display-flex">
          <p class="label-1">
            <span> 订单菜品金额：</span
            ><span>{{ baseInfo.tdotOrderPrice }}</span>
          </p>
          <p class="label-1">
            <span> 配送费：</span
            ><span>{{ baseInfo.tdotFoodDeliveryPrice }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p class="label-1">
            <span>合计应付：</span>
            <span>{{
              +baseInfo.tdotOrderPrice + +baseInfo.tdotFoodDeliveryPrice
            }}</span>
          </p>

          <p class="label-1">
            <span>实付：</span>
            <span>{{ baseInfo.tdotActualPrice || 0 }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p class="label-1">
            <span>支付方式：</span><span>{{ baseInfo.tdotPayWay }}</span>
          </p>
          <p class="label-1">
            <span>支付明细：</span>
            <span style="margin-right: 12px;"
              >{{baseInfo.tdotPayWay}}支付 {{ baseInfo.tcfAmount }}</span
            >
            <span>赠送金支付 {{ baseInfo.tcfDonation }}</span>
          </p>
        </div>
      </div>
      <div>
        <div class="display-flex">
          <p class="label-1">
            <span>下单人id：</span><span>{{ baseInfo.tdotUid }}</span>
          </p>
          <p class="label-1">
            <span>下单人手机：</span
            ><span>{{ baseInfo.tdotContactNumber }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p class="label-1">
            <span> 配送时间：</span><span>{{ baseInfo.tdotDate }}</span>
          </p>
          <p>
            <span>收货地址：</span
            ><span>{{ baseInfo.tdotReceivingAddress }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p class="label-1">
            <span> 配送单餐别：</span><span>{{ baseInfo.tdotCategory }}</span>
          </p>
          <p class="label-1">
            <span> 配送单状态：</span><span>{{ baseInfo.tdotOrderStt }}</span>
          </p>
        </div>
      </div>
    </section>
    <section>
      <h3>商品详情</h3>
      <BasePageTable ref="table" :data="baseInfo.orderDetailInfo">
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="菜品编码" prop="tfsCid"></el-table-column>
        <el-table-column
          label="菜品名称"
          prop="tfsSuggestedSkuname"
          align="center"
        >
        </el-table-column>
        <el-table-column
          label="规格"
          prop="tfsQuality"
          width="160"
        ></el-table-column>
        <el-table-column label="订货量" prop="tdodNum"></el-table-column>
        <el-table-column label="单价" prop="tdodPrice"></el-table-column>
        <el-table-column label="订单金额" prop="tdodPriceSum"></el-table-column>
      </BasePageTable>
    </section>
    <section v-if="tableData.length">
      <h3>异常情况</h3>
      <BasePageTable ref="table" :data="tableData" :visible="false">
        <el-table-column label="订单编码" prop="tsmeOrderId"></el-table-column>
        <el-table-column label="异常需求" prop="tsmeTypeDesc"></el-table-column>
        <el-table-column label="原因" prop="tsmeCauseDesc"></el-table-column>
        <el-table-column label="状态" prop="tsmeSttDesc"></el-table-column>
        <el-table-column label="供餐点" prop="tsmeHeatingPointName"></el-table-column>
        <el-table-column label="提交人" prop="tsmeCreatorName"></el-table-column>
        <el-table-column label="提交时间" prop="tsmeCtime"></el-table-column>
        <el-table-column label="审批完成时间" prop="tsmeAuditTime"></el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template v-slot="{ row }">
            <span class="brand-color cursor-pointer optr-label" @click="toDetail(row)">详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </section>
  </div>
</template>

<script>
import { dinnerOptions } from '@/utils/data-map';
import BasePageTable from '@/components/BasePageTable.vue';

export default {
  components: {
    BasePageTable
  },
  props: {
    routeQuery: {
      type: Object
    }
  },
  created() {
    this.getload();
    this.getErrInfo();
  },
  data() {
    return {
      indeximg: 1,
      baseInfo: {},
      skuname: '',
      skut: '1',
      skuprice: '',
      putawayDishModel: {
        topCatalog: '',
        secCatalog: '',
        supply: ''
      },
      tableData: [],
      putawayDishRules: {},
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
      const _this = this;

      this.$request('ServeMealsOperation/orderDetails', {
        orderid: _this.$route.query.id
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            //  this.getOrderList()
            _this.baseInfo = res;
          }
        })
      );
    },
    getErrInfo() {
      this.$request('shoperror.ShopManagerError/shopManagerErrorList', {orderId: this.$route.query.id}).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.tableData = dataPage.record;
          }
        })
      );
    },
    toDetail(row) {
      this.$router.push({
        path: '/scm/serving-meals/exception/detail',
        query: {
          id: row.tsmeId
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.label-1 {
  width: 400px;
  text-align: left;
}
.actions-wrap {
  text-align: center;
}

.step-bar-wrap {
  padding: 24px 18px;
  // background-color: @level4-border;
}

.display-flex p:first-child {
  margin-right: 4%;
}
</style>

<template>
  <div class="page-container">
    <!--<div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="70"
        :span="3"
        :action="false"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport">导出</el-button>
        </template>
      </QueryComponents>
    </div>-->
    <div style="display: flex;justify-content: space-between;height: 40px;margin-bottom: 20px;">
      <div class="section-item">
        <span class="section-label label-1">共：</span>
        <span class="label-2">{{baseInfo.count}}单</span>
        <span class="section-label label-1">已支付：</span>
        <span class="label-2">{{baseInfo.havePaid}}单</span>
        <span class="section-label label-1">待配送：</span>
        <span>{{baseInfo.waitDispatching}}单</span>
      </div>
      <div class="section-item">
        <el-button type="primary" @click="handleExport" :loading="$store.state.bloading">{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
      </div>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span class="brand-color cursor-pointer action-label" @click="toEdit(row)">详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import { orderStatusOptions, orderStatusMap } from '@/utils/data-map';

export default {
  components: {
    QueryComponents,
    BasePageTable,
  },
  created() {
    this.queryParams.skuId = this.$route.query.skuId
    this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      baseInfo: {},
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '餐单编码',
          prop: 'tdotOrderId'
        },
        {
          label: '配送单编码',
          prop: 'tdotShipOid'
        },
        {
          label: '大订单编码（支付行为）',
          prop: 'tdotSoid'
        },
        {
          label: '支付方式',
          prop: 'tdotPayWay'
        },
        {
          label: '供餐点名称',
          prop: 'thpName'
        },
        {
          label: '微信名/收货人',
          prop: 'uname'
        },
        {
          label: '用户手机',
          prop: 'tdotContactNumber'
        },
        {
          label: '收货人手机',
          prop: 'receiverPhone'
        },
        // {
        //   label: '性别',
        //   prop: 'sex',
        //   formatter: row => row.sex ? row.sex : '无'
        // },
        // {
        //   label: '身高',
        //   prop: 'stature',
        //   formatter: row => row.stature ? row.stature + 'cm' : '无'
        // },
        // {
        //   label: '年龄',
        //   prop: 'age',
        //   formatter: row => row.age ? row.age : '无'
        // },
        // {
        //   label: '体重',
        //   prop: 'weight',
        //   formatter: row => row.weight ? row.weight + 'kg' : '无'
        // },
        {
          label: '历史下单数',
          prop: 'orderNumber',
          formatter: row => row.orderNumber ? row.orderNumber : 0
        },
        {
          label: '餐别',
          prop: 'tdotCategory'
        },
        {
          label: '下单时间',
          prop: 'tdotCtime'
        },
        {
          label: '取餐方式',
          prop: 'tdotDistributionMode',
        },
        {
          label: '点餐方式',
          prop: 'tdotOrderMethod'
        },
        {
          label: '配送方式',
          prop: 'tdotShipWithCold',
          formatter: row => row.tdotShipWithCold == '00' ? '热食' : '冷链'
        },
        {
          label: '来源',
          prop: 'source'
        },
        {
          label: '菜品',
          prop: 'skuname',
          formatter: row => row.skuname.length > 30 ? row.skuname.substring(0, 30) + '...' : row.skuname
        },
        {
          label: '是否含套餐',
          prop: 'packageFlag'
        },
        {
          label: '订单金额',
          prop: 'tdotOrderPrice'
        },
        {
          label: '配送费',
          prop: 'tdotFoodDeliveryPrice'
        },
        {
          label: '优惠券抵扣金额',
          prop: 'tdotCouponAmount'
        },
        {
          label: '实付金额',
          prop: 'tdotActualPrice'
        },
        {
          label: '本金支付金额',
          prop: 'tdotPaidPrice'
        },
        {
          label: '赠送金支付金额',
          prop: 'tdotGiftPrice'
        },
        // {
        //   label: '客户经理姓名',
        //   prop: 'counselorName',
        // },
        // {
        //   label: '客户经理手机',
        //   prop: 'counselorPhone',
        // },
        {
          label: '配送地址',
          prop: 'tdotReceivingAddress',
        },
        {
          label: '配送日期',
          prop: 'tdotDate'
        },
        {
          label: '自取时间',
          prop: 'tdotMealTakingTime'
        },
        {
          label: '当前状态',
          prop: 'tdotOrderStt',
          formatter: row => this.formatOrderStatus2(row.tdotOrderStt)
        },
        // {
        //   label: '当餐是否有饮食方案',
        //   prop: 'planExist'
        // },
        // {
        //   label: '方案当天总摄入',
        //   prop: 'planDayIntake'
        // },
        // {
        //   label: '方案当餐应摄入',
        //   prop: 'planMealIntake'
        // },
        {
          label: '当餐点餐热量',
          prop: 'mealEnergy'
        },
        // {
        //   label: '热量差',
        //   prop: 'energyDiff'
        // },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        skuId: ''
      },
      queryComps: [],
    };
  },
  methods: {
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('Sku/getOrderListBySku', params);
      if (!res.errMsg) {
        this.baseInfo = res.obj.orderNum;
        this.tableData = res.obj.dispatchinglist.record;
        this.tableDataTotal = res.obj.dispatchinglist.totalRecordCount;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.page,
        ...this.genQueryParams(),
        pageSize: this.tableDataTotal,
      };
      let col = this.$deepClone(this.tableCol);
      const index = col.findIndex(item => item.prop == 'skuname');
      col[index] = {
        label: '菜品',
        prop: 'skuname',
      };
      const res = await this.$http('Sku/getOrderListBySku', params);
      const data = res.obj.dispatchinglist.record;
      data.forEach(item => {
        item.tdotShipWithCold = item.tdotShipWithCold == '00' ? '热食配送' : '冷链配送';
        item.orderNumber = item.orderNumber ? item.orderNumber : 0;
        item.tdotOrderStt = {
                              '00' : '未支付',
                              '01' : '已支付',
                              '02' : '处理中',
                              '03' : '已退款',
                              '04' : '已结算',
                              '05' : '待配送/待取餐',
                              '06' : '正在配送',
                              '07' : '配送异常',
                              '08' : '异常取消',
                              '09' : '已过期/失效',
                              '10' : '已完成',
                              '11' : '已关闭',
                              '12' : '已通过',
                              '13' : '入账中',
                              '14' : '已确认收货',
                              '99' : '已删除',
                              '00' : '未支付',
                            }[item.tdotOrderStt];
      });
      exportExcel({
        columns: col,
        filename,
        data
      });
    },
    toEdit(row) {
      this.$router.push({
        path: `/diet/order-management/order-list/detail`,
        query: {
          id: row.tdotOrderId,
        }
      })
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format('YYYY-MM-DD');
        params.endDate = endDate.format('YYYY-MM-DD');
      }
      delete params.date;
      return params;
    },
    formatOrderStatus2(status) {
      return orderStatusMap[status];
    },
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.label-1 {
  width: 100px;
}
</style>

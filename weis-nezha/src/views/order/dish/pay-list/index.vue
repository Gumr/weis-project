<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="6"
        :label-width="90"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport" :loading="$store.state.bloading">{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        :height="height"
        ref="table"
        v-loading="$store.state.vloading"
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
            <span
              class="brand-color cursor-pointer action-label"
              @click="goDetail(row)"
              >详情</span
            >
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

export default {
  name: 'order_dish_pay-list',
  components: {
    QueryComponents,
    BasePageTable,
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    this.getPayOrderQueryInfo();
    // this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '50'
        },
        {
          label: '支付单ID',
          prop: 'payNum'
        },
        {
          label: '下单人',
          prop: 'uname'
        },
        {
          label: '下单人手机',
          prop: 'phone'
        },
        {
          label: '订单金额',
          prop: 'orderAmount'
        },
        {
          label: '折扣金额',
          prop: 'discount'
        },
        {
          label: '优惠券',
          prop: 'couponAmount'
        },
        {
          label: '实际支付金额',
          prop: 'actualAmount'
        },
        {
          label: '支付方式',
          prop: 'payType'
        },
        {
          label: '端口',
          prop: 'market'
        },
        {
          label: '下单时间',
          prop: 'ctime'
        },
        {
          label: '当前状态',
          prop: 'orderSttStr'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [new Date(), new Date()],
        payNum: '',
        phone: '',
        payType: '',
        market: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '下单时间',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            clearable: false,
          }
        },
        {
          component: 'el-input',
          key: 'payNum',
          label: '支付单ID',
          placeholder: '支付单ID',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '下单人手机',
          placeholder: '下单人手机',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'BaseSelect',
          key: 'market',
          label: '端口',
          props: {
            options: [],
            clearable: true,
          }
        },
        {
          component: 'BaseSelect',
          key: 'payType',
          label: '支付方式',
          props: {
            options: [
              {
                label: '全部',
                value: ''
              },
              {
                label: '微信支付',
                value: 'wechat'
              },
              {
                label: '余额支付',
                value: 'balance'
              },
            ]
          }
        },
      ],
    };
  },
  methods: {
    async getPayOrderQueryInfo() {
      const res = await this.$http('OrderManage/getPayOrderQueryInfo', {});
      this.queryComps[3].props.options = res.obj.market;
    },
    async getList() {
      this.$store.state.vloading = true;
      const res = await this.$http('OrderManage/getPayOrder', { ...this.page, ...this.genQueryParams() });
      this.tableData = res.obj.record;
      this.tableDataTotal = res.obj.totalRecordCount;
      this.$nt(() => {
        // debugger;
        this.$refs.table.doLayout();
      });
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const res = await this.$http('OrderManage/getPayOrder', { pageNo: 1, pageSize: this.tableDataTotal, ...this.genQueryParams() });
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      });
    },
    goDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          payNum: row.payNum,
        }
      });
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
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>

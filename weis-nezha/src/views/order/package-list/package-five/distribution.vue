<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="6"
        :label-width="50"
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
            <span class="brand-color cursor-pointer action-label" @click="goDetail(row)">详情</span>
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
    this.tfrpOrderId = this.$route.query.tfrpOrderId;
    this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tfrpOrderId: '',
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        { label: '序号', type: 'index', width: '80' },
        { label: '配送单ID', prop: 'tdotShipOrder' },
        { label: '包含餐单数', prop: 'tdotMealNum' },
        { label: '菜品数量', prop: 'tdotSkuNum' },
        { label: '配送时间', prop: 'tdotShipTime' },
        { label: '配送方式', prop: 'tdotShipWithCold', formatter: row => row.tdotShipWithColdDesc + row.tdotDistributionModeDesc },
        { label: '配送频率', prop: 'tdotDeliveryFrequencyDesc'},
        { label: '当前状态', prop: 'tdotOrderSttDesc'},
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [],
        shipOid: '',
        stt: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'el-input',
          key: 'shipOid',
          label: '配送单',
          placeholder: '请输入配送单ID',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '状态',
          placeholder: '请选择状态',
          props: {
            clearable: true,
            options: [
              { label: '全部', value: '' },
              { label: '待配送', value: '05' },
              { label: '配送中', value: '06' },
              { label: '已完成', value: '14' },
              { label: '已签收', value: '10' },
              { label: '已支付', value: '00' },
              { label: '已退款', value: '03' },
            ]
          }
        },
      ],
    };
  },
  methods: {
    async getList() {
      this.$store.state.vloading = true;
      const params = {
        tfrpOrderId: this.tfrpOrderId,
        ...this.page,
        ...this.genQueryParams()
      };
      const res = await this.$http('comboactivity.ComboActivityOrder/queryShipOrderList', params);
      if (!res.errMsg) {
        this.tableData = res.obj.dataPage.record;
        this.tableDataTotal = res.obj.dataPage.totalRecordCount;
        this.$nt(() => {
          this.$refs.table.doLayout();
        });
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
        tfrpOrderId: this.tfrpOrderId,
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal
      };
      const res = await this.$http('comboactivity.ComboActivityOrder/queryShipOrderList', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.dataPage.record
      });
    },
    goDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          tdotShipOrder: row.tdotShipOrder,
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
.action-label {
  margin-right: 10px;
}
</style>

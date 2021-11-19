<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="7"
        :label-width="70"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
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
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
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
  name: 'order_package-list_package-ten',
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
    // this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        { label: '序号', type: 'index', width: '80' },
        { label: '套餐订单号', prop: 'tfrpOrderId' },
        { label: '周期', prop: 'tfrpCycle', formatter: row => `${row.tfrpCycle}日` },
        {
          label: '配送频率',
          prop: 'tfrpDeliveryFrequency',
          formatter: row => ({
            '01': '一天一送', '02': '每餐送', '03': '每餐自取', '': '无'
          }[row.tfrpDeliveryFrequency])
        },
        { label: '订单金额', prop: 'tfrpOrderPrice' },
        { label: '下单人性别', prop: 'sex', formatter: row => (row.sex == '0' ? '未知' : (row.sex == '1' ? '男' : '女')) },
        { label: '体重（kg）', prop: 'tfrpCurrWeight' },
        { label: '下单人昵称', prop: 'uname' },
        { label: '下单人手机', prop: 'phone' },
        { label: '下单时间', prop: 'tfrpCtime' },
        { label: '客户经理姓名', prop: 'counselorName', formatter: row => (row.counselorName ? row.counselorName : '无') },
        { label: '客户经理手机', prop: 'counselorPhone', formatter: row => (row.counselorPhone ? row.counselorPhone : '无') },
        { label: '主管名称', prop: 'ownCounselorName', formatter: row => (row.ownCounselorName ? row.ownCounselorName : '无') },
        { label: '主管手机', prop: 'ownCounselorPhone', formatter: row => (row.ownCounselorPhone ? row.ownCounselorPhone : '无') },
        { label: '订单开始时间', prop: 'tfrpStartDate', formatter: row => row.tfrpStartDate || '无' },
        { label: '订单结束时间', prop: 'tfrpEndDate', formatter: row => row.tfrpEndDate || '无' },
        { label: '当前状态', prop: 'tfrpOrderSttDesc' },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [],
        phone: '',
        sex: '',
        frequency: '',
        stt: '',
        cycle: '10'
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
          key: 'phone',
          label: '用户手机',
          placeholder: '请输入用户手机',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'BaseSelect',
          key: 'sex',
          label: '性别',
          placeholder: '请选择性别',
          props: {
            clearable: true,
            options: [
              { label: '全部', value: '' },
              { label: '男', value: '1' },
              { label: '女', value: '2' },
            ]
          }
        },
        {
          component: 'BaseSelect',
          key: 'frequency',
          label: '配送频率',
          placeholder: '请选择配送频率',
          props: {
            clearable: true,
            options: [
              { label: '全部', value: '' },
              { label: '一天一送', value: '01' },
              { label: '每餐送', value: '02' },
              { label: '每餐自取', value: '03' },
            ]
          }
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
              { label: '未开始', value: '00' },
              { label: '进行中', value: '01' },
              { label: '已完成', value: '02' },
              { label: '已退款', value: '03' },
              { label: '部分退款', value: '04' },
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
        ...this.page,
        ...this.genQueryParams()
      };
      const res = await this.$http('comboactivity.ComboActivityOrder/queryList', params);
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
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal
      };
      const res = await this.$http('comboactivity.ComboActivityOrder/queryList', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.dataPage.record
      });
    },
    goDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/distribution`,
        query: {
          tfrpOrderId: row.tfrpOrderId,
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

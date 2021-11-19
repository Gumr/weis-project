<template>
  <div class="page-container" style="margin-top: 20px;">
    <ButtonTabs v-model="activeTab" :tabs="tableTabs"></ButtonTabs>
    <div>
      <div style="margin: 20px 0;">
        <QueryComponents
          v-model="queryParams"
          :queryList="memberQueryComps"
          :span="3"
        >
          <template v-slot:action>
            <el-button type="primary" @click="searchClick"
              >搜索</el-button
            >
            <el-button type="primary" @click="exportClick">导出</el-button>
          </template>
        </QueryComponents>
      </div>
      <BasePageTable
        :data="table.data"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        :total="table.total"
        @current-page-change="getTableData"
        @size-change="getTableData"
        border
      >
        <el-table-column
          v-for="(col, index) in table.col"
          v-bind="col"
          :key="index"
        ></el-table-column>
        <el-table-column width="80" label="操作">
          <template v-slot="{ row }">
            <el-button size="small" @click="goDetail(row)"
              >详情</el-button
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import ButtonTabs from '@/components/ButtonTabs.vue';
import { validArray } from '@/utils/common';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ButtonTabs
  },
  created() {
    if (this.$route.query.startTime) {
      this.queryParams.date[0] = this.$route.query.startTime;
      this.queryParams.date[1] = this.$route.query.endTime;
    }
    if (this.$route.query.id) {
      this.queryParams.pCounselorId  = this.$route.query.id;
      this.getTableData();
    }
  },
  data() {
    return {
      activeTab: 0,
      tableTabs: [{
        label: '直级客户经理营业额',
        value: 0
      }],
      loading: false,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      table: {
        data: [],
        total: 0,
        col: [
          { type: 'index', label: '序号'},
          { label: '客户经理ID', prop: 'counselorId' },
          { label: '客户经理名称', prop: 'counselorName' },
          { label: '客户经理手机', prop: 'counselorPhone' },
          { label: '客户经理类型', prop: 'counselorType', formatter: row => `${row.counselorType == '01' ? '外部' : '自有'}` },
          { label: '营业总额', prop: 'turnoverTotal', formatter: row => `￥${row.turnoverTotal || 0}`},
          { label: '充值总额', prop: 'rechargeTotal', formatter: row => `￥${row.rechargeTotal || 0}` },
          { label: '微信支付总额', prop: 'wechatTotal', formatter: row => `￥${row.wechatTotal || 0}` },
        ]
      },
      queryParams: {
        marketType: '01',
        pCounselorId: '',
        date: [],
        counselorPhone: '',
      },
      memberQueryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            clearable: true,
            type: 'daterange'
          }
        },
        {
          component: 'el-input',
          key: 'counselorPhone',
          label: '手机号',
          placeHolder: '请输入客户经理手机号',
          props: {
            clearable: true
          }
        }
      ],
    };
  },
  methods: {
    async exportClick() {
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          exportExcel({
            columns: this.table.col,
            filename,
            data: res.dataPage.record
          });
        })
      );
    },
    reqAllUserData() {
      return this.$request('Channel/marketCounselorTurnover', {
        ...this.genQueryParams(),
        pageNo: 0,
        pageSize: this.table.total,
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
    searchClick() {
      this.page.pageNo = 1;
      this.getTableData();
    },
    goDetail(row) {
      let date = {}
      if (this.queryParams.date && this.queryParams.date.length) {
        date = {
          startTime: this.$day(this.queryParams.date[0]).format('YYYY-MM-DD'),
          endTime: this.$day(this.queryParams.date[1]).format('YYYY-MM-DD')
        }
      }
      this.$router.push({
        path: '/data/data/commission-statistics/sales-statistics/directSalesMemberDetail',
        query: {
          pCounselorId: this.queryParams.pCounselorId,
          counselorId: row.counselorId,
          ...date,
        }
      });
    },
    getTableData() {
      this.loading = true;
      this.$request('Channel/marketCounselorTurnover', { ...this.genQueryParams(), ...this.page }).then(
        this.$rw((err, result) => {
          this.loading = false;
          if (!err) {
            result = result.dataPage;
            this.table.total = result.totalRecordCount;
            this.table.data = result.record;
          }
        })
      );
    },
  }
};

</script>

<style lang="less" scoped>
.page-container {
  margin-top: 20px;
}
.total-item {
  display: inline-block;
  margin-right: 22px;
}
</style>

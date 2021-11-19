<template>
  <div>
    <div style="margin: 20px 0;">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="80"
        :span="7">
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="exportClick" :loading="$store.state.bloading">{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
    </div>
    <BasePageTable
      :height="height"
      v-loading="loading"
      :data="table.data"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      :total="table.total"
      @current-page-change="getTableData"
      @size-change="getTableData"
      border
      highlight-current-row>
      <el-table-column
        v-for="(col, index) in table.col"
        v-bind="col"
        :key="index"
      ></el-table-column>
      <el-table-column width="80" label="操作">
        <template v-slot="{ row }">
          <el-button size="small" @click="goDetail(row.parentId)"
            >详情</el-button
          >
        </template>
      </el-table-column>
    </BasePageTable>
   </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import ButtonTabs from '@/components/ButtonTabs.vue';
import { mapToOptions } from '@/utils/data-map';
import { validArray } from '@/utils/common';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';


export default {
  name: 'commission-statistics_index',
  components: {
    QueryComponents,
    BasePageTable,
    ButtonTabs,
  },
  computed: {

    tableRequestParams() {
      const params = {
        ...this.page,
        ...this.queryParams,
        marketType: '02'
      };

      if (validArray(params.date)) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = +startDate;
        params.endDate = +endDate;
      }

      delete params.date;

      return params;
    }
  },
  data() {
    return {
      height: window.innerHeight - 380,
      loading: false,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      table: {
        data: [],
        total: 0,
        col: []
      },
      queryParams: {
        uid: '',
        parentId: '',
        date: [],
        phone: '',
        marketType: '02',
        channel: '01'
      },
      queryComps: [
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
          key: 'phone',
          label: '手机号',
          placeholder: '请输入手机号',
          props: {
            clearable: true
          }
        }
      ]
    };
  },
  methods: {
    async exportClick() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;

      const data = await this.getAllTableData();
      this.$store.state.bloading = false;
      exportExcel({
        filename,
        data,
        columns: this.table.col
      });
    },
    getAllTableData() {
      return this.$request('Channel/queryAgentProfitList', {
        ...this.tableRequestParams,
        pageNo: 1,
        pageSize: 9999,
        marketType: '02'
      }).then(({ data }) => (data.errCode === 0 ? data.obj.dataPage.record : Promise.reject()));
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getTableData();
    },
    borderTypeFormatter(row) {
      return BroderTypeMap[row.parentType];
    },

    goDetail(id) {
      let date = {}
      if (this.queryParams.date && this.queryParams.date.length) {
        date = {
          startTime: this.$day(this.queryParams.date[0]).format('YYYY-MM-DD'),
          endTime: this.$day(this.queryParams.date[1]).format('YYYY-MM-DD')
        }
      }
      this.$pushRoute('channelCommissionDetail', {
        query: {
          id,
          marketType: '02',
          ...date,
        }
      });
    },
    getTableData() {
      this.loading = true;
      this.$request('Channel/queryAgentProfitList', this.tableRequestParams).then(
        this.$rw((err, result) => {
          this.loading = false;
          if (!err) {
            result = result.dataPage;
            this.table.total = result.totalRecordCount;
            this.table.data = result.record;
            this.table.col = [
              { type: 'index', label: '序号'},
              { label: '渠道兼职客户经理ID', prop: 'parentId' },
              { label: '渠道兼职客户经理名称', prop: 'parentName' },
              { label: '手机号', prop: 'parentPhone' },
              { label: '渠道兼职客户经理总佣金', prop: 'totalRoyalty', formatter: row => `￥${row.totalRoyalty || 0}`},
              { label: '渠道兼职客户经理总佣金 - 已确认', prop: 'totalRoyaltyAlready' },
              { label: '渠道兼职客户经理总佣金-待确认', prop: 'totalRoyaltyComing' },
              { label: '渠道兼职客户经理总佣金-已失效', prop: 'totalRoyaltyInvalid' },
              { label: '直级学员人数', prop: 'memberNum' },
              { label: '直级学员分润',  prop: 'memberRoyalty' },
              { label: '直级学员分润-已确认', prop: 'memberRoyaltyAlready' },
              { label: '直级学员分润-待确认', prop: 'memberRoyaltyComing' },
              { label: '直级学员分润-已失效', prop: 'memberRoyaltyInvalid' }
            ];
           }
        })
      );
    },
  },
  created() {
    this.queryParams.date = [this.$day().format('YYYY-MM-DD'), this.$day().format('YYYY-MM-DD')];
    this.getTableData();
  }
};

</script>

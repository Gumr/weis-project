<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="6"
        :label-width="80"
        semi>
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
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';

export default {
  components: {
    QueryComponents,
    BasePageTable,
  },
  computed: {
  },
  created() {
    this.queryParams.tpphTprcId = this.$route.query.id;
    this.getList();
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
          width: 50,
        },
        {
          label: '餐单单号',
          prop: 'tpphTdotOid'
        },
        {
          label: '下单人昵称',
          prop: 'tpphTdotUname'
        },
        {
          label: '下单人手机',
          prop: 'tpphTdotPhone'
        },
        {
          label: '出餐时间',
          prop: 'tpphShipTime'
        },
        {
          label: '餐单实付金额',
          prop: 'tpphOrderActual'
        },
        {
          label: '餐单当前状态',
          prop: 'tpphTdotStt'
        },
        {
          label: '提成比例',
          prop: 'tpphProfitRatio',
          formatter: row => row.tpphProfitRatio + '%'
        },
        {
          label: '提成金额',
          prop: 'tpphTotalProfit'
        },
        {
          label: '提成当前状态',
          prop: 'tpphStatusName'
        },
        {
          label: '创建时间',
          prop: 'tpphCtimeStr'
        },
        {
          label: '失效时间',
          prop: 'tpphDeadTimeStr',
          formatter: row => row.tpphDeadTimeStr || '无'
        },
        {
          label: '确认时间',
          prop: 'tpphComfirmTimeStr',
          formatter: row => row.tpphComfirmTimeStr || '无'
        },
      ],
      page: {
        tpphTprcId: '',
        pageNo: 1,
        pageSize: 100
      },
      queryParams: {
        date: [],
        phone: '',
        tpphTprcId: '',
        status: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '创建日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'el-input',
          label: '下单人手机',
          key: 'phone',
          maxlength: '30',
          placeholder: '请输入下单人手机',
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'status',
          label: '状态',
          props: {
            options: [
              { label: '全部', value: '' },
              { label: '待确认', value: '00' },
              { label: '已确认', value: '20' },
              { label: '已失效', value: '10' },
            ]
          }
        },
      ],
    };
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async getList() {
      this.$store.state.vloading = true;
      const res = await this.$http('partner.Partner/queryPartnerProfitDetail', { ...this.page, ...this.genQueryParams()});
      this.tableData = res.obj.record;
      this.tableDataTotal = res.obj.totalRecordCount;
      this.$nt(() => {
        this.$refs.table.doLayout();
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.valueOf();
        params.endDate = endDate.valueOf();
      }
      delete params.date;
      return params;
    },
    goDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/channel-detail`,
        query: {
          id: row.tpiId,
        }
      });
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
      const res = await this.$http('partner.Partner/queryPartnerProfitDetail', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      });
    },
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.small-input {
  margin: 0 8px;
  width: 300px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>

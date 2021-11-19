<template>
  <div class="">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="5"
        :label-width="70"
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
    this.queryParams.tpiId = this.$route.query.id;
    this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 330,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: 50,
        },
        {
          label: '下级合伙人名称',
          prop: 'tpiName'
        },
        {
          label: '下级合伙人手机',
          prop: 'tpiPhone'
        },
        {
          label: '合伙人提成点',
          prop: 'profitRatio',
          formatter: row => row.profitRatio + '%'
        },
        {
          label: '总提成额',
          prop: 'totalAmount'
        },
        {
          label: '已确认提成数',
          prop: 'comfirmAmount',
          formatter: row => row.comfirmAmount + '元'
        },
        {
          label: '未确认提成额',
          prop: 'unComfirmAmount',
          formatter: row => row.unComfirmAmount + '元'
        },
        {
          label: '已失效提成额',
          prop: 'invalidateAmount',
          formatter: row => row.invalidateAmount + '元'
        },
        {
          label: '状态',
          prop: 'tpiStatusStr'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 100
      },
      queryParams: {
        date: [],
        phone: '',
        tpiId: '',
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
          label: '合伙人手机',
          key: 'phone',
          maxlength: '30',
          placeholder: '请输入合伙人手机',
          props: {
            clearable: true
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
      const res = await this.$http('partner.Partner/queryPartnerIndirectProfit', { ...this.page, ...this.genQueryParams()});
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
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal
      };
      this.$store.state.bloading = true;
      const res = await this.$http('partner.Partner/queryPartnerIndirectProfit', params);
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

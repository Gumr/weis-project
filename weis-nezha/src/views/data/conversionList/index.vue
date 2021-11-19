<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        :label-width="120"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport2"
            :loading="$store.state.bloading2"
          >{{$store.state.bloading2 ? '导出中' : '导出'}}</el-button>

          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出明细'}}</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <div><h2>注册人数：{{registerNum}} </h2></div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :visible="false"
    
        border
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col" align="center"></el-table-column>
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
  name: 'business_om-data',
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
    // this.getAppAll();
    // this.getList();
  },
  data() {
    return {
      registerNum:0,
      height: window.innerHeight - 280,
      tableData: [],
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '订单数',
          prop: 'orderNum'
        },
        {
          label: '下单人数',
          prop: 'userNum'
        },
        {
          label: '下单转化率(%)',
          prop: 'invertRate',
           formatter: (row) => `${row.invertRate}%`
        },
       
      ],
       exportData: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '用户昵称',
          prop: 'uname'
        },
        {
          label: '用户手机号',
          prop: 'phone'
        },
        {
          label: '注册来源',
          prop: 'registerSource'
        },
         {
          label: '注册时间',
          prop: 'registerTime'
        },
         {
          label: '注册后周期',
          prop: 'cycleTime'
        },
         {
          label: '下单数',
          prop: 'orderNum'
        },
         {
          label: '是否有效注册',
          prop: 'validRegister'
        },
       
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        cycleType: '7',
        date: [],
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '注册时间',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
           
          }
        },
        {
          component: 'BaseSelect',
          key: 'cycleType',
          label: '注册后周期',
          props: {
         
            options: [
               { label: '一周', value: '7' },
                      { label: '两周', value: '14' },
                      { label: '三周', value: '21' },
                      { label: '四周', value: '28' },
                      { label: '五周', value: '35' },
                       { label: '六周', value: '42' }
                      ]
          }
        },
      ],
    };
  },
  methods: {
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('data.UserInvertRate/queryUserInvertRate', params);
      if (!res.errMsg) {
      
        this.tableData = res.obj.result;
        this.registerNum =res.obj.registerNum

      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
      async handleExport2() { //导出
      this.$store.state.bloading2 = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('data.UserInvertRate/queryUserInvertRate', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.result
      });
       this.$store.state.bloading2 = false
    },
    async handleExport() {//导出明细
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}明细-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('data.UserInvertRate/queryUserInvertRateDetails', params);
      exportExcel({
        columns: this.exportData,
        filename,
        data: res.obj.result
      });
      this.$store.state.bloading = false
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
:deep(.el-table .error-row td) {
  background: #f56c6c !important;
  color: white;
}
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.medium-input {
  width: 250px;
  margin-right: 20px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
</style>

<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="60"
        :span="7"
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
            <span class="brand-color cursor-pointer action-label" @click="goDetail('detail', row)">详情</span>
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
  name: 'order_dish_freight-list',
  components: {
    QueryComponents,
    BasePageTable,
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
        {
          label: '序号',
          type: 'index',
          width: '50'
        },
        {
          label: '运费补差订单号',
          prop: 'freightNum'
        },
        {
          label: '关联配送单号',
          prop: 'orderNum'
        },
        {
          label: '补差金额（元）',
          prop: 'amount'
        },
        {
          label: '生成时间',
          prop: 'ctime'
        },
        {
          label: '当前状态',
          prop: 'stt'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        freightNum: '',
        orderNum: '',
        stt: '',
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'freightNum',
          label: '补差单号',
          placeholder: '请输入补差单号',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'el-input',
          key: 'orderNum',
          label: '餐单号',
          placeholder: '请输入餐单号',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '状态',
          props: {
            options: [
              { label: '全部状态', value: '' },
              { label: '待支付', value: '00' },
              { label: '已支付', value: '01' },
              { label: '处理中', value: '02' },
              { label: '已退款', value: '03' },
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
      const res = await this.$http('FreightPriceSpread/freightAll', params);
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
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
        ...this.page,
        ...this.genQueryParams(),
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('FreightPriceSpread/freightAll', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      });
    },
    goDetail(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.primaryKey,
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

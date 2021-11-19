<template>
  <div class="">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="7"
        :label-width="60"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport" :loading="$store.state.bloading">{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="stockDeploy">门店库存调配</el-button>
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
import exportExcel from '@/utils/export-excel';
import { transformDaterange } from '@/utils/transform';

export default {
  components: {
    QueryComponents,
    BasePageTable
  },
  data() {
    return {
      height: window.innerHeight - 330,
      queryParams: {
        date: [],
        heatPoint: '',
        skuName: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          placeholder: '选择日期',
          props: {
            type: 'daterange',
            'value-format': 'yyyy-MM-dd',
          }
        },
        {
          component: 'el-input',
          key: 'skuName',
          label: '菜品名称',
          placeholder: '请输入菜品名称',
          maxlength: 30,
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'heatPoint',
          label: '供餐点',
          props: {
            options: []
          }
        },
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '转出供餐点',
          prop: 'outHeatPointName'
        },
        {
          label: '菜品名称',
          prop: 'skuname'
        },
        {
          label: '菜品编码',
          prop: 'cid'
        },
        {
          label: '菜品规格',
          prop: 'quality',
          formatter: row => row.quality + row.unit
        },
        {
          label: '转出门店量',
          prop: 'outStock',
        },
        {
          label: '转入供餐店',
          prop: 'innerHeatPointName'
        },
        {
          label: '操作人',
          prop: 'operatorName'
        },
        {
          label: '操作时间',
          prop: 'ctime'
        }
      ],
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
    };
  },
  created() {
    this.getHeatPoint();
    this.getList();
  },
  watch:{
    $route(to,from){
      this.getList();
    }
  },
  methods: {
    stockDeploy() {
      this.$router.push({
        path: `${this.$route.path}/stock-deploy`,
        query: {
        }
      });
    },
    searchClick() {
      this.date = this.queryParams.date;
      this.getList();
    },
    async getHeatPoint() {
      const res = await this.$request('HeatingPoint/queryEnabledHeat');
      this.queryComps[2].props.options = [{ label: '全部供餐点', value: '' }].concat(res.data.obj.heatVos);
    },
    async getList() {
      this.$store.state.vloading = true;
      const res = await this.$http('stock.ShopOrderStock/queryShopOrderStockList', {...this.page, ...this.genQueryParams()});
      this.tableData = res.obj.dataPage.record;
      this.tableDataTotal = res.obj.dataPage.totalRecordCount;
      this.$nt(() => {
        this.$refs.table.doLayout();
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
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `门店库存调配-导出(${date})`;
      const res = await this.$http('stock.ShopOrderStock/queryShopOrderStockList', {pageNo: 1, pageSize: this.tableDataTotal, ...this.genQueryParams()});
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.dataPage.record
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
.txt {
  width: 300px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>

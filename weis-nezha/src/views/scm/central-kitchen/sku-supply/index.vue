<template>
  <div class="page-container">
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
      height: window.innerHeight - 280,
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
            // 'picker-options': {
            //   disabledDate(time) {
            //     return time.getTime() < Date.now() - 8.64e7;   //禁用以前的日期，今天不禁用
            //   }
            // }
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
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '已下架菜品名称',
          prop: 'skuName'
        },
        {
          label: '菜品编码',
          prop: 'cid'
        },
        {
          label: '菜品规格',
          prop: 'quality'
        },
        {
          label: '下架日期',
          prop: 'soldOutTime'
        },
        {
          label: this.$day(new Date().getTime() + 86400000 * 1).format('YYYY/MM/DD') + '日供应量',
          prop: 'supplyByToday'
        },
        {
          label: this.$day(new Date().getTime() + 86400000 * 2).format('YYYY/MM/DD') + '日供应量',
          prop: 'supplyByTwo'
        },
        {
          label: this.$day(new Date().getTime() + 86400000 * 3).format('YYYY/MM/DD') + '日供应量',
          prop: 'supplyByThree'
        },
        {
          label: this.$day(new Date().getTime() + 86400000 * 4).format('YYYY/MM/DD') + '日供应量',
          prop: 'supplyByFuor'
        },
        {
          label: this.$day(new Date().getTime() + 86400000 * 5).format('YYYY/MM/DD') + '日供应量',
          prop: 'supplyByFive'
        },
        {
          label: this.$day(new Date().getTime() + 86400000 * 6).format('YYYY/MM/DD') + '日供应量',
          prop: 'supplyBySix'
        },
        {
          label: this.$day(new Date().getTime() + 86400000 * 7).format('YYYY/MM/DD') + '日供应量',
          prop: 'supplyBySeven'
        },
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
    this.getList();
  },
  methods: {
    searchClick() {
      this.date = this.queryParams.date;
      this.getList();
    },
    async getList() {
      this.$store.state.vloading = true;
      const res = await this.$http('SkuSoldOutSupply/querySkuSupply', {...this.page, ...this.genQueryParams()});
      this.tableData = res.obj.record;
      this.tableDataTotal = res.obj.totalRecordCount
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
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const res = await this.$http('SkuSoldOutSupply/querySkuSupply', {pageNo: 1, pageSize: this.tableDataTotal, ...this.genQueryParams()});
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
.txt {
  width: 300px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>

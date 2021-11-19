<template>
  <div class="page-container">
    <section>
      <h3>菜品详情</h3>
    </section>
    <div class="query-bar">
      <QueryComponents v-model="queryParams" :query-list="computedQueryComps" :span="4" semi>
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" :loading="$store.state.bloading" @click="handleExport">{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getDetailList"
        @size-change="getDetailList"
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="菜品编码" prop="tfsCid">
        </el-table-column>
        <el-table-column label="菜品名称" prop="tfsSkuname"></el-table-column>
        <el-table-column label="日期" prop="date"></el-table-column>
        <el-table-column label="单价（元）" prop="price"></el-table-column>
        <el-table-column label="卖出份数（份）" prop="num"></el-table-column>
        <el-table-column label="销售额（元）" prop="totalPrice"></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import ReturnButton from '@/components/ReturnButton.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';

export default {
  components: {
    QueryComponents,
    ReturnButton,
    BasePageTable,
  },
  data() {
    return {
      height: window.innerHeight - 330,
      tfsCid: '',
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: []
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
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '菜品编码',
          prop: 'tfsCid'
        },
        {
          label: '菜品名称',
          prop: 'tfsSkuname'
        },
        {
          label: '日期',
          prop: 'date'
        },
        {
          label: '单价（元）',
          prop: 'price'
        },
        {
          label: '卖出份数（份）',
          prop: 'num'
        },
        {
          label: '销售额（元）',
          prop: 'totalPrice'
        },
      ],
    };
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    this.queryParams.tfsCid  = this.$route.query.id;
    this.tfsCid = this.$route.query.id;
    this.getDetailList();
  },
  methods: {
    getDetailList() {
      this.$store.state.vloading = true;
      this.$request('FoodStatistics/queryFoodStatisticsDetailList', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$store.state.vloading = false;
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
          }
        })
      );
    },
    searchClick() {
      this.getDetailList();
    },
    handleExport() {
      this.$store.state.bloading = true;
      const filename = `${this.$route.meta.title}-导出`;
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false;
          const result = res.dataPage.record.map((item) => {
            return {
              tfsCid: this.tfsCid,
              tfsSkuname: item.tfsSkuname,
              date: item.date,
              price: item.price,
              num: item.num,
              totalPrice: item.totalPrice
            };
          });
          exportExcel({
            columns: this.tableCol,
            filename,
            data: result
          });
        })
      );
    },
    reqAllUserData() {
      return this.$request('FoodStatistics/queryFoodStatisticsDetailList', {
        ...this.genQueryParams(),
        pageSize: this.tableDataTotal,
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

<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
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
        :height="height"
        v-loading="loading"
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        @current-page-change="getFoodStatisticList"
        @size-change="getFoodStatisticList"
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <!-- <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span
              class="brand-color cursor-pointer action-label"
              @click="goDetail('detail', row)"
              >详情</span
            >
          </template>
        </el-table-column> -->
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
  name: 'scm_central-kitchen_dish-statistics',
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
    // this.getFoodStatisticList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      loading: false,
      tableData: [],
      tableDataTotal: 0,
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
          label: '菜品上下架状态',
          prop: 'sttDesc'
        },
        {
          label: '三端售卖合计（份）',
          prop: 'tdodNum'
        },
        {
          label: '小程序售卖量',
          prop: 'tdodMiniNum'
        },
        {
          label: '美团售卖量',
          prop: 'tdodMeituanNum'
        },
        {
          label: '饿了么售卖量',
          prop: 'tdodElemeNum'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [new Date(), new Date()],
        stt: '',
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'tfsSkuname',
          label: '菜品',
          placeholder: '输入菜品名称进行查询',
          props: {
            clearable: true
          },
          maxlength: 30
        },
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
          component: 'BaseSelect',
          key: 'stt',
          label: '菜品状态',
          props: {
            options: [
              {
                label: '全部',
                value: ''
              },
              {
                label: '已上架',
                value: '60'
              },
              {
                label: '已下架',
                value: '-1'
              },
            ]
          }
        },
      ],
    };
  },
  methods: {
    getFoodStatisticList() {
      this.loading = true;
      this.$request('FoodStatistics/queryFoodStatisticsPage', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, { dataPage }) => {
          this.loading = false;
          if (!err) {
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
          }
        })
      );
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getFoodStatisticList();
    },
    handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false;
          exportExcel({
            columns: this.tableCol,
            filename,
            data: res.dataPage.record
          });
        })
      );
    },
    goDetail(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.tfsCid,
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
    reqAllUserData() {
      return this.$request('FoodStatistics/queryFoodStatisticsPage', {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
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
</style>

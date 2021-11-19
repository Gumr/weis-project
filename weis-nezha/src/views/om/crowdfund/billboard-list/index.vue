<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="50"
        :span="6"
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
  components: {
    QueryComponents,
    BasePageTable,
  },
  created() {
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
          type: 'index'
        },
        {
          label: '期数',
          prop: 'trPhase',
          formatter: row => row.trPhase == 0 ? '无' : '第' + row.trPhase + '期'
        },
        {
          label: '上榜菜谱数量',
          prop: 'trRankFoodNum'
        },
        {
          label: '上架菜谱数量',
          prop: 'trPutawayFoodNum'
        },
        {
          label: '参与投票人数',
          prop: 'trVoteUserNum'
        },
        {
          label: '总投票票数',
          prop: 'trVoteNumber'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        phase: '',
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'phase',
          label: '期数',
          placeholder: '请输入期数',
          props: {
            clearable: true
          },
          maxlength: 30
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
      const res = await this.$http('foodfundraising.FoodRanking/queryFoodRankingList', params);
      if (!res.errMsg) {
        this.tableData = res.obj.page.record;
        this.tableDataTotal = res.obj.page.totalRecordCount;
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
      const res = await this.$http('foodfundraising.FoodRanking/queryFoodRankingList', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.page.record
      });
    },
    goDetail(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          phase: row.trPhase,
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

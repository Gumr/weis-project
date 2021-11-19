<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="70"
        :span="3"
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
            <span class="brand-color cursor-pointer action-label" @click="toEdit(row)">详情</span>
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
    this.queryParams.phase = this.$route.query.phase
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
          label: '名次',
          prop: 'trRanking'
        },
        {
          label: '菜品ID',
          prop: 'trId'
        },
        {
          label: '菜品名称',
          prop: 'trName'
        },
        {
          label: '菜品类型',
          prop: 'trTypeDesc'
        },
        {
          label: '投票数',
          prop: 'trVoteNumber'
        },
        {
          label: '收藏人数',
          prop: 'trCollectNumber'
        },
        {
          label: '分享次数',
          prop: 'trShareNumber'
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
          key: 'name',
          label: '菜品名称',
          placeholder: '请输入菜品名称',
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
      const res = await this.$http('foodfundraising.FoodRanking/queryFoodRankingDetailList', params);
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
      const res = await this.$http('foodfundraising.FoodRanking/queryFoodRankingDetailList', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.page.record
      });
    },
    toEdit(row, type) {
      this.$router.push({
        path: `/crowdfund/crowdfunding/dish-list/edit`,
        query: {
          id: row.trId,
        }
      })
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

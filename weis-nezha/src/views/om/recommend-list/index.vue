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
          <el-button type="primary" @click="goPage('create', 1)"
            >添加</el-button
          >
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
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="封面" prop="tdmCoverImg">
          <template class="action-cell" v-slot="{ row }">
           <el-image
             :upload-data="{ flag: 'dailyMood' }"
             :src="row.tdmCoverImg"
             :preview-src-list="[row.tdmCoverImg]"
             class="food-cover"/>
          </template>
        </el-table-column>
        <el-table-column label="标题" prop="tdmCoverTitle"></el-table-column>
        <el-table-column label="初始点赞数" prop="tdmInitializeLikenumInt"></el-table-column>
        <el-table-column label="用户点赞数" prop="tdmLikenumInt"></el-table-column>
        <el-table-column label="上架日期" prop="tdmLifeTimer"></el-table-column>
        <el-table-column label="编辑人" prop="tdmOperator"></el-table-column>
        <el-table-column label="编辑时间" prop="tdmUtime"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 8px;"
              @click="goPage('edit', row)"
              >编辑</span
            >
            <span
              class="brand-color cursor-pointer action-label"
              @click="goPage('detail', row)"
              >详情</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';

export default {
  name: 'om_recommend-list',
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
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [],
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
    };
  },
  created() {
    this.getList();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.tdmId
        }
      });
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request('DailyMood/getAll', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$store.state.vloading = false;
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
            setTimeout(() => {
              this.$refs.table.doLayout();
            }, 500);
          }
        })
      );
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [staTime, endTime] = transformDaterange(params.date);
        params.staTime = staTime.format('YYYY-MM-DD');
        params.endTime = endTime.format('YYYY-MM-DD');
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

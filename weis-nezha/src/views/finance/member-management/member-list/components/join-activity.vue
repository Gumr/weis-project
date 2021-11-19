<template>
  <div class="">
    <div class="">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="70"
        :span="3"
        :action="false"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport">导出</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        :data="tableData"
        :total="tableDataTotal"
        :visible="false"
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
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ReturnButton from '@/components/ReturnButton.vue';

export default {
  name: 'crowdfunding_dish-list',
  components: {
    QueryComponents,
    BasePageTable,
    ReturnButton
  },
  created() {
    this.queryParams.uid = this.$route.query.id;
    this.getList();
  },
  data() {
    return {
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '活动ID',
          prop: 'taId',
        },
        {
          label: '活动名称',
          prop: 'taName'
        },
        {
          label: '活动周期',
          prop: 'taCycle'
        },
        {
          label: '当前阶段',
          prop: 'taSttDesc'
        },
        {
          label: '参与时间',
          prop: 'taJoinTime'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        uid: '',
      },
      queryComps: [
      ],
    };
  },
  methods: {
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      const res = await this.$http('userdetails.UserDetails/activityList', params);
      if (!res.errMsg) {
        this.tableData = res.obj;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.page,
        ...this.genQueryParams(),
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('userdetails.UserDetails/activityList', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data:res.obj
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

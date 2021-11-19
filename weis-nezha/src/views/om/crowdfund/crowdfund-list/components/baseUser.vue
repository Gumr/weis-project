<template>
  <div>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="90"
        :span="4"
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

export default {
  name: 'crowdfunding_crowdfund-list',
  components: {
    QueryComponents,
    BasePageTable,
  },
  created() {
    this.taId = this.$route.query.id;
    this.getList();
  },
  data() {
    return {
      taId: '',
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '50'
        },
        {
          label: '人员ID',
          prop: 'trUid'
        },
        {
          label: '参与人昵称',
          prop: 'trUname'
        },
        {
          label: '参与人手机',
          prop: 'trPhone'
        },
        {
          label: '参与时间',
          prop: 'trCtime'
        },
        {
          label: '所传菜品数',
          prop: 'trNum'
        },
      ],
      queryParams: {
        date: []
      },
      queryComps: [

      ],
    };
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async getList() {
      const params = {
        taId: this.taId
      };
      const res = await this.$http('foodfundraising.FundraisingActivity/queryJoinList', params);
      if (!res.errMsg) {
        this.tableData = res.obj;
        this.tableDataTotal = res.obj;
      }
    },
    goDetail(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.tfsCid,
        }
      });
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        taId: this.taId
      };
      const res = await this.$http('foodfundraising.FundraisingActivity/queryJoinList', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj
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

<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents v-model="tableQuery" :queryList="queryComps">
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="$pushRoute('create')">添加政策</el-button>
    </div>
    <BasePageTable
      ref="table"
      v-loading="$store.state.vloading"
      :height="height"
      :data="table.data"
      :total="table.total"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      @current-page-change="getTableData"
      @size-change="getTableData"
      border
    >
      <el-table-column v-for="col in table.col" :key="col.prop" v-bind="col"></el-table-column>
      <el-table-column label="操作">
        <template v-slot="{ row }">
          <el-button size="small" @click="goDetail(row.policyId)">详情</el-button>
          <el-button
            v-if="row.state !== '01'"
            type="danger"
            size="small"
            @click="deletePolicyClick(row.policyId)"
          >删除</el-button>
        </template>
      </el-table-column>
    </BasePageTable>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import format from '@/utils/format';

export default {
  name: 'sales_dividend-policy',
  components: {
    BasePageTable,
    QueryComponents
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableQuery: {
        policyName: ''
      },
      queryComps: [{
        label: '政策名称',
        component: 'el-input',
        key: 'policyName',
        props: {
          clearable: true
        }
      }],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      table: {
        data: [],
        col: [{
          type: 'index',
          label: '序号'
        }, {
          label: '政策名称',
          prop: 'policyName'
        }, {
          label: '有效期',
          prop: 'indate'
        }, {
          label: '关系持续时间',
          prop: 'duration',
          formatter: row => `${row.duration}个月`
        }, {
          label: '当前状态',
          prop: 'status',
          formatter: this.policyStatusFormatter
        }, {
          label: '编辑人',
          prop: 'operator'
        }, {
          label: '最后编辑时间',
          prop: 'utime',
          formatter: row => format.date(row.utime)
        }],
        total: 0
      }
    };
  },
  methods: {
    deletePolicyClick(id) {
      this.deletePolicy(id)
        .then(({ data }) => {
          if (data.errCode === 0) {
            this.$message({
              type: 'error',
              message: '删除政策成功！'
            });

            this.getTableData();
          }
        });
    },
    deletePolicy(policyId) {
      return this.$request('Channel/deletePolicy', {
        policyId
      });
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getTableData();
    },
    policyStatusFormatter(row) {
      return {
        '00': '无效',
        '01': '正常',
        '02': '待生效'
      }[row.state];
    },
    getTableData() {
      this.$store.state.vloading = true;
      this.$request('Channel/queryPolicy', {
        ...this.page,
        ...this.tableQuery
      })
        .then(({ data }) => {
          this.$store.state.vloading = false;
          if (data.errCode === 0) {
            data = data.obj && data.obj.dataPage;
            this.table.total = data.totalRecordCount;
            this.table.data = data.record;
          }
        });
    },
    goDetail(id) {
      this.$pushRoute('detail', {
        query: {
          id
        }
      });
    }
  },
  activated() {
    this.getTableData();
  }
};
</script>
<style lang="less" scoped>
@import "../../../styles/base.less";
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>

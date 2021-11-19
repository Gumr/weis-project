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
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
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
        <el-table-column label="菜品名称" prop="skuname"></el-table-column>
        <el-table-column label="口味（满分10分）" prop="flavorScore"></el-table-column>
        <el-table-column label="包装（满分10分）" prop="packScore"></el-table-column>
        <el-table-column label="评价内容" prop="propose">
          <template v-slot="{ row }">
            <span>{{row.propose}}</span>
          </template>
        </el-table-column>
        <el-table-column label="反馈时间" prop="utime"></el-table-column>
        <el-table-column label="评价人昵称" prop="uname"></el-table-column>
        <el-table-column label="评价人手机" prop="uphone"></el-table-column>
        <el-table-column label="最后编辑时间" prop="utime"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 8px;"
              @click="goPage('detail', row)"
            >详情</span>
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
import exportExcel from '@/utils/export-excel';
export default {
  name: 'feedback-list',
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
  filters: {
    ellipsis(value) {
      if (!value) return "";
      if (value.length > 20) {
        return value.slice(0, 20) + "...";
      }
      return value;
    },
  },
  data() {
    return {
      height: window.innerHeight - 280,
      value: 7,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        phone: '',
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'phone',
          type: 'number',
          label: '手机号',
          placeholder: '请输入评价人手机号',
          props: {
            clearable: true
          }
        },
      ],
    }
  },
  created() {
    this.getList();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request('feedback.SkuFeed/queryAllFeed', {
        ...this.page,
        ...this.queryParams
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$store.state.vloading = false;
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
            this.tableData.forEach(item => {
              item.flavorScore = Number(item.flavorScore);
              item.packScore = Number(item.packScore);
            });
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
          }
        })
      );
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.tdodId
        }
      });
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.queryParams,
        pageNo: 1,
        pageSize: this.tableDataTotal
      };
      const columns = [
        {label: '序号', type: 'index'},
        {label: '菜品名称', prop: 'skuname'},
        {label: '口味（满分10分）', prop: 'flavorScore'},
        {label: '包装（满分10分）', prop: 'packScore'},
        {label: '评价内容', prop: 'propose'},
        {label: '反馈时间', prop: 'utime'},
        {label: '评价人昵称', prop: 'uname'},
        {label: '评价人手机', prop: 'uphone'},
      ];
      const res = await this.$http('feedback.SkuFeed/queryAllFeed', params);
      exportExcel({
        columns,
        filename,
        data: res.obj.dataPage.record
      });
    },
  }
}
</script>

<style>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>

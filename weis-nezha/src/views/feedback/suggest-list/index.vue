<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="7"
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
        <el-table-column label="反馈来源" prop="miniChannel"></el-table-column>
        <el-table-column label="反馈类型" prop="type"></el-table-column>
        <el-table-column label="描述">
          <template v-slot="{ row }">
            <span>{{row.content.length > 20 ? `${row.content.slice(0, 30)}......` : row.content}}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="微信号" prop="wechat"></el-table-column> -->
        <el-table-column label="反馈人昵称" prop="uname"></el-table-column>
        <el-table-column label="反馈人手机" prop="uphone"></el-table-column>
        <el-table-column label="反馈时间" prop="ctime"></el-table-column>
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
import exportExcel from '@/utils/export-excel';
export default {
  name: 'suggest-list',
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
        type: '',
        phone: '',
        miniChannel: ''
      },
      queryComps: [
        {
          component: 'BaseSelect',
          label: '反馈类型',
          key: 'type',
          props: {
            options: [
              {
                label: '全部反馈',
                value: ''
              },
              {
                label: 'bug反馈',
                value: '02'
              },
              {
                label: '功能建议',
                value: '01'
              },
            ]
          }
        },
        {
          component: 'BaseSelect',
          key: 'miniChannel',
          label: '来源',
          props: {
            options: [
              {
                label: '全部',
                value: ''
              },
              {
                label: '维士数字饮食',
                value: '01'
              },
              {
                label: '糖三彩',
                value: '04'
              },
              {
                label: '数搭',
                value: '07'
              },
            ]
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          type: 'number',
          label: '手机号',
          placeholder: '请输入反馈人手机号',
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
      this.$request('feedback.Suggest/queryAllSuggest', {
        ...this.page,
        ...this.queryParams
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$store.state.vloading = false;
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
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
          id: row.tusId
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
        {label: '反馈来源', prop: 'miniChannel'},
        {label: '反馈类型', prop: 'type'},
        {label: '描述', prop: 'content'},
        {label: '微信号', prop: 'wechat'},
        {label: '反馈人昵称', prop: 'uname'},
        {label: '反馈人手机', prop: 'uphone'},
        {label: '反馈时间', prop: 'ctime'},
      ];
      const res = await this.$http('feedback.Suggest/queryAllSuggest', params);
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

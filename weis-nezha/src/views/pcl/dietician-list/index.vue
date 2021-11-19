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
          <el-button type="primary" @click="goPage('create', 1)"
            >添加方案师</el-button
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
        @current-page-change="getDieticianList"
        @size-change="getDieticianList"
        border
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="方案师ID" prop="tcdDid"></el-table-column>
        <el-table-column label="方案师名称" prop="tcdName"></el-table-column>
        <el-table-column label="状态">
          <template class="action-cell" v-slot="{ row }">{{
            row.tcdStt === "00" ? "在线" : "下线"
          }}</template>
        </el-table-column>
        <el-table-column label="编辑人" prop="tcdAlterName"></el-table-column>
        <el-table-column label="最后编辑时间" prop="tcdUtime"></el-table-column>
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
              style="margin-right: 8px;"
              @click="hideTag('update', row)"
              v-if="row.tcdStt === '01'"
              >上线</span
            >
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 8px;"
              @click="hideTag('update', row)"
              v-if="row.tcdStt === '00'"
              >下线</span
            >
            <span
              class="brand-color cursor-pointer action-label"
              @click="hideTag('delete', row)"
              >删除</span
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
  name: 'pcl_dietician-list',
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
        tcdStt: '',
        tcdName: '',
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'tcdStt',
          label: '状态',
          props: {
            options: [
              {
                label: '全部方案师状态',
                value: ''
              },
              {
                label: '在线',
                value: '00'
              },
              {
                label: '下线',
                value: '01'
              },
            ]
          }
        },
        {
          component: 'el-input',
          key: 'tcdName',
          label: '方案师',
          maxlength: '30',
          placeholder: '请输入方案师名称',
          props: {
            clearable: true
          }
        },
      ],
    };
  },
  created() {
    this.getDieticianList();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getDieticianList();
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.tcdDid
        }
      });
    },
    getDieticianList() {
      this.$store.state.vloading = true;
      this.$request('plan.Dietician/queryDieticianList', {
        ...this.page,
        ...this.genQueryParams()
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
    hideTag(type, row) {
      let url = '';
      const params = {
        tcdDid: row.tcdDid
      };
      if (type === 'delete') {
        url = 'plan.Dietician/deleteDietician';
      } else {
        url = 'plan.Dietician/updateDieticianStatus';
        const tcdStt = row.tcdStt === '00' ? '01' : '00';
        params.tcdStt = tcdStt;
      }
      this.$request(url, params).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({
              type: 'success',
              message: '操作成功!'
            });
            this.getDieticianList();
          }
        })
      );
    }
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>

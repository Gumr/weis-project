<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="goPage('create', 1)"
            >添加厨师</el-button
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
        <el-table-column label="厨师ID" prop="tfmCode"></el-table-column>
        <el-table-column label="厨师名称" prop="tfmName"></el-table-column>
        <el-table-column label="厨师状态">
          <template class="action-cell" v-slot="{ row }">{{
            row.tfmDataStt === "01" ? "在线" : "下线"
          }}</template>
        </el-table-column>
        <el-table-column label="编辑人" prop="tfmUpdator"></el-table-column>
        <el-table-column label="最后编辑时间" prop="tfmUtime"></el-table-column>
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
              @click="hideTag('show', row)"
              v-if="row.tfmDataStt === '00'"
              >上线</span
            >
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 8px;"
              @click="hideTag('hide', row)"
              v-if="row.tfmDataStt === '01'"
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
  name: 'master_master-list',
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
        status: '',
        name: '',
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'status',
          label: '厨师状态',
          props: {
            options: [
              {
                label: '全部厨师状态',
                value: ''
              },
              {
                label: '在线',
                value: '01'
              },
              {
                label: '下线',
                value: '00'
              },
            ]
          }
        },
        {
          component: 'el-input',
          key: 'name',
          maxlength: '30',
          label: '厨师名称',
          placeholder: '请输入厨师名称',
          props: {
            clearable: true
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
          id: row.tfmId
        }
      });
    },
    getList() {
      this.$request('FoodMaster/queryAllMaster', {
        ...this.page,
        ...this.queryParams
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
          }
        })
      );
    },
    hideTag(type, row) {
      let url = '';
      const params = {
        tfmId: row.tfmId
      };
      if (type === 'delete') {
        url = 'FoodMaster/deleteMaster';
      } else if (type === 'hide'){
        url = 'FoodMaster/disabledMaster';
      } else if (type === 'show') {
        url = 'FoodMaster/enabledMaster'
      }
      this.$request(url, params).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({
              type: 'success',
              message: '操作成功!'
            });
            this.getList();
          } else {
            this.$message({
              type: 'error',
              message: err.errMsg
            });
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

<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        semi
        :action="false"
      >
        <template v-slot:action></template>
      </QueryComponents>
      <el-button type="primary" @click="toCreate()">添加单位</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        :total="tableDataTotal"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span class="brand-color cursor-pointer action-label" @click="toEdit(row)">编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="toUpdate(row, '01')"
              v-if="row.tfsStt == '00'"
            >上线</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="toUpdate(row, '00')"
              v-if="row.tfsStt == '01'"
            >下线</span>
            <span class="brand-color cursor-pointer action-label" @click="toDel(row)">删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="editDialogVisible"
      :title="title"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <div>
        <div class="section-item">
          <span class="section-label label-1">单位名称：</span>
          <el-input clearable class="medium-input" v-model="currentTag.tfsName"></el-input>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  name: 'kitchen_dish-unit',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      editDialogVisible: false,
      title: '',
      currentTag: {
        tfsName: '',
      },
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '单位ID',
          prop: 'tfsId'
        },
        {
          label: '单位名称',
          prop: 'tfsName'
        },
        {
          label: '当前状态',
          prop: 'tfsSttDesc'
        },
        {
          label: '最后编辑人',
          prop: 'tfsUpdator'
        },
        {
          label: '编辑时间',
          prop: 'tfsUtime'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {

      },
      queryComps: [

      ],
    };
  },
  methods: {
    checkText(type) {
      this.currentTag[type] = isNaN(this.currentTag[type]) ? '' : this.currentTag[type];
      this.currentTag[type] = this.currentTag[type] == '' ? '' : Number(Math.abs(this.currentTag[type])).toFixed(2);
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('FoodUnit/queryList', params);
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
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
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('FoodUnit/queryUnitById', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      });
    },
    toCreate() {
      this.title = '新增单位';
      this.currentTag = {
        tfsName: ''
      };
      this.editDialogVisible = true;
    },
    async toEdit(row) {
      this.title = '编辑单位';
      const res = await this.$http('FoodUnit/queryUnitById', { tfsId: row.tfsId });
      this.currentTag = {
        tfsId: res.obj.tfsId,
        tfsName: res.obj.tfsName
      };
      this.editDialogVisible = true;
    },
    async toUpdate(row, opType) {
      const res = await this.$http('FoodUnit/updateUnitState', { tfsId: row.tfsId, opType });
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.getList();
      } else {
        this.$msg(res.errMsg, 'error');
      }
    },
    async toDel(row) {
      this.$confirm('确定删除？', '提示？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('FoodUnit/deleteUnit', { tfsId: row.tfsId });
        if (!res.errMsg) {
          this.$msg('操作成功', 'success');
          this.getList();
        } else {
          this.$msg(res.errMsg, 'error');
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
    async tagConfirm(done) {
      if (!this.currentTag.tfsName) {
        this.$msg('请输入单位名称', 'error');
        done();
        return;
      }
      const params = this.$deepClone(this.currentTag);
      const res = await this.$http('FoodUnit/updateUnit', params);
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.editDialogVisible = false;
        this.getList();
        this.$nt(() => {
          setTimeout(done(), 800);
        });
      } else {
        this.$msg(res.errMsg, 'error');
      }
      done();
    }
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.action-label {
  margin-right: 10px;
}
.mini-input {
  width: 100px;
  margin-right: 20px;
}
.medium-picker {
  width: 300px;
}
.medium-input {
  width: 450px;
  margin-right: 20px;
}
.max-input {
  width: 350px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}
.small-select {
  margin-left: 8px;
  width: 200px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  min-height: 30px;
  flex-wrap: wrap;
  button {
    height: 30px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3,
h3 {
  margin-left: 22px;
}
</style>

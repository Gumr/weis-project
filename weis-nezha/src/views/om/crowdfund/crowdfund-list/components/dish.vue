<template>
  <div>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="80"
        :span="6"
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
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span
              class="span"
              v-if="row.trAuditResult == '07' || row.trAuditResult == '08'"
              @click="showDialog(row)"
            >关联上架菜品</span>
            <span class="span" @click="toEdit(row, 'edit')">操作</span>
            <span class="span" @click="toEdit(row, 'detail')">详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="hasDialog"
      title="选择菜品"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onconfirm"
    >
      <BasePageTable
        height="600"
        empty-text="当前没有可关联菜品，请先到erp系统新建一款菜品"
        :visible="false"
        :data="dishTable"
        :stripe="false"
        highlight-current-row
        @current-change="handleCurrentChange"
        border
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="菜品编码" prop="tfsCid"></el-table-column>
        <el-table-column label="菜品名称" prop="tfsSkuname"></el-table-column>
        <el-table-column label="菜品单价" prop="tfsPrice"></el-table-column>
      </BasePageTable>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="hasDialog2"
      title="备注"
      :close-on-click-modal="false"
      :async-confirm="true"
      :auto-confirm="false"
      @on-confirm="onconfirm2"
    >
      <el-input type="textarea" :rows="6" placeholder="请填写拒绝原因" v-model="remark" />
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
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  created() {
    this.taPhase = this.$route.query.taPhase;
    this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 330,
      hasDialog: false,
      hasDialog2: false,
      remark: '',
      dishTable: [],
      trId: '',
      currentRow: {},
      taPhase: '',
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '50'
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
          label: '上传人昵称',
          prop: 'trUname'
        },
        {
          label: '上传人手机',
          prop: 'trPhone'
        },
        {
          label: '上传时间',
          prop: 'trCtime'
        },
        {
          label: '当前状态',
          prop: 'trAuditResultDesc'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        name: '',
        phone: '',
        stt: '',
        type: '',
        date: []
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
        {
          component: 'BaseSelect',
          key: 'type',
          label: '菜品类型',
          props: {
            options: [
              { label: '全部菜品状态', value: '' },
              { label: '蔬菜', value: '01' },
              { label: '蛋白质', value: '02' },
              { label: '碳水', value: '03' },
            ]
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '上传人手机',
          placeholder: '请输入上传人手机',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '状态',
          placeholder: '请选择状态',
          props: {
            clearable: true,
            options: [
              {label: '全部', value: ''},
              {label: '违规下线', value: '00'},
              {label: '已提交', value: '01'},
              {label: '待厨房审核', value: '02'},
              {label: '未通过', value: '03'},
              {label: '已通过', value: '04'},
              {label: '投票中', value: '05'},
              {label: '终止投票', value: '06'},
              {label: '研发中', value: '07'},
              {label: '已上架', value: '08'},
              {label: '已下架', value: '09'},
            ]
          }
        },
      ],
    };
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    toEdit(row, type) {
      this.$store.state.keepRoutes.push('crowdfunding_crowdfund-list_detail');
      this.$router.push({
        path: `/om/crowdfund/dish-list/edit`,
        query: {
          id: row.trId,
          type
        }
      });
    },
    async editFoodStt(trId, type) {
      const params = {
        trId,
        type
      };
      const res = await this.$http('foodfundraising.Recipes/editFoodStt', params);
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.getList();
      } else {
        this.$msg(res.errMsg, 'error');
      }
    },
    async showDialog(row) {
      this.trId = row.trId;
      const res =  await this.$http('foodfundraising.Recipes/getPutawayFoodList', {});
      this.dishTable = res.obj;
      this.hasDialog = true;
    },
    failFoodStt(row) {
      this.trId = row.trId;
      this.hasDialog2 = true;
    },
    handleCurrentChange(val) {
      this.currentRow = val;
    },
    async onconfirm(done) {
      const res =  await this.$http('foodfundraising.Recipes/editFoodBinding', {trId: this.trId, cid: this.currentRow.tfsCid});
      if (!res.errMsg) {
        this.$msg('关联成功', 'success');
        this.hasDialog = false;
        this.getList();
        this.$nt(() => {
          setTimeout(done, 500);
        });
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    },
    async onconfirm2(done) {
      const res = await this.$http('foodfundraising.Recipes/editFoodStt', {trId: [this.trId], type: '03'});
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.getList();
        this.hasDialog2 = false;
        this.$nt(() => {
          setTimeout(done, 500);
        });
      } else {
        this.$msg(res.errMsg, 'error');
      }
    },
    async getList() {
      const params = {
        phase: this.taPhase,
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('foodfundraising.Recipes/queryFoodList', params);
      if (!res.errMsg) {
        this.tableData = res.obj.page.record;
        this.tableDataTotal = res.obj.page.totalRecordCount;
        this.$nt(() => {
          this.$refs.table.doLayout();
        });
      }
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        phase: this.taPhase,
        pasgeNo: 1,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('foodfundraising.Recipes/queryFoodList', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.page.record
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
.span {
  cursor: pointer;
  color: #409eff;
  margin: 0 5px;
  display: inline-block;
}
.medium-input {
  width: 240px;
  margin-right: 10px;
}
</style>

<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="85"
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
      <!-- <el-button type="primary" size="mini" @click="batchEdit('04')">批量通过</el-button> -->
      <el-button type="primary" size="mini" @click="batchEdit('03')">批量拒绝</el-button>
      <el-button type="primary" size="mini" @click="batchEdit('07')">批量研发</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:selection="tableSelection"
        v-model:page-size="page.pageSize"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column label="/" type="selection"></el-table-column>
        <el-table-column label="序号" type="index" width="50"></el-table-column>
        <el-table-column label="菜品ID" prop="trId"></el-table-column>
        <el-table-column label="菜品图片">
          <template class="action-cell" v-slot="{ row }">
            <el-image
              :src="row.trCoverImageUrl"
              :preview-src-list="[row.trCoverImageUrl]"
              class="food-cover"
            />
          </template>
        </el-table-column>
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
  name: 'om_crowdfund_dish-list',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  created() {
    this.getList();
  },
  watch: {
    $route(to, from) {
      this.getList();
    }
  },
  data() {
    return {
      height: window.innerHeight - 280,
      hasDialog: false,
      hasDialog2: false,
      remark: '',
      dishTable: [],
      trId: '',
      currentRow: {},
      tableData: [],
      tableDataTotal: 0,
      tableSelection: [],
      tableCol: [
        {
          label: '菜品名称',
          prop: 'trName'
        },
        {
          label: '菜品类型',
          prop: 'trTypeDesc'
        },
        {
          label: '所属期数',
          prop: 'trPhase',
          formatter: row => (row.trPhase == 0 ? '无' : `第${row.trPhase}期`)
        },
        {
          label: '当期状态',
          prop: 'trActivitySttDesc'
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
          label: '投票数',
          prop: 'trVoteNumber'
        },
        {
          label: '分享次数',
          prop: 'trShareNumber'
        },
        {
          label: '收藏人数',
          prop: 'trCollectNumber'
        },
        {
          label: '当前状态',
          prop: 'trAuditResultDesc'
        },
        {
          label: '上传时间',
          prop: 'trCtime'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        name: '',
        type: '',
        phase: '',
        phone: '',
        stt: '',
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
          key: 'phase',
          label: '所属期数',
          placeholder: '请输入所属期数',
          props: {
            clearable: true
          },
          maxlength: 30
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
              { label: '全部', value: '' },
              { label: '违规下线', value: '00' },
              { label: '已提交', value: '01' },
              { label: '待厨房审核', value: '02' },
              { label: '未通过', value: '03' },
              { label: '已通过', value: '04' },
              { label: '投票中', value: '05' },
              { label: '终止投票', value: '06' },
              { label: '研发中', value: '07' },
              { label: '已上架', value: '08' },
              { label: '已下架', value: '09' },
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
    batchEdit(type) {
      if (!this.tableSelection.length) {
        this.$msg('请选择最少一条数据', 'error');
        return;
      }
      const trId = this.tableSelection.map(item => item.trId);
      if (type == '03') {
        this.remark = '';
        this.hasDialog2 = true;
      } else {
        this.editFoodStt(trId, type);
      }
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
    toEdit(row, type) {
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {
          id: row.trId,
          type
        }
      });
    },
    async showDialog(row) {
      this.trId = row.trId;
      const res = await this.$http('foodfundraising.Recipes/getPutawayFoodList', {});
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
      const res = await this.$http('foodfundraising.Recipes/editFoodBinding', { trId: this.trId, cid: this.currentRow.tfsCid });
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
      let trId = [this.trId];
      if (this.hasDialog2) {
        trId = this.tableSelection.map(item => item.trId);
      }
      const res = await this.$http('foodfundraising.Recipes/editFoodStt', { trId, type: '03', remark: this.remark });
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.getList();
        this.hasDialog2 = false;
        this.$nt(() => {
          setTimeout(done, 500);
        });
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('foodfundraising.Recipes/queryFoodList', params);
      if (!res.errMsg) {
        this.tableData = res.obj.page.record;
        this.tableDataTotal = res.obj.page.totalRecordCount;
        setTimeout(() => {
          this.$refs.table.doLayout();
        }, 500);
      }
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.page,
        ...this.genQueryParams(),
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('foodfundraising.Recipes/queryFoodList', params);
      const columns = [{ label: '序号', type: 'index' }, { label: '菜品ID', prop: 'trId' }].concat(this.tableCol);
      exportExcel({
        columns,
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

<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents v-model="queryParams" :queryList="computedQueryComps" :span="4" semi>
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport">导出</el-button>
        </template>
      </QueryComponents>
      <el-button style="float: right;" type="primary" @click="editDialogVisible = true">创建活动</el-button>
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
            <span class="brand-color cursor-pointer action-label" @click="goDetail('edit', row)">编辑</span>
            <span class="brand-color cursor-pointer action-label" @click="del(row)">删除</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="goDetail('detail', row)"
            >详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      width="500px"
      v-model="editDialogVisible"
      title="创建发券活动"
      :close-on-click-modal="false"
      :comfirmVisible="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <div style="margin-bottom: 20px;">
        <el-button class="btn" @click="toCreate('00')">下单返券</el-button>
        <el-button class="btn" @click="toCreate('04')">注册送券</el-button>
        <!-- <el-button class="btn" @click="toCreate('01')">手动发券</el-button> -->
      </div>
      <div style="margin-bottom: 20px;">
        <el-button class="btn" @click="toCreate('02')">预定送券</el-button>
        <el-button class="btn" @click="toCreate('03')">老带新送券</el-button>
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
  name: 'marketing_recharge-card_coupon_coupon-activity',
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
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '活动ID',
          prop: 'activityShowId'
        },
        {
          label: '活动名称',
          prop: 'activityName'
        },
        {
          label: '活动类型',
          prop: 'typeStr',
        },
        {
          label: '活动周期',
          prop: 'period',
        },
        {
          label: '投放人群',
          prop: 'userType'
        },
        {
          label: '创建时间',
          prop: 'ctime'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [],
        activityName: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '创建时间',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'el-input',
          key: 'activityName',
          label: '活动名称',
          placeholder: '输入活动名称进行查询',
          props: {
            clearable: true
          },
          maxlength: 30
        },
      ],
    };
  },
  methods: {
    getList() {
      this.$store.state.vloading = true;
      this.$request('coupon.Hotlist/getHotlist', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, dataPage) => {
          this.$store.state.vloading = false;
          if (!err) {
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
          }
        })
      );
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false;
          exportExcel({
            columns: this.tableCol,
            filename,
            data: res.record
          });
        })
      );
    },
    goDetail(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.activityId,
          type: row.type
        }
      });
    },
    toCreate(type) {
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {
          type,
        }
      });
    },
    del(row) {
      this.$confirm('确认删除？', '提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this.$request('coupon.Hotlist/del', { activityId: row.activityId }).then(
          this.$rw((err, dataPage) => {
            if (!err) {
              if (!err) {
                this.$message({type: 'success', message: '删除成功'});
                this.getList();
              } else {
                this.$message({type: 'error', message: err.errMsg});
              }
            }
          })
        );
      })
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
    reqAllUserData() {
      return this.$request('coupon.Hotlist/getHotlist', {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
      });
    },
    tagConfirm() {

    },
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.btn {
  width: 220px;
  height: 50px;
}
.action-label {
  margin-right: 10px;
}
</style>

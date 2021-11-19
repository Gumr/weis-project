<template>
  <div class="page-container">
    <div style="margin: 20px 0;">
      <QueryComponents v-model="queryParams" :queryList="queryComps" :span="4">
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
        </template>
      </QueryComponents>
    </div>
    <BasePageTable
      ref="table"
      v-loading="$store.state.vloading"
      :height="height"
      :data="tableData"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      :total="tableDataTotal"
      @current-page-change="getTableData"
      @size-change="getTableData"
      border
    >
      <el-table-column v-for="(col, index) in tableCol" v-bind="col" :key="index"></el-table-column>
      <el-table-column width="220" align="center" label="操作">
        <template v-slot="{ row }">
          <el-button
            v-if="row.status === '02'"
            type="success"
            size="small"
            @click="passReviewClick(row.id)"
          >通过</el-button>
          <el-button
            v-if="row.status === '02'"
            type="warning"
            size="small"
            @click="rejectReviewClick(row)"
          >驳回</el-button>
          <el-button size="small" @click="detailClick(row.id)">详情</el-button>
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      title="驳回备注"
      v-model="reviewDialogVisible"
      @on-confirm="handleRejectConfirm"
      :auto-confirm="false"
      center
    >
      <el-input v-model="rejectMessage" type="textarea" maxlength="200" rows="4"></el-input>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const StatusOpts = [{
  label: '全部',
  value: null
}, {
  label: '驳回',
  value: '01'
}, {
  label: '待审核',
  value: '02'
}, {
  label: '通过',
  value: '03'
}];

export default {
  name: 'sales_bodybuilding_review-lsit',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      height: window.innerHeight - 280,
      counselor: {}, // 当前操作的客户经理
      reviewDialogVisible: false, // 审核备注确认框
      tableData: [],
      rejectMessage: '',
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      tableCol: [{
        type: 'index',
        label: '序号',
      }, {
        label: '姓名',
        prop: 'counselorName'
      }, {
        label: '手机号',
        prop: 'counselorPhone'
      }, {
        label: '身份证号',
        prop: 'idCardNumber'
      }, {
        label: '银行卡号',
        prop: 'bankCardNumber'
      }, {
        label: '开户银行全称',
        prop: 'bankName'
      }, {
        label: '开户支行',
        prop: 'bankBranch'
      }, {
        label: '开户人姓名',
        prop: 'accountName'
      }, {
        label: '纳税人类型',
        prop: 'taxpayerType'
      }, {
        label: '所属渠道经理名称',
        prop: 'parentCounselorName'
      }, {
        label: '当前状态',
        prop: 'status',
        formatter: (row) => {
          let res = '';
          if (row.status === '04') {
            res = '通过';
          } else {
            const match = StatusOpts.find(opt => opt.value === row.status);
            if (match) res = match.label;
          }
          return res;
        }
      }, {
        label: '备注',
        prop: 'rejectRemarks'
      }, {
        label: '提交时间',
        prop: 'ctimestr'
      }],
      queryParams: {
        stt: null,
        phone: '',
        marketType: '02'
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '审核状态',
          placeholder: '请选择审核状态',
          props: {
            clearable: true,
            options: StatusOpts
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '请输入渠道兼职客户经理手机号'
        }
      ]
    };
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getTableData();
    },
    getTableData() {
      this.$store.state.vloading = true;
      this.$request('Motion/getCounselorApplication', {
        ...this.page,
        ...this.queryParams
      }).then(
        this.$rw((err, res) => {
          this.$store.state.vloading = false;
          if (!err) {
            const { result } = res;
            this.tableDataTotal = result.totalRecordCount;
            this.tableData = result.record;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
          }
        })
      );
    },
    // updateCounselorStatus(params) {
    //   return this.$request('Motion/setCounselorApplicationStt', params);
    // },
    detailClick(id) {
      this.$pushRoute('detail', {
        query: {
          id,
          status: 0
        }
      });
    },
    passReviewClick(id) {
      this.$request('Motion/passCounselorApplication', {
        id,
      }).then(this.$rw((err) => {
        if (!err) {
          this.$message({
            message: '审核通过成功',
            type: 'success'
          });
          this.page.pageNo = 1;
          this.getTableData();
        } else {
          this.$message({
            message: err.errMsg,
            type: 'error'
          });
        }
      }));
    },
    handleRejectConfirm() {
      if (!this.rejectMessage) {
        this.$message({
          message: '请输入驳回备注',
          type: 'error'
        });
        return;
      }
      this.$request('Motion/refuseCounselorApplication', {
        id: this.counselor.id,
        remarks: this.rejectMessage
      }).then(this.$rw((err) => {
        if (!err) {
          this.$message({
            message: '审核驳回成功',
            type: 'success'
          });
          this.page.pageNo = 1;
          this.getTableData();
          this.reviewDialogVisible = false;
        }
      }));
    },
    rejectReviewClick(row) {
      this.counselor = { ...row };
      this.rejectMessage = '';
      this.id = '';
      this.reviewDialogVisible = true;
    },
  },
  created() {
    this.getTableData();
  }
};

</script>

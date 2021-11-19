<template>
  <div class="page-container">
    <div style="margin: 20px 0;">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :label-width="60"
        :span="7"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" :loading="$store.state.bloading" @click="handleExport">{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
    </div>
    <BasePageTable
      ref="table"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      v-loading="$store.state.vloading"
      :height="height"
      :data="tableData"
      :total="tableDataTotal"
      border
      @current-page-change="getTableData"
      @size-change="getTableData"
    >
      <el-table-column
        v-for="(col, index) in tableCol"
        v-bind="col"
        :key="index"
      ></el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button v-if="row.statusDesc == '正常'" type="warning" size="small" @click="updateState(row, '0')">失效</el-button>
          <el-button v-if="row.statusDesc == '失效'" type="success" size="small" @click="loseClick(row)">转移</el-button>
          <el-button v-if="row.statusDesc == '失效'" type="danger" size="small" @click="updateState(row, '1')">启动</el-button>
          <el-button type="primary" size="small" @click="detailClick(row)">详情</el-button>
        </template>
      </el-table-column>
    </BasePageTable>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import { validArray } from '@/utils/common';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';

export default {
  name: 'sales_bodybuilding_parttime-manager',
  components: {
    QueryComponents,
    BasePageTable,
  },
  data() {
    return {
      height: window.innerHeight - 280,
      consleorNameDisabled: false,
      createDialogVisible: false, // 审核备注确认框
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      tableCol: [{
        type: 'index',
        label: '序号',
      }, {
        label: '渠道兼职客户经理ID',
        prop: 'counselorId'
      }, {
        label: '渠道兼职客户经理名称',
        prop: 'counselorName'
      }, {
        label: '渠道兼职客户经理手机号',
        prop: 'counselorPhone'
      }, {
        label: '邀请人ID',
        prop: 'invitationCode',
        formatter: row => row.invitationCode || '无'
      }, {
        label: '邀请人姓名',
        prop: 'inviterName',
        formatter: row => row.inviterName || '无'
      }, {
        label: '邀请人手机号',
        prop: 'inviterPhone',
        formatter: row => (row.inviterPhone ? row.inviterPhone : '无')
      }, {
        label: '直级会员人数',
        prop: 'memberNum'
      }, {
        label: '绑定渠道经理名称',
        prop: 'parentCounselorName',
        formatter: row => (row.parentCounselorName ? row.parentCounselorName : '无')
      }, {
        label: '绑定渠道经理手机',
        prop: 'parentCounselorPhone',
        formatter: row => (row.parentCounselorPhone ? row.parentCounselorPhone : '无')
      }, {
        label: '当前状态',
        prop: 'statusDesc',
        // formatter: row => this.transformBrokerStatus(row.dataStt)
      },
      {
        label: '最后编辑时间',
        prop: 'lastModifyTime'
      }],
      queryParams: {
        date: [],
        channel: '01',
        phone: '',
        status: '',
        marketType: '02'
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '编辑时间',
          props: {
            clearable: true,
            type: 'daterange'
          }
        },
        {
          component: 'BaseSelect',
          key: 'status',
          label: '状态',
          props: {
            options: [{ label: '全部', value: '' }, { label: '正常', value: '03' }, { label: '失效', value: '04' }]
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '请输入渠道兼职客户经理手机号',
          props: {
            clearable: true
          }
        }
      ]
    };
  },
  computed: {
    tableRequestParams() {
      const params = {
        ...this.page,
        ...this.queryParams
      };

      if (validArray(params.date)) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = +startDate;
        params.endDate = +endDate;
      }

      if (!params.channel) {
        delete params.channel;
      }

      delete params.date;

      return params;
    }
  },
  created() {
    this.getTableData();
  },
  methods: {

    async broderPhoneBlur() {
      const phone = this.counselor.counselorPhone;
      if (phone.length === 11) {
        const user = await this.getUserByPhone();

        this.counselor.nickname = user.uname;
        this.counselor.counselorId = user.uid;
      } else {
        this.counselor.counselorName = '';
      }
    },
    getUserByPhone(phone = this.counselor.counselorPhone) {
      return this.$request('Customer/queryCustomerByPhone', {
        phone
      }).then(({ data }) => (data.errCode === 0 ? data.obj : Promise.reject()));
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getTableData();
    },
    updateState(row, type) {
      this.$request('Channel/updateAgentState', {
        counselorId: row.counselorId,
        id: row.id,
        marketType: '02',
        type
      }).then(this.$rw((err) => {
        if (!err) {
          this.$message({ type: 'success', message: '操作成功！' });
          this.getTableData();
        } else {
          this.$message({ type: 'error', message: err.errMsg });
        }
      }));
    },
    getTableData() {
      this.$store.state.vloading = true;
      this.$request('Channel/queryAgentList', this.tableRequestParams).then(
        this.$rw((err, result) => {
          if (!err) {
            this.$store.state.vloading = false;
            result = result.dataPage;
            this.tableDataTotal = result.totalRecordCount;
            this.tableData = result.record;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
          }
        })
      );
    },
    loseClick(row) {
      this.$pushRoute('lose', {
        query: {
          id: row.id,
          counselorId: row.counselorId,
          name: row.counselorName
        }
      });
    },
    detailClick(row) {
      this.$pushRoute('detail', {
        query: {
          id: row.id
        }
      });
    },
    handleCreateConfirm() {
      this.$refs.broderForm.validate((valid) => {
        if (valid) {
          this.addBroker().then(({ data }) => {
            if (data.errCode === 0) {
              this.$message({
                message: '添加客户经理成功',
                type: 'success'
              });
              this.page.pageNo = 1;
              this.getTableData();
              this.createDialogVisible = false;
            } else {
              this.$message({
                type: 'error',
                message: data.errMsg
              });
            }
          });
        }
      });
    },
    rejectReviewClick(row) {
      this.counselor = { ...row };
      this.rejectMessage = '';
      this.id = '';
      this.createDialogVisible = true;
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
            data: res.dataPage.record
          });
        })
      );
    },
    reqAllUserData() {
      return this.$request('Channel/queryAgentList', {
        ...this.tableRequestParams,
        pageNo: 1,
        pageSize: this.tableDataTotal,
      });
    },
  }
};

</script>

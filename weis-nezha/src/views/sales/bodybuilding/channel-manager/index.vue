<template>
  <div class="page-container">
    <div style="margin: 20px 0;display: flex;">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="60"
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
      <el-button type="danger" @click="addBrokerClick">添加渠道主管</el-button>
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
      <el-table-column label="操作" width="220">
        <template v-slot="{ row }">
          <el-button
            type="warning"
            size="small"
            v-if="row.statusDesc == '正常'"
            @click="updateState(row, '0')"
          >失效</el-button>
          <el-button
            type="success"
            size="small"
            v-if="row.statusDesc == '失效'"
            @click="loseClick(row)"
          >转移</el-button>
          <el-button
            type="danger"
            size="small"
            v-if="row.statusDesc == '失效'"
            @click="updateState(row, '1')"
          >启动</el-button>
          <el-button type="primary" size="small" @click="detailClick(row)">详情</el-button>
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      title="添加渠道经理"
      v-model="createDialogVisible"
      @on-confirm="handleCreateConfirm"
      :auto-confirm="false"
      center
    >
      <el-form ref="broderForm" :model="counselor" :rules="counselorRules" label-width="120px">
        <el-form-item label="绑定渠道主管" prop="ownCounselorId">
          <el-select v-model="counselor.ownCounselorId">
            <el-option
              v-for="item in chargeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="手机" prop="counselorPhone">
          <el-input v-model="counselor.counselorPhone" @blur="broderPhoneBlur"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <span>{{ counselor.nickname }}</span>
        </el-form-item>
        <el-form-item label="名称" prop="counselorName">
          <el-input v-model="counselor.counselorName" :disabled="consleorNameDisabled"></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { validArray } from '@/utils/common';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';

export default {
  name: 'sales_bodybuilding_channel-manager',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
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
  data() {
    return {
      height: window.innerHeight - 280,
      consleorNameDisabled: false,
      chargeOptions: [],
      counselor: {
        ownCounselorId: '',
        nickname: '',
        counselorId: '',
        counselorName: '',
        counselorPhone: '',
        channel: '02',
        marketType: '02'
      }, // 当前操作的客户经理
      counselorRules: {
        ownCounselorId: [{
          trigger: 'change',
          message: '请选择渠道主管',
          required: true
        }],
        counselorPhone: [{
          pattern: /\d{11}/,
          type: 'string',
          trigger: 'blur',
          message: '请输入规范的手机号',
          required: true
        }],
        counselorName: [{
          type: 'string',
          trigger: 'blur',
          message: '请输入姓名',
          required: true
        }],
      },
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
        label: '渠道经理ID',
        prop: 'counselorId'
      }, {
        label: '渠道经理名称',
        prop: 'counselorName'
      }, {
        label: '渠道经理手机',
        prop: 'counselorPhone'
      }, {
        label: '所属渠道主管名称',
        prop: 'inviterName',
        formatter: row => row.ownManagerName || '无'
      }, {
        label: '所属渠道主管手机号',
        prop: 'inviterPhone',
        formatter: row => (row.ownManagerPhone || '无')
      }, {
        label: '渠道兼职客户经理人数',
        prop: 'counselorNum'
      }, {
        label: '当前状态',
        prop: 'statusDesc',
      },
      {
        label: '最后编辑时间',
        prop: 'lastModifyTime'
      }],
      queryParams: {
        date: [],
        channel: '02',
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
          key: 'parentId',
          label: '所属渠道主管',
          props: {
            clearable: true,
            options: []
          }
        },
        {
          component: 'BaseSelect',
          key: 'status',
          label: '状态',
          props: {
            options: [{label: '全部', value: ''}, { label: '正常', value: '03'}, { label: '失效', value: '04'}]
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '请输入渠道经理手机号',
          props: {
            clearable: true
          }
        }
      ]
    };
  },
  methods: {
    getCharge(type) {
      const status = type === 'add' ? '03' : '';
      const params = { marketType: '02', status };
      this.$request('Channel/queryOwnCounselor', params).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            const result = dataPage.map((item) => {
              return {
                label: item.counselorName,
                value: item.counselorId,
                phone: item.counselorPhone,
              };
            });
            if (type === 'created') {
              this.queryComps[1].props.options = result;
            } else {
              this.chargeOptions = result;
            }
          }
        })
      );
    },
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
    addBrokerClick() {
      this.counselor = {
        nickname: '',
        counselorId: '',
        counselorName: '',
        counselorPhone: '',
        channel: '02',
        marketType: '02',
        ownCounselorId: '',
      };
      this.getCharge('add');
      this.createDialogVisible = true;
      this.$nt(() => {
        this.$refs.broderForm.resetFields();
      });
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
    addBroker() {
      return this.$request('Channel/addAgent', this.counselor);
    },
    rejectReviewClick(row) {
      this.counselor = { ...row };
      this.rejectMessage = '';
      this.id = '';
      this.createDialogVisible = true;
    },
    updateState(row, type) {
      this.$request('Channel/updateAgentState', {
        marketType: '02',
        counselorId: row.counselorId,
        id: row.id,
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
  },
  created() {
    this.getCharge('created');
    this.getTableData();
  }
};

</script>

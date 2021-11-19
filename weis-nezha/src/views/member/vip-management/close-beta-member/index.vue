<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents v-model="queryParams" :queryList="queryComps" :span="4" semi>
        <template v-slot:action>
          <el-button type="primary" @click="resetPageRequestData">搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
      <el-button @click="addMemberClick" type="primary">添加内测会员</el-button>
    </div>
    <BasePageTable
      ref="table"
      v-loading="$store.state.vloading"
      :height="height"
      :data="tableData"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      :total="tableDataTotal"
      @current-page-change="getAllUser"
      @size-change="getAllUser"
      border
    >
      <el-table-column label="序号" type="index"></el-table-column>
      <el-table-column label="会员ID" prop="uid"></el-table-column>
      <el-table-column prop="auth" label="会员级别">
        <template v-slot="{ row }">
          <span>{{ memberClassLabel(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员手机号" width="120" prop="phone"></el-table-column>
      <el-table-column label="推荐人" prop="inviter"></el-table-column>
      <el-table-column label="注册时间" width="160" prop="ctime">
        <template v-slot="{ row }">{{ $day(+row.ctime).format("YYYY-MM-DD HH:mm:ss") || "无" }}</template>
      </el-table-column>
      <el-table-column label="是否消费" prop="isConsumed">
        <template v-slot="{ row }">{{ row.isConsumed === "1" ? "是" : "否" }}</template>
      </el-table-column>
      <el-table-column label="打卡次数" prop="punchNum"></el-table-column>
      <el-table-column label="入场次数" prop="enterNum"></el-table-column>
      <el-table-column label="入场累计时长" prop="enterDuration"></el-table-column>
      <el-table-column label="场地消费额" prop="totalVenueFees"></el-table-column>
      <el-table-column label="买课节数" prop="totalPaidClassNum"></el-table-column>
      <el-table-column label="买课总消费额" prop="totalPaidAmount"></el-table-column>
      <el-table-column label="约课节数" prop="totalAppointNum"></el-table-column>
      <el-table-column label="课程金额总和" prop="totalClassAmount"></el-table-column>
      <el-table-column label="会员状态" prop="userStatus">
        <template v-slot="{ row }">{{ userStatusLabel(row) }}</template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="{ row }">
          <div class="op-action brand-color cursor-pointer" @click="goEntryPage(row)">入场记录</div>
          <div class="op-action brand-color cursor-pointer" @click="goAppointPage(row)">约课记录</div>
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      title="添加内测会员"
      v-model="addMemberDialogVsibile"
      :close-on-click-modal="false"
      :auto-mutation="false"
      @on-confirm="handleAddMemberConfirm"
      @on-cancel="hiddenAddMemberDialog"
      async-confirm
    >
      <div class="add-member-section">
        <span class="add-member-label">会员手机</span>
        <el-input class="add-member-input" v-model="memberPhone">
          <template #append>
            <el-button @click="handleAddMember">添加</el-button>
          </template>
        </el-input>
      </div>
      <div class="add-member-section">
        <span class="add-member-label" v-show="addMemberList.length > 0">已添加</span>
        <ul class="add-member-list-wrap">
          <li class="add-member-item" v-for="(mb, index) in addMemberList" :key="index">
            <span class="add-member-phone overflow-ellipsis">{{ mb }}</span>
            <el-button size="mini" @click="handleRemoveMember(index)" type="warning">移除</el-button>
          </li>
        </ul>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import { memberClassMap, userStatusMap } from '@/utils/data-map';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import exportExcel from '@/utils/export-excel';

export default {
  components: {
    ConfirmDialog,
    BasePageTable
  },
  created() {
    this.getAllUser();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      addMemberList: [],
      addMemberDialogVsibile: false,
      memberPhone: '',
      page: {
        pageNo: 1,
        pageSize: 10
      },
      tableDataTotal: 0,
      queryParams: {
        date: [],
        phone: ''
      },
      tableCol: [{
        label: '序号',
        type: 'index'
      }, {
        label: '会员ID',
        prop: 'uid'
      }, {
        label: '会员级别',
        prop: 'auth',
        formatter: this.memberClassLabel
      }, {
        label: '会员手机号',
        prop: 'phone'
      }, {
        label: '推荐人',
        prop: 'inviter'
      }, {
        label: '注册时间',
        prop: 'ctime',
        formatter: row => this.$day(+row.ctime).format('YYYY-MM-DD HH:mm:ss'),
      }, {
        label: '是否消费',
        prop: 'isConsumed',
        formatter: row => (row.isConsumed === '1' ? '是' : '否'),
      }, {
        label: '打卡次数',
        prop: 'punchNum'
      }, {
        label: '入场次数',
        prop: 'enterNum'
      }, {
        label: '入场累计时长',
        prop: 'enterDuration'
      }, {
        label: '场地消费额',
        prop: 'totalVenueFees'
      }, {
        label: '买课节数',
        prop: 'totalPaidClassNum'
      }, {
        label: '买课总消费额',
        prop: 'totalPaidAmount'
      }, {
        label: '约课节数',
        prop: 'totalAppointNum'
      }, {
        label: '课程金额总和',
        prop: 'totalClassAmount'
      }, {
        label: '会员状态',
        prop: 'userStatus',
        formatter: this.userStatusLabel
      }],
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '请输入会员手机号',
          props: {
            clearable: true
          }
        }]
    };
  },
  methods: {
    handleExport() {
      const filename = `${this.$route.meta.title}-导出`;

      this.reqAllUserData({
        pageNo: 1,
        pageSize: this.tableDataTotal
      }).then(this.$rw((err, { dataPage }) => {
        exportExcel({
          columns: this.tableCol,
          filename,
          data: dataPage.record
        });
      }));
    },
    handleAddMember() {
      const member = this.memberPhone;

      if (!member) {
        this.$message({
          message: '请输入会员号码',
          type: 'error'
        });
      } else if (this.addMemberList.includes(member)) {
        this.$message({
          message: '会员已添加过',
          type: 'error'
        });
      } else {
        this.addMemberList.push(member);
        this.memberPhone = '';
      }
    },
    addMemberClick() {
      this.addMemberDialogVsibile = true;
      this.addMemberList = [];
      this.memberPhone = '';
    },
    handleRemoveMember(idx) {
      this.addMemberList.splice(idx, 1);
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate;
        params.endDate = endDate;
      }
      delete params.date;
      return params;
    },
    memberClassLabel(data) {
      return memberClassMap[data.auth];
    },
    userStatusLabel(data) {
      return userStatusMap[data.userStatus];
    },
    handleAddMemberConfirm(done) {
      if (this.addMemberList.length <= 0) {
        this.$message({
          type: 'warning',
          message: '请至少添加一条内测会员'
        });
        done();
        return;
      }

      this.addMember()
        .then(this.$rw((err, { updateResult }) => {
          if (!err) {
            if (updateResult === 0) {
              this.$message({
                type: 'error',
                message: '添加未成功，请检查会员是非内测的已有会员'
              });
            } else {
              this.addMemberDialogVsibile = false;
              this.resetPageRequestData();
            }
          }
          done();
        }))
        .catch(done);
    },
    addMember() {
      return this.$request('Customer/updateUserToBeta', {
        phone: this.addMemberList,
        opType: '1',
        auth: '1'
      });
    },
    hiddenAddMemberDialog() {
      this.addMemberDialogVsibile = false;
    },
    resetPageRequestData() {
      this.page.pageNo = 1;
      this.getAllUser();
    },
    reqAllUserData(page = {}) {
      return this.$request('Customer/getAllUser', {
        ...page,
        ...this.genQueryParams(),
        auth: '1'
      });
    },
    getAllUser() {
      this.reqAllUserData(this.page).then(this.$rw((err, { dataPage }) => {
        if (!err) {
          this.tableDataTotal = dataPage.totalRecordCount;
          this.tableData = dataPage.record;
        }
      }));
    },
    goEntryPage(data) {
      this.$router.push({
        path: '/order/entry-list',
        query: {
          phone: data.phone
        }
      });
    },
    goAppointPage(data) {
      this.$router.push({
        path: '/order/appoint-class-list',
        query: {
          phone: data.phone
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.add-bar {
  text-align: right;
  margin-bottom: 20px;
}

.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.table-wrap {
  padding: 0 14px;
}

.add-member-section {
  display: flex;
  margin-bottom: 12px;
  .add-member-label {
    display: inline-block;
    min-width: 120px;
  }
  .add-member-input {
    width: 480px;
  }
}

.add-member-list-wrap {
  margin: 0;
  .add-member-item {
    margin: 12px 0;
    list-style: none;
  }
  .add-member-phone {
    display: inline-block;
    width: 220px;
  }
}
</style>

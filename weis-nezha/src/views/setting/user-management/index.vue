<template>
  <div class="page-container">
    <div style="margin: 20px 0;display: flex;">
      <QueryComponents v-model="queryParams" :queryList="queryComps" :span="6" :label-width="60">
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="createClick">新建用户</el-button>
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
      <el-table-column v-for="col in tableCol" :key="col.label" v-bind="col"></el-table-column>
      <el-table-column label="操作" width="260">
        <template v-slot="{ row }">
          <el-tag class="cursor-pointer action-tag" type="success" @click="editUserClick(row)">编辑</el-tag>
          <el-tag
            class="cursor-pointer action-tag"
            type="warning"
            @click="changeStatusClick(row)"
          >{{ row.status === "1" ? "禁用" : "启用" }}</el-tag>
          <el-tag class="cursor-pointer action-tag" @click="resetPasswordClick(row.uid)">重置密码</el-tag>
          <el-tag class="cursor-pointer" type="danger" @click="deleteClick(row.uid)">删除</el-tag>
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      :title="dialogMode === 'create' ? '新建用户' : '编辑用户'"
      v-model="userDialogVisible"
      @on-confirm="handleUserDialogConfirm"
      :auto-confirm="false"
      :close-on-click-modal="false"
      center
    >
      <div class="display-flex user-form-item">
        <span class="user-label">用户姓名：</span>
        <el-input v-model="role.uname"></el-input>
      </div>
      <div class="display-flex user-form-item">
        <span class="user-label">用户手机：</span>
        <el-input v-model="role.phone"></el-input>
      </div>
      <div class="display-flex user-form-item">
        <span class="user-label">所属角色：</span>
        <BaseSelect class="role-select" v-model="role.roleId" :options="roleList" />
      </div>
      <div v-if="dialogMode === 'create'">
        <span class="user-label">初始密码：</span>
        <span>weis666666</span>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { optionsToMap } from '@/utils/data-map';
import { transformDaterange } from '@/utils/transform';

const UserStatusOpts = [{
  label: '全部',
  value: -1
}, {
  label: '正常',
  value: '1'
}, {
  label: '冻结',
  value: '2'
}];

const UserStatusMap = optionsToMap(UserStatusOpts);

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      height: window.innerHeight - 280,
      userDialogVisible: false,
      dialogMode: 'create',
      page: {
        pageNo: 1,
        pageSize: 10
      },
      roleList: [],
      role: {
        uid: '',
        uname: '',
        phone: '',
        roleId: '',
      },
      tableDataTotal: 0,
      tableData: [],
      tableCol: [{
        type: 'index',
        label: '序号',
      }, {
        label: '用户ID',
        prop: 'uid'
      }, {
        label: '用户手机',
        prop: 'phone'
      }, {
        label: '用户名称',
        prop: 'uname'
      }, {
        label: '所属角色',
        prop: 'roleName'
      }, {
        label: '当前状态',
        prop: 'status',
        formatter: row => UserStatusMap[row.status]
      }, {
        label: '创建时间',
        prop: 'ctime',
        formatter: row => this.$day(+row.ctime).format('YYYY-MM-DD HH:mm:ss')
      }, {
        label: '创建人账号',
        prop: 'creatorName'
      }],
      queryParams: {
        data: [],
        status: '',
        phone: ''
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            clearable: true,
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'BaseSelect',
          key: 'status',
          label: '用户状态',
          placeholder: '请选择用户状态',
          props: {
            clearable: true,
            options: UserStatusOpts
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '输入手机号',
          props: {
            clearable: true,
          }
        }
      ]
    };
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getTableData();
    },

    handleUserDialogConfirm() {
      if (this.dialogMode === 'create') {
        this.addUser();
      }

      if (this.dialogMode === 'edit') {
        this.editUser();
      }
    },

    editUser() {
      this.$request('sys.User/editUser', this.role)
        .then(({ data }) => {
          if (data.obj && data.obj.result === 1) {
            this.userDialogVisible = false;
            this.getTableData();
          }
        });
    },

    addUser() {
      this.$request('sys.User/addUser', this.role)
        .then(({ data }) => {
          if (data.obj && data.obj.result === 1) {
            this.userDialogVisible = false;
            this.getTableData();
          } else {
            this.$msg(data.errMsg, 'error');
          }
        });
    },

    editUserClick(user) {
      this.role = { ...user };
      delete this.role.roleName;
      this.dialogMode = 'edit';
      this.userDialogVisible = true;
    },

    resetPasswordClick(uid) {
      this.$request('sys.User/resetPwd', {
        uid
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: 'success',
            message: '重置用户密码成功'
          });
        } else {
          this.$message({
            type: 'error',
            message: data.errMsg
          });
        }
      });
    },
    deleteClick(uid) {
      this.$confirm('此操作将删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request('sys.User/deleteUser', {
          uid
        }).then(({ data }) => {
          if (data.errCode === 0) {
            this.$message({
              type: 'success',
              message: '删除用户成功'
            });

            this.getTableData();
          }
        });
      }).catch(() => {});
    },
    changeStatusClick(row) {
      const url = {
        2: 'sys.User/enableUser',
        1: 'sys.User/disableUser'
      }[row.status];

      this.$request(url, {
        uid: row.uid
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: 'success',
            message: '修改用户状态成功'
          });
          this.getTableData();
        }
      });
    },
    createClick() {
      this.userDialogVisible = true;
      this.dialogMode = 'create';
      this.role = {
        uname: '',
        phone: '',
        roleId: (this.roleList[0] && this.roleList[0].value) || '',
      };
    },
    genParams() {
      const params = { ...this.queryParams };

      const { date } = params;
      if (Array.isArray(date) && date.length > 0) {
        const [startDate, endDate] = transformDaterange(date);
        params.startDate = +startDate;
        params.endDate = +endDate;
      }

      delete params.date;

      return params;
    },
    getRoleOpts() {
      this.$request('sys.Role/queryEnableRole').then(({ data }) => {
        if (data.errCode === 0) {
          this.roleList = data.obj.result;
        }
      });
    },
    getTableData() {
      this.$request('sys.User/queryUserList', {
        ...this.genParams(),
        ...this.page
      }).then(({ data }) => {
        if (data.errCode === 0) {
          data = data.obj.dataPage;
          this.tableData = data.record;
          this.tableDataTotal = data.totalRecordCount;
        }
      });
    },

  },
  created() {
    this.getTableData();
    this.getRoleOpts();
  }
};

</script>

<style lang="less" scoped>
.create-section {
  margin-bottom: 22px;
}

.user-form-item {
  margin: 12px 0;
}

.action-tag {
  margin-right: 6px;
}

.role-select {
  width: 300px;
}

.user-label {
  display: inline-block;
  min-width: 140px;
  width: 140px;
  text-align: right;
}
</style>

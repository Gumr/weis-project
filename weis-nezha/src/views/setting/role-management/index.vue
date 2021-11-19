<template>
  <div class="page-container">
    <div style="margin: 20px 0;display: flex;">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="3"
      >
        <template v-slot:action>
          <el-button
            type="primary"
            @click="searchClick"
          >搜索</el-button>
        </template>
      </QueryComponents>
      <el-button
        type="primary"
        @click="$pushRoute('search')"
      >权限查询</el-button>
      <el-button
        type="primary"
        @click="$pushRoute('create')"
      >新建角色</el-button>
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
      <el-table-column
        v-for="col in tableCol"
        :key="col.label"
        v-bind="col"
      ></el-table-column>
      <el-table-column
        label="操作"
        width="300"
        align="center"
      >
        <template v-slot="{ row }">
          <el-tag
            class="cursor-pointer action-tag"
            type="success"
            @click="editRoleClick(row.trId)"
          >编辑</el-tag>
          <el-tag
            class="cursor-pointer action-tag"
            type="warning"
            @click="detailRoleClick(row.trId)"
          >详情</el-tag>
          <el-tag
            class="cursor-pointer action-tag"
            @click="changeRoleStatusClick(row)"
          >{{ row.trStatus === "01" ? "禁用" : "启用" }}</el-tag>
          <el-tag
            type="info"
            class="cursor-pointer action-tag"
            @click="userCount(row.trId)"
          >账号</el-tag>
          <el-tag
            class="cursor-pointer"
            type="danger"
            @click="deleteRoleClick(row.trId)"
          >删除</el-tag>
        </template>
      </el-table-column>
    </BasePageTable>
  </div>
  <ConfirmDialog
    v-model="DialogVisible"
    title="账号"
    :close-on-click-modal="false"
    :auto-confirm="false"
    :async-confirm="false"
    :comfirmVisible="false"
  >
    <el-button
      type="primary"
      style="margin-bottom: 10px;float:right"
      @click="handleExport"
    >导出</el-button>
    <BasePageTable
      :height="height"
      :data="userData.filter(data => !search || data.phone.toLowerCase().includes(search.toLowerCase()))"
      :visible="false"
      border
    >

      <el-table-column
        type="index"
        label="序号"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="uname"
        label="用户姓名"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="phone"
        label="用户手机"
        align="center"
      >
        <template #header>
          <div style="display:inline-flex;">
            <label style="padding-top: 10px;">用户手机</label>
            <el-input
              v-model="search"
              style="width:200px;margin-left:20px"
              placeholder="输入手机号筛选"
              clearable
            />

          </div>

        </template>

      </el-table-column>
    </BasePageTable>

  </ConfirmDialog>
</template>

<script>
import BasePageTable from "@/components/BasePageTable.vue";
import QueryComponents from "@/components/QueryComponents.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import exportExcel from '@/utils/export-excel';
const RoleStatusMap = {
  "01": "启用",
  "02": "关闭",
};

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
  },
  data() {
    return {
      search: "",
      DialogVisible: false,
      height: window.innerHeight - 280,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      tableDataTotal: 0,
      tableData: [],
      userData: [],
      tableCol: [
        {
          type: "index",
          label: "序号",
        },
        {
          label: "角色ID",
          prop: "trId",
        },
        {
          label: "角色名称",
          prop: "trName",
        },
        {
          label: "角色权限详情",
          prop: "tmName",
          formatter: (row) =>
            row.tmName.length > 60
              ? `${row.tmName.slice(0, 60)}...`
              : row.tmName,
        },
        {
          label: "创建时间",
          prop: "trCtime",
        },
        {
          label: "角色状态",
          prop: "trStatus",
          formatter: this.roleStatusFormatter,
        },
        {
          label: "创建人",
          prop: "creator",
        },
        {
          label: "操作人",
          prop: "operator",
        },
      ],
      queryParams: {
        strValue: "",
      },
      queryComps: [
        {
          component: "el-input",
          key: "strValue",
          placeholder: "请输入角色名称",
          props: {
            clearable: true,
          },
        },
      ],
    };
  },
  methods: {
    handleExport() {
      const filename = `${this.$route.meta.title}-导出`;
      const columns = [
        { label: "序号", type: "index" },
        { label: "用户姓名", prop: "uname" },
        { label: "用户手机", prop: "phone" },
      ];
      exportExcel({
        columns: columns,
        filename,
        data: this.userData,
      });
    },
    userCount(id) {
      this.$request("sys.Role/queryUserForRole", {
        rid: id,
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.userData = data.obj;
          this.DialogVisible = true;
        } else {
          this.$msg(data.errMsg, "error");
        }
      });
    },
    closeRole(id) {
      this.$request("sys.Role/closeRole", {
        intValue: id,
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.getTableData();
        }
      });
    },
    openRole(id) {
      this.$request("sys.Role/openRole", {
        intValue: id,
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.getTableData();
        }
      });
    },
    changeRoleStatusClick(row) {
      if (row.trStatus === "01") {
        this.closeRole(row.trId);
      } else if (row.trStatus === "02") {
        this.openRole(row.trId);
      }
    },
    roleStatusFormatter(row) {
      return RoleStatusMap[row.trStatus];
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getTableData();
    },
    getTableData() {
      this.$request("sys.Role/getRole", {
        ...this.page,
        ...this.queryParams,
      }).then(({ data }) => {
        if (data.errCode === 0) {
          data = data.obj.result;
          this.tableData = data.record;
          this.tableDataTotal = data.totalRecordCount;
        }
      });
    },
    deleteRoleClick(id) {
      this.$confirm(`确认删除？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(async () => {
        this.$request("sys.Role/delRole", {
          intValue: id,
        }).then(({ data }) => {
          if (data.errCode === 0) {
            this.$msg("删除成功", "success");
            this.getTableData();
          } else {
            this.$msg(data.errMsg, "error");
          }
        });
      });
    },
    detailRoleClick(id) {
      this.$pushRoute("detail", {
        query: {
          id,
        },
      });
    },
    editRoleClick(id) {
      this.$pushRoute("edit", {
        query: {
          id,
        },
      });
    },
  },
  created() {
    this.getTableData();
  },
};
</script>

<style lang="less" scoped>
.create-section {
  margin-bottom: 22px;
}

.action-tag {
  margin-right: 8px;
}
</style>

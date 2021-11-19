<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        :label-width="80"
        semi
      >
        <template v-slot:action>
          <el-button
            type="primary"
            @click="searchClick()"
          >搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
      <el-button
        type="primary"
        @click="showAdd"
      >添加人员</el-button>
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
        :visible="false"
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
          align="center"
        ></el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template
            class="action-cell"
            v-slot="{ row }"
          >
            <span
              class="brand-color cursor-pointer action-label"
              @click="toDel(row)"
            >删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="showSel"
      title="添加人员"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color:red">*</span>手机号：
          </span>
          <NumberInput
            clearable
            class="medium-input"
            v-model="userPhone"
            @input="getName"
          ></NumberInput>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            昵称:
          </span>
          <span>{{userName}}</span>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { transformDaterange } from "@/utils/transform";
import BaseSelect from "@/components/BaseSelect.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
export default {
  components: {
    QueryComponents,
    BasePageTable,
    BaseSelect,
    ConfirmDialog,
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    },
  },
  created() {
    this.getList();
  },
  data() {
    return {
      userPhone: "",
      userName: "",
      userId: "",
      tableSelection: [],
      showSel: false,
      height: window.innerHeight - 280,
      tableData: [],
      tableData2: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "昵称",
          prop: "uname",
        },
        {
          label: "手机号",
          prop: "phone",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        phone: "",
      },
      queryComps: [
        {
          component: "el-input",
          key: "phone",
          label: "手机号",
          placeholder: "请输入手机号",
          props: {
            clearable: true,
          },
        },
      ],
    };
  },
  methods: {
    async showAdd() {
       this.userName=''
       this.userId=''
       this.userPhone= ''
      this.showSel = true;
     
    },
    async getName() {
      const res = await this.$http(
        "mealcircle.MealCircleManage/queryUserByPhone",
        {phone:this.userPhone}
      );
      this.userId = res.obj.uid
      this.userName=res.obj.uname
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.queryParams,
      };
      this.$store.state.vloading = true;
      const res = await this.$http(
        "mealcircle.MealCircleManage/queryUserMealCircleManage",
        params
      );
      if (!res.errMsg) {
        this.tableData = res.obj;
        // this.tableDataTotal = res.obj.totalRecordCount;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async onconfirm() {
      if (!this.userId) {
        this.$msg("请输入正确的手机号", "error");
        return;
      } else {
       
        const res = await this.$http("mealcircle.MealCircleManage/addUserMealCircleManage", {uid:this.userId});
        if (!res.errMsg) {
          this.$msg("操作成功", "success");
          this.showSel = false;
          this.getList();
        } else {
          this.$msg(res.errMsg, "error");
        }
      }
    },
    async handleExport() {
      this.$store.state.bloading = true;
      
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.queryParams,
        pageNo: 1,
        pageSize: 99999,
      };
    
      const res = await this.$http(
        "mealcircle.MealCircleManage/queryUserMealCircleManage",
        params
      );
      
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj,
      });
    },

    toDel(row) {
      this.$confirm(`确认删除该人员？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(async () => {
        const res = await this.$http("mealcircle.MealCircleManage/delUserMealCircleManage", {
          uid:row.uid
        });
        if (!res.errMsg) {
          this.$msg("删除成功", "success");
          this.getList();
        } else {
          this.$msg(res.errMsg, "error");
        }
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format("YYYY-MM-DD");
        params.endDate = endDate.format("YYYY-MM-DD");
      }
      delete params.date;
      return params;
    },
  },
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.medium-input {
  width: 250px;
  margin-right: 20px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
</style>

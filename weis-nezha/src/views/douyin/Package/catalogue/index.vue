<template>
  <div class="page-container">
    <div class="query-bar">
      <el-button
        type="primary"
        @click="Add()"
      >新建类目</el-button>

    </div>

    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :data="tableData"
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
            #default="{ row }"
            class="action-cell"
          >
            <span
              class="brand-color cursor-pointer action-label"
              @click="editTagClick(row)"
              style="margin-right:10px"
            >编辑 </span>
            <span
              class="brand-color cursor-pointer"
              :class="row.classifyStt == '上线'?'redSpan':''"
              @click="deleteTagClick(row)"
            >{{row.classifyStt == '上线'?'下线':'上线'}}</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="editDialogVisible"
      title='类目'
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="tagConfirm"
    >
      <el-form
        :model="currentTag"
        label-width="80px"
      >

        <el-form-item label="*类目名称">
          <el-input
            v-model="currentTag.classifyName"
            class="medium-input"
          ></el-input>
        </el-form-item>

        <el-form-item label="*排序">
          <NumberInput
            v-model="currentTag.classifyRank"
            class="medium-input"
          ></NumberInput>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
export default {
  components: {
    ConfirmDialog,
  },
  data() {
    return {
      currentTag: {
        classifyName: "",
        classifyRank: "",
      },
      tagCategoryOpts: [],
      editDialogVisible: false,
      // height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "类目名称",
          prop: "classifyName",
        },
        {
          label: "排序",
          prop: "classifyRank",
        },
        // {
        //   label: '端口',
        //   prop: 'market'
        // },
        {
          label: "状态",
          prop: "classifyStt",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        // couponName: "",
      },
    };
  },

  created() {},
  mounted() {
    this.getList();
  },
  methods: {
    Add() {
      //新建类目
      this.currentTag = {};
      this.editDialogVisible = true;
    },
    async deleteTagClick(row) {
      //上线 下线
      row.classifyStt = row.classifyStt == "上线" ? "00" : "10";
      const res = await this.$http("doupack.DouPackClassify/opClassify", {
        ...row,
      });
      if (!res.errMsg) {
        this.getList();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    editTagClick(row) {
      this.currentTag = { ...row };
      this.editDialogVisible = true;
    },
    async getList() {
      //查询类目
      this.$store.state.vloading = true;
      const res = await this.$http("doupack.DouPackClassify/queryClassify", {
        ...this.page,
        ...this.queryParams,
      });
      if (!res.errMsg) {
        this.tableData = res.obj;
        // this.tableDataTotal = res.obj.totalRecordCount;
      }
    },
    async tagConfirm() {
      //新建 编辑 类目
      if (!this.currentTag.classifyName) {
        this.$msg("请输入正确的类目名称", "error");
        return;
      } else if (!this.currentTag.classifyRank) {
        this.$msg("请输入正确的排序", "error");
        return;
      }
      const res = await this.$http("doupack.DouPackClassify/opClassify", {
        ...this.currentTag,
        classifyStt: "10",
      });
      if (!res.errMsg) {
        this.editDialogVisible = false;
        this.getList();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;

      const res = await this.$http("data.CouponData/queryGetCouponData", {
        ...this.page,
        ...this.queryParams,
      });
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record,
      });
    },
  },
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
  float: right;
}
.redSpan {
  color: red;
}
// .medium-input {
//   width: 250px;
//   margin-right: 20px;
// }

// .label-1 {
//   width: 170px;
//   margin-right: 12px;
//   text-align: right;
// }
// .action-label {
//   margin-right: 10px;
// }
</style>

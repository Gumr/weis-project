<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="70"
        :span="2"
        semi
      >
        <template v-slot:action>
          <el-button
            type="primary"
            @click="getList"
          >搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
          <span
            style="color:blue;line-height: 40px;"
            class="float-right cursor-pointer"
            @click="downLoadTemplate"
          >下载导入模板</span>
          <el-button
            type="primary"
            class="float-right"
            @click="choiceUpload"
            style="margin-right:20px"
          >批量导入</el-button>
          <el-button
            type="primary"
            class="float-right"
            @click="addEmpInfo"
            style="margin-right:20px"
          >手动添加</el-button>

        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :data="tableData"
        border
        @current-page-change="getList"
        @size-change="getList"
        :total="tableDataTotal"
        ref="table"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          v-bind="col"
          align="center"
        ></el-table-column>
        <el-table-column
          label="操作"
          :width="160"
          align="center"
        >
          <template #default="{row}">
            <span
              class="table-action-label"
              style="margin-right: 6px"
              @click="deleteClick(row)"
            >移除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="box"
      title="手动添加"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onWareConfirm"
    >
      <div class="section-item">
        <span class="section-label label-1">手机号:</span>
        <NumberInput
          v-model="phone"
          placeholder="请输入手机号"
          clearable
          class="medium-input"
        ></NumberInput>
      </div>
    </ConfirmDialog>
    <input
      ref="upload"
      type="file"
      accept=".xls, .xlsx"
      class="outputlist_upload"
      style="opacity: 0;"
    />
  </div>
</template>

<script>
import ImageUpload from "@/components/ImageUpload.vue";
import { defineComponent } from "vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import exportExcel from "@/utils/export-excel";
import XLSX from "@/utils/xlsx";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { ElForm, ElMessageBox, ElMessage } from "element-plus";
export default defineComponent({
  components: {
    QueryComponents,
    ImageUpload,
    ConfirmDialog,
    BasePageTable,
  },
  data() {
    return {
      phoneList: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      box: false,
      tableDataTotal: 0,
      tableData: [],
      empInfo: {},
      phone: "",
      queryParams: {
        phone: "",
      },
      queryComps: [
        {
          component: "NumberInput",
          key: "phone",
          label: "手机号",
          placeholder: "请输入手机号",
          props: {
            clearable: true,
          },
        },
      ],
      columns: [
        {
          type: "index",
          label: "序号",
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
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    this.$refs.upload.addEventListener("change", (e) => {
      // 绑定监听表格导入事件
      this.readExcel(e);
    });
  },
  methods: {
    addEmpInfo() {
      this.phone = "";
      this.box = true;
    },
    downLoadTemplate() {
      const col = [
        { label: "序号", type: "index", width: "80" },

        { label: "微信绑定手机号", prop: "tgePhone" },
      ];
      exportExcel({
        columns: col,
        filename: "灰度名单导入模板",
        data: [],
      });
    },

    async onWareConfirm(done) {
      const params = {
        phone: this.phone,
      };
      const res = await this.$http("sku.SkuWhiteList/addSkuWhiteList", params);
      if (!res.errMsg) {
        this.$msg("添加成功", "success");
        this.$refs.table.$refs.table.clearSelection();
        this.box = false;
        this.getList();
        setTimeout(done, 500);
      } else {
        this.$msg(res.errMsg, "error");
        done();
      }
    },
    upexcel() {
      this.$store.state.vloading = true;
      this.$request("sku.SkuWhiteList/addSkuWhiteListForBatch", {
        phone: this.phoneList,
      }).then(
        this.$rw((err, res) => {
          if (err) {
            this.$message({ type: "error", message: err.errMsg });
          } else {
            this.$msg("添加成功", "success");
          }
          this.phoneList = [];
          this.getList();
        })
      );
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request("sku.SkuWhiteList/querySkuWhiteList", {
        ...this.page,
        ...this.queryParams,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$store.state.vloading = false;

            this.tableDataTotal = res.totalRecordCount;
            this.tableData = res.record;
            setTimeout(() => {
              this.$refs.table.doLayout();
            }, 500);
          }
        })
      );
    },
    async handleExport() {
      this.$store.state.bloading = true;
      let page = {
        pageNo: 1,
        pageSize: 99999,
      };
      this.getEvaluateConformity(page)
        .thenwrap((err, res) => {
          if (!err) {
            exportExcel({
              data: res.record,
              columns: this.columns,
              filename: "灰度人群名单",
            });
          }
        })
        .finally(() => {
          this.$store.state.bloading = false;
        });
    },
    choiceUpload() {
      this.$refs.upload.dispatchEvent(new MouseEvent("click"));
    },
    getEvaluateConformity(page) {
      return this.$request("sku.SkuWhiteList/querySkuWhiteList", {
        pageNo:page.pageNo,
        pageSize:page.pageSize,
        ...this.queryParams,
      });
    },
    deleteClick(row) {
      ElMessageBox.confirm("是否移除该用户？", "提示").then(() => {
        this.$request("sku.SkuWhiteList/removeSkuWhiteList", {
          uid: row.uid,
        }).thenwrap((err) => {
          if (!err) {
            this.getList();
          }
        });
      });
    },
    readExcel(e) {
      const files = e.target.files;
      if (files.length <= 0) {
        this.$message({ type: "error", message: "没有文件名" });
        return;
      }
      if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        this.$message({
          type: "error",
          message: "上传格式不正确，请上传xls或者xlsx格式",
        });
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = (ev) => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const wsname = workbook.SheetNames[0]; // 取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); // 生成json表格内容

          const outputs = ws.map((item) => ({
            phone: item["微信绑定手机号"],
          }));
          var re = /^[0-9]+.?[0-9]*/; //判断字符串是否为数字//判断正整数/[1−9]+[0−9]∗]∗/
          outputs.forEach((element) => {
            if (re.test(element.phone)) {
              this.phoneList.push(element.phone);
            }
          });
          this.upexcel();
          this.$refs.upload.value = "";
          // this.$nt(() => {
          //   this.$refs.empTable.doLayout();
          // });
        } catch (e) {
          this.$message({ type: "error", message: e });
        }
      };
      fileReader.readAsBinaryString(files[0]);
    },
  },
});
</script>

<style>
</style>
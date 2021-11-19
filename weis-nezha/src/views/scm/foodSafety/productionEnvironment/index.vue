<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="3"
        :label-width="60"
        semi
      >
        <template v-slot:action>
          <el-button
            type="primary"
            @click="searchClick"
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
        @click="add()"
      >新建检测</el-button>

    </div>

    <div>
      <BasePageTable
        ref="table"
        :height="height"
        v-loading="loading"
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        @current-page-change="getFoodStatisticList"
        @size-change="getFoodStatisticList"
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        >
          <template
            #default="{ row }"
            class="action-cell"
            v-if="col.prop === 'document'"
          >
            <span
              class="brand-color cursor-pointer action-label"
              @click="downLoad(row.document[0].name,row.document[0].url)"
            >{{row.document[0].name}}</span>
          </template>

        </el-table-column>
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
              @click="goDetail(row)"
            >编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-left:10px;color:red"
              @click="del(row)"
            >删除</span>

          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="box"
      title="检测"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <el-form label-width="130px">
        <el-form-item label="文档名称：">
          <el-input
            v-model="formData.docName"
            class="small-input"
            style="width: 350px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="检测日期：">
          <el-date-picker
            v-model="formData.examineDate"
            class="medium-input"
            value-format="yyyy-MM-dd"
            style="width: 350px;"
          ></el-date-picker>

        </el-form-item>
        <el-form-item label="生产日期：">

          <el-date-picker
            v-model="formData.producedDate"
            class="medium-input"
            value-format="yyyy-MM-dd"
            style="width: 350px;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="文件">
          <!-- <el-input
            v-model="formData.methodParams"
            class="small-input"
            style="width: 350px;"
          ></el-input> -->
          <el-upload
            class="upload-demo"
            action="/upload/image"
            :on-remove="handleRemove"
            :on-success="handleVideoSuccess"
            drag
            :file-list="fileList"
            :limit="1"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { transformDaterange } from "@/utils/transform";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default {
  name: "scm_central-kitchen_dish-statistics",
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    },
  },
  created() {
    this.getFoodStatisticList();
  },
  data() {
    return {
      fileList: [],
      box: false,
      formData: {
        recordId: "",
        docName: "",
        examineDate: "",
        producedDate: "",
        document: [],
      },
      height: window.innerHeight - 280,
      loading: false,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: "序号",
          type: "index",
        },
        {
          label: "文档名称",
          prop: "docName",
        },
        {
          label: "文件",
          prop: "document",
           formatter: row => row.document.length>0?row.document[0].name:'',
        },
        {
          label: "开始检测日期",
          prop: "examineDate",
        },
        {
          label: "生产时间",
          prop: "producedDate",
        },
        {
          label: "操作人",
          prop: "operator",
        },
        {
          label: "操作时间",
          prop: "utime",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        date: [new Date(), new Date()],
        docName: "",
        examineDateBegin: "",
        examineDateEnd: "",
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "检测时间",
          props: {
            type: "daterange",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
          },
        },
        {
          component: "el-input",
          key: "docName",
          label: "文档名称",
          // placeholder: '输入菜品名称进行查询',
          props: {
            clearable: true,
          },
          maxlength: 30,
        },
      ],
    };
  },
  methods: {
    add() {
       this.fileList = [];
      this.formData = []
      this.box = true;
    },
    getFoodStatisticList() {
      this.loading = true;
      this.$request("foodsecurity.ProdMonitor/queryGetProdMonitor", {
        ...this.page,
        ...this.genQueryParams(),
      }).then(
        this.$rw((err, res) => {
          this.loading = false;
          if (!err) {
            this.tableData = res.record;
            this.tableDataTotal = res.totalRecordCount;
          }
        })
      );
    },
    del(row) {
      this.$request("foodsecurity.ProdMonitor/delProdMonitor", {
        recordId: row.recordId,
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$message.success("删除成功");
            this.getFoodStatisticList();
          } else {
            this.$message.error(err.errMsg);
          }
        })
      );
    },
    handleVideoSuccess(res, file) {
      this.formData.document = [{ name: file.name, url: res.obj.imageUrl }];
      this.fileList = [file];
    },
    downLoad(name, url) {
      const link = document.createElement("a");
      link.href = url;
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          // 将链接地址字符内容转变成blob地址
          link.href = URL.createObjectURL(blob);
          link.download = "";
          link.download = `${name}`; // 下载后文件名
          document.body.appendChild(link);
          link.click();
        });
    },
    onconfirm() {
      if (!this.formData.docName) {
        this.$message.error("请输入文档名称");
        return;
      }
      if (!this.formData.examineDate) {
        this.$message.error("请选择检测日期");
        return;
      }
      if (!this.formData.producedDate) {
        this.$message.error("请选择生产日期");
        return;
      }
      if (this.formData.document.length <= 0) {
        this.$message.error("请上传检测文件");
        return;
      }
      this.$request("foodsecurity.ProdMonitor/opProdMonitor", {
        ...this.formData,
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.box = false;
            this.getFoodStatisticList();
          } else {
            this.$message.error(err.errMsg);
          }
        })
      );
    },
    goDetail(row) {
      this.formData = { ...row };
      this.fileList = row.document;
      this.box = true;
    },

    searchClick() {
      this.page.pageNo = 1;
      this.getFoodStatisticList();
    },
    handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false;
          exportExcel({
            columns: this.tableCol,
            filename,
            data: res.record,
          });
        })
      );
    },

    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [examineDateBegin, examineDateEnd] = transformDaterange(
          params.date
        );
        params.examineDateBegin = examineDateBegin.format("YYYY-MM-DD");
        params.examineDateEnd = examineDateEnd.format("YYYY-MM-DD");
      }
      delete params.date;
      return params;
    },
    reqAllUserData() {
      return this.$request("foodsecurity.ProdMonitor/queryGetProdMonitor", {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
      });
    },
  },
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.colortext {
  color: red;
}
</style>

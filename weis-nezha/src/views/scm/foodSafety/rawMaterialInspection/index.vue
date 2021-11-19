<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
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
      >食材录入</el-button>

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
            >{{row.document.length>0?row.document[0].name:''}}</span>
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
      title="食材录入"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <el-form label-width="130px">

        <el-form-item label="入库提日：">
          <el-date-picker
            v-model="formData.date"
            class="medium-input"
            value-format="yyyyMMdd"
            style="width: 350px;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="供应商：">
          <BaseSelect
            filterable
            v-model="formData.supplierNumber"
            :options="SupplierList"
            clearable
            @change="changesupplierValue"
          />
        </el-form-item>
        <el-form-item label="原材料名称：">
          <BaseSelect
            filterable
            v-model="formData.materialNumber"
            :options="materialList"
            clearable
            @change="changeLocationValue"
          />
        </el-form-item>
        <el-form-item label="原材料ID：">
          <span>{{formData.materialNumber}}</span>
        </el-form-item>
        <el-form-item label="检验项目：">
          <el-input
            v-model="formData.project"
            class="small-input"
            style="width: 350px;"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="检测结果：">
          <BaseSelect
            filterable
            v-model="formData.detection"
            :options="queryOptByStore"
            clearable
          />
        </el-form-item>
        <el-form-item label="结果判定：">
          <BaseSelect
            filterable
            v-model="formData.determine"
            :options="determine"
            clearable
          />
        </el-form-item>

        <el-form-item label="检测文件">
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
    this.queryMaterialList();
    this.querySupplierList();
    this.getFoodStatisticList();
  },
  data() {
    return {
      SupplierList: [],
      materialList: [],
      determine: [
        {
          label: "合格",
          value: "10",
        },
        {
          label: "不合格",
          value: "20",
        },
      ],
      queryOptByStore: [
        {
          label: "阴性",
          value: "10",
        },
        {
          label: "阳性",
          value: "20",
        },
      ],
      fileList: [],
      box: false,
      formData: {
        id: "",
        date: new Date(),
        materialNumber: "",
        materialName: "",
        supplierName: "",
        supplierNumber: "",
        project: "有机磷、氨基酸甲酯",
        detection: "10",
        determine: "10",
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
          label: "供应商",
          prop: "supplierName",
        },
        {
          label: "原材料名称",
          prop: "materialName",
        },
        {
          label: "原材料ID",
          prop: "materialNumber",
        },
        {
          label: "入库时间",
          prop: "date",
        },
        {
          label: "检验项目",
          prop: "project",
        },
        {
          label: "检测结果",
          prop: "detectionDesc",
        },
        {
          label: "结果判定",
          prop: "determineDesc",
        },
        {
          label: "检测文件",
          prop: "document",
          formatter: row => row.document.length>0?row.document[0].name:'',
          
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
        materialNumber: "",
        detection: "",
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "入库时间",
          props: {
            type: "daterange",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
          },
        },
        {
          label: "食材",
          key: "materialNumber",
          component: "base-select",
          props: {
            options: [],
            clearable: true,
            filterable: true,
          },
        },
        {
          label: "检测结果",
          key: "detection",
          component: "base-select",
          props: {
            clearable: true,
            options: [
              {
                label: "阴性",
                value: "10",
              },
              {
                label: "阳性",
                value: "20",
              },
            ],
          },
        },
      ],
    };
  },
  methods: {
    add() {
      this.fileList = [];
      this.formData = []
      this.formData.date = new Date()
      this.formData.project="有机磷、氨基酸甲酯",
      this.formData.detection= "10",
      this.formData.determine= "10",
      this.box = true;
    },
    queryMaterialList() {
      this.$request("foodsecurity.MaterialDetection/queryMaterialList", {
        name: "",
        startRow: [],
        limit: 2000,
      }).then(
        this.$rw((err, res) => {
          const result = res.map((item) => ({
            label: item.materialName,
            value: item.materialNumber,
          }));
          this.queryComps[1].props.options = result;
          this.materialList = result;
        })
      );
    },
    querySupplierList() {
      this.$request("foodsecurity.MaterialDetection/querySupplierList", {
        name: "",
        startRow: [],
        limit: 2000,
      }).then(
        this.$rw((err, res) => {
          const result = res.map((item) => ({
            label: item.supplierName,
            value: item.supplierNumber,
          }));

          this.SupplierList = result;
        })
      );
    },
    getFoodStatisticList() {
      this.loading = true;
      this.$request(
        "foodsecurity.MaterialDetection/queryMaterialDetectionPage",
        {
          ...this.page,
          ...this.genQueryParams(),
        }
      ).then(
        this.$rw((err, res) => {
          this.loading = false;
          if (!err) {
            this.tableData = res.dataPage.record;
            this.tableDataTotal = res.dataPage.totalRecordCount;
          }
        })
      );
    },
    del(row) {
      this.$request("foodsecurity.MaterialDetection/deleteMaterialDetection", {
        id: row.id,
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
    handleVideoSuccess(res, file) {
      this.formData.document = [{ name: file.name, url: res.obj.imageUrl }];
      this.fileList = [file];
    },
    changeLocationValue(val) {
      let obj = {};
      obj = this.materialList.find((item) => {
        return item.value === val;
      });
      this.formData.materialName = obj.label;
    },
    changesupplierValue(val) {
      let obj = {};
      obj = this.SupplierList.find((item) => {
        return item.value === val;
      });
      this.formData.supplierName = obj.label;
    },
    onconfirm() {
      if (!this.formData.date) {
        this.$message.error("请选择入库日");
        return;
      }
      if (!this.formData.supplierNumber) {
        this.$message.error("请选择供应商");
        return;
      }
      if (!this.formData.materialNumber) {
        this.$message.error("请选择原材料");
        return;
      }
      if (!this.formData.project) {
        this.$message.error("请输入检验项目");
        return;
      }
      if (!this.formData.detection) {
        this.$message.error("请选择检测结果");
        return;
      }
      if (!this.formData.determine) {
        this.$message.error("请选择结果判定");
        return;
      }
      if (!this.formData.document||this.formData.document.length <= 0) {
        this.$message.error("请上传检测文件");
        return;
      }
      this.$request("foodsecurity.MaterialDetection/updateMaterialDetection", {
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
      this.formData.detection =  !this.formData.detection?'10':this.formData.detection
      this.formData.determine =  !this.formData.determine?'10':this.formData.determine
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
            data: res.dataPage.record,
          });
        })
      );
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
    reqAllUserData() {
      return this.$request("foodsecurity.MaterialDetection/queryMaterialDetectionPage", {
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
</style>

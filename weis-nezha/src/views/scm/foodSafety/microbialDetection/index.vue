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
          <el-button
            type="primary"
            @click="addExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导入中' : '导入'}}</el-button>

          <span
            style="color:blue;line-height: 40px;margin-left:10px"
            class="cursor-pointer"
            @click="downLoadTemplate"
          >下载导入模板</span>

        </template>

      </QueryComponents>
      <el-button
        type="primary"
        @click="add()"
      >新建样品</el-button>

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
        <el-form-item label="样品编号：">
          <el-input
            v-model="formData.sampleNo"
            class="small-input"
            style="width: 350px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="样品名称：">
          <el-select
            filterable
            clearable
            type="text"
            v-model="formData.sampleName"
            style="width: 350px;"
            placeholder="输入/选择样品名称"
          >
            <el-option
              
              v-for="item in middelOptions"
              :key="item.skuName"
              :label="item.skuName"
              :value="item.skuName"
            ></el-option>

          </el-select>

        </el-form-item>
        <el-form-item label="菌落结果：">
          <el-input
            v-model="formData.microbeResult"
            class="small-input"
            style="width: 350px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="菌落总数判断： ">
          <el-select
            clearable
            type="text"
            v-model="formData.microbeEstimate"
            style="width: 350px;"
          >
            <el-option
              label="合格"
              value="0"
            ></el-option>
            <el-option
              label="不合格"
              value="1"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="大肠埃希氏菌：">
          <el-input
            v-model="formData.escherichiaColi"
            class="small-input"
            style="width: 350px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="大肠埃希氏菌判断:">
          <el-select
            clearable
            type="text"
            v-model="formData.escherichiaColiEstimate"
            style="width: 350px;"
          >
            <el-option
              label="合格"
              value="0"
            ></el-option>
            <el-option
              label="不合格"
              value="1"
            ></el-option>
          </el-select>
        </el-form-item>
         <el-form-item label="检测日期：">
          <el-date-picker
            v-model="formData.examineDate"
            class="medium-input"
            value-format="YYYYMMDD"
            style="width: 350px;"
          ></el-date-picker>

        </el-form-item>
         <el-form-item label="生产日期：">
          <el-date-picker
            v-model="formData.producedDate"
            class="medium-input"
            value-format="YYYYMMDD"
            style="width: 350px;"
          ></el-date-picker>

        </el-form-item>

      </el-form>
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
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { transformDaterange } from "@/utils/transform";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import XLSX from '@/utils/xlsx';

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
  mounted() {
     this.$refs.upload.addEventListener("change", (e) => {
      // 绑定监听表格导入事件
      this.readExcel(e);
    });

  },
  created() {
    this.getFoodStatisticList();
    this.querySkuAll();
  },
  data() {
    return {
      middelOptions: [],
      fileList: [],
      box: false,
      formData: {
        recordId: "",
        sampleName: "",
        sampleNo: "",
        microbeResult: "",
        microbeEstimate: "",
        escherichiaColi: "",
        escherichiaColiEstimate: "",
        examineDate: [],
        producedDate: [],
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
          label: "样品编号",
          prop: "sampleNo",
        },
        {
          label: "样品名称",
          prop: "sampleName",
        },
        {
          label: "ID",
          prop: "skuId",
        },
        {
          label: "菌落结果（CFU/g）",
          prop: "microbeResult",
        },
        {
          label: "菌落总数判断（合格/不合格）",
          prop: "microbeEstimate",
        },
        {
          label: "大肠埃希氏菌（CFU/g）",
          prop: "escherichiaColi",
        },
        {
          label: "大肠埃希氏菌判断（合格/不合格）",
          prop: "escherichiaColiEstimate",
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
        sampleNo: "",
        sampleName: "",
      },
      queryComps: [
        {
          component: "el-input",
          key: "sampleNo",
          label: "样品编号",
          // placeholder: '输入菜品名称进行查询',
          props: {
            clearable: true,
          },
          maxlength: 30,
        },
        {
          component: "el-input",
          key: "sampleName",
          label: "样品名称",
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
      this.formData = {}
      this.box = true;
    },
    addExport() {
      this.$refs.upload.dispatchEvent(new MouseEvent("click"));

    },
    getFoodStatisticList() {
      this.loading = true;
      this.$request("foodsecurity.MicrobeMonitor/queryMicrobeMonitor", {
        ...this.page,
        ...this.queryParams,
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
      this.$request("foodsecurity.MicrobeMonitor/delMicrobeMonitor", {
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
      this.formData.document = [res.obj.imageUrl];
      this.fileList = [file];
    },
    querySkuAll() {
      this.$request("foodsecurity.MicrobeMonitor/querySkuAll").then(
        this.$rw((err, res) => {
          this.middelOptions = res;
        })
      );
    },
    upexcel(data) {  
       this.$request("foodsecurity.MicrobeMonitor/opMicrobeMonitor", {
        datalist:data,
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$message.success('导入成功');           
            this.getFoodStatisticList();
          } else {
            this.$message.error(err.errMsg);
          }
        })
      );

    },
    onconfirm() {
       if (!this.formData.sampleNo) {
        this.$message.error("请输入样品编号");
        return;
      }
      if (!this.formData.sampleName) {
        this.$message.error("请选择样品名称");
        return;
      }
       if (!this.formData.microbeResult) {
        this.$message.error("请输入菌落结果");
        return;
      }
       if (!this.formData.microbeEstimate) {
        this.$message.error("请选择菌落总数判断");
        return;
      }
      if (!this.formData.escherichiaColi) {
        this.$message.error("请输入大肠埃希氏菌");
        return;
      }
      if (!this.formData.escherichiaColiEstimate) {
        this.$message.error("请选择肠埃希氏菌判断");
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

      this.$request("foodsecurity.MicrobeMonitor/opMicrobeMonitor", {
        datalist:[{ ...this.formData }],
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
    downLoadTemplate() {
      const col = [
        { label: "序号", type: "index", width: "80" },
        { label: "开始检测日期(年月日)", prop: "examineDate" },
        { label: "生产日期(年月日)", prop: "producedDate" },
        { label: "样品编号", prop: "sampleNo" },
        { label: "名称", prop: "sampleName" },
        { label: "菌落结果（CPU/g）", prop: "microbeResult" },
        { label: "菌落总数判断（合格/不合格）", prop: "microbeEstimate" },
        { label: "大肠埃希氏菌（CPU/g）", prop: "escherichiaColi" },
        { label: "大肠埃希氏菌判断（合格/不合格）", prop: "escherichiaColiEstimate" },
      ];
      exportExcel({
        columns: col,
        filename: "微生物检测导入模板",
        data: [],
      });
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
            examineDate: item["开始检测日期(年月日)"],
            producedDate:item["生产日期(年月日)"],
            sampleNo:item["样品编号"],
            sampleName:item["名称"],
            microbeResult:item["菌落结果（CPU/g）"],
            microbeEstimate:item["菌落总数判断（合格/不合格）"],
            escherichiaColi:item["大肠埃希氏菌（CPU/g）"],
            escherichiaColiEstimate:item["大肠埃希氏菌判断（合格/不合格）"],
          }));
         
          // var re = /^[0-9]+.?[0-9]*/; //判断字符串是否为数字//判断正整数/[1−9]+[0−9]∗]∗/
          outputs.forEach((element) => {
            // if (re.test(element.phone)) {
            //   this.phoneList.push(element.phone);
            // }
          
          element.escherichiaColiEstimate = element.escherichiaColiEstimate.trim() == '合格'?'0':element.escherichiaColiEstimate.trim() == '不合格'?'1':''
          element.microbeEstimate = element.microbeEstimate.trim() == '合格'?'0':element.microbeEstimate.trim() == '不合格'?'1':''
         });
        
          this.upexcel(outputs);
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
      return this.$request("foodsecurity.MicrobeMonitor/queryMicrobeMonitor", {
        ...this.queryParams,
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

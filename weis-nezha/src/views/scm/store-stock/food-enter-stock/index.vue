<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :label-width="60"
        semi
      >
        <template #buttons>
          <el-button
            type="primary"
            @click="searchClick"
          >搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
          <el-button
            type="primary"
            :loading="loading"
            @click="choiceUpload"
          >{{ loading ? '导入中' : '导入' }}</el-button>
        </template>
        <template #action>
          <el-button
            type="primary"
            @click="AllDetailExt"
          >导出明细</el-button>
          <el-button
            type="primary"
            @click="batchSync"
          >批量同步</el-button>
          <el-button
            type="text"
            @click="downLoad(1)"
          >下载备货模板</el-button>
          <!-- <el-dropdown>
            <el-button type="text">
              下载模板<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="downLoad(0)">端内备货模板</el-dropdown-item>
                <el-dropdown-item @click="downLoad(1)">端外备货模板</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>-->
        </template>
      </QueryComponents>
      <input
        ref="upload"
        type="file"
        accept=".xls, .xlsx"
        class="outputlist_upload"
        style="opacity: 0;"
      />
      <el-button
        type="primary"
        @click="toEnter('add')"
      >备货录入</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-model:selection="tableSelection"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column
          label="操作"
          width="220"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              v-if="hasEdit && row.tkdhState === '10'"
              size="small"
              @click="toEnter('edit', row)"
            >编辑</el-button>
            <el-button
              size="small"
              @click="detailClick(row)"
            >详情</el-button>
            <el-button
              v-if="hasEdit && row.tkdhState === '10'"
              size="small"
              @click="deleteClick(row)"
            >删除</el-button>
            <el-button
              v-if="hasEdit && row.tkdhState === '10'"
              size="small"
              @click="syncClick(row)"
            >同步</el-button>
            <el-button
              size="small"
              @click="exportClick(row.tkdhId)"
            >导出</el-button>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { catchNonNumberKeydown } from "@/utils/event-catcher";
// import ConfirmDialog from '@/components/ConfirmDialog.vue';
import exportExcel from "@/utils/export-excel";
import XLSX from "@/utils/xlsx";
import { defineComponent } from "vue";
export default defineComponent({
  components: {
    // ConfirmDialog,
    QueryComponents,
    BasePageTable,
  },
  inject: ["reload"],
  data() {
    return {
      loading: false,
      height: window.innerHeight - 280,
      count: 0,
      current: {},
      disableTodayOptions: {
        disabledDate: (d) => d < Date.now(),
      },
      editDialogVisible: false,
      queryParams: {
        date: this.$day(new Date(Date.now() + 86400000 * 1)).format(
          "YYYY-MM-DD"
        ),
        heatPointId: "",
      },
      date: this.$day(new Date(Date.now() + 86400000 * 1)).format("YYYY-MM-DD"),
      tkdhId: "",
      hasEdit: true,
      hasReadOnly: false,
      heatPointId: "",
      tableSelection: [],
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "售卖日期",
          placeholder: "选择日期",
          props: {
            type: "date",
            "value-format": "yyyy-MM-dd",
          },
        },
        {
          component: "BaseSelect",
          key: "heatPointId",
          label: "供餐点",
          props: {
            options: [],
          },
        },
        {
          slot: "buttons",
        },
      ],
      tableCol: [
        {
          type: "selection",
        },
        {
          label: "序号",
          type: "index",
        },
        {
          label: "供餐点",
          prop: "tkdhHpName",
        },
        // {
        //   label: "总备货数量",
        //   prop: "tkdhTotal",
        // },
        // {
        //   label: "现点备货量",
        //   prop: "tkdhInnerTotal",
        // },
        {
          label: "补备货量",
          prop: "tkdhTotal",
        },
        // {
        //   label: "备货类型",
        //   prop: "tkdhTypeDesc",
        // },
        // {
        //   label: '端内备货数量',
        //   prop: 'tkdhInnerTotal'
        // },
        // {
        //   label: "端外备货数量",
        //   prop: "tkdhOutTotal",
        // },
        {
          label: "备货用途",
          prop: "tkdhChannelDesc",
        },
        {
          label: "售卖日期",
          prop: "tkdhStockDate",
        },
        {
          label: "备货人",
          prop: "tkdhUname",
        },
        {
          label: "操作时间",
          prop: "tkdhUtime",
        },
        {
          label: "备注",
          prop: "tkdhRemark",
        },
      ],
      exportCol: [
        {
          label: "序号",
          type: "index",
        },
        {
          label: "供餐点",
          prop: "tkdhHpName",
        },
        {
          label: "菜品",
          prop: "tkdhSkuName",
        },
        {
          label: "编码",
          prop: "tkdhCid",
        },
        // {
        //   label: "小程序预订备货量",
        //   prop: "tkdhReserveStockTotal",
        // },
        // {
        //   label: "小程序现点备货量",
        //   prop: "tkdhMiniStockTotal",
        // },
        // {
        //   label: "美团备货量",
        //   prop: "MeituanStockTotal",
        // },
        // {
        //   label: "饿了么备货量",
        //   prop: "tkdhElemeStockTotal",
        // },
        {
          label: "补备货量",
          prop: "tkdhTotal",
        },
        {
          label: "备货用途",
          prop: "tkdhChannelDesc",
        },
        {
          label: "售卖日期",
          prop: "tkdhStockDate",
        },

        {
          label: "备货人",
          prop: "tkdhOperator",
        },
        {
          label: "操作时间",
          prop: "tkdhCtime",
        },
        {
          label: "备注",
          prop: "",
        },
      ],
      tableData: [],
      tableSkuData: [],
      tableSkuDataTotal: 0,
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      mealsOptions: [],
      tkdhRemark: "",
    };
  },
  created() {
    this.handleDate();
    this.getHeatPoint();
    this.getList();
  },
  mounted() {
    this.$refs.upload.addEventListener("change", (e) => {
      // 绑定监听表格导入事件
      this.readExcel(e);
    });
  },
  methods: {
    catchNonNumberKeydown,
    handleDate() {
      const now = this.$day().startOf("day");
      const queryDate = this.queryParams.date;
      this.hasEdit =
        now.get("hour") < 18
          ? this.$day(queryDate) >= now
          : this.$day(queryDate) >= now.add(1, "day");
    },
    AllDetailExt() {
      const { tableSelection } = this;
      if (tableSelection.length == 0) {
        this.$message({
          type: "error",
          message: "请先选择导出数据",
        });
        return;
      }

      this.exportClick(tableSelection.map(({ tkdhId }) => tkdhId).toString());
    },
    /* 导出备货明细*/
    async exportClick(tkdhId) {
      let date = this.$day(this.queryParams.date).format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}明细-导出(${date})`;
      const res = await this.$http("OrderStockHist/queryStockHistDetailList", {
        tkdhId: tkdhId,
      });
      if (!res.errMsg) {
        exportExcel({
          columns: this.exportCol,
          filename,
          data: res.obj,
        });
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    toEnter(type, row) {
      // if ((row && row.tkdhType) === '01') {
      //   this.$router.push({
      //     path: '/scm/store-stock/food-enter-stock',
      //     query: {
      //       tkdhId: type == 'add' ? null : row.tkdhId,
      //       date: type == 'add' ? null : row.tkdhStockDate,
      //       heatPointId: type == 'add' ? null : row.tkdhHpid
      //     }
      //   })
      // } else {
      this.$router.push({
        path: "/scm/store-stock/food-enter-stock/foodEnterStock",
        query: {
          tkdhId: type == "add" ? null : row.tkdhId,
          date: type == "add" ? null : row.tkdhStockDate,
          heatPointId: type == "add" ? null : row.tkdhHpid,
        },
      });
      // }
    },
    syncClick(row) {
      this.stockHistSync([row.tkdhId]);
    },
    batchSync() {
      const { tableSelection } = this;
      if (!tableSelection.every((i) => i.tkdhState === "10")) {
        this.$message({
          type: "error",
          message: "含有已入库的记录无法批量同步",
        });
        return;
      }
      this.stockHistSync(tableSelection.map(({ tkdhId }) => tkdhId));
    },
    stockHistSync(tkdhIds) {
      if (this.syncing) return;
      this.syncing = true;
      this.$request("OrderStockHist/stockHistSync", {
        tkdhIds,
      })
        .thenwrap((err) => {
          if (!err) {
            this.$msg("同步成功", "success");
            this.getList();
          } else {
            this.$msg(err.errMsg, "error");
          }
        })
        .finally(() => {
          this.syncing = false;
        });
    },
    detailClick(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          id: row.tkdhId,
        },
      });
    },
    deleteClick(row) {
      this.$request("OrderStockHist/deleteStockHist", {
        tkdhId: row.tkdhId,
        type: "01",
      }).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({ type: "success", message: "删除成功" });
            this.getList();
          } else {
            this.$message({ type: "success", message: err.errMsg });
          }
        })
      );
    },
    refresh() {
      setTimeout(() => {
        if (this.editDialogVisible) {
          this.count += 1;
          if (this.count === 600) {
            this.getSkuList();
          }
        }
        this.refresh();
      }, 1000);
    },
    searchClick() {
      this.date = this.queryParams.date;

      this.getList();
    },
    searchSku() {
      this.getSkuList();
    },
    getHeatPoint() {
      this.$request("HeatingPoint/queryEnabledHeat").then(
        this.$rw((err, { heatVos }) => {
          if (!err) {
            this.queryComps[1].props.options = [
              {
                label: "全部供餐点",
                value: "",
              },
            ].concat(heatVos);
            this.mealsOptions = [].concat(heatVos);
          }
        })
      );
    },
    getSkuList() {
      if (!this.heatPointId) {
        this.tableSkuData = [];
        return;
      }
      return this.$request("OrderStock/getSkuListByHpId", {
        heatPointId: this.heatPointId,
        date: this.queryParams.date,
        type: "01",
      }).then(
        this.$rw((err, { skuInfoVos }) => {
          if (!err) {
            this.tableSkuData = skuInfoVos.map((item) => ({
              outsideStock: "",
              insideStock: "",
              ...item,
            }));
          }
        })
      );
    },
    getList() {
      this.handleDate();
      this.$store.state.vloading = true;
      this.$request("OrderStockHist/queryStockHistList", {
        ...this.page,
        ...this.queryParams,
        type: "01",
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$store.state.vloading = false;
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
          }
        })
      );
    },
    handleExport() {
      this.$store.state.bloading = true;
      const filename = `${this.$route.meta.title}-导出(${this.date})`;
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
    reqAllUserData() {
      return this.$request("OrderStockHist/queryStockHistList", {
        ...this.queryParams,
        pageSize: 999,
        pageNo: 1,
        type: "01",
      });
    },
    // 导入
    choiceUpload() {
      this.$refs.upload.dispatchEvent(new MouseEvent("click"));
    },
    async readExcel(e) {
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
      this.loading = true;
      const fileReader = new FileReader();

      fileReader.onload = async (ev) => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, { type: "binary" });
          // console.log(workbook);
          const pointStockList = [];

          for (const wsname of workbook.SheetNames) {
            const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); // 生成json表格内容
            for (const w of ws) {
              if (
                ( w["补备货量"]) &&
                w["用途"] != "小程序+美团+饿了么" &&
                // w["用途"] != "美团" &&
                // w["用途"] != "饿了么" &&
                w["用途"] != "市场活动" &&
                w["用途"] != "质检留样" &&
                w["用途"] != "其他"
              ){
                this.$msg("请输入正确的用途", "error");
                this.reload();
                return;
              }
            }
             
            const arr1 = ws.filter((val) => val["用途"] == "小程序+美团+饿了么");
            // const arr2 = ws.filter((val) => val["用途"] == "美团");
            // const arr8 = ws.filter((val) => val["用途"] == "饿了么");
            const arr3 = ws.filter((val) => val["用途"] == "市场活动");
            const arr4 = ws.filter((val) => val["用途"] == "质检留样");
            const arr5 = ws.filter((val) => val["用途"] == "其他");
           const stockArr = [arr1,arr3, arr4, arr5];
            const arrtype = ["10", "03", "04", "05"];
          
            const tkdhHpid = this.queryComps[1].props.options.find(
              (val) => val.label == wsname
            ).value;
            for (const i in stockArr) {
              if (stockArr[i].length) {
                if (arrtype[i] == "05") {
                  const remark = stockArr[i].find((val) => val["备注"]);
                  if (!remark) {
                    this.$msg("其他用途请填写备注", "error");
                    this.loading = false;
                    this.reload();
                    return;
                  }
                }
                let stockList = {};
                if (arrtype[i] == "10") {
                  stockList = stockArr[i].map((val) => ({
                    tfsCid: val["编码"],
                    insideStock: val["补备货量"],
                    // insideReserveStock: val["预订量"],
                  }));
                } else {
                  stockList = stockArr[i].map((val) => ({
                    tfsCid: val["编码"],
                    outsideStock: val["补备货量"],
                  }));
                }
                const remark = stockArr[i].find((val) => val["备注"]);
                const params = {
                  tkdhHpid,
                  date: this.$day(`${stockArr[i][0]["备货使用日期"]}`).format(
                    "YYYY-MM-DD"
                  ),
                  tkdhRemark: remark ? remark["备注"] : "",
                  tkdhChannel: arrtype[i],
                  type: "01",
                  stockList,
                };

                pointStockList.push(params);
              }
            }
          }

          let date = Number(
            this.$day(pointStockList[0].date).format("YYYYMMDD")
          );
          let nowDate = Number(
            this.$day(new Date(Date.now() + 86400000 * 1)).format("YYYYMMDD")
          );
          if (date != nowDate) {
            this.$msg("导入的备货日期有误,只能备T+1哦", "error");
            this.loading = false;
            this.reload();
            return;
          }

          const res = await this.$http("OrderStockHist/updateStockHistImport", {
            pointStockList,
          });
          if (!res.errMsg) {
            this.$msg("导入成功", "success");
            this.getList();
            this.reload();
          } else {
            this.$msg(res.errMsg, "error");
            this.reload();
          }
          this.loading = false;
        } catch (e) {
          console.log(e);
          this.loading = false;
          this.$message({ type: "error", message: "导入的模板有误" });
          this.reload();
        }
      };
      fileReader.readAsBinaryString(files[0]);
    },
    async downLoad(type) {
      const res = await this.$http("Sku/querySkuList", {
        pageNo: 1,
        pageSize: 9999,
        tfsStt: 60,
      });
      const date =
        this.$day().hour() >= 18
          ? new Date(Date.now() + 86400000 * 1)
          : new Date(Date.now() + 86400000);
      const col =
        // type === 0
        //   ? [
        //       { label: "序号", type: "index" },
        //       { label: "编码", prop: "tfsCid" },
        //       { label: "菜品名称", prop: "tfsSuggestedSkuname" },
        //       { label: "用途", prop: "tkdhChannel" },
        //       {
        //         label: "现点备货量",
        //         prop: "tkdhInnerTotal",
        //       },
        //       {
        //         label: "预定单备货量",
        //         prop: "tkdhInsideReserveTotal",
        //       },
        //       { label: "备注", prop: "remark" },
        //       {
        //         label: "备货使用日期",
        //         formatter: () => this.$day(date).format("YYYYMMDD"),
        //       },
        //     ]
          // : 
          [
              { label: "序号", type: "index" },
              { label: "编码", prop: "tfsCid" },
              { label: "菜品名称", prop: "tfsSuggestedSkuname" },
              { label: "用途", prop: "tkdhChannel" },
              { label: "补备货量", prop: "stock" },
              // { label: "备货量", prop: "stock" },
              // { label: "预订量", prop: "insideReserveStock" },
              { label: "备注", prop: "remark" },
              {
                label: "备货使用日期",
                formatter: () => this.$day(date).format("YYYYMMDD"),
              },
            ];
      const sheetArr = this.queryComps[1].props.options.map((val) => val.label);

      sheetArr.shift();
      exportExcel({
        columns: col,
        filename: "紧急备货导入模板",
        sheetArr,
        data: res.obj.dataPage.record,
        type: "excelType",
      });
    },
  },
});
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.txt {
  width: 300px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>

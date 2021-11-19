<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <ButtonTabs
        v-model="activeTab"
        :tabs="dishStatusTabs"
        @change="changes"
      />
    </div>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :label-width="60"
        semi
      >
        <!-- <template #store>
          <BaseSelect
            v-if="activeTab !== 0"
            v-model="queryParams.heatPointId"
            :options="heatPointOptions"
            style="margin-right: 10px;"
          ></BaseSelect>
        </template>-->
        <template #action>
          <el-button
            type="primary"
            @click="searchClick"
          >搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
          <span>（售卖日期：{{ saleDate }}）</span>
        </template>
      </QueryComponents>
      <!-- <el-button v-if="activeTab === 0" type="danger" @click="handlePrint">打印生产列表菜品标签</el-button> -->
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:selection="tableSelection"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="loading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        :visible="false"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column
          v-for="col in tableCols"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="hasDialog"
      :close-on-click-modal="false"
      :auto-confirm="false"
      title="确定打印"
      @on-confirm="handlePrintConfirm"
    >
      <div class="dialogTxt">确认一键打印生产列表菜品的所有标签吗?</div>
      <div class="dialogTxt">
        合计菜品种类:
        <span>{{ printType }}</span>种
      </div>
      <div class="dialogTxt">
        合计标签数:
        <span>{{ printNum }}</span>张
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import ButtonTabs from "@/components/ButtonTabs.vue";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import exportExcel from "@/utils/export-excel";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { getLodop } from "@/utils/LodopFuncs";
import { defineComponent } from "vue";

export default defineComponent({
  name: "scm_central-kitchen_production-list",
  components: {
    ButtonTabs,
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
  },
  data() {
    return {
      height: window.innerHeight - 280,
      hasDialog: false,
      printType: 0,
      printNum: 0,
      currentDish: [],
      printDate: new Date(Date.now() + 86400000),
      loading: false,
      heatPointOptions: [{ label: "全部加热点", value: "" }],
      activeTab: "03",
      queryParams: {
        date: new Date(),
        heatPointId: "",
      },
      dishStatusTabs: [
        {
          label: "备货生产单",
          value: "02",
        },
        {
          label: "18:00 补货生产单",
          value: "03",
        },
        {
          label: "19:00 紧急补货生产单",
          value: "04",
        },

        {
          label: "总生产单",
          value: "01",
        },
      ],
      // tableCols: [
      //   {
      //     type: 'index',
      //     label: '序号',
      //     width: 60
      //   },
      //   {
      //     label: '菜品名称',
      //     prop: 'tfsSkuname'
      //   },
      //   {
      //     label: '菜品编码',
      //     prop: 'tdodCid'
      //   },
      //   {
      //     label: '备货生产数量',
      //     prop: 'num'
      //   },
      //   {
      //     label: '单价（元）',
      //     prop: 'tfsPrice'
      //   },
      //   {
      //     label: '总额',
      //     prop: 'sum'
      //   }
      // ],
      tableSelection: [],
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      saleDate: "",
      url: "",
    };
  },
  computed: {
    queryComps() {
      return [
        {
          component: "el-date-picker",
          key: "date",
          label: "生产日期",
          placeholder: "选择日期",
          props: {
            type: "date",
            editable: false,
            clearable: false,
            "value-format": "yyyy-MM-dd",
          },
        },
      ];
    },
    tableCols() {
      const label = {
        "04": "补货生产量",
        "03": "补货生产量",
        "01": "备货总生产量",
        "02": "备货生产数量",
      }[this.activeTab];

      return this.activeTab === "04"
        ? [
            {
              type: "index",
              label: "序号",
              width: 60,
            },
            {
              label: "菜品名称",
              prop: "tfsSkuname",
            },
            {
              label: "菜品编码",
              prop: "tdodCid",
            },
            {
              label: "紧急补货生产量",
              prop: "replenishmentNum",
            },

            {
              label: "单价（元）",
              prop: "tfsPrice",
            },
            {
              label: "总额",
              prop: "sum",
            },
          ]
        : this.activeTab === "02"
        ? [
            {
              type: "index",
              label: "序号",
              width: 60,
            },
            {
              label: "菜品名称",
              prop: "tfsSkuname",
            },
            {
              label: "菜品编码",
              prop: "tdodCid",
            },
            {
              label: label,
              prop: "num",
            },
            //    {
            //   label: '备货补生产单',
            //   prop: 'replenishmentNum'
            // },
            //  {
            //   label: '备货生产合计',
            //   prop: 'totalNum'
            // },
            {
              label: "单价（元）",
              prop: "tfsPrice",
            },
            {
              label: "总额",
              prop: "sum",
            },
          ]
        : this.activeTab === "03"
        ? [
            {
              type: "index",
              label: "序号",
              width: 60,
            },
            {
              label: "菜品名称",
              prop: "tfsSkuname",
            },
            {
              label: "菜品编码",
              prop: "tdodCid",
            },
            // {
            //   label: '紧急补货生产单',
            //   prop: 'replenishmentNum'
            // },
            {
              label: label,
              prop: "num",
            },
            {
              label: "单价（元）",
              prop: "tfsPrice",
            },
            {
              label: "总额",
              prop: "sum",
            },
          ]
        : [
            {
              type: "index",
              label: "序号",
              width: 60,
            },
            {
              label: "菜品名称",
              prop: "tfsSkuname",
            },
            {
              label: "菜品编码",
              prop: "tdodCid",
            },
            {
              label: label,
              prop: "num",
            },
            {
              label: "单价（元）",
              prop: "tfsPrice",
            },
            {
              label: "总额",
              prop: "sum",
            },
          ];
    },
    exportCols() {
      const label = {
        "03": "补货生产量",
        "01": "备货总生产量",
        "02": "备货生产数量",
        "04": "补货生产量",
      }[this.activeTab];

      const label2 = {
        "04": "紧急补货生产量",
        "02": "补备货生产量",
      }[this.activeTab];

      return this.activeTab == "04"
        ? [
            {
              type: "index",
              label: "序号",
              width: 60,
            },
            {
              label: "金蝶物料编码",
              prop: "tfsKingdeeId",
            },
            {
              label: "菜品名称",
              prop: "tfsSkuname",
            },
            {
              label: "规格",
              prop: "tfsQuality",
              formatter: (row) => row.tfsQuality + row.tfsUnit,
            },
            // {
            //   label: label,
            //   prop: "num",
            // },
            {
              label: label2,
              prop: "replenishmentNum",
            },
            {
              label: "单价（元）",
              prop: "tfsPrice",
            },
            {
              label: "总额",
              prop: "sum",
            },
          ]
        : this.activeTab == "02"
        ? [
            {
              type: "index",
              label: "序号",
              width: 60,
            },
            {
              label: "金蝶物料编码",
              prop: "tfsKingdeeId",
            },
            {
              label: "菜品名称",
              prop: "tfsSkuname",
            },
            {
              label: "规格",
              prop: "tfsQuality",
              formatter: (row) => row.tfsQuality + row.tfsUnit,
            },
            {
              label: label,
              prop: "num",
            },
            // {
            //   label: label2,
            //   prop: "replenishmentNum",
            // },
            {
              label: "单价（元）",
              prop: "tfsPrice",
            },
            {
              label: "总额",
              prop: "sum",
            },
          ]
        : [
            {
              type: "index",
              label: "序号",
              width: 60,
            },
            {
              label: "金蝶物料编码",
              prop: "tfsKingdeeId",
            },
            {
              label: "菜品名称",
              prop: "tfsSkuname",
            },
            {
              label: "规格",
              prop: "tfsQuality",
              formatter: (row) => row.tfsQuality + row.tfsUnit,
            },
            {
              label: label,
              prop: "num",
            },
            {
              label: "单价（元）",
              prop: "tfsPrice",
            },
            {
              label: "总额",
              prop: "sum",
            },
          ];
    },
  },
  watch: {
    "queryParams.date": {
      flush: "sync",
      handler(date) {
        this.saleDate = this.$day(date).add(1, "day").format("YYYY-MM-DD");
      },
    },
  },
  created() {
    const date = new Date();
    const month =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    this.queryParams.date = `${date.getFullYear()}-${month}-${day}`;
    // this.getHeatList();
    this.getList();
  },
  methods: {
    getHeatList() {
      this.$request("OrderPrint/hpInfo", {}).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.heatPointOptions = this.heatPointOptions.concat(dataPage.res);
          }
        })
      );
    },
    searchClick() {
      this.printDate = this.queryParams.date;
      this.getList();
    },
    changes() {
      this.getList();
    },
    getList() {
      this.loading = true;
      this.tableData = [];
      this.$request("OrderPrint/queryProductionList", {
        type: this.activeTab,
        date: this.saleDate.split("-").join(""),
      }).then(
        this.$rw((err, dataPage) => {
          this.loading = false;
          if (!err) {
            this.tableData = dataPage;
          }
        })
      );
    },
    handleExport() {
      const file = this.dishStatusTabs.find(
        (tab) => tab.value === this.activeTab
      ).label;
      const date = this.$day(this.printDate).format("YYYY-MM-DD");
      const filename = `${file}-导出(${date})`;
      this.$store.state.bloading = true;
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false;
          exportExcel({
            columns: this.exportCols,
            filename,
            data: res,
          });
        })
      );
    },
    reqAllUserData() {
      return this.$request("OrderPrint/queryProductionList", {
        type: this.activeTab,
        date: this.saleDate.split("-").join(""),
      });
    },
    async handlePrintConfirm() {
      this.hasDialog = false;
      // this.CreateOneFormPage(this.currentDish[0]);
      for (let i = 0; i < this.printNum; i += 1) {
        this.CreateOneFormPage(this.currentDish[i]);
      }
    },
    handlePrint() {
      this.printType = this.tableSelection.length;
      this.printNum = 0;
      this.currentDish = [];
      this.tableSelection.forEach((item) => {
        this.printNum = this.printNum + Number(item.num);
        for (let i = 0; i < Number(item.num); i++) {
          this.currentDish.push(item);
        }
      });
      this.hasDialog = true;
    },
    CreateOneFormPage(dish) {
      const LODOP = getLodop();
      LODOP.PRINT_INIT("");
      LODOP.SET_PRINT_PAGESIZE(0, 480, 350, "");
      LODOP.ADD_PRINT_TEXT(15, 37, 160, 34, dish.tfsSkuname);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 11);
      LODOP.SET_PRINT_STYLEA(0, "FontName", "思源宋体");
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);

      LODOP.ADD_PRINT_LINE(35, 37, 35, 145, 0, 1);

      LODOP.ADD_PRINT_TEXT(40, 10, 133, 40, "能量：");
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(41, 67, 58, 40, `${dish.tfsEnergy}kcal`);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Alignment", 3);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(54, 10, 133, 40, "蛋白质：");
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(55, 71, 52, 40, `${dish.tfsProtein}g`);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Alignment", 3);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(68, 10, 133, 40, "脂肪：");
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(68, 68, 55, 40, `${dish.tfsFat}g`);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Alignment", 3);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(83, 10, 133, 40, "碳水化合物：");
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(83, 70, 53, 40, `${dish.tfsCarbonwater}g`);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Alignment", 3);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(99, 10, 133, 40, "规格：");
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(99, 67, 55, 40, `${dish.tfsQuality}${dish.tfsUnit}`);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Alignment", 3);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);

      /* LODOP.ADD_PRINT_TEXT(40,37,133,40,"能量：");
      LODOP.SET_PRINT_STYLEA(0,"FontSize",8);
      LODOP.SET_PRINT_STYLEA(0,"Bold",1);
      LODOP.ADD_PRINT_TEXT(41,107,133,40,`${dish.tfsEnergy}kcal`);
      LODOP.SET_PRINT_STYLEA(0,"FontSize",8);
      LODOP.SET_PRINT_STYLEA(0,"Bold",1);
      LODOP.ADD_PRINT_TEXT(54,37,133,40,"蛋白质：");
      LODOP.SET_PRINT_STYLEA(0,"FontSize",8);
      LODOP.SET_PRINT_STYLEA(0,"Bold",1);
      LODOP.ADD_PRINT_TEXT(55,107,133,40,`${dish.tfsProtein}g`);
      LODOP.SET_PRINT_STYLEA(0,"FontSize",8);
      LODOP.SET_PRINT_STYLEA(0,"Bold",1);
      LODOP.ADD_PRINT_TEXT(68,37,133,40,"脂肪：");
      LODOP.SET_PRINT_STYLEA(0,"FontSize",8);
      LODOP.SET_PRINT_STYLEA(0,"Bold",1);
      LODOP.ADD_PRINT_TEXT(68,107,133,40,`${dish.tfsFat}g`);
      LODOP.SET_PRINT_STYLEA(0,"FontSize",8);
      LODOP.SET_PRINT_STYLEA(0,"Bold",1);
      LODOP.ADD_PRINT_TEXT(83,37,133,40,"碳水化合物：");
      LODOP.SET_PRINT_STYLEA(0,"FontSize",8);
      LODOP.SET_PRINT_STYLEA(0,"Bold",1);
      LODOP.ADD_PRINT_TEXT(83,107,133,40,`${dish.tfsCarbonwater}g`);
      LODOP.SET_PRINT_STYLEA(0,"FontSize",8);
      LODOP.SET_PRINT_STYLEA(0,"Bold",1);
      LODOP.ADD_PRINT_TEXT(99,37,133,40,"规格：");
      LODOP.SET_PRINT_STYLEA(0,"FontSize",8);
      LODOP.SET_PRINT_STYLEA(0,"Bold",1);
      LODOP.ADD_PRINT_TEXT(99,107,133,40,`${dish.tfsQuality}${dish.tfsUnit}`);
      LODOP.SET_PRINT_STYLEA(0,"FontSize",8);
      LODOP.SET_PRINT_STYLEA(0,"Bold",1); */

      /*
      LODOP.ADD_PRINT_TEXT(40, 37, 133, 40, '能量：');
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 6);
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);
      LODOP.ADD_PRINT_TEXT(40, 107, 133, 40, `${dish.tfsEnergy}kcal`);
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 6);
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);

      LODOP.ADD_PRINT_TEXT(50, 37, 133, 40, '蛋白质：');
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 6);
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);
      LODOP.ADD_PRINT_TEXT(50, 107, 133, 40, `${dish.tfsProtein}g`);
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 6);
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);

      LODOP.ADD_PRINT_TEXT(60, 37, 133, 40, '脂肪：');
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 6);
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);
      LODOP.ADD_PRINT_TEXT(60, 107, 133, 40, `${dish.tfsFat}g`);
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 6);
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);

      LODOP.ADD_PRINT_TEXT(72, 37, 133, 40, '碳水化合物：');
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 6);
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);
      LODOP.ADD_PRINT_TEXT(72, 107, 133, 40, `${dish.tfsCarbonwater}g`);
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 6);
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);

      LODOP.ADD_PRINT_TEXT(84, 37, 133, 40, '规格：');
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 6);
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);
      LODOP.ADD_PRINT_TEXT(84, 107, 133, 40, `${dish.tfsQuality}${dish.tfsUnit}`);
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 6);
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);

      // LODOP.ADD_PRINT_BARCODE(96, 37, 120, 20, '128Auto', `${dish.tdodCid}`);
      // LODOP.SET_PRINT_STYLEA(0, 'ShowBarText', 0);// 设置是否显示下方的文字
      */
      LODOP.SET_PRINT_PAGESIZE(2, 350, 350, "");
      LODOP.PRINT();
      // LODOP.PRINT_DESIGN();
      // return LODOP;
    },
  },
});
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}

.food-cover {
  max-height: 100%;
  max-width: 100%;
}
.dialogTxt {
  height: 60px;
  font-size: 17px;
  line-height: 60px;
  span {
    color: red;
    margin: 0 20px;
  }
}
</style>

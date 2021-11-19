<template>
  <div class="page-container">
    <div></div>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="7"
        :label-width="60"
        semi
      >
        <template v-slot:action>
          <el-button
            type="primary"
            @click="searchClick"
          >搜索</el-button>
        </template>
      </QueryComponents>
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
        @current-page-change="getOrderList"
        @size-change="getOrderList"
        border
      >
        <el-table-column
          label="序号"
          type="index"
        ></el-table-column>
        <el-table-column
          label="菜品名称"
          prop="tfsSkuname"
        ></el-table-column>
        <el-table-column
          label="菜品规格"
          prop="tfsQuality"
        ></el-table-column>
        <el-table-column
          label="能量(kcal)"
          prop="energyKcal"
          width="120"
        ></el-table-column>
        <el-table-column
          label="能量(kJ)"
          prop="energyKJ"
          width="120"
        ></el-table-column>
        <el-table-column
          label="能量NRV(%)"
          prop="energyNRV"
          width="120"
        ></el-table-column>
        <el-table-column
          label="脂肪(g)"
          prop="tfsFat"
          width="160"
        ></el-table-column>
        <el-table-column
          label="脂肪NRV(%)"
          prop="fatNRV"
          width="120"
        ></el-table-column>
        <el-table-column
          label="蛋白质(g)"
          prop="tfsProtein"
        ></el-table-column>
        <el-table-column
          label="蛋白质NRV(%)"
          prop="proteinNRV"
          width="120"
        ></el-table-column>
        <el-table-column
          label="碳水(g)"
          prop="tfsCarbonwater"
        ></el-table-column>
        <el-table-column
          label="碳水NRV(%)"
          prop="carbonwaterNRV"
          width="120"
        ></el-table-column>
        <el-table-column
          label="食盐(g)"
          prop="tfsSalt"
        ></el-table-column>
        <el-table-column
          label="钠(mg)"
          prop="sodium"
        ></el-table-column>
        <el-table-column
          label="钠NRV(%)"
          prop="sodiumNRV"
          width="120"
        ></el-table-column>
        <el-table-column
          label="状态"
          prop="tfsStt"
        ></el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template v-slot="{ row }">
            <span
              class="brand-color cursor-pointer"
              style="margin-right: 8px;"
              @click="goDishPage(row)"
            >打印</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="printDialogVisible"
      :close-on-click-modal="false"
      :auto-confirm="false"
      title="打印菜品"
      @on-confirm="handlePrintConfirm"
    >
      <p>
        目前打印菜品:
        <strong>{{ currentDish.tfsSkuname }}</strong>
      </p>
      <div>
        <p>标签选择：</p>
        <el-select
          v-model="tagType"
          class="medium-input"
        >
          <el-option
            label="门店标签"
            value="01"
          ></el-option>
          <el-option
            label="小站标签（菜品信息）"
            value="02"
          ></el-option>
          <el-option
            label="小站标签（固定标签）"
            value="03"
          ></el-option>
        </el-select>
      </div>
      <div>
        <span>生产日期：</span>
        <el-date-picker
          v-model="printDate"
          :editable="false"
          :clearable="false"
        ></el-date-picker>
      </div>
      <div>打印张数</div>
      <el-input v-model="printNums"></el-input>
    </ConfirmDialog>
    <!--标签内的表格-->
    <div
      style="visibility:hidden"
      ref="tagTable"
    >
      <table
        border="1"
        style="border: 1px solid black;border-style: solid;border-collapse: collapse;width:50%;font-size:5px;font-weight: bold;"
      >
        <tr>
          <td>项目</td>
          <td style="text-align:center ">每份({{currentDish.tfsQuality}}{{currentDish.tfsUnit}})</td>
          <td style="text-align:center ">NRV% </td>
        </tr>
        <tr>
          <td>能量</td>
          <td style="text-align:center ">{{currentDish.tfsEnergy}}kcal</td>
          <td style="text-align:center ">{{currentDish.energyNRV}}</td>
        </tr>
        <tr>
          <td>蛋白质</td>
          <td style="text-align:center ">{{currentDish.tfsProtein}}</td>
          <td style="text-align:center ">{{currentDish.proteinNRV}}</td>
        </tr>
        <tr>
          <td>脂肪</td>
          <td style="text-align:center ">{{currentDish.tfsFat}} </td>
          <td style="text-align:center ">{{currentDish.fatNRV}}</td>
        </tr>
        <tr>
          <td>碳水化合物</td>
          <td style="text-align:center ">{{currentDish.tfsCarbonwater}} </td>
          <td style="text-align:center ">{{currentDish.carbonwaterNRV}}</td>
        </tr>
        <tr>
          <td>钠</td>
          <td style="text-align:center ">{{currentDish.sodium}} </td>
          <td style="text-align:center ">{{currentDish.sodiumNRV}}</td>
        </tr>
      </table>

    </div>

  </div>
</template>

<script>
import BasePageTable from "@/components/BasePageTable.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import exportExcel from "@/utils/export-excel";
import { getLodop } from "@/utils/LodopFuncs";
import dayjs from 'dayjs'

const orderStatusMap = {
  0: "已取消",
  1: "待开始",
  2: "进行中",
  3: "已完成",
  4: "未开始",
};
const orderStatusMap2 = {
  0: "草稿",
  20: "待审核",
  30: "预发布",
  40: "已驳回",
  50: "已发布",
  60: "已下架",
};

export default {
  components: {
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
    this.getOrderList();
  },
  data() {
    return {
      tagType: "01",
      height: window.innerHeight - 280,
      printDate: new Date(Date.now() + 86400000),
      currentDish: {},
      printDialogVisible: false,
      printNums: 1,
      tableData: [],
      activeTab: 50,
      dishStatusTabs: [
        {
          label: "已提交",
          value: 50,
        },
        {
          label: "草稿箱",
          value: 0,
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      tableDataTotal: 0,
      queryParams: {
        dishes: "",
        tfsStt: "60",
      },
      queryComps: [
        {
          component: "el-input",
          key: "dishes",
          label: "菜品名称",
          placeholder: "请输入菜品名称",
          props: {
            clearable: true,
          },
        },
        {
          component: "BaseSelect",
          key: "tfsStt",
          label: "状态",
          props: {
            options: [
              { label: "已上架", value: "60" },
              { label: "已下架", value: "70" },
            ],
          },
        },
      ],
    };
  },
  methods: {
    unload(row) {
      this.$prompt("请输入驳回理由", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(({ value }) => {
          // this.$message({
          //   type: "success",
          //   message: "你的理由是: " + value
          // });
          this.$request("Food/updateFoodStatus", {
            remark: value,
            tfsVersion: row.tfsVersion,
            tfsCid: row.tfsCid,
            opType: 40,
          }).then(
            this.$rw((err, { dataPage }) => {
              if (!err) {
                this.tableData = dataPage.record;
              }
            })
          );
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入",
          });
        });
    },
    deleterow(row) {
      this.$confirm("此操作将删除该菜品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.deleteTag(row.tfsCid, row.tfsVersion)
          .then(() => {
            this.getOrderList();
          })
          .catch(() => {});
      });
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getOrderList();
    },
    changes() {
      this.getOrderList();
    },
    async handlePrintConfirm() {
      if (/^\d+$/.test(this.printNums)) {
        // for (let i = 0; i < this.printNums; i += 1) {
        //   // eslint-disable-next-line
        //   await printDish({
        //     ...this.currentDish,
        //     printDate: this.printDate
        //   });
        // }
        for (let i = 0; i < this.printNums; i += 1) {
          if (this.tagType == "01") {
            // 门店标签
            this.CreateOneFormPage(this.currentDish);
          } else if (this.tagType == "02") {
            //小站标签（信息标签）
            this.creatskuTag(this.currentDish);
          } else if (this.tagType == "03") {
            //小站标签（固定标签）
            this.creatTag(this.currentDish);
          }
        }
        this.printDialogVisible = false;
      } else {
        this.$message({
          type: "warning",
          message: "请输入正确打印的数字",
        });
      }
    },
    goDishPage(row) {
      this.currentDish = row;
      this.printDate = new Date(Date.now() + 86400000);
      this.printDialogVisible = true;
      this.printNums = 1;
    },

    handleExport() {
      const filename = `${this.$route.meta.title}-导出`;
      exportExcel(this.$refs.table.$el, { filename });
    },
    getOrderList() {
      const _this = this;
      this.$request("OrderPrint/getOrderSkuMsg", {
        ...this.page,
        ...this.genQueryParams(),
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            _this.tableData = res.orderdata.record;
            _this.tableDataTotal = res.orderdata.totalRecordCount;
          }
        })
      );
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      params.dishes = params.dishes.trim();
      params.date = this.$day().format("YYYY-MM-DD");

      return params;
    },
    formatOrderStatus(status) {
      return orderStatusMap[status];
    },
    formatOrderStatus2(status) {
      return orderStatusMap2[status];
    },
    transformAppointTime(data) {
      const { startTime, endTime } = data;
      return `(${this.$day(+startTime).format("YYYY-MM-DD")}) ${this.$day(
        +startTime
      ).format("HH:mm:ss")}--${this.$day(+endTime).format("HH:mm:ss")}`;
    },
    creatskuTag(dish) {
      //小站菜品
      const LODOP = getLodop();
      LODOP.PRINT_INIT("");
      LODOP.SET_PRINT_PAGESIZE(0, 480, 350, "");
      LODOP.ADD_PRINT_TEXT(4,-10,159,18, dish.tfsSkuname);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 11);
      LODOP.SET_PRINT_STYLEA(0, "FontName", "思源宋体");
      LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(19, 14, 106, 15, "营养成分表");
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 6);
      LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TABLE(28, 10, 218, 77, this.$refs.tagTable.innerHTML); 
      LODOP.ADD_PRINT_TEXT(84, 12, 130, 10, `配料表:${dish.tfsDosing}`);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 4);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(108,12,139,11, `生产日期（年/月/日）:${dayjs(this.printDate).format('YYYY/MM/DD')}`);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 4);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(116,12,100,9, `净含量:${dish.tfsQuality}${dish.tfsUnit}    保质期：${dish.tfsShelfLife}天`);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 4);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);

      LODOP.SET_PRINT_PAGESIZE(2, 350, 350, "");
      LODOP.PRINT()
      // LODOP.PRINT_DESIGN();
    },
    creatTag(dish) {
      //小站固定模板
      const LODOP = getLodop();
      LODOP.PRINT_INIT("");
      LODOP.SET_PRINT_PAGESIZE(0, 480, 350, "");
      LODOP.SET_PRINT_MODE("PRINT_NOCOLLATE", 1);
      LODOP.ADD_PRINT_IMAGE(
        3,
        10,
        136,
        63,
        "<img src='http://static.weis1606.cn/api/diet-tag/2021092412290304815.png' />"
      );
      LODOP.SET_PRINT_STYLEA(0, "Stretch", 2);
      LODOP.SET_PRINT_STYLEA(0,"TransColor","#FFFFFF");
      LODOP.ADD_PRINT_TEXT(
        68,
        10,
        180,
        20,
        "生产商：深圳市维士数字饮食（科技）有限公司"
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 4);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(74,10,179,14,"产地：广东省深圳市  联系方式：400-668-1606");
      LODOP.SET_PRINT_STYLEA(0,"FontSize",4);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(82,10,125,15,"生产地址：深圳市龙岗区南湾街道上李朗社区平吉大道金科路金积嘉科技园3栋");
      LODOP.SET_PRINT_STYLEA(0,"FontSize",4);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(98,10,148,10,"食品生产许可证编号：SC10744030704994");
      LODOP.SET_PRINT_STYLEA(0,"FontSize",4);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(105,10,103,10,"产品标准代号：DBS 44/007 ");
      LODOP.SET_PRINT_STYLEA(0,"FontSize",4);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(111,10,100,10,"贮存条件：（0~10)°C冷藏保存");
      LODOP.SET_PRINT_STYLEA(0,"FontSize",4);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(117,10,132,5,"食用方法：复热至中心温度70°C及以上后食用");
      LODOP.SET_PRINT_STYLEA(0,"FontSize",4);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
 


      LODOP.SET_PRINT_PAGESIZE(2, 350, 350, "");
      LODOP.PRINT();
      // LODOP.PRINT_DESIGN()
    },

    CreateOneFormPage(dish) {
      //门店标签
      const LODOP = getLodop();
      LODOP.PRINT_INIT("");
      LODOP.SET_PRINT_PAGESIZE(0, 480, 350, "");
      LODOP.ADD_PRINT_TEXT(15, 10, 140, 34, dish.tfsSkuname);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 11);
      LODOP.SET_PRINT_STYLEA(0, "FontName", "思源宋体");
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);

      LODOP.ADD_PRINT_LINE(35, 10, 35, 120, 0, 1);

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
      LODOP.ADD_PRINT_TEXT(55, 71, 52, 40, `${dish.tfsProtein}`);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Alignment", 3);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(68, 10, 133, 40, "脂肪：");
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(68, 68, 55, 40, `${dish.tfsFat}`);
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Alignment", 3);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(83, 10, 133, 40, "碳水化合物：");
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      LODOP.ADD_PRINT_TEXT(83, 70, 53, 40, `${dish.tfsCarbonwater}`);
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

      LODOP.SET_PRINT_PAGESIZE(2, 350, 350, "");
      LODOP.PRINT();
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

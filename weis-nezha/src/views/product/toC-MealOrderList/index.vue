<template>
  <div class="page-container">
    <div class="query-bar">
      <!--筛选搜索项-->
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :label-width="100"
        semi
      >
        <template #action>
          <el-button
            type="primary"
            @click="getList"
          >搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
    </div>
    <!--普通表格-->
    <div>
      <BasePageTable
        v-if="isshow &&  PrivetableData.length<=0"
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
        :columns="queryParams.form === '01'?columns:queryParams.form === '02'? mealCategory:queryParams.form === '03'? delivery: queryParams.form === '04'?orderMeal:queryParams.form === '05'?registerSource: queryParams.form === '06'?sexAgeAnalysis:queryParams.form === '10'?firstOrderPurchase:queryParams.form === '07'?EatType:queryParams.form === '08'? storeList:[]"
      >
      </BasePageTable>
    </div>
    <!--客单价多表头表格-->
    <div>
      <BasePageTable
        style="width: 100%;"
        :data="PrivetableData"
        border
        ref="report-table"
        v-if="queryParams.form === '09' && PrivetableData.length>0"
      >
        <el-table-column
          label="序号"
          width="80"
          type="index"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="shipTime"
          label="日期"
          align="center"
        > </el-table-column>
        <el-table-column
          label="早餐"
          align="center"
        >
          <el-table-column
            prop="breakfastNum"
            label="餐单数"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="breakfastPrice"
            label="实付本金总计"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="breakfastUnitPrice"
            label="客单价"
            align="center"
          > </el-table-column>
        </el-table-column>
        <el-table-column
          label="午餐"
          align="center"
        >
          <el-table-column
            prop="lunchNum"
            label="餐单数"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="lunchPrice"
            label="实付本金总计"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="lunchUnitPrice"
            label="客单价"
            align="center"
          > </el-table-column>
        </el-table-column>
        <el-table-column
          label="晚餐"
          align="center"
        >
          <el-table-column
            prop="dinnerNum"
            label="餐单数"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="dinnerPrice"
            label="实付本金总计"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="dinnerUnitPrice"
            label="客单价"
            align="center"
          > </el-table-column>
        </el-table-column>
        <el-table-column
          label="加餐"
          align="center"
        >
          <el-table-column
            prop="addfoodNum"
            label="餐单数"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="addfoodPrice"
            label="实付本金总计"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="addfoodUnitPrice"
            label="客单价"
            align="center"
          > </el-table-column>
        </el-table-column>
        <el-table-column
          label="总计"
          align="center"
        >
          <el-table-column
            prop="totalNum"
            label="餐单数"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="totalPrice"
            label="实付本金总计"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="totalUnitPrice"
            label="客单价"
            align="center"
          > </el-table-column>
        </el-table-column>

      </BasePageTable>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import exportExcel from "@/utils/export-excel";
import { saveAs } from "file-saver";
import XLSX from "@/utils/xlsx";
export default defineComponent({
  name: "product_toC-MealOrderList",
  data() {
    return {
      PrivetableData: [],
      isshow: false,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      columns: [
        {
          type: "index",
          label: "序号",
        },
        {
          label: "时间",
          prop: "shipTime",
        },
        {
          label: "预订(18:00)之前",
          prop: "beforePresetNum",
        },
        {
          label: "预订(18:00--24:00)",
          prop: "afterPresetNum",
        },
        {
          label: "现点",
          prop: "nowNum",
        },
      ],
      mealCategory: [
        {
          type: "index",
          label: "序号",
        },
        {
          prop: "shipTime",
          label: "时间",
        },
        {
          prop: "breakfastNum",
          label: "早餐",
        },
        {
          prop: "lunchNum",
          label: "午餐",
        },
        {
          prop: "dinnerNum",
          label: "晚餐",
        },
      ],
      delivery: [
        {
          type: "index",
          label: "序号",
        },
        {
          prop: "shipTime",
          label: "时间",
        },
        {
          prop: "ordinaryNum",
          label: "配送-普通订单",
        },
        {
          prop: "putorderNum",
          label: "配送-拼单",
        },
        {
          prop: "groupNum",
          label: "企业专送",
        },
        {
          prop: "himselfNum",
          label: "自取",
        },
      ],

      orderMeal: [
        {
          type: "index",
          label: "序号",
        },
        {
          prop: "shipTime",
          label: "时间",
        },
        {
          prop: "homeNum",
          label: "首页点餐",
        },
        {
          prop: "groupNum",
          label: "企业点餐",
        },
        {
          prop: "aiNum",
          label: "AI套餐",
        },
        {
          prop: "fatreducecampNum",
          label: "线上减脂营",
        },
        {
          prop: "batchNum",
          label: "批量点餐",
        },
        {
          prop: "counselorNum",
          label: "教练点餐",
        },
        {
          prop:'moremealsNum',
          label:'多餐优惠'
        }
      ],
      registerSource: [
        {
          type: "index",
          label: "序号",
        },
        {
          prop: "sourceName",
          label: "注册来源",
        },
        {
          prop: "sourceNum",
          label: "注册数量",
        },
        {
          prop: "shipTime",
          label: "注册时间",
        },
      ],
      sexAgeAnalysis: [
        {
          type: "index",
          label: "序号",
        },
        {
          prop: "shipTime",
          label: "时间",
        },
        {
          prop: "isMen",
          label: "男",
        },
        {
          prop: "isWomen",
          label: "女",
        },
        {
          prop: "isOther",
          label: "性别其他",
        },
        {
          prop: "otherAgeNum",
          label: "年龄其他",
        },
        {
          prop: "twoToSixNum",
          label: "2-6",
        },
        {
          prop: "sevenToSeventeenNum",
          label: "7-17",
        },
        {
          prop: "eighteenToTwentyfiveNum",
          label: "18-25",
        },
        {
          prop: "twentysixToThirtyNum",
          label: "26-30",
        },
        {
          prop: "thirtyoneToThirtyfiveNum",
          label: "31-35",
        },
        {
          prop: "thirtysixToFortyNum",
          label: "36-40",
        },
        {
          prop: "fortyoneToFiftyNum",
          label: "40-50",
        },
        {
          prop: "fiftyoneToSixtyfiveNum",
          label: "51-65",
        },
        {
          prop: "eighteenToTwentyfiveNum",
          label: "65以上",
        },
      ],
      firstOrderPurchase: [
        {
          type: "index",
          label: "序号",
        },
        {
          prop: "shipTime",
          label: "时间",
        },
        {
          prop: "firstNum",
          label: "首单",
        },
        {
          prop: "totalNum",
          label: "复购单",
        },
      ],
      EatType: [
        {
          type: "index",
          label: "序号",
        },
        {
          prop: "shipTime",
          label: "时间",
        },
        {
          prop: "eathowType",
          label: "吃法",
        },
        {
          prop: "eathowNum",
          label: "数量",
        },
      ],
      storeList: [
        {
          type: "index",
          label: "序号",
        },
        {
          prop: "shipTime",
          label: "时间",
        },
        {
          prop: "type",
          label: "类型",
        },
        {
          prop: "dachongNum",
          label: "大冲店",
        },
        {
          prop: "chenjiaciNum",
          label: "陈家祠店",
        },
        {
          prop: "jinjijiaNum",
          label: "金积嘉店",
        },
        {
          prop: "baotiNum",
          label: "宝体店",
        },

        {
          prop: "honglangbeiNum",
          label: "洪浪北店",
        },
        {
          prop: "shangmeilinNum",
          label: "上梅林店",
        },
        {
          prop: "bantianNum",
          label: "坂田店",
        },
        {
          prop: "longchengNum",
          label: "龙城店",
        },
        {
          prop: "guiyuanNum",
          label: "桂园店",
        },
        {
          prop: "jiangnanxiNum",
          label: "江南西店",
        },
        {
          prop: "nanyouNum",
          label: "南油店",
        },
        {
          prop: "shekouNum",
          label: "蛇口店",
        },
        {
          prop: "sungangNum",
          label: "笋岗店",
        },
        {
          prop: "huaqiaochengNum",
          label: "华侨城店",
        },
        {
          prop: "huanghuagangNum",
          label: "黄花岗店",
        },
        {
          prop: "daxuechengNum",
          label: "大学城店",
        },
        {
          prop: "chegongmiaoNum",
          label: "车公庙店",
        },
        {
          prop: "hongshanNum",
          label: "红山店",
        },
        {
          prop: "shiqiaoNum",
          label: "市桥店",
        },

        {
          prop: "chigangNum",
          label: "赤岗店",
        },
        {
          prop: "baiyunhuiguangchangNum",
          label: "白云汇广场店",
        },

        {
          prop: "beidayiyuanNum",
          label: "北大医院店",
        },
        {
          prop: "aoyuanguangchangNum",
          label: "奥园广场店",
        },
        {
          prop: "gangxiaNum",
          label: "岗厦店",
        },
        {
          prop: "huashiNum",
          label: "华师店",
        },

        {
          prop: "wushanhuagongNum",
          label: "五山华工店",
        },
        {
          prop: "zhujiangxinchengNum",
          label: "珠江新城店",
        },
        //  {
        //   prop: "shipTime",
        //   label: "盐田店",
        // },
      ],

      queryParams: {
        form: "",
        cycleType: "",
        startDate: "", //开始时间 yyyy-mm-dd
        endDate: "", //结束时间 yyyy-mm-dd
      },

      queryComps: [
        {
          component: "BaseSelect",
          key: "form",
          label: "分析项目",
          props: {
            options: [
              {
                label: "预订单",
                value: "01",
              },
              {
                label: "早中晚餐别",
                value: "02",
              },
              {
                label: "配送自取",
                value: "03",
              },
              {
                label: "点餐入口",
                value: "04",
              },
              {
                label: "注册来源",
                value: "05",
              },
              {
                label: "性别年龄",
                value: "06",
              },
              {
                label: "吃法",
                value: "07",
              },
              {
                label: "门店分析",
                value: "08",
              },
              {
                label: "客单价分析",
                value: "09",
              },
              {
                label: "首单复购分析",
                value: "10",
              },
            ],
            clearable: true,
          },
          listeners: {
            change: (val) => {
              this.tableData = [];
            },
          },
        },

        {
          component: "BaseSelect",
          key: "cycleType",
          label: "分析周期",
          props: {
            options: [
              {
                label: "日分析",
                value: "01",
              },
              {
                label: "周分析",
                value: "02",
              },
              {
                label: "月分析",
                value: "03",
              },
            ],
            clearable: true,
          },
          listeners: {
            change: (val) => {
              const item = this.queryComps.find(
                (it) => it.label === "日期区间"
              );
              if (val === "03") {
                item.props.type = "monthrange";
              } else {
                item.props.type = "daterange";
              }
              this.queryParams.date = [];
              this.queryParams.startDate = "";
              this.queryParams.endDate = "";
            },
          },
        },
        {
          component: "el-date-picker",
          key: "date",
          label: "日期区间",
          props: {
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
            type: "daterange",
            clearable: true,
          },
          listeners: {
            change: (value: Date[]) => {
              const queryParams = this.queryParams as Record<string, any>;
              queryParams.startDate = this.$day(value[0]).format("YYYYMMDD");
              queryParams.endDate = this.$day(value[1]).format("YYYYMMDD");
            },
          },
        },
      ],
    };
  },
  created() {
    // this.getList()
  },
  methods: {
    getEvaluateConformity(page: { pageNo: number; pageSize: number }) {
      let form = this.queryParams.form;
      let path = "";
      if (form == "01") {
        path = "data.MultiAnalysis/presetNowAnalysis";
      } else if (form == "02") {
        path = "data.MultiAnalysis/mealCategoryAnalysis";
      } else if (form == "03") {
        path = "data.MultiAnalysis/deliveryHimselfAnalysis";
      } else if (form == "04") {
        path = "data.MultiAnalysis/orderMealInletAnalysis";
      } else if (form == "05") {
        path = "data.MultiAnalysis/registerSourceAnalysis";
      } else if (form == "06") {
        path = "data.MultiAnalysis/sexAgeAnalysis";
      } else if (form == "07") {
        path = "data.MultiAnalysis/eathowAnalysis";
      } else if (form == "08") {
        path = "data.MultiAnalysis/storesAnalysis";
      } else if (form == "09") {
        path = "data.MultiAnalysis/pricepreunitAnalysis";
      } else if (form == "10") {
        path = "data.MultiAnalysis/firstOrderPurchaseAnalysis";
      }
      return this.$request(path, {
        ...page,
        ...this.queryParams,
      });
    },
    getList() {
      if (!this.queryParams.form) {
        this.$message.error("请选择分析项目");
        return;
      } else if (!this.queryParams.cycleType) {
        this.$message.error("请选择分析周期");
        return;
      } else if (!this.queryParams.date) {
        this.$message.error("请选择日期");
        return;
      } else {
        this.$store.state.vloading = true;
        this.PrivetableData = [];
        if (this.queryParams.form != "09") {
          // 客单价
          this.isshow = true;
        } else {
          this.isshow = false;
        }
        this.getEvaluateConformity(this.page).thenwrap((err, res) => {
          if (!err) {
            if (this.queryParams.form == "09") {
              this.PrivetableData = res.result;
            } else {
              this.tableData = res.result;
              this.tableDataTotal = res.totalRecordCount;
            }
          } else {
            this.$message.error(err.errMsg);
          }
          this.$store.state.vloading = false;
        });
      }
    },
    async handleExport() {
      this.$store.state.bloading = true;
      if (this.queryParams.form == "09") {
        // 客单价 导出多表头excel
        const $e = this.$refs["report-table"].$el;
        let $table = $e.querySelector(".el-table__fixed");
        if (!$table) {
          $table = $e;
        }
        const wb = XLSX.utils.table_to_book($table, { raw: true });
        const wbout = XLSX.write(wb, {
          bookType: "xlsx",
          bookSST: true,
          type: "array",
        });
        saveAs(
          new Blob([wbout], {
            type: "application/octet-stream",
          }),
          `360客单价分析.xlsx`
        );
        this.$store.state.bloading = false;
        return;
      }
      let columns =
        this.queryParams.form === "01"
          ? this.columns
          : this.queryParams.form === "02"
          ? this.mealCategory
          : this.queryParams.form === "03"
          ? this.delivery
          : this.queryParams.form === "04"
          ? this.orderMeal
          : this.queryParams.form === "05"
          ? this.registerSource
          : this.queryParams.form === "06"
          ? this.sexAgeAnalysis
          : this.queryParams.form === "10"
          ? this.firstOrderPurchase
          : this.queryParams.form === "07"
          ? this.EatType
          : this.queryParams.form === "08"
          ? this.storeList
          : "";
      this.getEvaluateConformity({
        pageNo: 1,
        pageSize: 99999,
      })
        .thenwrap((err, res) => {
          if (!err) {
            exportExcel({
              data: res.result,
              columns: columns,
              // filename: 'rfgr'
            });
          }
        })
        .finally(() => {
          this.$store.state.bloading = false;
        });
    },
  },
});
</script>

<style>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>

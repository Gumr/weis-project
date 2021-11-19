<template>
  <div class="page-container">
    <div class="overflow-hidden"></div>
    <div class="query-bar">
      <QueryComponents
        v-model="planQuery"
        :span="5"
        :label-width="90"
        :query-list="tableQueryComps"
        semi
      >
        <template #action>
          <el-button
            type="primary"
            @click="searchClick"
          >搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >
            {{ $store.state.bloading ? '导出中' : '导出' }}
          </el-button>
          <el-button
            type="text"
            :loading="printLoading"
            @click="printExport"
          >打印出库单</el-button>
        </template>
      </QueryComponents>
      <el-button
        type="primary"
        :loading="loading"
        @click="godown"
      >生成配送出库单</el-button>
      <!-- <el-button type="primary" @click="outbound" :loading="loading">同步配送出库单</el-button> -->
    </div>
    <div>
      <BasePageTable
        v-model:pageSize="page.pageSize"
        v-model:currentPage="page.pageNo"
        v-loading="$store.state.vloading"
        :page-props="{ pageSizes: [100, 200, 500, 1000] }"
        :data="tableData"
        style="width: 100%"
        :total="total"
        @page-change="getList"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.key"
          v-bind="col"
        ></el-table-column>
        <el-table-column
          key="tksoActualNum"
          label="实际出库量（份）"
          prop="tksoActualNum"
        >
          <template #default="{ row }">
            <input
              v-model="row.tksoActualNum"
              :class="['input', row.tksoOutNum == row.tksoActualNum ? '' : 'red']"
              :disabled="isEdit"
              @blur="stockOut(row)"
            />
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import exportExcel from "@/utils/export-excel";
// import XLSX from 'xlsx';
import XLSX from "@/utils/xlsx.js";
const typeoption = [
  {
    label: "早餐",
    value: "01",
  },
  {
    label: "中餐",
    value: "02",
  },
  {
    label: "晚餐",
    value: "03",
  },
  {
    label: "加餐",
    value: "04",
  },
];

export default defineComponent({
  name: "scm-kitchen_outbound-list",
  data() {
    return {
      isEdit: true,
      printLoading: false,
      loading: false,
      total: 0,
      page: {
        pageNo: 1,
        pageSize: 100,
      },
      optionList: [],
      activeTab: "01",
      tableData: [],
      backupTable: [],
      tableQueryComps: [
        {
          label: "出库日期",
          component: "el-date-picker",
          key: "date",
          props: {
            clearable: false,
            "value-format": "yyyy-MM-dd",
          },
          listeners: {
            change: (date) => {
              this.planQuery.tksoDate = this.$day(date)
                .add(1, "day")
                .format("YYYY-MM-DD");
            },
          },
        },
        {
          label: "供餐点名称",
          component: "BaseSelect",
          key: "tksoHpid",
          props: {
            clearable: true,
            filterable:true,
            options: [],
          },
        },
        {
          label: "供餐点市区",
          component: "BaseSelect",
          key: "tksoCity",
          props: {
            options: [
              {
                label: "全部",
                value: "",
              },
              {
                label: "广州市",
                value: "广州市",
              },
              {
                label: "深圳市",
                value: "深圳市",
              },
            ],
          },
        },
        {
          label: "ATM出库单",
          component: "BaseSelect",
          key: "shopType",
          props: {
            options: [
              {
                label: "是",
                value: "20",
              },
              {
                label: "否",
                value: "10",
              },
            ],
          },
        },
      ],
      planQuery: {
        date: this.$day().format("YYYY-MM-DD"),
        tksoDate: this.$day().add(1, "day").format("YYYY-MM-DD"),
        tksoCity: "",
        tksoHpid: "",
      },
      dishStatusTabs: [
        {
          label: "计划生产",
          value: "01",
        },
        {
          label: "备货生产",
          value: "02",
        },
      ],
      typeoption,
      tableCol: [
        {
          label: "序号",
          type: "index",
        },
        {
          label: "菜品名称",
          prop: "tfsSkuname",
        },
        {
          prop: "heatPonitName",
          label: "供餐点名称",
        },
        {
          label: "菜品编码",
          prop: "tksoCid",
        },
        {
          label: "菜品规格",
          prop: "tfsQuality",
          formatter: (row) => row.tfsQuality + row.tfsUnit,
        },
        {
          label: "补货生产量（份）",
          prop: "tksoSupplementNum",
        },
        {
          label: "备货生产量（份）",
          prop: "tksoStockUpNum",
        },
        {
          label: "生产合计（份）",
          prop: "tksoOutNum",
        },
        {
          label: "计划出库量",
          prop: "tksoPlanNum",
        },
      ],
    };
  },

  created() {
    this.handleDate();
    this.getOptionList();
    this.getList();
  },
  methods: {
    async godown() {
      this.loading = true;
      const res = await this.$http("tools.ServiceTools/kingdeeBillTool", {
        functionBillType: "createDeliveryStock",
        date: this.planQuery.tksoDate,
      });
      this.loading = false;
      if (res.errCode === 0) {
        this.$msg("操作成功", "success");
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    async outbound() {
      this.loading = true;
      await this.$http("tools.ServiceTools/kingdeeBillTool", {
        functionBillType: "deliveryStockSync",
        date: this.planQuery.tksoDate,
      });
      this.loading = false;
      this.$msg("操作成功", "success");
    },
    handleDate() {
      const date1 = new Date(this.planQuery.tksoDate).getTime();
      const date2 = new Date().getTime();
      if (date1 > date2) {
        this.isEdit = false;
      } else {
        const date = this.$day(new Date()).format("HH");
        this.isEdit = date > 7;
      }
    },
    searchClick() {
      this.handleDate();
      this.getList();
    },
    getOptionList() {
      return this.$request("OrderPrint/hpInfo", {}).then(
        this.$rw((err, res) => {
          if (!err) {
            const list = res.res;
            this.optionList = list;
            this.tableQueryComps[1].props.options = list;
          }
        })
      );
    },
    async handleExport() {
      const date = this.$day(this.planQuery.tksoDate).format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}单品出库单-导出(${date})`;
      const params = {
        ...this.planQuery,
        pageNo: 1,
        pageSize: this.total,
      };
      const res = await this.$http("StockOut/stockOutList", params);
      const columns = this.$deepClone(this.tableCol);
      columns.splice(4, 0, { label: "金蝶物料编码", prop: "tfsKingdeeId" });
      columns.push({
        label: "实际出库量（份）",
        prop: "tksoActualNum",
      });
      const data = res.obj.record;
      // data.forEach((item) => {
      //   item.tfsQuality = item.tfsQuality + item.tfsUnit;
      // });
      exportExcel({
        columns,
        filename,
        data,
      });
    },
    async getList() {
      const params = {
        ...this.planQuery,
        ...this.page,
      };
      const res = await this.$http("StockOut/stockOutList", params);
      this.tableData = res.obj.record;
      this.total = res.obj.totalRecordCount;
    },
    async stockOut(row) {
      row.tksoActualNum = isNaN(row.tksoActualNum)
        ? 0
        : Math.abs(Number(row.tksoActualNum));
      const params = {
        stockOutBeans: [
          {
            tksoHpid: row.tksoHpid,
            tksoDate: row.tksoDate,
            tksoCid: row.tksoCid,
            tksoActualNum: row.tksoActualNum,
          },
        ],
      };
      const res = await this.$http("StockOut/makeOutData", params);
      if (!res.errMsg) {
        this.$msg("修改成功", "success");
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    async printExport() {
      this.printLoading = true;
      const border = {
        // 设置边框
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      const headers = {
        A1: {
          v: "",
          s: {
            font: { sz: 14, bold: true },
            border,
            alignment: {
              horizontal: "center",
              wrapText: true,
              vertical: "center",
            },
          },
        },
        B1: { v: " ", s: { border } },
        C1: { v: " ", s: { border } },
        D1: { v: " ", s: { border } },
        E1: { v: " ", s: { border } },
        F1: { v: " ", s: { border } },
        G1: { v: " ", s: { border } },
        // H1: { v: " ", s: { border } },
        // I1: { v: " ", s: { border } },
        A2: { v: "联系人及电话：", s: { border } },
        B2: { v: "15989660279/刘荟岭", s: { border } },
        C2: { v: " ", s: { border } },
        D2: { v: "送货日期：", s: { border } },
        E2: {
          v: this.$day(this.planQuery.date).format("YYYY-MM-DD"),
          s: { border, alignment: { horizontal: "center", wrapText: true } },
        },
        F2: { v: " ", s: { border } },
        G2: { v: " ", s: { border } },
        // H2: { v: " ", s: { border } },
        // I2: { v: " ", s: { border } },
        A3: { v: "配送点地址：", s: { border } },
        B3: { v: "", s: { border } },
        C3: { v: " ", s: { border } },
        D3: { v: " ", s: { border } },
        E3: { v: " ", s: { border } },
        F3: { v: " ", s: { border } },
        G3: { v: " ", s: { border } },
        // H3: { v: " ", s: { border } },
        // I3: { v: " ", s: { border } },
        A4: {
          v: "产品编号",
          s: {
            font: { bold: true },
            border,
            alignment: {
              horizontal: "center",
              wrapText: true,
              vertical: "center",
            },
          },
        },
        B4: {
          v: "产品名称",
          s: {
            font: { bold: true },
            border,
            alignment: {
              horizontal: "center",
              wrapText: true,
              vertical: "center",
            },
          },
        },
        C4: {
          v: "规格",
          s: {
            font: { bold: true },
            border,
            alignment: {
              horizontal: "center",
              wrapText: true,
              vertical: "center",
            },
          },
        },
        // D4: {
        //   v: "单位",
        //   s: {
        //     font: { bold: true },
        //     border,
        //     alignment: {
        //       horizontal: "center",
        //       wrapText: true,
        //       vertical: "center",
        //     },
        //   },
        // },
        D4: {
          v: "备货量",
          s: {
            font: { bold: true },
            border,
            alignment: {
              horizontal: "center",
              wrapText: true,
              vertical: "center",
            },
          },
        },
        E4: {
          v: "补货量",
          s: {
            font: { bold: true },
            border,
            alignment: {
              horizontal: "center",
              wrapText: true,
              vertical: "center",
            },
          },
        },
        F4: {
          v: "原定量",
          s: {
            font: { bold: true },
            border,
            alignment: {
              horizontal: "center",
              wrapText: true,
              vertical: "center",
            },
          },
        },
        // H4: {
        //   v: "送货量",
        //   s: {
        //     font: { bold: true },
        //     border,
        //     alignment: {
        //       horizontal: "center",
        //       wrapText: true,
        //       vertical: "center",
        //     },
        //   },
        // },
        G4: {
          v: "实际签收量",
          s: {
            font: { bold: true },
            border,
            alignment: {
              horizontal: "center",
              wrapText: true,
              vertical: "center",
            },
          },
        },
      };
      // 获取数据
      const params = {
        ...this.planQuery,
        pageNo: 1,
        pageSize: this.total,
      };
      const res = await this.$http("StockOut/stockOutList", params);
      const stockList = res.obj.record;
      if (stockList.length <= 0) {
        this.$message.error("没有可打印的出库数据");
        this.printLoading = false;
        return;
      }
      // 表格数据
      const dataArr = [];
      const headerArr = [];
      let heatPonitName = this.optionList.map((val) => val.label);
      if (this.planQuery.tksoHpid) {
        heatPonitName = this.optionList
          .filter((val) => val.value == this.planQuery.tksoHpid)
          .map((val) => val.label);
      }
      let resData = heatPonitName.map((name) =>
        stockList.filter((stock) => stock.heatPonitName === name)
      );


      for (const i in resData) {
        const list = resData[i];
        if (list.length <= 0) {
          resData[i] = false;
          heatPonitName[i] = false;
        }
      }
      resData = resData.filter(Boolean);
      heatPonitName = heatPonitName.filter(Boolean);

      heatPonitName.forEach((item) => {
        const head = this.$deepClone(headers);
        const heatInfo = this.optionList.find((val) => val.label == item);
        head.A1.v = `深圳市维士数字饮食（科技）有限公司    《${item}》  配送单`;
        head.B2.v =
          heatInfo.obj.thpShopLeader + "/" + heatInfo.obj.thpShopLeaderPhone;
        head.B3.v = heatInfo.obj.thpShopAddress;
        headerArr.push(head);
        dataArr.push([]);
      });

      let maxLength = 0;
      resData.forEach((item, index) => {
        let total = 0;
        item.forEach((_, i) => {
          maxLength = Math.max(maxLength, item.length);
          total += Number(item[i].tksoPlanNum);

          dataArr[index][`A${5 + Number(i)}`] = {
            v: item[i].tfsKingdeeId,
            s: {
              alignment: {
                horizontal: "center",
                wrapText: true,
                vertical: "center",
              },
              border,
            },
          };
          dataArr[index][`B${5 + Number(i)}`] = {
            v: item[i].tfsSkuname,
            s: {
              font: { sz: 12, bold: true },
              alignment: {
                horizontal: "center",
                wrapText: true,
                vertical: "center",
              },
              border,
            },
          };
          dataArr[index][`C${5 + Number(i)}`] = {
            v: item[i].tfsQuality + item[i].tfsUnit,
            s: {
              alignment: {
                horizontal: "center",
                wrapText: true,
                vertical: "center",
              },
              border,
            },
          };
          // dataArr[index][`D${5 + Number(i)}`] = {
          //   v: "盒",
          //   s: {
          //     alignment: {
          //       horizontal: "center",
          //       wrapText: true,
          //       vertical: "center",
          //     },
          //     border,
          //   },
          // };
          dataArr[index][`D${5 + Number(i)}`] = {
            v: item[i].tksoStockUpNum,
            s: {
              font: { sz: 13, bold: true },
              alignment: {
                horizontal: "center",
                wrapText: true,
                vertical: "center",
              },
              border,
            },
          };
          dataArr[index][`E${5 + Number(i)}`] = {
            v: item[i].tksoSupplementNum,
            s: {
              font: { sz: 13, bold: true },
              alignment: {
                horizontal: "center",
                wrapText: true,
                vertical: "center",
              },
              border,
            },
          };

          dataArr[index][`F${5 + Number(i)}`] = {
            v: item[i].tksoPlanNum,
            s: {
              font: { sz: 13, bold: true },
              alignment: {
                horizontal: "center",
                wrapText: true,
                vertical: "center",
              },
              border,
            },
          };
          // dataArr[index][`G${5 + Number(i)}`] = {
          //   v: item[i].tksoPlanNum,
          //   s: {
          //     font: { bold: true },
          //     alignment: {
          //       horizontal: "center",
          //       wrapText: true,
          //       vertical: "center",
          //     },
          //     border,
          //   },
          // };
          dataArr[index][`G${5 + Number(i)}`] = { v: " ", s: { border } };
          headerArr[index][`A${item.length + 5}`] = { v: " ", s: { border } };
          headerArr[index][`B${item.length + 5}`] = { v: " ", s: { border } };
          headerArr[index][`C${item.length + 5}`] = { v: " ", s: { border } };
          headerArr[index][`D${item.length + 5}`] = { v: " ", s: { border } };
          headerArr[index][`E${item.length + 5}`] = { v: " ", s: { border } };
          headerArr[index][`F${item.length + 5}`] = { v: " ", s: { border } };
          headerArr[index][`G${item.length + 5}`] = { v: " ", s: { border } };
          // headerArr[index][`H${item.length + 5}`] = { v: " ", s: { border } };
          // headerArr[index][`I${item.length + 5}`] = { v: " ", s: { border } };
          headerArr[index][`A${item.length + 6}`] = { v: " ", s: { border } };
          headerArr[index][`D${item.length + 6}`] = {
            v: "总计",
            s: {
              font: { sz: 13, bold: true },
              alignment: {
                horizontal: "center",
                wrapText: true,
                vertical: "center",
              },
              border,
            },
          };
          headerArr[index][`E${item.length + 6}`] = {
            v: total,
            s: {
              font: { sz: 13, bold: true },
              alignment: {
                horizontal: "center",
                wrapText: true,
                vertical: "center",
              },
              border,
            },
          };

          headerArr[index][`F${item.length + 6}`] = { v: " ", s: { border } };
          headerArr[index][`G${item.length + 6}`] = { v: " ", s: { border } };
          headerArr[index][`A${item.length + 7}`] = {
            v: "收货人",
            s: {
              alignment: {
                horizontal: "center",
                wrapText: true,
                vertical: "center",
              },
              border,
            },
          };
          headerArr[index][`B${item.length + 7}`] = { v: " ", s: { border } };
          headerArr[index][`C${item.length + 7}`] = { v: " ", s: { border } };
          headerArr[index][`D${item.length + 7}`] = { v: " ", s: { border } };
          headerArr[index][`E${item.length + 7}`] = { v: " ", s: { border } };
          headerArr[index][`F${item.length + 7}`] = { v: " ", s: { border } };
          headerArr[index][`G${item.length + 7}`] = { v: " ", s: { border } };
          // headerArr[index][`H${item.length + 7}`] = { v: " ", s: { border } };
          // headerArr[index][`I${item.length + 7}`] = { v: " ", s: { border } };
        });
      });
      // 合并 headers 和 data
      // 表格范围，范围越大生成越慢
      const ref = `A1:ZZ${maxLength + 10}`;
      // 合并单元格设置
      const merges = [
        { s: { c: 0, r: 0 }, e: { c: 6, r: 0 } }, // 深圳市维士数字饮
        { s: { c: 1, r: 1 }, e: { c: 2, r: 1 } }, // 配送单配送单
        { s: { c: 4, r: 1 }, e: { c: 6, r: 1 } }, //出货单出货单
        { s: { c: 1, r: 2 }, e: { c: 6, r: 2 } }, // 送货日期
      ];
      const cols = [
        { wch: 14 },
        { wch: 24 },
        { wch: 5 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        // { wch: 16},
        // { wch: 24 },
      ];
      const rows = [{ hpx: 25 }, { hpx: 25 }];
      // 构建 workbook 对象
      const wb = {
        SheetNames: heatPonitName,
        Sheets: {},
      };
 
      resData.forEach((_, index) => {
        wb.Sheets[heatPonitName[index]] = Object.assign(
          {},
          headerArr[index],
          dataArr[index],
          { "!ref": ref, "!merges": merges, "!cols": cols, "!rows": rows }
        );
      });
      // 导出 Excel

      this.printLoading = false;
      XLSX.writeFile(wb, "出库单.xlsx");
    },
  },
});
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.action-label {
  margin-right: 8px;
}
#container {
  min-width: 600px;
  min-height: 767px;
}
.input {
  box-sizing: border-box;
  width: 95%;
  padding: 0 10px;
  height: 40px;
  display: inline-block;
  font-size: inherit;
  outline: 0;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
}
.red {
  color: red !important;
}
</style>

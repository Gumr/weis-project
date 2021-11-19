<template>
  <div class="page-container">
    <div class="query-bar">
      <ButtonTabs
        v-model="currentTab"
        :tabs="tabs"
        @change="handleTabChange"
      />
    </div>
    <div v-if="currentTab === 0">
      <div class="query-bar">
        <QueryComponents
          v-model="queryParams"
          :query-list="queryComps"
          :span="6"
          :label-width="120"
          :action="false"
          semi
        >
          <template #actions>
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
          <template #button>
            <div class="text-right">
              <el-button
                v-if="forecastable"
                type="success"
                @click="forecastClick"
              >新增预测</el-button>
            </div>
          </template>
        </QueryComponents>
      </div>
      <div>
        <BasePageTable
          ref="table"
          v-model:current-page="page.pageNo"
          v-model:page-size="page.pageSize"
          v-loading="$store.state.vloading"
          :data="tableData"
          :total="tableDataTotal"
          border
          @current-page-change="getList"
          @size-change="getList"
        >
          <el-table-column
            v-for="col in columns"
            :key="col.label"
            v-bind="col"
          >
            <template
              v-if="col.label === '预测量'"
              #default="{ row }"
            >
              <span v-if="row.modify === 'false'">{{ row.num }}</span>
              <el-popover
                placement="right"
                :width="400"
                trigger="click"
                v-if="row.modify === 'true'"
              >
                <template #reference>
                  <span
                    :style="row.modify === 'true' ? 'color: red;' : ''"
                    @click="showtips(row)"
                  >{{ row.num }}</span>
                </template>
                <div
                  v-for="item in showdata"
                  :key="item.num"
                >{{item.mealName}}由{{item.preNum}}份改成{{item.num}}份，修改人：{{item.creator}},修改时间:{{item.ctime}}</div>
              </el-popover>

            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
          >
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="editClick(row)"
              >编辑</el-button>
            </template>
          </el-table-column>
        </BasePageTable>
      </div>
    </div>
    <div v-if="currentTab === 1">
      <ChildrenOrder />
    </div>
    <div v-if="currentTab === 2">
      <PredictCompanyOrder />
    </div>
    <div v-if="currentTab === 3">
      <PredictOrder />
    </div>
  </div>
  <ConfirmDialog
    v-model="editForecastDialog"
    title="修改预测单"
    async-confirm
    :auto-loading="false"
    @on-confirm="handleEditForecastConfirm"
  >
    <el-alert
      title="提示：预测数据已同步至央厨，修改后需要同步央厨同学呦"
      type="error"
      :closable="false"
    ></el-alert>
    <el-form label-width="130px">
      <el-form-item label="供餐日期：">{{ forecastInfo.date }}</el-form-item>
      <el-form-item label="园区名称：">{{ forecastInfo.tgcaName }}</el-form-item>
      <el-form-item label="供餐门店：">{{ forecastInfo.thpName }}</el-form-item>
      <el-form-item label="收货地址：">{{ forecastInfo.tgcaAddress }}</el-form-item>
      <el-form-item label="套餐名称：">{{ forecastInfo.mealName }}</el-form-item>
      <el-form-item label="套餐预测量：">
        <NumberInput v-model="forecastInfo.num"></NumberInput>
      </el-form-item>
    </el-form>
  </ConfirmDialog>
  <ConfirmDialog
    v-model="newForecastDialog"
    title="新增预测"
    :auto-loading="false"
    async-confirm
    @on-confirm="handleNewForcastConfirm"
  >
    <el-form label-width="130px">
      <el-form-item label="配送日期：">
        <el-date-picker
          v-model="forecast.date"
          :disabled-date="disabledDate"
          :clearable="false"
          @change="queryCorpOnlineComboList"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="企业：">
        <BaseSelect
          v-model="forecast.corpId"
          :options="forecastOptions.corp"
          :props="{
            label: 'tgcName',
            value: 'tgcId'
          }"
          @change="handleForecastCorpChange"
        ></BaseSelect>
      </el-form-item>
      <el-form-item label="园区名称：">
        <BaseSelect
          v-model="forecast.tgcaId"
          :options="forecastOptions.address"
          :props="{
            label: 'addressName',
            value: 'addressId'
          }"
          @change="handleForecastAddressChange"
        ></BaseSelect>
      </el-form-item>
      <el-form-item
        label="收货地址："
        required
      >{{ forecast.detailAddress }}</el-form-item>
      <el-form-item
        label="供餐门店："
        required
      >{{ forecast.thpName }}</el-form-item>
      <el-form-item label="菜品信息：">
        <el-table
          :data="forecastTable.data"
          border
          stripe
          max-height="500px"
        >
          <el-table-column
            type="index"
            label="序号"
            :width="80"
          ></el-table-column>
          <el-table-column
            prop="tgccComboId"
            label="菜品编码"
          ></el-table-column>
          <el-table-column
            prop="tgccName"
            label="菜品"
          ></el-table-column>
          <el-table-column
            prop="tgccContent"
            label="明细"
          ></el-table-column>
          <el-table-column
            prop="num"
            label="数量"
          >
            <template #default="{ row }">
              <NumberInput v-model="row.num" />
            </template>
          </el-table-column>
          <el-table-column
            prop="tgccTotalAmount"
            label="单价"
          ></el-table-column>
          <el-table-column
            prop="tgccAmount"
            label="订单金额"
          ></el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
  </ConfirmDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import exportExcel from "@/utils/export-excel";
import ButtonTabs from "@/components/ButtonTabs.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { getCorpAddress } from "@/utils/data-getter";
// import childrenOrder from "@views/product/predict/children-order";
import ChildrenOrder from "./childrenOrder.vue";
import PredictCompanyOrder from "@/views/product/predict-company-order/index";
import PredictOrder from "@/views/scm/predict-order/index";
function createForecast() {
  return {
    corpId: "",
    tgcaId: "",
    detailAddress: "",
    thpName: "",
    date: new Date(Date.now() + 86400000 * 2),
    skuList: "",
  };
}

export default defineComponent({
  name: "product_children-forecast",
  components: {
    ButtonTabs,
    ConfirmDialog,
    PredictCompanyOrder,
    ChildrenOrder,
    PredictOrder,
  },
  data() {
    return {
      newForecastDialog: false,
      editForecastDialog: false,
      forecastable: true,
      currentTab: 0,
      forecastInfo: {},
      tabs: [
        {
          label: "幼托预测数据",
          value: 0,
        },
        {
          label: "幼托订单数据",
          value: 1,
        },
        {
          label: "幼托预测与实际订单比对(套餐)",
          value: 2,
        },
        {
          label: "幼托预测与实际订单比对(单品)",
          value: 3,
        },
      ],
      showdata: {},
      // productQueryComps: [
      //   {
      //     component: 'el-date-picker',
      //     key: 'date',
      //     label: '售卖日期',
      //     placeholder: '选择日期',
      //     props: {
      //       type: 'date',
      //       'value-format': 'yyyy-MM-dd'
      //     }
      //   },
      //   {
      //     component: 'BaseSelect',
      //     key: 'heatPointId',
      //     label: '供餐点',
      //     props: {
      //       options: []
      //     }
      //   },
      //   {
      //     slot: 'buttons'
      //   }
      // ],
      forecast: createForecast(),
      forecastOptions: {
        corp: [],
        address: [],
      },
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
          label: "企业",
          prop: "corpName",
        },
        {
          label: "园区名称",
          prop: "tgcaName",
        },
        {
          label: "配送地址",
          prop: "tgcaAddress",
        },
        {
          label: "供餐门店",
          prop: "thpName",
        },
        {
          label: "预测套餐ID",
          prop: "mealId",
        },
        {
          label: "套餐名称",
          prop: "mealName",
        },
        {
          label: "用餐日期",
          prop: "date",
        },
        {
          label: "预测量",
          prop: "num",
        },
        {
          label: "预测人",
          prop: "creator",
        },
        {
          label: "预测提交时间",
          prop: "ctime",
        },
      ],
      queryParams: {
        uphone: "",
        type: "",
        date: [
          new Date(Date.now() + 86400000 * 2),
          new Date(Date.now() + 86400000 * 2),
        ],
        econtent: "",
        startDate: new Date(Date.now() + 86400000 * 2), //开始时间 yyyymmdd
        endDate: new Date(Date.now() + 86400000 * 2), //结束时间 yyyymmdd
        hpName: "",
      },
      forecastTable: {
        data: [],
      },
      // productTable: {
      //   selection: [],
      //   data: [],
      //   cols: [],
      //   total: 0,
      //   page: {
      //     pageNo: 1,
      //     pageSize: 10
      //   }
      // },
      // productQueryParams: {
      //   date: ''
      // },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "用餐日期",
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
        {
          component: "BaseSelect",
          key: "corpId",
          label: "企业",
          placeholder: "请选择企业",
          props: {
            options: [],
            props: {
              label: "tgcName",
              value: "tgcId",
            },
            clearable: true,
          },
          listeners: {
            change: (id) => {
              if (!id) {
                this.queryParams.addressId = "";
                this.queryComps[2].props.options = [];
              } else {
                getCorpAddress(id).then((list) => {
                  this.queryComps[2].props.options = list;
                });
              }
            },
          },
        },

        {
          component: "BaseSelect",
          key: "addressId",
          label: "地址",
          placeholder: "请选择地址",
          props: {
            options: [],
            props: {
              label: "addressName",
              value: "addressId",
            },
            clearable: true,
          },
        },
        {
          component: "el-input",
          label: "加热点名称",
          key: "hpName",
          placeholder: "请输入加热点名称",
          props: {
            clearable: true,
          },
        },
        {
          slot: "actions",
        },
        {
          slot: "button",
        },
      ],
    };
  },
  created() {
    // this.forecastable = this.$day().get('hour') >= 12
    this.getList();
    this.queryCorpAllList();
  },
  methods: {
    handleTabChange(val) {
      // if (val === 1) {
      //   this.queryStockHistList()
      // }
    },
    showtips(row) {
      if (row.modify === "false") {
        return;
      }
      this.$request("supply.ChildrenForecast/queryChildrenForecastChangeList", {
        tgfdId: row.tgfdId,
      }).thenwrap((err, data) => {
        if (!err) {
          this.showdata = data;
        }
      });
    },
    editClick(row) {
      this.forecastInfo = {
        ...row,
        date: this.$day(row.date).format("YYYY-MM-DD"),
      };
      this.editForecastDialog = true;
    },
    disabledDate(date: Date) {
      return date.valueOf() - Date.now() < 86400000;
    },
    forecastClick() {
      this.forecast = createForecast();
      this.forecastTable.data = "";
      this.newForecastDialog = true;
    },
    queryChildrenForecastPage(page: { pageNo: number; pageSize: number }) {
      return this.$request(
        "supply.ChildrenForecast/queryChildrenForecastPage",
        {
          ...page,
          ...this.queryParams,
        }
      );
    },
    queryCorpOnlineComboList() {
      this.$request("supply.ChildrenForecast/queryCorpOnlineComboList", {
        tgcId: this.forecast.corpId,
        salesDate: this.$day(this.forecast.date).format("YYYYMMDD"),
      }).thenwrap((err, data) => {
        if (!err) {
          console.log(data, "data");
          this.forecastTable.data = data.map((item) => {
            item.num = "";
            return item;
          });
        }
      });
    },
    validateForecastErr() {
      const { forecast } = this;
      if (!forecast.corpId) {
        return "请选择企业";
      }
      if (!forecast.tgcaId) {
        return "请选择园区地址";
      }
      const skuNum = this.forecastTable.data.some((item) => Boolean(item.num));
      if (!skuNum) {
        return "请填写至少一项菜品数量";
      }
    },
    handleEditForecastConfirm(loading) {
      if (!this.forecastInfo.num) {
        this.$message.error("请输入套餐预测量");
        return;
      }
      const done = loading();
      console.log(done, "done");
      this.$request("supply.ChildrenForecast/editChildrenForecast", {
        tgfdId: this.forecastInfo.tgfdId,
        num: this.forecastInfo.num,
      }).thenwrap((err) => {
        done();
        if (!err) {
          this.$message.success("修改成功");
          this.editForecastDialog = false;
          this.getList();
        } else {
          this.$message.error(err.errMsg);
        }
      });
    },
    handleNewForcastConfirm(loading) {
      const errMsg = this.validateForecastErr();
      if (errMsg) {
        this.$message.error(errMsg);
        return;
      }
      const done = loading();
      this.$request("supply.ChildrenForecast/addChildrenForecast", {
        ...this.forecast,
        skuList: this.forecastTable.data
          .filter((item) => Boolean(item.num))
          .map((item) => ({
            cid: item.tgccComboId,
            num: item.num,
          })),
        date: this.$day(this.forecast.date).format("YYYYMMDD"),
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success("添加预测成功");
          this.getList();
          this.newForecastDialog = false;
        } else {
          this.$message.error(err.errMsg);
        }
        done();
      });
    },
    handleForecastCorpChange(value) {
      this.queryCorpOnlineComboList();
      this.forecast.tgcaId = "";
      getCorpAddress(value).then((list) => {
        this.forecastOptions.address = list;
      });
    },
    handleForecastAddressChange(addressId) {
      const item = this.forecastOptions.address.find(
        (item) => item.addressId === addressId
      );
      if (item) {
        this.forecast.detailAddress = item.detailAddress;
        this.forecast.thpName = item.thpName;
      }
    },
    // queryStockHistList() {
    //   this.$request('OrderStockHist/queryStockHistList', {
    //     ...this.productTable.page,
    //     ...this.productQueryParams,
    //     type: '04'
    //   }).thenwrap((err, { dataPage }) => {
    //     if (!err) {
    //       this.tableData = dataPage.record
    //       this.tableDataTotal = dataPage.totalRecordCount
    //     }
    //   })
    // },
    queryCorpAllList() {
      this.$request("groupmeal.Corp/queryCorpAllList", {
        type: "00",
        areaType: "01",
      }).thenwrap((err, data) => {
        if (!err) {
          this.queryComps[1].props.options = data;
          this.forecastOptions.corp = data;
        }
      });
    },
    getList() {
      this.$store.state.vloading = true;
      this.queryChildrenForecastPage(this.page).thenwrap((err, res) => {
        if (!err) {
          this.tableData = res.record;
          this.tableDataTotal = res.totalRecordCount;
        }

        this.$store.state.vloading = false;
      });
    },
    async handleExport() {
      this.$store.state.bloading = true;
      this.queryChildrenForecastPage({
        pageNo: 1,
        pageSize: 99999,
      })
        .thenwrap((err, res) => {
          if (!err) {
            exportExcel({
              data: res.record,
              columns: this.columns,
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

<template>
  <div class="page-container">
    <!-- <div class="query-bar">
      <ButtonTabs
        v-model="currentTab"
        :tabs="tabs"
      />
    </div> -->
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="5"
        :label-width="100"
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
            >新建订单</el-button>
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
            v-if="col.label === '是否更改信息'"
            #default="{ row }"
          >
            <!-- <span :style="row.modify === 'true' ? 'color: blue;' : ''">{{ row.modify=== 'true' ?'已修改':'未修改' }}</span> -->
            <span v-if="row.modify === 'false'">未修改</span>
            <el-popover
              placement="right"
              :width="400"
              trigger="click"
              v-if="row.modify === 'true'"
            >
              <template #reference>
                <span
                  :style="row.modify === 'true' ? 'color: blue;' : ''"
                  @click="showtips(row)"
                >已修改</span>
              </template>
              <div
                v-for="item in showdata"
                :key="item.num"
              >{{item.name}}由{{item.preNum}}份改成{{item.num}}份，修改人：{{item.updator}},修改时间:{{item.utime}}</div>
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
  <ConfirmDialog
    v-model="newForecastDialog"
    title="新增订单"
    :auto-loading="false"
    async-confirm
    @on-confirm="handleNewForcastConfirm"
  >

    <el-alert
      title="提示：需要和央厨及相关人员沟通呦"
      type="error"
      :closable="false"
    ></el-alert>

    <el-form label-width="130px" ref="broderForm">
      <el-form-item label="配送日期：">
        <el-date-picker
          v-model="forecast.date"
          :disabled-date="disabledDate"
          :clearable="false"
          disabled
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
      >{{ forecast.address }}</el-form-item>
      <el-form-item
        label="收货人："
        required
      >{{ forecast.empName}}</el-form-item>

      <el-form-item
        label="预计送达时间："
        required
      >
        <!-- <el-time-picker     
          is-range
          v-model="forecast.shipTime"
          value-format="HH:mm"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        ></el-time-picker> -->
        <el-time-select
          :key="reqId"
          v-model="forecast.shipTime"
          placeholder="起始时间"
          v-bind="{ start: '07:30', step: '00:15', end: '23:30' }"
        />
        <span style="margin-right: 10px;" />
        <!-- <el-time-select
          :key="reqId"
          v-model="forecast.shipTime[1]"
          placeholder="结束时间"
          v-bind="{ start: '07:30', step: '00:15', end: '23:30', minTime: forecast.shipTime[0] }"
        /> -->
      </el-form-item>

      <el-form-item
        label="供餐门店："
        required
      >{{ forecast.thpName }}</el-form-item>
      <el-form-item
        label="取餐方式："
        required
      >
        <el-radio-group v-model="forecast.distributionMode">
          <el-radio label="2">企业专送（需先和门店沟通）</el-radio>
          <el-radio label="0">配送</el-radio>
          <el-radio label="1">自取</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        label="配送方式："
        required
      >
        <el-radio-group v-model="forecast.shipWithCold">
          <el-radio label="00">热食</el-radio>
          <el-radio label="01">冷链</el-radio>

        </el-radio-group>
      </el-form-item>

      <el-form-item
        label="餐别："
        required
      >
        <el-radio-group
          v-model="forecast.category"
          @change="queryCorpOnlineComboList"
        >
          <el-radio label="01">早餐</el-radio>
          <el-radio label="02">中餐</el-radio>
          <el-radio label="03">晚餐</el-radio>

        </el-radio-group>
      </el-form-item>

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
            prop="skuPageId"
            label="菜品编码"
          ></el-table-column>
          <el-table-column
            prop="name"
            label="菜品"
          ></el-table-column>
          <el-table-column
            prop="content"
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
            prop="amount"
            label="单价"
          ></el-table-column>
          <el-table-column label="订单金额">
            <template #default="{ row }">
              <span>{{row.num *row.amount}}</span>
            </template>

          </el-table-column>
        </el-table>
      </el-form-item>

    </el-form>

  </ConfirmDialog>

  <ConfirmDialog
    v-model="editForecastDialog"
    title="编辑"
    async-confirm
    :autoConfirm="false"
    :auto-loading="false"
    @on-confirm="handleEditForecastConfirm"
  >
    <el-alert
      title="提示：数据已同步至央厨，需要与央厨同学沟通呦"
      type="error"
      :closable="false"
      v-if="isShow"

    ></el-alert>
    <el-form label-width="130px" ref="broderForm">
      <el-form-item label="配送日期：">{{ forecastInfo.date }}</el-form-item>
      <el-form-item label="园区名称：">{{ forecastInfo.tgcaName }}</el-form-item>
      <el-form-item label="供餐门店：">{{ forecastInfo.thpName }}</el-form-item>
      <el-form-item label="收货地址：">{{ forecastInfo.tgcaAddress }}</el-form-item>
      <el-form-item label="菜品信息：">
        <el-table
          :data="editforecastTable.data"
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
            prop="skuId"
            label="菜品编码"
          ></el-table-column>
          <el-table-column
            prop="name"
            label="菜品"
          ></el-table-column>
          <el-table-column
            prop="content"
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
            prop="amount"
            label="单价"
          ></el-table-column>
          <el-table-column label="订单金额">
            <template #default="{ row }">
              <span>{{row.num *row.amount}}</span>
            </template>
          </el-table-column>
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
// import StockRecord from './StockRecord.vue'
import PredictCompanyOrder from "@/views/product/predict-company-order/index";
function createForecast() {
  return {
    corpId: "",
    tgcaId: "",
    address: "",
    thpName: "",
    date: new Date(Date.now() + 86400000 * 1),
    skuList: "",
    consignee: "",
    contactNumber: "",
    shipTime: "",
    distributionMode: null,
    shipWithCold: null,
    category: "",
    empName: "",
  };
}
export default defineComponent({
  name: "product_children-order",
  components: {
    ButtonTabs,
    ConfirmDialog,
    PredictCompanyOrder,
  },
  data() {
    return {
      intorderprice: 0,
      tabs: [
        {
          label: "幼托订单数据",
          value: 0,
        },
      ],
      forecastable: true,
      currentTab: 0,
      queryParams: {
        uphone: "",
        type: "",
        date: [
          new Date(Date.now() + 86400000 * 1),
          new Date(Date.now() + 86400000 * 1),
        ],
        econtent: "",
        startDate: new Date(Date.now() + 86400000 * 1), //开始时间 yyyymmdd
        endDate: new Date(Date.now() + 86400000 * 1), //结束时间 yyyymmdd
      },
      forecast: createForecast(),
      forecastOptions: {
        corp: [],
        address: [],
      },
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      tableData: [],
      tableDataTotal: 0,
      forecastInfo: {},
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
          slot: "actions",
        },
        {
          slot: "button",
        },
      ],
      columns: [
        {
          type: "index",
          label: "序号",
        },
        {
          label: "配送单编码",
          prop: "shipOid",
        },
        {
          label: "订单号",
          prop: "orderId",
        },
        {
          label: "供餐点",
          prop: "thpName",
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
          label: "收货人",
          prop: "consignee",
        },
        {
          label: "联系方式",
          prop: "contactNumber",
        },
        {
          label: "餐别",
          prop: "category",
        },
        {
          label: "菜品",
          prop: "content",
        },
        {
          label: "订单金额",
          prop: "orderPrice",
        },
        {
          label: "配送日期",
          prop: "date",
        },
        {
          label: "配送时间",
          prop: "shipTime",
        },
        {
          label: "是否更改信息",
          // prop: "modify",
          formatter: (row) => (row.modify === "true" ? "已修改" : "未修改"),
        },
        {
          label: "操作",
          prop: "corpName",
        },
        {
          label: "操作人",
          prop: "updator",
        },
        {
          label: "操作时间",
          prop: "utime",
        },
      ],
      showdata: {},
      newForecastDialog: false,
      editForecastDialog: false,
      forecastTable: {
        data: [],
      },
      editforecastTable: {
        data: [],
      },
      isShow: false,
    };
  },
  created() {
    // this.forecastable = this.$day().get('hour') >= 12
    this.getList();
    this.queryCorpAllList();
  },
  methods: {
    editClick(row) {
      this.forecastInfo = {
        ...row,
        date: this.$day(row.date).format("YYYY-MM-DD"),
      };
      this.queryChildrenOrderInfo(row.orderId);
      let times = this.$day().get("hour");
     
      this.isShow = times == 18? true : false;

      this.editForecastDialog = true;
    },
    queryChildrenOrderInfo(orderId) {
      this.$request("supply.ChildrenOrder/queryChildrenOrderInfo", {
        orderId: orderId,
      }).thenwrap((err, data) => {
        if (!err) {
          this.editforecastTable.data = data;
          // .map((item) => {
          //   item.num = "";
          //   return item;
          // });
        }
      });
    },

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
    validateForecastErr() {
      const { forecast } = this;
      if (!forecast.corpId) {
        return "请选择企业";
      }
      if (!forecast.tgcaId) {
        return "请选择园区地址";
      }
      if (!forecast.shipTime) {
        return "请选择送达时间";
      }
      if (!forecast.distributionMode) {
        return "请选择取餐方式";
      }
      if (!forecast.shipWithCold) {
        return "请选择配送方式";
      }
      if (!forecast.category) {
        return "请选择餐别";
      }
      const skuNum = this.forecastTable.data.some((item) => Boolean(item.num));
      if (!skuNum) {
        return "请填写至少一项菜品数量";
      }
    },
    handleNewForcastConfirm(loading) {
      const errMsg = this.validateForecastErr();
      if (errMsg) {
        this.$message.error(errMsg);
        return;
      }
      const done = loading();

      this.$request("supply.ChildrenOrder/addChildrenOrder", {
        ...this.forecast,
        shipTime: this.forecast.shipTime,
        skuList: this.forecastTable.data
          .filter((item) => Boolean(item.num))
          .map((item) => ({
            skuId: item.skuId,
            num: item.num,
            type: item.type,
          })),
        date: this.$day(this.forecast.date).format("YYYYMMDD"),
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success("添加成功");
          this.getList();
          this.newForecastDialog = false;
        } else {
          this.$message.error(err.errMsg);
        }
        done();
      });
    },
    showtips(row) {
      if (row.modify === "false") {
        return;
      }
      this.$request("supply.ChildrenOrder/queryChildrenOrderChangeList", {
        orderId: row.orderId,
      }).thenwrap((err, data) => {
        if (!err) {
          this.showdata = data;
        }
      });
    },
    handleEditForecastConfirm(loading) {
      // if (!this.forecastInfo.num) {
      //   this.$message.error("请输入套餐预测量");
      //   return;
      // }
      const done = loading();
      // console.log(done, "done");
      this.$request("supply.ChildrenOrder/editChildrenOrder", {
        orderId: this.forecastInfo.orderId,
        skuList: this.editforecastTable.data
          .filter((item) => Boolean(item.num))
          .map((item) => ({
            skuId: item.skuId,
            num: item.num,
            type: item.type,
          })),
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
    forecastClick() {
      this.forecast = createForecast();
       this.forecastTable.data=''
      this.newForecastDialog = true;
    },
    handleForecastCorpChange(value) {
      // this.queryCorpOnlineComboList();
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
        this.forecast.addressId = item.addressId;
        this.forecast.address = item.detailAddress;
        this.forecast.thpName = item.thpName;
        this.forecast.empName = item.empName;
      }
    },
    queryCorpOnlineComboList() {
      this.$request("supply.ChildrenOrder/querySkuList", {
        tgcaId: this.forecast.addressId,
        salesDate: this.$day(this.forecast.date).format("YYYYMMDD"),
        category: this.forecast.category,
      }).thenwrap((err, data) => {
        if (!err) {
          this.forecastTable.data = data.map((item) => {
            item.num = "";
            return item;
          });
        }
      });
    },
    getList() {
      this.$store.state.vloading = true;
      this.queryChildrenOrderPage(this.page).thenwrap((err, res) => {
        if (!err) {
          this.tableData = res.record;
          this.tableDataTotal = res.totalRecordCount;
        }

        this.$store.state.vloading = false;
      });
    },
    queryChildrenOrderPage(page: { pageNo: number; pageSize: number }) {
      return this.$request("supply.ChildrenOrder/queryChildrenOrderPage", {
        ...page,
        ...this.queryParams,
      });
    },
    async handleExport() {
      this.$store.state.bloading = true;
      this.queryChildrenOrderPage({
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
</style>


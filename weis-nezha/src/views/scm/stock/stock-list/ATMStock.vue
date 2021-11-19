<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <!-- <ButtonTabs
        v-model="activeTab"
        :tabs="tabs"
      /> -->
    </div>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :label-width="120"
        semi
      >
        <template #action>
          <el-button
            type="primary"
            @click="getList"
          >搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>

    </div>
    <div>
      <BasePageTable
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="searchClick"
        @size-change="searchClick"
        :columns="columns"
      >
      </BasePageTable>
    </div>
  </div>

</template>

<script lang="ts">
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { method } from "node_modules/_@types_lodash@4.14.170@@types/lodash";
import ButtonTabs from "@/components/ButtonTabs.vue";
export default {
  name: "scm_ATMStock",
  components: {
    QueryComponents,
    BasePageTable,
    ButtonTabs,
  },
  data() {
    return {
      activeTab: "00",
      tabs: [
        {
          label: "菜品维度",
          value: "00",
        },
        {
          label: "货道维度",
          value: "01",
        },
      ],
      queryParams: {
        shopType: "20",
        date: this.$day().format("YYYY-MM-DD"),
        heatPointId: undefined,
        skuname: "",
      },
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "日期",
          placeholder: "选择日期",
          props: {
            type: "date",
            clearable: false,
            "value-format": "yyyy-MM-dd",
          },
        },
        {
          component: "BaseSelect",
          key: "heatPointId",
          label: "供餐点名称",
          props: {
            options: [],
          },
        },
        {
          component: "el-input",
          key: "skuname",
          label: "商品名称",
          placeholder: "请输入商品",
          props: {
            clearable: true,
          },
          maxlength: 30,
        },
      ],
    };
  },
  computed: {
    columns() {
      return this.activeTab == "00"
        ? [
            {
              type: "index",
              label: "序号",
            },
            {
              label: "供餐点名称",
              prop: "heatPointName",
            },
            {
              label: "商品名称",
              prop: "tfsSkuname",
            },
            {
              label: "商品编码",
              prop: "tfsCid",
            },
            {
              label: "单价（元）",
              prop: "tfsPrice",
            },
            {
              label: "库存数据",
              prop: "totalStock",
            },
            {
              label: "预订单量",
              prop: "insideSaled",
            },
            {
              label: "可现点量",
              prop: "totalForSale",
            },
            {
              label: "机器已出餐量",
              prop: "machineSoldOut",
            },
            {
              label: "机器剩余量",
              prop: "machineSurplus",
            },
          ]
        : [
            {
              type: "index",
              label: "序号",
            },
            {
              label: "供餐点名称",
              prop: "heatPointName",
            },
            {
              label: "机器名称",
              prop: "tfsSkuname",
            },
            {
              label: "机器编码",
              prop: "tfsCid",
            },
            {
              label: "货道",
              prop: "tfsPrice",
            },
            {
              label: "商品名称",
              prop: "totalStock",
            },
            {
              label: "菜品编码",
              prop: "insideSaled",
            },
            {
              label: "最大容量",
              prop: "totalForSale",
            },
            {
              label: "备货库存量",
              prop: "machineSoldOut",
            },
            {
              label: "盘点量",
              prop: "machineSurplus",
            },
             {
              label: "已消耗量",
              prop: "machineSurplus",
            },
             {
              label: "可现点量",
              prop: "machineSurplus",
            },
             {
              label: "机器已出餐量",
              prop: "machineSurplus",
            },
             {
              label: "机器剩余量",
              prop: "machineSurplus",
            },

          ];
    },
  },
  created() {
    this.getList();
    this.queryHeatingPointList();
  },
  methods: {
    async queryHeatingPointList() {
      let params = {
        shopType: "20",
      };
      const res = await this.$request(
        "HeatingPoint/queryHeatingPointList",
        params
      );
      if (!res.data.errMsg) {
        this.queryComps[1].props.options = [
          {
            label: "全部",
            value: "",
          },
        ].concat(res.data.obj);
      }
    },
    getList() {
      // this.$store.state.vloading = true;
      this.$request("OrderStock/queryAllStock", this.queryParams).then(
        this.$rw((err, { stockVos }) => {
          if (!err) {
            this.tableData = stockVos;
            // this.$store.state.vloading = false;
            // this.$nt(() => {
            //   this.$refs.table.doLayout();
            // });
          }
        })
      );
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.queryParams,
        ...this.page,
        pageSize: 99999,
      };
      const res = await this.$http("OrderStock/queryAllStock", params);
      exportExcel({
        columns: this.columns,
        filename,
        data: res.obj.stockVos,
      });
    },
  },
};
</script>

<style>
</style>
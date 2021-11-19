<template>
  <div class="page-container">
    <div style="margin-top:20px">
      <ButtonTabs
        v-model="activeTab"
        :tabs="dishStatusTabs"
        @change="changes"
      />

    </div>

    <div class="query-bar">

      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="6"
        :label-width="60"
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
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
      <div class="flex-items-center">
        <el-button
          type="primary"
          @click="batchDeleteClick"
        >批量删除</el-button>
        <!-- <ImportExcel @file="handleBatchImport">
          <el-button
            style="margin: 0 8px;"
            type="primary"
          >批量导入</el-button>
        </ImportExcel> -->
        <el-button
          style="margin-right: 8px;"
          type="success"
          @click="toEdit"
        >批量修改</el-button>
        <el-button
          style="margin-right: 8px;"
          type="success"
          @click="toCreate('edit', '')"
        >新建套餐</el-button>
        <!-- <span
          class="table-action-label"
          @click="downloadTemplateClick"
        >下载导入模板</span> -->
      </div>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:selection="tableSelection"
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
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
          align="center"
          class-name="setStyle"
        ></el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template
            #default="{ row }"
            class="action-cell"
          >
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="goPage('edit', row)"
            >编辑</span>
            <span
              v-if="row.stt == '01'"
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="toOperate('close', row)"
            >下线</span>
            <span
              v-if="row.stt == '00'"
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="toOperate('open', row)"
            >上线</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="toOperate('del', row)"
            >删除</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="goPage('detail', row)"
            >详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="editModal"
      title="批量修改"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="false"
      @on-confirm="onconfirm"
    >
      <div>
        <div class="section-item">
          <span class="section-label label-1">已选套餐</span>
          <span> {{comboName}} </span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">修改选项</span>
          <el-radio-group
            v-model="editdata.opType"
            @change="selChange"
          >
            <el-radio :label="10">修改菜品</el-radio>
            <el-radio :label="20">修改供应时间 </el-radio>
          </el-radio-group>
        </div>

        <div
          class="section-item"
          v-if="editdata.opType =='10'"
        >
          <span class="section-label label-1">选择菜品</span>
          <el-select
            v-model="editdata.skuChangeBefore"
            clearable
            filterable
          >
            <el-option
              v-for="item in comboSkuInfo"
              :key="item.skuCid"
              :label="item.skuName"
              :value="item.skuCid"
            ></el-option>
          </el-select>
        </div>

        <div
          class="section-item"
          v-if="editdata.opType =='10'"
        >
          <span class="section-label label-1">菜品修改为</span>
          <el-select
            v-model="lastcid"
            clearable
            filterable
            @change="selsku"
          >
            <el-option
              v-for="item in editSkuInfo"
              :key="item.tfsCid"
              :label="item.tfsSkuname"
              :value="item.tfsCid +'/'+item.tfsSalestime+'/'+item.tfsSalestime"
            ></el-option>
          </el-select>
        </div>
        <div
          class="section-item"
          v-if="editdata.opType =='10'"
        >
          <span class="section-label label-1">菜品供应时间</span>

          <el-date-picker
            clearable
            type="date"
            style="width: 180px;"
            v-model="editdata.sellBeginDate"
          ></el-date-picker> --
          <el-date-picker
            clearable
            type="date"
            style="width: 180px;"
            v-model="editdata.sellEndDate"
          ></el-date-picker>
        </div>

        <div
          class="section-item"
          v-if="editdata.opType =='20'"
        >
          <span class="section-label label-1">修改供应时间</span>

          <el-date-picker
            clearable
            type="date"
            style="width: 180px;"
            v-model="editdata.sellBeginDate"
          ></el-date-picker> --
          <el-date-picker
            clearable
            type="date"
            style="width: 180px;"
            v-model="editdata.sellEndDate"
          ></el-date-picker>
        </div>

        <div
          class="section-item"
          v-if="editdata.opType =='20'"
        >
          <span class="section-label label-1">菜品供应时间</span>
        </div>
        <BasePageTable
          height="600"
          :data="tablesku"
          :visible="false"
          border
          v-if="editdata.opType =='20'"
        >
          <el-table-column
            label="序号"
            type="index"
            width="50"
            align="center"
          ></el-table-column>
          <el-table-column
            label="菜品名称"
            prop="skuName"
            align="center"
          ></el-table-column>
          <el-table-column
            label="供应时间"
            align="center"
            width="420px"
          >
            <template
              #default="{ row }"
              class="action-cell"
            >
              <el-date-picker
                clearable
                type="date"
                style="width: 180px;"
                v-model="row.sellBeginDate"
              ></el-date-picker> --
              <el-date-picker
                clearable
                type="date"
                style="width: 180px;"
                v-model="row.sellEndDate"
              ></el-date-picker>
            </template>
          </el-table-column>

        </BasePageTable>

      </div>

    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { transformDaterange } from "@/utils/transform";
import exportExcel from "@/utils/export-excel";
import { getSetMealTypeOptions } from "@/utils/data-getter";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ImportExcel from "@/components/ImportExcel.vue";
// import FormItem from '@/components/FormItem.vue'
import ButtonTabs from "@/components/ButtonTabs.vue";
import axios from "axios";
export default {
  name: "goods_fast-foods_groupList",
  components: {
    QueryComponents,
    ConfirmDialog,
    ImportExcel,
    // FormItem,
    BasePageTable,
    ButtonTabs,
  },
  data() {
    return {
      skudate: "",
      tablesku: [],
      lastcid: "",
      editSkuInfo: {},
      editModal: false,
      activeTab: "01",
      dishStatusTabs: [
        {
          label: "已提交",
          value: "01",
        },
        {
          label: "草稿箱",
          value: "00",
        },
      ],
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        comboName: "",
        skuName: "",
        sellDate: "",
        stt: "",
      },
      comboName: "",
      comboSkuInfo: {},
      editdata: {
        opType: 10,
        sellBeginDate: "",
        sellEndDate: "",
        skuChangeBefore: "",
        comboSkuInfo: {
          skuCid: "",
          skuNum: "",
          sellBeginDate: "",
          sellBeginDate: "",
        },
      },

      tableSelection: [],
      // tableCol: [
      //   { type: "selection", width: "60" },
      //   { label: "序号", type: "index", width: "80" },
      //   { label: "套餐ID", prop: "comboId" },
      //   { label: "套餐名称", prop: "comboName" },
      //    { label: "套餐分类", prop: "classifyDesc" },
      //     { label: "套餐类型", prop: "category" },
      //   { label: "套餐内容", prop: "comboContent" },
      //   { label: "营养素", prop: "nutrient" },
      //   { label: "商品合计价格", prop: "totalAmount" },
      //   { label: "套餐价格", prop: "amount" },
      //   { label: "当前状态", prop: "sttDesc" },
      // ],
    };
  },
  computed: {
    queryComps() {
      return this.activeTab == "01"
        ? [
            {
              component: "el-input",
              key: "comboName",
              label: "套餐名称",

              props: {
                clearable: true,
              },
            },
            {
              component: "el-input",
              key: "skuName",
              label: "菜品名称",

              props: {
                clearable: true,
              },
            },
            {
              component: "el-date-picker",
              key: "sellDate",
              label: "售卖日期",
              props: {
                type: "date",
              },
            },
            {
              component: "BaseSelect",
              key: "classify",
              label: "套餐分类",

              props: {
                clearable: true,
                options: [
                  {
                    label: "基础套餐",
                    value: "01",
                  },
                  {
                    label: "定制套餐",
                    value: "02",
                  },
                ],
              },
            },
            {
              component: "BaseSelect",
              key: "stt",
              label: "当前状态",
              placeholder: "请选择状态",
              props: {
                clearable: true,
                options: [
                  { label: "全部", value: "" },
                  { label: "上线", value: "01" },
                  { label: "下线", value: "00" },
                ],
              },
            },
          ]
        : [
            {
              component: "el-input",
              key: "comboName",
              label: "套餐名称",

              props: {
                clearable: true,
              },
            },
            {
              component: "el-input",
              key: "skuName",
              label: "菜品名称",

              props: {
                clearable: true,
              },
            },
            {
              component: "el-date-picker",
              key: "sellDate",
              label: "售卖时间",
              props: {
                type: "date",
              },
            },
            {
              component: "BaseSelect",
              key: "classify",
              label: "套餐分类",

              props: {
                clearable: true,
                options: [
                  {
                    label: "基础套餐",
                    value: "01",
                  },
                  {
                    label: "定制套餐",
                    value: "02",
                  },
                ],
              },
            },
          ];
    },

    tableCol() {
      return this.activeTab == "01"
        ? [
            { type: "selection", width: "60" },
            { label: "序号", type: "index", width: "80" },
            { label: "套餐ID", prop: "comboId" },
            { label: "套餐名称", prop: "comboName" },
            { label: "套餐分类", prop: "classifyDesc" },
            { label: "套餐类型", prop: "category" },
            { label: "套餐内容", prop: "comboContent" },
            { label: "营养素", prop: "nutrient" },
            { label: "商品合计价格", prop: "totalAmount" },
            { label: "套餐价格", prop: "amount" },
            { label: "售卖日期", prop: "sellDate" },
            { label: "当前状态", prop: "sttDesc" },
          ]
        : [
            { type: "selection", width: "60" },
            { label: "序号", type: "index", width: "80" },
            { label: "套餐ID", prop: "comboId" },
            { label: "套餐名称", prop: "comboName" },
            { label: "套餐分类", prop: "classifyDesc" },
            { label: "套餐类型", prop: "category" },
            { label: "套餐内容", prop: "comboContent" },
            { label: "营养素", prop: "nutrient" },
            { label: "商品合计价格", prop: "totalAmount" },
            { label: "售卖日期", prop: "sellDate" },
            { label: "套餐价格", prop: "amount" },
          ];
    },
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    },
  },
  watch: {
    $route(to, from) {
      this.getList();
    },
  },
  created() {
    this.getList();
  },
  methods: {
    async querysku() {
      const res = await this.$http("dietician.Combo/queryLibrarySku", {});
      this.editSkuInfo = res.obj;
    },
    selChange() {
      this.$request("dietician.Combo/queryComboInfoByBatch", {
        opType: this.editdata.opType,
        comboIds: this.tableSelection.map(({ comboId }) => comboId),
      }).thenwrap((err, res) => {
        this.comboName = res.comboName;
        this.comboSkuInfo = res.comboSkuInfo;
        this.tablesku = res.comboSkuInfo;
        this.editdata.sellBeginDate = res.sellBeginDate;
        this.editdata.sellEndDate = res.sellEndDate;
      });
    },
    toEdit() {
      const { tableSelection } = this;
      if (tableSelection.length <= 0) {
        this.$message.error("请选择至少一条套餐数据");
        return;
      }

      this.querysku();
      this.selChange();
      this.editdata.opType = 10;
      this.editdata.skuChangeBefore = "";
      this.lastcid = "";
      this.editdata.sellBeginDate = "";
      this.editdata.sellEndDate = "";
      this.editModal = true;
    },

    async batchDeleteClick() {
      const { tableSelection } = this;
      if (tableSelection.length <= 0) {
        this.$message.error("请选择至少一条套餐数据");
        return;
      }

      await this.$messageBox.confirm(
        `是否删除这${tableSelection.length}条套餐数据？`,
        "提示"
      );

      this.$request("groupmeal.Combo/batchDeleteCombo", {
        tgcIds: tableSelection.map(({ comboId }) => comboId),
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success("删除成功");
          this.getList();
        } else {
          this.$message.error(err.errMsg);
        }
      });
    },
    onconfirm() {
      this.editdata.sellBeginDate = this.$day(
        this.editdata.sellBeginDate
      ).format("YYYYMMDD");
      this.editdata.sellEndDate = this.$day(this.editdata.sellEndDate).format(
        "YYYYMMDD"
      );
      this.editdata.comboSkuInfo.skuCid = this.skudate.split("/")[0];
      this.editdata.comboIds = this.tableSelection.map(
        ({ comboId }) => comboId
      );

      if (this.editdata.opType == "10") {
        this.editdata.comboSkuInfo.sellBeginDate = this.editdata.sellBeginDate;
        this.editdata.comboSkuInfo.sellEndDate = this.editdata.sellEndDate;
      } else {
        this.comboSkuInfo.map((item, index) => {
          item.sellBeginDate = this.$day(item.sellBeginDate).format("YYYYMMDD");
          item.sellEndDate = this.$day(item.sellEndDate).format("YYYYMMDD");
        });
        this.editdata.comboSkuInfo = this.comboSkuInfo;
      }

      this.$request(
        "dietician.Combo/editComboSkuBatch",
        this.editdata
      ).thenwrap((err) => {
        if (!err) {
          this.editModal = false;
          this.$message.success("修改成功");
          this.getList();
        } else {
          let aaa = this.editSkuInfo;
          this.$message.error(err.errMsg);
        }
      });
    },
    selsku(e) {
      this.skudate = e;
    },

    batchImportClick() {
      this.batchDialog = true;
    },
    changes() {
      this.getList();
    },

    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    toCreate() {
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {},
      });
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          tgcId: row.comboId,
          type: this.activeTab,
        },
      });
    },
    async toOperate(type, row) {
      let url = {
        close: "groupmeal.Combo/updateComboState",
        open: "groupmeal.Combo/updateComboState",
        del: "groupmeal.Combo/deleteCombo",
      }[type];
      const params = { tgcId: row.comboId };
      if (type == "close" || type == "open") {
        params.opType = row.stt == "00" ? "01" : "00";
      }
      const res = await this.$http(url, params);
      if (!res.errMsg) {
        this.$msg("操作成功", "success");
        this.getList();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.queryParams,
      };
      params.operationType = this.activeTab;
      this.$store.state.vloading = true;
      const res = await this.$http("dietician.Combo/queryComboList", params);
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
        this.$nt(() => {
          this.$refs.table.doLayout();
        });
      }
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
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.page,
        ...this.queryParams,
      };
      params.operationType = this.activeTab;
      this.$store.state.vloading = true;
      const res = await this.$http("dietician.Combo/queryComboList", params);

      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record,
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
.small-input {
  margin: 0 8px;
  width: 300px;
}
.tiny-input {
  margin: 0 8px;
  width: 100px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}

.section-item {
  min-width: 200px;
  margin-right: 20px;
}
.detail-footer {
  text-align: center;
}

.vertical-top {
  vertical-align: top;
}

.section-label {
  display: inline-block;
  min-width: 50px;
  text-align: left;
}

.detail-section {
  margin: 22px 0 22px 0;
}

.flex-grow-1 {
  flex-basis: 25%;
}

.card-image-box {
  margin: 0 0 8px 12px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 3px;
  display: inline-block;

  .certificate-img {
    max-width: 320px;
    max-height: 160px;
  }
}

.qrcode-image {
  max-width: 200px;
  max-height: 200px;
}

.phone-image {
  margin: 0 8px;
  max-width: 200px;
  max-height: 200px;
}
.count-label {
  margin-left: 20px;
}
.display-flex {
  padding: 0;
}
.setStyle {
  white-space: pre-wrap !important;
}
</style>

<template>
  <div class>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
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
      <el-button
        type="danger"
        @click="showDialog"
      >选择套餐</el-button>
    </div>
    <div class="query-bar flex-items-center">
      <span class="font-size-14">定义套餐类型：</span>
      <el-button
        type="primary"
        size="small"
        @click="defineSetMealTypeClick"
      >添加类型</el-button>
      <span class="font-size-14">{{ setMealTypes.selected }}</span>
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
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
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
              v-if="row.tgccStt == '01'"
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="toOperate('close', row)"
            >下线</span>
            <span
              v-if="row.tgccStt == '00'"
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
              @click="goPage('mealDetail', row)"
            >详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="hasDialog"
      title="选择套餐"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <h2>选择套餐类型</h2>
      <div>
        <el-checkbox-group v-model="setMealTypes.model">
          <el-checkbox
            v-for="item in setMealTypeOptions"
            :key="item.tgccId"
            :label="item.tgccId"
            class="set-meal-type-item"
            @change="setMealTypeChange"
          >
            <span class="set-meal-type-item__text">{{ item.tgccName }}</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <h2>套餐列表</h2>
      <BasePageTable
        height="600"
        :visible="false"
        :data="dialogTable"
        highlight-current-row
        border
      >
        <el-table-column
          :width="60"
          align="center"
        >
          <template #header>
            <el-checkbox
              :model-value="selectedSetMeal.length === dialogTable.length"
              @change="selectAllSetMealChange"
            ></el-checkbox>
          </template>
          <template
            #default="{ row }"
            class="action-cell"
          >
            <el-checkbox v-model="row.operate"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column
          v-for="col in dialogTableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
      </BasePageTable>
      <p style="font-size: 16px">已选择套餐数：{{ selectedSetMeal.length }}</p>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="setMealTypeDialog"
      title="套餐类型"
      center
      async-confirm
      @on-confirm="handleSetMealTypeConfirm"
    >
      <BasePageTable
        ref="table"
        v-model:selection="setMealSelection"
        max-height="500px"
        :data="setMealTypeOptions"
        :visible="false"
      >
        <el-table-column type="selection"></el-table-column>
        <el-table-column
          label="类型名称"
          prop="tgccName"
        ></el-table-column>
        <el-table-column
          label="餐标"
          :width="140"
        >
          <template #default="{ row }">
            <NumberInput
              v-model="row.standard"
              @change="editT(row)"
            />
          </template>
        </el-table-column>
      </BasePageTable>
      <!-- <el-checkbox-group v-model="setMealTypes.model">
        <el-checkbox
          v-for="item in setMealTypeOptions"
          :key="item.tgccId"
          :label="item.tgccId"
          class="set-meal-type-item"
        >
          <span class="set-meal-type-item__text">{{ item.tgccName }}</span>
        </el-checkbox>
      </el-checkbox-group>-->
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { transformDaterange } from "@/utils/transform";
import exportExcel from "@/utils/export-excel";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { getSetMealTypeOptions } from "@/utils/data-getter";
import { ElMessage } from "element-plus";

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
  },
  data() {
    return {
      tgcId: "",
      setMealTypeDialog: false,
      setMealSelection: [],
      setMealTypes: {
        model: [],
        selected: "",
      },
      tableData: [],
      tableDataTotal: 0,
      hasDialog: false,
      dialogTable: [],
      page: {
        pageNo: 1,
        pageSize: 100,
      },
      queryParams: {
        name: "",
        tgccId: "",
        stt: "",
      },
      numlist: [],
      queryComps: [
        {
          component: "el-input",
          key: "name",
          label: "套餐名称",
          placeholder: "请输入套餐名称",
          props: {
            clearable: true,
          },
        },
        {
          component: "BaseSelect",
          key: "tgccId",
          label: "套餐类型",
          placeholder: "请选择套餐类型",
          props: {
            clearable: true,
            props: {
              value: "tgccId",
              label: "tgccName",
            },
            options: [],
          },
        },
        {
          component: "BaseSelect",
          key: "stt",
          label: "套餐状态",
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
      ],
      setMealTypeOptions: [],
      tableCol: [
        { label: "序号", type: "index", width: "80" },
        { label: "套餐ID", prop: "tgccPageComboId" },
        { label: "套餐名称", prop: "tgccName" },
        { label: "套餐类型", prop: "tgccCategory" },
        { label: "餐标", prop: "tgccStandard" },
        { label: "套餐内容", prop: "tgccContent" },
        { label: "商品合计价格", prop: "tgccTotalAmount" },
        { label: "套餐价格", prop: "tgccAmount" },
        { label: "当前状态", prop: "tgccSttDesc" },
      ],
      dialogTableCol: [
        { label: "序号", type: "index", width: "80" },
        { label: "套餐", prop: "tgccPageComboId" },
        { label: "套餐编码", prop: "tgccCode" },
        { label: "套餐名称", prop: "tgccName" },
        { label: "套餐价格", prop: "tgccAmount" },
        { label: "套餐商品合计", prop: "tgccTotalAmount" },
      ],
    };
  },
  computed: {
    selectedSetMeal() {
      return this.dialogTable.filter((i) => i.operate);
    },
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    },
  },
  created() {
    this.tgcId = this.$route.query.id;
    const height = window.innerHeight;
    this.tableHeight = `${height - 340}px`;
    this.getList();
    this.getInfo();
    getSetMealTypeOptions().then((data) => {
      this.setMealTypeOptions = data.map((item) => {
        item.standard = "";
        return item;
      });
      const item = this.queryComps.find((item) => item.label === "套餐类型");
      if (item) {
        item.props.options = data;
      }
    });
  },
  methods: {
    selectAllSetMealChange(value) {
      for (const item of this.dialogTable) {
        item.operate = value;
      }
    },
    async setMealTypeChange() {
      const res = await this.queryOnlineComboList();
      const unchecked = this.dialogTable
        .filter((item) => !item.operate)
        .map((item) => item.tgccComboId);

      this.dialogTable = res.map((item) => {
        item.operate = unchecked.indexOf(item.tgccComboId) === -1;
        return item;
      });
    },
    createSetMealClick() {
      this.$store.state.keepRoutes.push(this.$route.name);
      this.$pushRoute("/goods/fast-foods/meal-list/edit", {
        query: {
          corpId: this.tgcId,
        },
      });
    },
    editT(row) {
      this.numlist.push(row.tgccId);
    },
    handleSetMealTypeConfirm(done) {
      const index = this.setMealSelection.findIndex((item) => !item.standard);
      
      if (index !== -1) {
        ElMessage.error("有一项选中的套餐类型未填写餐标");
        done();
        return;
      }
      let isnumber = true
      if (this.numlist.length > 0) {
        // debugger
        this.numlist.forEach((item) => {       
          const found = this.setMealSelection.find(
            (category) => category.tgccId === item
          );
          if (!found) {
            ElMessage.error("有一项填写餐标的套餐未勾选");
            isnumber = false
            done();
            return;
          } else {
             isnumber = true

          }
        });
      }
      if (!isnumber) {
        return
      }

      this.saveCorpComboCategory()
        .thenwrap((err) => {
          if (!err) {
            this.getInfo();
            this.getList();
            this.$message.success("设置成功");
            this.setMealTypeDialog = false;
          } else {
            this.$message.error(err.errMsg);
          }
        })
        .finally(done);
    },
    saveCorpComboCategory() {
      return this.$request("groupmeal.Corp/saveCorpComboCategory", {
        tgcId: this.tgcId,
        tgccId: this.setMealSelection.map((item) => ({
          standard: Number(item.standard),
          id: item.tgccId,
        })),
      });
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
    defineSetMealTypeClick() {
      this.setMealTypeDialog = true;

      this.$nextTick(() => {
        const selection = [];
        this.setMealTypeOptions.forEach((item) => {
          const found = this.tgcComboCategoryInfo.find(
            (category) => category.id === item.tgccId
          );
          if (found) {
            selection.push(item);
          }
          item.standard = found ? found.standard : "";
          // return Boolean(found
        });
        this.setMealSelection = [...selection];
        this.$refs.table.setSelection(selection);
      });
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          tgccComboId: row.tgccComboId,
        },
      });
    },
    getInfo() {
      this.$request("groupmeal.Corp/queryCorpById", {
        tgcId: this.tgcId,
      }).thenwrap((err, { corpInfo }) => {
        if (!err) {
          this.setMealTypes.selected = corpInfo.tgcComboCategory;
          this.tgcComboCategoryId = corpInfo.tgcComboCategoryId || [];
          this.tgcComboCategoryInfo = corpInfo.tgcComboCategoryInfo || [];
        }
      });
    },
    async getList() {
      const params = {
        tgcId: this.tgcId,
        ...this.page,
        ...this.genQueryParams(),
      };
      this.$store.state.vloading = true;
      const res = await this.$http("groupmeal.Corp/queryComboList", params);
      this.tableData = res.obj.record;
      this.tableDataTotal = res.obj.totalRecordCount;
      this.$nt(() => {
        this.$refs.table.doLayout();
      });
    },
    queryOnlineComboList() {
      return this.$request("groupmeal.Corp/queryOnlineComboList", {
        tgccId: this.setMealTypes.model,
      }).thenwrap((err, data) => (!err ? data : []));
    },
    async showDialog() {
      this.setMealTypes.model = this.tgcComboCategoryId;
      const res = await this.queryOnlineComboList();
      // const res = (await this.$http('groupmeal.Corp/queryOnlineComboList', {})).obj
      this.dialogTable = res;
      this.$http("groupmeal.Corp/queryComboList", {
        tgcId: this.tgcId,
        pageNo: 1,
        pageSize: res.length,
      }).thenwrap((err, { record }) => {
        if (!err) {
          const ids = record.map((item) => item.tgccComboId);
          this.dialogTable.forEach((item) => {
            item.operate = item.tgccComboId
              ? ids.includes(item.tgccComboId)
              : false;
          });
        }
      });
      this.hasDialog = true;
    },
    chonce(index) {
      // const index = this.dialogTable.findIndex(item => item.tgccComboId == tgccComboId)
      this.dialogTable[index].operate = !this.dialogTable[index].operate;
    },
    async onconfirm() {
      const item = this.dialogTable
        .filter((item) => item.operate)
        .map((item) => item.tgccComboId);
      await this.saveCorpComboCategory();
      this.getInfo();
      const res = await this.$http("groupmeal.Corp/saveCombo", {
        tgcId: this.tgcId,
        comboIds: item,
      });
      if (!res.errMsg) {
        this.$msg("添加成功", "success");
        this.getList();
        this.hasDialog = false;
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    async toOperate(type, row) {
      let url = {
        close: "groupmeal.Corp/updateCorpComboState",
        open: "groupmeal.Corp/updateCorpComboState",
        del: "groupmeal.Corp/deleteCorpCombo",
      }[type];
      const params = { tgcId: this.tgcId, tgccId: row.tgccId };
      if (type == "close" || type == "open") {
        params.opType = row.tgccStt == "00" ? "01" : "00";
      }
      const res = await this.$http(url, params);
      if (!res.errMsg) {
        this.$msg("操作成功", "success");
        this.getList();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        tgcId: this.tgcId,
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http("groupmeal.Corp/queryComboList", params);
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
.font-size-14 {
  font-size: 14px;
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
.set-meal-type-item {
  display: inline-block;
  width: 160px;
  &__text {
    max-width: 160px;
    vertical-align: middle;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    width: max-content;
    text-overflow: ellipsis;
  }
}
.display-flex {
  padding: 0;
}
</style>

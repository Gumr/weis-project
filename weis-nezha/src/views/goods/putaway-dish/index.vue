<template>
  <div class="page-container">
    <div style="margin-top: 20px">
      <ButtonTabs
        v-model="activeTab"
        :tabs="dishStatusTabs"
        @change="changes"
      />

      <el-button
        class="float-right"
        type="primary"
        @click="addTagClick('down')"
      >批量下架</el-button>
      <el-button
        class="float-right"
        type="success"
        style="margin-right: 20px"
        @click="listUser"
      >灰度人群</el-button>
      <el-button
        v-if="activeTab == 60"
        class="float-right"
        type="primary"
        style="margin-right: 10px"
        @click="addTagClick('update')"
      >批量修改供应时间</el-button>
      <el-button
        v-if="activeTab == 60"
        class="float-right"
        type="primary"
        @click="handleWare()"
      >批量关联餐具</el-button>
    </div>
    <ButtonTabs
      v-if="activeTab === 60"
      v-model="queryParams.labelId"
      size="small"
      style="margin-top: 12px"
      :tabs="[
        {
          label: '全部菜品',
          value: null,
        },
        {
          label: '少儿菜品',
          value: '100042',
        },
      ]"
      @change="skuTypeChange"
    />
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
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
            v-if="activeTab != 50"
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
      <ImportExcel @file="handleImport">
        <el-button
          v-show="activeTab == 60 || activeTab == 70"
          type="primary"
        >批量导入更新菜品售卖时间</el-button>
      </ImportExcel>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:selection="tableSelection"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getOrderList"
        @size-change="getOrderList"
      >
        <el-table-column
          v-if="activeTab == 60"
          key="selection"
          label
          type="selection"
        ></el-table-column>
        <el-table-column
          label="序号"
          type="index"
        ></el-table-column>
        <el-table-column
          key="tfsCid"
          label="菜品编码"
          prop="tfsCid"
        ></el-table-column>
        <el-table-column
          v-if="activeTab != 50"
          key="tfsPrimaryUrl"
          label="菜品缩略图"
          prop="tfsPrimaryUrl"
          align="center"
        >
          <template #default="{ row }">
            <el-image
              :src="row.tfsPrimaryUrl"
              :preview-src-list="[row.tfsPrimaryUrl]"
              class="food-cover"
            />
          </template>
        </el-table-column>
        <el-table-column
          key="tfsSuggestedSkuname"
          label="菜品名称"
          prop="tfsSuggestedSkuname"
        ></el-table-column>
        <el-table-column
          key="tfsQuality"
          label="菜品规格"
        >
          <template #default="{ row }">{{ row.tfsQuality }}{{ row.tfsUnit }}</template>
        </el-table-column>
        <el-table-column
          key="tfsEnergy"
          label="菜品能量"
          prop="tfsEnergy"
        ></el-table-column>
        <el-table-column
          v-if="activeTab == 50"
          key="tfsCategory"
          label="建议餐别分类"
          prop="tfsCategory"
        ></el-table-column>
        <el-table-column
          v-if="activeTab != 50"
          key="tfsCategory"
          label="上架餐别"
          prop="tfsCategory"
        ></el-table-column>
        <el-table-column
          v-if="activeTab != 50"
          key="tfsNormalPrice"
          label="制定价格（元）"
          prop="tfsNormalPrice"
        ></el-table-column>
        <el-table-column
          v-if="activeTab != 50"
          key="tfsPrice"
          label="实际价格（元）"
          prop="tfsPrice"
        ></el-table-column>
        <el-table-column
          key="tfsVersion"
          label="当前版本"
          prop="tfsVersion"
        ></el-table-column>
        <el-table-column
          v-if="activeTab != 50"
          key="tfsSaleTime"
          label="供应时间"
          prop="tfsSaleTime"
        ></el-table-column>
        <el-table-column
          key="grayLevel"
          label="供餐类型"
          prop="grayLevel"
        ></el-table-column>
        <el-table-column
          v-if="activeTab != 50"
          key="tfsSkuTitle"
          label="封面标签"
          prop="tfsSkuTitle"
        ></el-table-column>
        <el-table-column
          v-if="activeTab != 50"
          key="haveMaster"
          label="是否名厨造"
          prop="haveMaster"
        ></el-table-column>

        <el-table-column
          key="utime"
          v-if="activeTab != 70"
          :label="
            activeTab == 50
              ? '提交时间'
              : '上架时间'"
          prop="utime"
        ></el-table-column>
        <el-table-column
          key="utime"
          v-if="activeTab == 70"
          label="下架时间"
          prop="unpublishTime"
        ></el-table-column>
        <el-table-column
          key="tfsOperator"
          v-if="activeTab != 70"
          :label="
            activeTab == 50 ? '提交人' :  '上架人'"
          prop="tfsOperator"
        ></el-table-column>
        <el-table-column
          key="tfsOperator"
          v-if="activeTab == 70"
          :label=" '下架人'"
          prop="unpublisher"
        ></el-table-column>
        <el-table-column
          key="tfsSttStr"
          label="状态"
          prop="tfsSttStr"
        ></el-table-column>
        <el-table-column
          v-if="activeTab == 60"
          key="关联未完成单数"
          label="关联未完成单数"
        >
          <template #default="{ row }">
            <span
              class="brand-color cursor-pointer"
              @click="goOrder(row)"
            >详情</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template #default="{ row }">
            <span
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="goDetai('edit', row)"
            >编辑</span>
            <span
              v-if="activeTab == 70"
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="handleOpreate('30', row)"
            >上架</span>
            <span
              v-if="activeTab == 60"
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="handleOpreate('10', row)"
            >下架</span>
            <span
              class="brand-color cursor-pointer"
              @click="goDetai('detail', row)"
            >详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="editDialogVisible"
      :title="editMode === 'update' ? '批量修改供应时间' : '批量下架'"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onConfirm"
    >
      <el-form :model="currentTag">
        <el-form-item
          :label="currentTag.label"
          label-width="350px"
        ></el-form-item>
        <el-form-item
          v-if="editMode == 'update'"
          label="输入时间"
          label-width="90px"
        >
          <el-date-picker
            v-model="currentTag.tfsSalestime"
            class="medium-input"
            value-format="yyyy-MM-dd"
            style="margin-right: 10px"
          ></el-date-picker>
          <el-date-picker
            v-model="currentTag.tfsSaleetime"
            class="medium-input"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="box"
      title="批量关联餐具"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onWareConfirm"
    >
      <div>
        <el-checkbox-group v-model="wareList">
          <el-checkbox
            v-for="(item, index) in wareArr"
            :key="index"
            :label="item.wareCid"
          >{{ item.wareSkuname }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from "@/components/BasePageTable.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ButtonTabs from "@/components/ButtonTabs.vue";
// import { mapToOptions } from '@/utils/data-map';
import exportExcel from "@/utils/export-excel";
import ImportExcel from "@/components/ImportExcel.vue";
import { transformDaterange } from "@/utils/transform";
import axios from "axios";

export default {
  name: "goods_putaway-list",
  components: {
    BasePageTable,
    ImportExcel,
    ButtonTabs,
    ConfirmDialog,
  },
  data() {
    return {
      userbox: false,
      height: window.innerHeight - 330,
      tableData: [],
      activeTab: "50",
      editDialogVisible: false,
      box: false,
      wareList: [],
      wareArr: [],
      editMode: "",
      currentTag: {
        label: "",
        tfsSalestime: "",
        tfsSaleetime: "",
      },
      dishStatusTabs: [
        {
          label: "未上架",
          value: 50,
        },
        {
          label: "已上架",
          value: 60,
        },
        {
          label: "已下架",
          value: 70,
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      tableDataTotal: 0,
      tableSelection: [],
      queryParams: {
        date: [],
        skuName: "",
        labelId: null,
        category: "",
        grayLevel: "",
        libraryStt: "30",
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "上架时间",
          props: {
            type: "daterange",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
          },
        },
        {
          label: "餐别分类",
          key: "category",
          component: "base-select",
          props: {
            placeholder: "请选择订餐类别",
            options: [
              {
                label: "全部",
                value: "-1",
              },
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
            ],
          },
        },
        {
          component: "el-input",
          key: "skuName",
          label: "菜品名称",
          placeholder: "请输入菜品名称",
          props: {
            clearable: true,
          },
        },
        {
          component: "BaseSelect",
          key: "grayLevel",
          label: "供餐类型",
          props: {
            clearable: true,
            options: [
              {
                label: "正式供餐",
                value: "0",
              },
              {
                label: "灰度供餐",
                value: "1",
              },
            ],
          },
        },
      ],
    };
  },
  watch: {
    $route(to, from) {
      this.getOrderList();
    },
  },
  created() {
    this.getOrderList();
  },
  methods: {
    handleImport(file) {
      const formData = new FormData();
      formData.append("file", file);
      // formData.append('tfsStt', '01')
      axios
        .post(
          "/import/excel/cn.nezha.impl.food.SkuImpl/skuSaleDateImport",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              token: sessionStorage.getItem("token"),
            },
          }
        )
        .thenwrap((err) => {
          if (!err) {
            this.getOrderList();
            this.$message.success("导入成功");
          } else {
            this.$message.error(err.errMsg);
          }
        });
    },
    skuTypeChange() {
      this.page.pageNo = 1;
      this.getOrderList();
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getOrderList();
    },
    changes() {
      this.page.pageNo = 1;
      this.getOrderList();
    },
    addTagClick(type) {
      if (!this.tableSelection.length) {
        this.$message({ type: "error", message: "请勾选菜品" });
        return;
      }
      this.editMode = type;
      if (type == "down") {
        const tfsCidList = [];
        this.tableSelection.forEach((item) => {
          tfsCidList.push(item.tfsCid);
        });
        // 下架菜品 先查询关联套餐
        this.$request("Sku/querySkuReCombo", { skuCid: tfsCidList }).then(
          this.$rw((err, dataPage) => {
            if (!err) {
              const groupList = dataPage.comboName;
              if (groupList && groupList.length > 0) {
                this.$confirm(
                  `下架该菜品会影响到以下套餐：【${groupList} 】， 请去更新套餐`,
                  "提示",
                  {
                    confirmButtonText: "更新套餐",
                    cancelButtonText: "取消",
                    type: "warning",
                    center: true,
                  }
                ).then(async () => {
                  //跳转【团膳套餐管理】页面
                  this.$router.push({
                    name: "goods_fast-foods_meal-list",
                    query: {
                      // skuName: row.tfsSkuname,
                    },
                  });
                });
              } else {
                this.currentTag.label = `共${this.tableSelection.length}个上架菜品，批量将这些菜品下架吗`;
                this.currentTag.tfsSalestime = "";
                this.currentTag.tfsSaleetime = "";
                this.editDialogVisible = true;
              }
            }
          })
        );
      } else {
        this.currentTag.label = `共${this.tableSelection.length}个上架菜品，批量将这些菜品供应时间修改为`;
        this.currentTag.tfsSalestime = "";
        this.currentTag.tfsSaleetime = "";
        this.editDialogVisible = true;
      }
    },
    async handleWare() {
      if (!this.tableSelection.length) {
        this.$message({ type: "error", message: "请勾选菜品" });
        return;
      }
      this.wareList = [];
      const res = await this.$http("Sku/queryWareList", {});
      this.wareArr = res.obj[0];
      this.box = true;
    },
    goOrder(row) {
      this.$router.push({
        path: `${this.$route.path}/unfinish`,
        query: {
          skuId: row.tfsCid,
        },
      });
    },
    listUser() {
      this.$router.push({
        path: `${this.$route.path}/addUser`,
      });
    },
    goDetai(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          tfsId: row.tfsId,
          tfsCid: row.tfsCid,
          tfsVersion: row.tfsVersion,
        },
      });
    },
    handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const col = [
        { label: "序号", type: "index" },
        { label: "菜品编码", prop: "tfsCid" },
        { label: "菜品名称", prop: "tfsSuggestedSkuname" },
        {
          label: "菜品规格",
          prop: "tfsQuality",
          formatter: (row) => `${row.tfsQuality}${row.tfsUnit}`,
        },
        { label: "菜品能量", prop: "tfsEnergy" },
        { label: "上架餐别", prop: "tfsCategory" },
        { label: "制定价格(元)", prop: "tfsNormalPrice" },
        { label: "实际价格(元)", prop: "tfsPrice" },
        { label: "当前版本", prop: "tfsVersion" },
        { label: "供应时间", prop: "tfsSaleTime" },
        { label: "供餐类型", prop: "grayLevel" },
        { label: "是否名厨造", prop: "haveMaster" },
        { label: "上架时间", prop: "utime" },
        { label: "上架人", prop: "tfsOperator" },
        { label: "状态", prop: "tfsSttStr" },
      ];
      if (this.activeTab == 60) {
        col[12].label = "上架时间";
        col[13].label = "上架人";
      } else if (this.activeTab == 70) {
        col[12].label = "下架时间";
        col[13].label = "下架人";
      }
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false;
          exportExcel({
            columns: col,
            filename,
            data: res.dataPage.record,
          });
        })
      );
    },
    reqAllUserData() {
      return this.$request("Sku/querySkuList", {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
      });
    },
    getOrderList() {
      this.$store.state.vloading = true;
      this.$request("Sku/querySkuList", {
        ...this.page,
        ...this.genQueryParams(),
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$store.state.vloading = false;
            this.tableDataTotal = dataPage.totalRecordCount;
            this.tableData = dataPage.record;
            setTimeout(() => {
              this.$refs.table.doLayout();
            }, 500);
          }
        })
      );
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      params.tfsStt = this.activeTab;
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = +startDate;
        params.endDate = +endDate;
      }
      if (!params.labelId) {
        params.labelId = "";
      }

      delete params.date;
      return params;
    },
    onConfirm() {
      if (this.editMode == "update") {
        if (
          !this.currentTag.tfsSaleetime ||
          !this.currentTag.tfsSalestime ||
          this.currentTag.tfsSalestime > this.currentTag.tfsSaleetime
        ) {
          this.$message({ type: "error", message: "请输入正确的时间" });
          return;
        }
      }
      const type = this.editMode == "update" ? "20" : "10";
      this.handleBatch(type);
    },
    async onWareConfirm(done) {
      const cidList = this.tableSelection.map((item) => item.tfsCid);
      const params = {
        wareList: this.wareList,
        cidList,
      };
      const res = await this.$http("Sku/foodWareBatchBinding", params);
      if (!res.errMsg) {
        this.$msg("关联成功", "success");
        this.$refs.table.$refs.table.clearSelection();
        this.box = false;
        setTimeout(done, 500);
      } else {
        this.$msg(res.errMsg, "error");
        done();
      }
    },
    handleBatch(type) {
      const params = {
        opType: type,
        tfsId: [],
        tfsSaleetime: this.currentTag.tfsSaleetime,
        tfsSalestime: this.currentTag.tfsSalestime,
      };
      this.tableSelection.forEach((item) => {
        params.tfsId.push(item.tfsId);
      });
      this.$request("Sku/updateSkuBatch", params).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$message({ type: "success", message: "操作成功" });
            this.getOrderList();
            this.editDialogVisible = false;
          } else {
            this.$message({ type: "error", message: err.errMsg });
          }
        })
      );
    },

    handleOpreate(type, row) {
      const params = {
        optype: type,
        tfsId: [row.tfsId],
      };
      if (type == "10") {
        // 下架菜品 先查询关联套餐
        this.$request("Sku/querySkuReCombo", { skuCid: [row.tfsCid] }).then(
          this.$rw((err, dataPage) => {
            if (!err) {
              const groupList = dataPage.comboName;
              if (groupList && groupList.length > 0) {
                this.$confirm(
                  `下架该菜品会影响到以下套餐：【${groupList} 】， 请去更新套餐`,
                  "提示",
                  {
                    confirmButtonText: "更新套餐",
                    cancelButtonText: "取消",
                    type: "warning",
                    center: true,
                  }
                ).then(async () => {
                  //跳转【团膳套餐管理】页面
                  this.$router.push({
                    name: "goods_fast-foods_meal-list",
                    query: {
                      skuName: row.tfsSkuname,
                    },
                  });
                });
              } else {
                this.updatatt(params);
              }
            } else {
              this.$message({ type: "error", message: err.errMsg });
            }
          })
        );
      } else {
        this.updatatt(params);
      }
    },
    updatatt(params) {
      this.$request("Sku/updateSkuBatch", params).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$message({ type: "success", message: "操作成功" });
            this.getOrderList();
          } else {
            this.$message({ type: "error", message: err.errMsg });
          }
        })
      );
    },
  },
};
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
</style>

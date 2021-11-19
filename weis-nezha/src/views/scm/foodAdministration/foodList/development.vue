<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        :label-width="80"
        semi
      >
        <template v-slot:action>
          <el-button
            type="primary"
            @click="searchClick()"
          >搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
      <el-button
        type="primary"
        @click="showAdd"
      >新建菜品</el-button>
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
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
          align="center"
        ></el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template
            class="action-cell"
            v-slot="{ row }"
          >
            <span
              class="brand-color cursor-pointer action-label"
              @click="toDetail(row)"
            >编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="launchAudit(row)"
            >发起审核</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="color:red"
              @click="toDel(row)"
            >删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="showSel"
      :title="title"
      :close-on-click-modal="false"
      :async-confirm="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <div>
        <el-form
          :model="ruleForm"
          :rules="rules"
          ref="ruleForm"
          label-width="120px"
          class="demo-ruleForm"
        >
          <el-form-item
            label="菜品名称"
            prop="skuName"
          >
            <el-input v-model="ruleForm.skuName"></el-input>
          </el-form-item>
          <el-form-item
            label="ERP菜品分类"
            prop="foodCategory"
          >
            <el-select
              v-model="ruleForm.foodCategory"
              :disabled="title === '编辑菜品'?true:false"
            >
              <el-option
                v-for="item in initialData.foodCategory"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="规格"
            required
          >
            <el-col :span="11">
              <el-form-item prop="quality">
                <el-input
                  v-model="ruleForm.quality"
                  style="width: 100%;"
                  @blur="checkText('quality')"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item prop="unit">
                <el-select v-model="ruleForm.unit">
                  <el-option
                    v-for="item in initialData.unit"
                    :key="item.value"
                    :label="item.label"
                    :value="item.label"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item
            label="主食材"
            required
          >
            <el-col :span="11">
              <el-form-item
                prop="mainIngredientType"
                required
              >
                <el-select
                  v-model="ruleForm.mainIngredientType"
                  @change="shareType"
                >
                  <el-option
                    v-for="item in initialData.mainIngredientType"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item prop="mainIngredient">
                <el-select v-model="ruleForm.mainIngredient">
                  <el-option
                    v-for="item in initialData.mainIngredient"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>

          </el-form-item>

          <el-form-item
            label="所属菜系"
            prop="skuStyle"
            required
          >
            <el-select v-model="ruleForm.skuStyle">
              <el-option
                v-for="item in initialData.skuStyle"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="菜品性质"
            prop="nature"
            required
          >
            <el-select v-model="ruleForm.nature">
              <el-option
                v-for="item in initialData.nature"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="烹饪方式"
            prop="cookingMethod"
            required
          >
            <el-select v-model="ruleForm.cookingMethod">
              <el-option
                v-for="item in initialData.cookingMethod"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="味型"
            prop="smell"
            required
          >
            <el-select v-model="ruleForm.smell">
              <el-option
                v-for="item in initialData.smell"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="混杂性"
            prop="mix"
            required
          >
            <el-select v-model="ruleForm.mix">
              <el-option
                v-for="item in initialData.mix"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="品相"
            prop="appearance"
            required
          >
            <el-select v-model="ruleForm.appearance">
              <el-option
                v-for="item in initialData.appearance"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item
            label="季节性"
            prop="season"
            required
          >
            <el-select v-model="ruleForm.season">
              <el-option
                v-for="item in initialData.season"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item
            label="厨房售价"
            prop="kitchenPrice"
          >
            <el-input
              v-model="ruleForm.kitchenPrice"
              @blur="checkText('kitchenPrice')"
            ></el-input>
          </el-form-item>
          <!-- <el-form-item
            label="食材"
            prop="foodMaterials"
          >
            <el-input
              v-model="ruleForm.foodMaterials"
              type="textarea"
              :rows="2"
            ></el-input>
          </el-form-item>

          <el-form-item
            label="附件"
            prop="accessoryImg"
          >
            <ImageUpload
              v-model:file-list="ruleForm.accessoryImg"
              :upload-data="{ flag: 'diet-tag' }"
              :limit="1"
            />
          </el-form-item> -->
        </el-form>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { transformDaterange } from "@/utils/transform";
import BaseSelect from "@/components/BaseSelect.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ImageUpload from "@/components/ImageUpload.vue";
export default {
  components: {
    QueryComponents,
    BasePageTable,
    BaseSelect,
    ConfirmDialog,
    ImageUpload,
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    },
  },
  watch: {
    $route() {
      if (this.$mounted) {
        this.getList();
      }
    },
  },
  mounted() {
    this.$mounted = true;
    this.initialDataList();
    this.getList();
  },

  created() {},
  data() {
    return {
      title: "新建菜品",
      recordId: "",
      initialData: {},
      ruleForm: {
        foodMaterials: "",
        skuName: "",
        foodCategory: "",
        quality: "",
        unit: "",
        mainIngredientType: "",
        mainIngredient: "",
        skuStyle: "",
        nature: "",
        cookingMethod: "",
        smell: "",
        mix: "",
        appearance: "",
        season: "",
        kitchenPrice: "",
        accessoryImg: [],
      },
      rules: {
        skuName: [
          { required: true, message: "请输入名称", trigger: "blur" },
          // { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
        foodCategory: [
          { required: true, message: "请选择食物类别", trigger: "change" },
        ],
        quality: [
          {
            required: true,
            message: "请输入规格",
            trigger: "blur",
          },
        ],
        unit: [
          {
            required: true,
            message: "请选择单位",
            trigger: "change",
          },
        ],

        mainIngredientType: [
          {
            required: true,
            message: "请选择主食材类别",
            trigger: "change",
          },
        ],
        mainIngredient: [
          {
            required: true,
            message: "请选择主食材",
            trigger: "change",
          },
        ],
        skuStyle: [
          { required: true, message: "请选择菜系", trigger: "change" },
        ],
        nature: [{ required: true, message: "请选择性质", trigger: "change" }],
        cookingMethod: [
          { required: true, message: "请选择烹饪方式", trigger: "change" },
        ],
        smell: [{ required: true, message: "请选择味型", trigger: "change" }],
        mix: [{ required: true, message: "请选择混杂性", trigger: "change" }],
        appearance: [
          { required: true, message: "请选择品相", trigger: "change" },
        ],
        season: [
          { required: true, message: "请选择季节性", trigger: "change" },
        ],
      },
      tableSelection: [],
      showSel: false,
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "菜品名称",
          prop: "skuName",
        },
        {
          label: "菜品ID",
          prop: "skuCid",
        },
        {
          label: "ERP菜品分类",
          prop: "foodCategory",
        },
        {
          label: "主食材",
          prop: "mainIngredient",
        },
        {
          label: "规格",
          prop: "quality",
        },
        {
          label: "性质",
          prop: "nature",
        },
        {
          label: "菜系",
          prop: "skuStyle",
        },
        {
          label: "烹饪方式",
          prop: "cookingMethod",
        },
        {
          label: "味型",
          prop: "smell",
        },
        {
          label: "厨房售价",
          prop: "kitchenPrice",
        },
        {
          label: "操作人",
          prop: "operator",
        },
        {
          label: "操作时间",
          prop: "utime",
        },
      ],
       tableCol2: [

          {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "菜品名称",
          prop: "skuName",
        },
        {
          label: "菜品ID",
          prop: "skuCid",
        },
        {
          label: "菜品类目",
          prop: "foodCategory",
        },
        {
          label: "主食材",
          prop: "mainIngredient",
        },
        {
          label: "规格",
          prop: "quality",
        },
        {
          label: "性质",
          prop: "nature",
        },
        {
          label: "菜系",
          prop: "skuStyle",
        },
        {
          label: "烹饪方式",
          prop: "cookingMethod",
        },
        {
          label: "味型",
          prop: "smell",
        },
        {
          label: "混杂性",
          prop: "mix",
        },
        {
          label: "品相",
          prop: "appearance",
        },
        {
          label: "季节性",
          prop: "season",
        },
        {
          label: "厨房售价",
          prop: "kitchenPrice",
        },
        {
          label: "操作人",
          prop: "operator",
        },
        {
          label: "操作时间",
          prop: "utime",
        },

        
        
      ],

      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        libraryStt: "00",
        date: [],
        foodCategory: "",
        skuName: "",
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "日期",
          props: {
            clearable: true,
            type: "daterange",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
          },
        },
        {
          component: "BaseSelect",
          key: "foodCategory",
          label: "种类",
          placeholder: "请选择种类",
          props: {
            clearable: true,
            options: [],
          },
        },
        {
          component: "el-input",
          key: "skuName",
          label: "菜品品名",
          placeholder: "请输入菜品名称",
          props: {
            clearable: true,
          },
        },
      ],
    };
  },
  methods: {
    async shareType() {
      const res = await this.$http("sku.SkuLibrary/initialData", {});
      const id = this.ruleForm.mainIngredientType;
      this.ruleForm.mainIngredient = "";
      this.initialData.mainIngredient = res.obj.mainIngredient.filter(
        (data) => !id || data.exValue.toLowerCase().includes(id.toLowerCase())
      );
    },
    initialDataList() {
      this.$request("sku.SkuLibrary/initialData", {}).thenwrap((err, data) => {
        if (!err) {
          this.queryComps[1].props.options = data.foodCategory;
          this.initialData = data;
        }
      });
    },
    showAdd() {    
      if (this.$refs["ruleForm"]) {
        this.$refs["ruleForm"].resetFields();
      }
      this.title = "新建菜品";
      this.showSel = true;
      
    },
    toDetail(row) {
      this.$request("sku.SkuLibrary/querySkuLibraryInfo", {
        recordId: row.recordId,
      }).thenwrap((err, data) => {
        if (!err) {
          this.ruleForm = data;
          this.ruleForm.accessoryImg = data.accessoryImg
            ? [{ url: data.accessoryImg }]
            : [];
          this.title = "编辑菜品";
          this.showSel = true;
          this.recordId = row.recordId;
        } else {
          this.$msg(err.errMsg, "error");
        }
      });
    },
    onconfirm() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          const params = this.$deepClone(this.ruleForm);
          if (params.accessoryImg && params.accessoryImg.length) {
            params.accessoryImg = params.accessoryImg[0].response
              ? params.accessoryImg[0].response.obj.imageUrl
              : params.accessoryImg[0].url;
          } else {
            params.accessoryImg = "";
          }

          params.recordId = this.title == "新建菜品"?'':this.recordId;
          delete params.foodCategoryStr;
          delete params.smellStr;

          this.$request("sku.SkuLibrary/opSkuLibrary", params).thenwrap(
            (err, data) => {
              if (!err) {
                this.$msg("成功", "success");
                this.showSel = false;
                this.getList();
              } else {
                this.$msg(err.errMsg, "error");
              }
            }
          );
        } else {
          this.$msg("请正确填写菜品相应内容", "error");
          return;
        }
      });
    },
    checkText(type) {
      let number = this.ruleForm[type];
      number = isNaN(number)
        ? 0
        : Number(number) < 0
        ? Math.abs(number)
        : Number(number);
      // if (type == "kitchenPrice") {
      number = number.toFixed(2);
      // }
      this.ruleForm[type] = number.toString();
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams(),
      };
      this.$store.state.vloading = true;
      const res = await this.$http("sku.SkuLibrary/querySkuLibrarys", params);
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async launchAudit(row) {
      const res = await this.$http("sku.SkuLibrary/launchAudit", {
        recordId: row.recordId,
      });
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
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal,
      };

      const res = await this.$http("sku.SkuLibrary/querySkuLibrarys", params);
      exportExcel({
        columns: this.tableCol2,
        filename,
        data: res.obj.record,
      });
    },

    toDel(row) {
      this.$confirm(`确定删除【${row.skuName}】?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(async () => {
        const res = await this.$http("sku.SkuLibrary/delSku", {
          recordId: row.recordId,
        });
        if (!res.errMsg) {
          this.$msg("删除成功", "success");
          this.getList();
        } else {
          this.$msg(res.errMsg, "error");
        }
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
  },
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.medium-input {
  width: 250px;
  margin-right: 20px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
</style>

<template>
  <div class="page-container">
    <section>
      <div class="section-item">
        <span class="section-label label-1">套餐包名称：</span>
        <el-input
          v-model="douPackName"
          clearable
          class="medium-input"
          :disabled="type?true:false"
        ></el-input>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">封面：</span>
        <UploadImage
          v-model="coverImg"
          :limit="Infinity"
          type="list"
          v-if="!type"
        />
       <div v-if="type">     
          <el-image
            style="width:200px"
            v-for="(img, idx) in coverImg"
            :key="idx"
            :src="img"
            :preview-src-list="[img]"
          ></el-image>
          </div>
        
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">详情图：</span>
        <UploadImage
          v-model="detailsImg"
          :limit="Infinity"
          type="list"
          v-if="!type"
        />
         <div v-if="type">   
         <el-image
            style="width:200px"
            v-for="(img, idx) in detailsImg"
            :key="idx"
            :src="img"
            :preview-src-list="[img]"
          ></el-image>
         </div>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">上架类目：</span>
        <el-radio-group
          v-model="classify"
          :disabled="type?true:false"
        >
          <el-radio
            v-for="(item, index) in classifyList"
            :key="index"
            :label="item.classifyId"
          >{{ item.classifyName }}</el-radio>
        </el-radio-group>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">售卖天数餐数：</span>
        <NumberInput
          v-model="daysNum"
          clearable
          class="medium-input"
          @input="sumtab"
          :disabled="type?true:false"
        ></NumberInput>天，每天
        <el-select
          v-model="mealsNum"
          clearable
          class="medium-input"
          @change="sumtab"
          :disabled="type?true:false"
        >
          <el-option
            label="1"
            value="1"
          ></el-option>
          <el-option
            label="2"
            value="2"
          ></el-option>
        </el-select>餐
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">套餐包内容：</span>
        <BasePageTable
          :data="rightTable"
          :visible="false"
          border
        >
          <el-table-column
            v-for="(col, index) in rightCol"
            :key="index"
            v-bind="col"
            align="center"
          ></el-table-column>

          <el-table-column
            label="操作"
            align="center"
            v-if="!type"
          >
            <template
              class="action-cell"
              v-slot="{ row ,$index }"
            >
              <span
                class="brand-color cursor-pointer action-label"
                @click="remove(row,$index )"
              >{{row.comboId?'移除':'添加套餐'}}</span>
            </template>
          </el-table-column>

        </BasePageTable>
        <span>套餐合计：{{countPrice}}元</span>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">套餐包价格(含配送费)：</span>
        <el-input
          v-model="sellPrice"
          clearable
          class="medium-input"
          @blur="checkText()"
          :disabled="type?true:false"
        ></el-input>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">排序：</span>
        <el-input
          v-model="sort"
          clearable
          class="medium-input"
          :disabled="type?true:false"
        ></el-input>
      </div>
    </section>
  </div>
  <footer
    class="btn-footer"
    v-if="!type"
  >
    <el-button
      type="primary"
      :loading="loading"
      @click="submit"
    >确认</el-button>
    <el-button @click="cancel">取消</el-button>
  </footer>
  <ConfirmDialog
    v-model="showSkuList"
    title="选择套餐"
    :close-on-click-modal="false"
    :auto-confirm="false"
    :async-confirm="false"
    @on-confirm="sekSku"
  >
    <div style="margin-bottom:15px">
      <span>套餐名称： </span>
      <el-input
        clearable
        v-model="comboName"
        class="medium-input"
      />
      <span>菜品名称：</span>
      <el-input
        clearable
        v-model="skuName"
        class="medium-input"
      />
      <el-button
        type="primary"
        :loading="loading"
        @click="querySkuList"
      >搜索</el-button>

    </div>

    <BasePageTable
      ref="table"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      v-loading="$store.state.vloading"
      :data="skuList"
      :total="tableDataTotal"
      border
      @current-page-change="querySkuList"
      @size-change="querySkuList"
    >
      <el-table-column
        label="序号"
        type="index"
        width="50"
      ></el-table-column>
      <el-table-column
        label="套餐ID"
        prop="comboId"
      ></el-table-column>
      <el-table-column
        label="套餐名称"
        prop="comboName"
      ></el-table-column>
      <el-table-column
        label="套餐内容"
        prop="comboContent"
      ></el-table-column>
      <el-table-column
        label="套餐类型"
        prop="category"
      ></el-table-column>

      <el-table-column
        label="商品合计价格"
        prop="totalPrice"
      ></el-table-column>
      <el-table-column
        label="套餐价格"
        prop="actualPrice"
      ></el-table-column>
      <el-table-column
        label="操作"
        align="center"
      >
        <template
          class="action-cell"
          v-slot="{row}"
        >
          <span
            class="brand-color cursor-pointer action-label"
            @click="toSel(row)"
          >选择</span>
        </template>
      </el-table-column>
    </BasePageTable>
  </ConfirmDialog>
</template>

<script>
import UploadImage from "@/components/UploadImage";
import BasePageTable from "@/components/BasePageTable.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default {
  components: {
    BasePageTable,
    UploadImage,
    ConfirmDialog,
  },
  data() {
    return {
      type: "", //跳转类型
      douPackId: "", //抖音套餐包id
      douPackName: "", //套餐包名称
      coverImg: [], //封面
      detailsImg: [], //详情
      classify: "", //上架类目
      daysNum: "", //售卖天数,
      mealsNum: "", //每天餐数,
      skuList: [], //套餐内容
      showSkuList: false, //选择套餐弹窗
      sellPrice: "", //套餐包售卖价格
      sort: "", //排序
      rightTable: [],
      countPrice: 0,
      classifyList: [], //类目列表
      selIndex: 0,
      comboName: "",
      tableDataTotal: 0,
      days: "",
      Mealnums: "",
      skuName: "",
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      rightCol: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "餐别序号",
          prop: "showSort",
        },
        {
          label: "套餐ID",
          prop: "comboId",
        },
        {
          label: "套餐名称",
          prop: "comboName",
        },
        {
          label: "套餐内容",
          prop: "comboContent",
        },
        {
          label: "套餐类型",
          prop: "category",
        },
        {
          label: "商品合计价格",
          prop: "totalPrice",
        },
        {
          label: "套餐价格",
          prop: "actualPrice",
        },
        {
          label: "当前状态",
          prop: "stt",
          // formatter: (row) => `${row.comboId ? "上线" : ""}`,
        },
      ],
    };
  },
  created() {
    if (this.$route.query.douPackId) {
      // 编辑 查询详情
      this.queryDouComboInfo(this.$route.query.douPackId);
      this.type = this.$route.query.type;
    }
  },
  mounted() {
    this.getList(); //查询类目
  },
  methods: {
    async getList() {
      const res = await this.$http("doupack.DouPackClassify/queryClassify", {});
      this.classifyList = res.obj.filter(
        (col) => col.classifyStt && col.classifyStt !== "下线"
      );
    },
    async queryDouComboInfo(douPackId) {
      const res = await this.$http("doupack.DouCombo/queryDouComboInfo", {
        douPackId: douPackId,
      });
      if (!res.errMsg) {
        this.douPackName = res.obj.douPackName;
        this.coverImg = res.obj.coverImg;
        this.detailsImg = res.obj.detailsImg;
        this.classify = Number(res.obj.classify);
        this.daysNum = res.obj.daysNum;
        this.mealsNum = res.obj.mealsNum;
        this.sort = res.obj.sort;
        this.sellPrice = res.obj.sellPrice;
        this.rightTable = res.obj.douComboInfo;
        this.douPackId = res.obj.douPackId;
        this.AllPrice();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    sumtab() {
      // 套餐包内容：餐别序号数 = 天数*餐数
      const nums = Number(this.daysNum) * Number(this.mealsNum);

      this.rightTable = [];
      for (let index = 0; index < nums; index++) {
        this.rightTable.push({
          showSort: `第${index + 1}餐`,
        });
      }
      this.AllPrice();
    },
    remove(row, index) {
      this.selIndex = index;
      if (row.comboId) {
        // 移除
        this.rightTable[index].comboId = "";
        this.rightTable[index].comboName = "";
        this.rightTable[index].comboContent = "";
        this.rightTable[index].category = "";
        this.rightTable[index].totalPrice = "";
        this.rightTable[index].actualPrice = "";
      } else {
        this.querySkuList(); //选择套餐
      }
    },
    AllPrice() {
      //计算套餐包合计价格
      this.countPrice = 0;
      this.rightTable.map((col) => {
        if (col.actualPrice) {
          this.countPrice += Number(col.actualPrice);
        }
      });
    },
    //价格保留两位小数
    checkText() {
      let number = this.sellPrice;
      number = isNaN(number) ? 0 : Number(number) < 0 ? 0 : Number(number);
      number = number.toFixed(2);
      this.sellPrice = number.toString();
    },
    toSel(row) {
      (row.showSort = `第${this.selIndex + 1}餐`),
        (this.rightTable[this.selIndex] = row);
      this.rightTable[this.selIndex].sort = this.selIndex + 1;
      this.AllPrice();
      this.showSkuList = false;
    },
    async querySkuList() {
      const params = {
        ...this.page,
        comboName: this.comboName,
        skuName: this.skuName,
      };
      const res = await this.$http("doupack.DouCombo/queryCombo", params);
      this.skuList = res.obj.record;
      this.tableDataTotal = res.obj.totalRecordCount;
      this.showSkuList = true;
    },
    async submit() {
      const index = this.rightTable.findIndex((item) => !item.comboId);
      if (!this.douPackName) {
        this.$msg("请输入套餐包名称", "error");
        return;
      } else if (!this.coverImg) {
        this.$msg("请上传封面", "error");
        return;
      } else if (!this.detailsImg) {
        this.$msg("请上传详情图", "error");
        return;
      } else if (!this.classify) {
        this.$msg("请选择上架类目", "error");
        return;
      } else if (!this.daysNum) {
        this.$msg("请输入售卖天数", "error");
        return;
      } else if (!this.mealsNum) {
        this.$msg("请选择每天餐数", "error");
        return;
      } else if (index !== -1) {
        this.$msg(`请添加第${index + 1}餐的套餐`, "error");
        return;
      } else if (!this.sellPrice) {
        this.$msg("请输入套餐包售卖价格", "error");
        return;
      } else if (!this.sort) {
        this.$msg("请输入排序", "error");
        return;
      }
      let params = {
        douPackName: this.douPackName,
        coverImg: this.coverImg,
        detailsImg: this.detailsImg,
        classify: this.classify,
        daysNum: this.daysNum,
        mealsNum: this.mealsNum,
        sellPrice: this.sellPrice,
        sort: this.sort,
        douComboInfo: this.rightTable,
      };
      if (this.douPackId) {
        params.douPackId = this.douPackId;
      }
      const res = await this.$http("doupack.DouCombo/opDouCombo", params);
      if (!res.errMsg) {
        this.$msg("操作成功", "success");
        this.$closeRoute();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    cancel() {
      this.$confirm("确认取消？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(() => {
        this.$closeRoute();
      });
    },
  },
};
</script>

<style>
</style>
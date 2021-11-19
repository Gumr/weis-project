<template>
  <div class="page-container">
    <!-- <section>
      <div v-if="!tfsId" class="section-item">
        <span class="section-label">
          <span style="color: red">*</span>目标门店：
        </span>
        <el-button type="primary" @click="addStore">添加门店</el-button>
        <div style="width: 100%; margin-top: 30px"></div>
        <div
          class="store-list"
          v-if="tableSelection.length > 0"
          style="padding-left: 30px; width: 60%"
        >
          <BasePageTable
            empty-text="未选择门店"
            :visible="false"
            :data="tableSelection"
            :stripe="false"
            border
            @current-page-change="getList"
            @size-change="getList"
            @current-change="handleCurrentChange"
          >
            <el-table-column
              v-for="col in colBySelectedStore"
              :key="col.prop"
              v-bind="col"
            ></el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="{ row }" class="action-cell">
                <span
                  class="brand-color cursor-pointer"
                  style="margin-right: 8px"
                  @click="removeStore(row)"
                  >删除</span
                >
              </template>
            </el-table-column>
          </BasePageTable>
        </div>
      </div>
    </section> -->
    <section>
      <h3>新建饿了么商品：</h3>
      <div class="section-item">
        <span class="section-label">
          <span style="color: red">*</span>选择菜品：
        </span>
        <el-button type="primary" @click="addGoods">选择菜品</el-button>
      </div>
      <div class="section-item--box" v-if="selectedGood.tfsCid">
        <div class="section-item">
          <span class="section-label label-1">菜品名称：</span>
          <span>{{ selectedGood.tfsSkuname }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">菜品Id：</span>
          <span>{{ selectedGood.tfsCid }}</span>
          <el-button
            v-if="tfsId"
            style="margin-left: 10px"
            type="primary"
            @click="refresh"
            >刷新</el-button
          >
        </div>
        <div class="section-item">
          <span class="section-label label-1">菜品规格：</span>
          <span>{{
            selectedGood.tfsType === '00'
              ? selectedGood.tfsQuality + selectedGood.tfsUnit
              : '套餐'
          }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>热量：
          </span>
          <span>{{ selectedGood.tfsEnergy }}kcal</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>价格：
          </span>
          <span>{{ selectedGood.tfsPrice }}</span>
        </div>
      </div>
    </section>
    <!-- 基本信息 -->
    <section>
      <h3>基本信息：</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>商品名称：
        </span>
        <el-input
          clearable
          v-model="formData.name"
          class="medium-input"
          placeholder="请输入商品名称"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>店内分类：
        </span>
        <BaseSelect
          placeholder="下拉选择分类"
          v-model="formData.categoryId"
          :options="formData.categoryOptions"
          filterable
          clearable
        />
        <el-button type="primary" style="margin-left: 10px" @click="createType"
          >新建分类</el-button
        >
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>商品类目：
        </span>
        <el-cascader
          :show-all-levels="false"
          :options="formData.cateOptions"
          v-model="formData.backCategoryId"
          :props="cascaderOpts"
          @change="getCascaderTags"
          ref="leimu"
        ></el-cascader>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>商品图片：
        </span>
        <ImageUpload
          v-model:file-list="formData.pictureUrl"
          @upload-success="imgUploadSuccess"
          @delete-success="imgDeleteSuccess"
          :upload-data="{ flag: 'square' }"
          :data="{ platform: 'eleme' }"
          size="480*480"
          upload-path="/upload/meituanImage"
          :limit="1"
        />
      </div>
    </section>
    <!-- 售卖信息 -->
    <section>
      <h3>售卖信息：</h3>
      <h3>商品规格：</h3>
      <div class="section-item">
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red">*</span>价格：
          </span>
          <el-input
            clearable
            v-model="formData.price"
            @blur="validateIpt('price')"
            class="medium-input"
            placeholder="精确到小数点后两位"
          />
        </div>
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red">*</span>包装费：
          </span>
          <el-input
            clearable
            max="8"
            v-model="formData.boxPrice"
            @blur="validateIpt('boxPrice')"
            class="medium-input"
            placeholder="精确到小数点后两位"
          />
        </div>

        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red">*</span>份量
          </span>
          <el-input
            clearable
            v-model="formData.weight"
            @blur="validateIpt('weight')"
            class="medium-input"
            placeholder="请输入整数"
          />
          <el-select
            v-model="formData.unit"
            class="btn"
            placeholder="请选择商品单位"
          >
            <el-option
              v-for="item in middelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <!-- <span>{{ formData.unit }}</span> -->
        </div>
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red">*</span>库存：
          </span>
          <el-input
            clearable
            :disabled="editType == 'edit'"
            v-model="formData.stock"
            @blur="validateIpt('stock')"
            class="medium-input"
            placeholder="请输入整数"
          />
        </div>
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red"></span>热量:
          </span>
          <el-input
            clearable
            v-model="formData.calorie"
            class="medium-input"
            placeholder=""
          />千卡/100克
        </div>
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red"></span>条形码:
          </span>
          <el-input
            clearable
            v-model="formData.barCode"
            class="medium-input"
            placeholder=""
          />
        </div>
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red"></span>SKU码:
          </span>
          <el-input
            clearable
            :disabled="true"
            v-model="formData.skuSize"
            class="medium-input"
            placeholder=""
          />
        </div>
      </div>
    </section>
    <section>
      <!-- <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red"></span>商品属性：
        </span>
        <el-button style="margin-left: 10px" type="primary" @click="addPropFn"
          >添加属性</el-button
        >
        <div style="width: 100%; margin-top: 20px"></div>
        <div class="props-list" style="width: 100%">
          <div
            class="props-list__apiece"
            v-for="(item, index) in customProps"
            :key="index"
          >
            <el-input
              style="width: 120px; margin-right: 10px"
              placeholder="请输入属性"
              v-model="item.label"
            ></el-input
            ><span style="opacity: 0.5">例如：微辣</span>
          </div>
        </div>
      </div> -->
    </section>

    <!-- 详细信息 -->
    <section>
      <h3>详细信息</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>商品原料：
        </span>
        <el-cascader
          v-model="materials"
          :show-all-levels="false"
          :options="formData.materialsOptions"
          :props="mCascaderOpts"
          @change="getCascaderTags"
          ref="yuanliao"
        ></el-cascader>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>菜品描述：
        </span>
        <el-input
          clearable
          v-model="formData.description"
          class="medium-input"
          type="textarea"
          :rows="4"
          placeholder="描述"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red"></span>商品标签：</span
        >
        <el-checkbox-group v-model="formData.lable">
          <el-checkbox label="1">新品</el-checkbox>
          <el-checkbox label="2">招牌</el-checkbox>
          <!-- <el-checkbox
            label="招牌"
            v-if="selectedGood.tfsType === '01'"
            :disabled="selectedGood.tfsType === '01'"
          ></el-checkbox> -->
        </el-checkbox-group>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red"></span>商品视频<span
            class="el-icon-question"
            style="color: blue"
            title="请上传mp4格式，时长5秒～5分钟，大小不超过200M，宽高比为：1:1，16:9，4:3，3:4的视频，视频请勿含有第三方水印、黑边、非真实商品和引导关注的内容"
          ></span
          >：</span
        >
        <el-form-item label="上传视频" prop="video">
          <el-upload
            class="upload-demo"
            accept="video/*"
            action="/upload/image"
            :on-remove="handleRemove"
            :on-success="handleVideoSuccess"
            :file-list="formData.video"
            multiple="false"
            limit="1"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">最多可上传1个视频</div>
            </template>
          </el-upload>
        </el-form-item>
      </div> -->
      <!-- <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>套餐适用人数：
        </span>
        <el-input
          clearable
          v-model="formData.applicableNum"
          class="medium-input"
          type="textarea"
          :rows="4"
          placeholder="描述"
        ></el-input>
      </div> -->
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>最小购买量：
        </span>
        <el-input
          clearable
          @blur="validateIpt('minBuy')"
          v-model="formData.minBuy"
          class="medium-input"
          :rows="4"
          placeholder="描述"
        ></el-input
        >份
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red"></span>可售时间：
        </span>
        <el-radio-group v-model="formData.timeType">
          <el-radio :label="0">时间不限</el-radio>
          <el-radio :label="1">自定义时间</el-radio>
        </el-radio-group>
        <div style="margin: 10px 0; width: 100%"></div>
        <span class="section-label label-1">
          <span style="color: red"></span>
        </span>
        <div class="custom-time" v-if="formData.timeType == 1">
          <div class="block" style="margin-bottom: 20px">
            <span class="demonstration" style="margin-right: 10px"
              >选择时间段</span
            >
            <el-date-picker
              v-model="formData.saleDate"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            >
            </el-date-picker>
          </div>
          <el-checkbox-group v-model="formData.saleTime.weeks">
            <el-checkbox label="MONDAY">周一</el-checkbox>
            <el-checkbox label="TUESDAY">周二</el-checkbox>
            <el-checkbox label="WEDNESDAY">周三</el-checkbox>
            <el-checkbox label="THURSDAY">周四</el-checkbox>
            <el-checkbox label="FRIDAY">周五</el-checkbox>
            <el-checkbox label="SATURDAY">周六</el-checkbox>
            <el-checkbox label="SUNDAY">周日</el-checkbox>
          </el-checkbox-group>
          <div style="margin: 10px 0; width: 100%"></div>
          <el-time-select
            placeholder="起始时间"
            v-model="formData.bTime"
            v-bind="{ start: '07:30', step: '00:15', end: '23:30' }"
          />
          -
          <el-time-select
            placeholder="结束时间"
            v-model="formData.eTime"
            v-bind="{
              start: '07:30',
              step: '00:15',
              end: '23:30',
              minTime: formData.bTime,
            }"
          />
        </div>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red"></span>配送方式：
        </span>
        <el-radio-group v-model="formData.timeType">
          <el-radio :label="0">单点可送</el-radio>
          <el-radio :label="1">单点不送</el-radio>
        </el-radio-group>
      </div> -->
    </section>
    <section class="add-form-btn-box">
      <el-button size="small" type="success" @click="updateFoodInfo">
        保存商品并发布
      </el-button>
      <el-button size="small" type="warning" @click="backPage">
        取消
      </el-button>
    </section>

    <!-- 选择菜品 -->
    <ConfirmDialog
      v-model="goodsDialog"
      title="选择菜品"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="confirmGood"
    >
      <BasePageTable
        height="600"
        empty-text="当前没有菜品"
        :visible="false"
        :data="tableDataByGoods"
        :stripe="false"
        highlight-current-row
        border
        @current-page-change="getList"
        @size-change="getList"
        @current-change="handleCurrentChange"
      >
        <el-table-column
          v-for="col in tableColByGoods"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
      </BasePageTable>
    </ConfirmDialog>
    <!-- 选择商店 -->
    <ConfirmDialog
      v-model="storeDialog"
      title="选择门店"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="confirmStore"
      @on-cancel="cancelStore"
    >
      <BasePageTable
        v-model:selection="preTableSelection"
        v-loading="$store.state.vloading"
        empty-text="当前没有门店可选"
        :visible="false"
        :data="tableDataByStore"
        :stripe="false"
        border
        @current-page-change="getList"
        @size-change="getList"
        @current-change="handleCurrentChangeByStore"
      >
        <el-table-column>
          <template #header>
            <el-checkbox
              :model-value="checkedStore.length === tableDataByStore.length"
              @change="selectAllStoreChange"
            ></el-checkbox>
          </template>
          <template #default="{ row }" class="action-cell">
            <el-checkbox v-model="row.operate"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column
          v-for="col in tableColByStore"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
      </BasePageTable>
    </ConfirmDialog>
    <!-- 新建分类 -->
    <ConfirmDialog
      v-model="typeDialog"
      title="新建分类"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="createTypeConfirm"
      @on-cancel="cancelStore"
    >
      <el-form
        :model="typeForm"
        ref="ruleTypeForm"
        :rules="typeFormRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="categoryName">
          <el-input class="medium-input" v-model="typeForm.categoryName" />
        </el-form-item>
        <el-form-item label="分类描述" prop="categoryDesc">
          <el-input
            class="medium-input"
            type="textarea"
            v-model="typeForm.categoryDesc"
          />
        </el-form-item>
        <!-- <el-form-item label="类型" prop="type">
          <BaseSelect
            v-model="typeForm.type"
            :options="typeOptions"
            clearable
            filterable
            @change="handleChange"
          ></BaseSelect>
        </el-form-item>
        <el-form-item label="限时置顶" prop="istop">
          <el-radio-group v-model="typeForm.istop">
            <el-radio label="00">开启</el-radio>
            <el-radio label="01">关闭</el-radio>
          </el-radio-group>
        </el-form-item> -->
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import { defineComponent } from 'vue'
import { isInt, isDecimal } from '@/utils/validator'
export default defineComponent({
  components: {
    BasePageTable,
    ConfirmDialog,
    ImageUpload,
  },
  data() {
    return {
      editType: 'add',
      middelOptions: [
        {
          label: '克',
          value: '克',
        },
        {
          label: '千克',
          value: '千克',
        },
        {
          label: '毫升',
          value: '毫升',
        },
      ],
      cascaderOpts: {
        value: 'id',
        label: 'name',
        children: 'children',
        emitPath: false,
      },
      mCascaderOpts: {
        value: 'id',
        label: 'name',
        multiple: true,
        children: 'children',
        emitPath: false,
      }, // 原材料级联选择器属性
      typeDialog: false,
      tipDialog: false,
      // 自定义属性
      customProps: [],
      // 选择菜品
      selectedGood: {},
      goodsDialog: false,
      tableDataByGoods: [],
      tableColByGoods: [
        {
          label: '序号',
          type: 'index',
        },
        {
          label: '菜品编码',
          prop: 'tfsCid',
        },
        {
          label: '菜品名称',
          prop: 'tfsSkuname',
        },
        {
          label: '菜品单价',
          prop: 'tfsPrice',
        },
        {
          label: '菜品热量',
          prop: 'tfsEnergy',
          formatter: (row) => {
            return `${row.tfsEnergy}kcal`
          },
        },
      ],
      // 选择门店
      storeDialog: false,
      preTableSelection: [],
      tableSelection: [],
      tableDataByStore: [],
      tableColByStore: [
        // { type: 'selection', width: 60 },
        {
          label: '供餐点编码',
          prop: 'app_poi_code',
        },
        {
          label: '供餐点名称',
          prop: 'name',
        },
        {
          label: '供餐点地址',
          prop: 'address',
        },
      ],
      // 已添加门店
      colBySelectedStore: [
        {
          label: '供餐点编码',
          prop: 'app_poi_code',
        },
        {
          label: '供餐点名称',
          prop: 'name',
        },
        {
          label: '供餐点地址',
          prop: 'address',
        },
      ],
      materials: [],
      formData: {
        materials: [],
        materialsOptions: [],
        categoryId: '', // 店内分类
        categoryName: '',
        categoryOptions: [],
        cateOptions: [],
        foodCode: '',
        foodCid: '', // 后台的菜品cid
        backCategoryName: '', // 菜品分类
        backCategoryId: [],
        name: '', // 显示的菜品名称
        description: '',
        price: '',
        stock: '',
        boxPrice: '',
        calorie: '',
        skuSize: '',
        specId: 0,
        weight: '',
        unit: '克',
        foodType: '', // 00单品，01套餐
        speciality: '',
        applicableNum: '',
        minBuy: '',
        pictureUrl: [],
        status: '',
        otherAttrs: '',
        barCode: '',
        lable: [],
        checkedCategory: ['招牌'],
        video: [],
        saleTime: {
          beginDate: '',
          endDate: '',
          times: [
            {
              beginTime: '',
              endTime: '',
            },
          ],
          weeks: [],
        },
        timeType: 0, // 0时间不限，1自定义时间
        bTime: '',
        eTime: '',
        saleDate: [],
      },
      typeForm: {
        categoryName: '',
        categoryDesc: '',
        // type: '00',
        // istop: '00',
      },
      typeOptions: [
        {
          label: '普通分类',
          value: '00',
        },
        {
          label: '必点分类',
          value: '01',
        },
        {
          label: '可单独下单分类',
          value: '02',
        },
      ],
      typeFormRules: {
        categoryName: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      catalogV: '', // 用户还原下拉框
      catalogF: '',
      skuTagVos: '',
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        phone: '',
      },
    }
  },
  computed: {
    checkedStore() {
      return this.tableDataByStore.filter((i) => i.operate)
    },
  },
  created() {},
  mounted() {
    const { type, code, tefId } = this.$route.query
    this._code = code
    this._tefId = tefId
    this.editType = type
    // 已关联菜品查详情，未关联从前一个页面取
    if (type === 'edit') {
      this.queryDetail()
      // if (tefId && code) {
      //   this.queryDetail()
      // } else {
      //   this.getEleGoodData()
      // }
    }
    this.queryFoodCategorys()
    this.queryItemMaterialTree()
    this.queryElemeBackCategory()
  },
  methods: {
    // 新建分类
    createType() {
      this.typeDialog = true
    },
    createTypeConfirm() {
      this.$refs.ruleTypeForm.validate((valid) => {
        if (valid) {
          const params = { ...this.typeForm }
          this.$request(
            'cn.nezha.api.eleme.Food/createStoreCategory',
            {
              ...params,
            },
            true
          ).then(
            this.$rw((err, res) => {
              if (!err) {
                console.log(res.result)
                this.typeDialog = false

                this.formData.categoryOptions.push({
                  label: res.result.name,
                  value: res.result.id,
                })
                return
              }
              this.$message.warning(err.errMsg)
            })
          )
          return
        }
        this.$message.warning('必填值为空')
      })
    },
    selectAllStoreChange(value) {
      for (const item of this.tableDataByStore) {
        item.operate = value
      }
    },
    // 添加自定义属性
    addPropFn() {
      const customProps = this.customProps
      this.customProps.push({
        label: '',
        index: customProps.length - 1,
      })
    },
    confirmGood() {
      this.goodsDialog = false
      this.selectedGood = this.preSelectedGood
      // console.log(this.selectedGood)
      this.formData.skuSize = this.selectedGood.tfsCid
      if (this._tfsType == '01') this.formData.checkedCategory.push('套餐')
    },
    confirmStore() {
      this.tableSelection = this.tableDataByStore.filter((item) => item.operate)
      this.storeDialog = false
    },
    cancelStore() {
      this.preTableSelection = []
      this.storeDialog = false
    },
    removeStore(row) {
      this.tableSelection = this.tableSelection.filter(
        (item) => item.app_poi_code != row.app_poi_code
      )
    },
    handleCurrentChange(row) {
      if (row) {
        this.preSelectedGood = row
        this._tfsType = row.tfsType
      }
    },
    // 编辑菜品，查菜品信息
    queryDetail() {
      this.$request(
        'cn.nezha.api.eleme.Food/queryFoodInfo',
        {
          appFoodCode: this._code,
          tmfId: this._tefId || 0,
        },
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            const r = res.result
            const saleTime = r.tefSaleTime ? JSON.parse(r.tefSaleTime) : {}
            this.formData = {
              ...this.formData,
              materials: r.tefMaterial ? JSON.parse(r.tefMaterial) : [],
              price: r.tefPrice,
              categoryId: r.tefCategoryId,
              categoryName: r.tefCategoryName,
              foodCode: '',
              foodCid: r.tefCid,
              backCategoryId: +r.tefBackCategoryId,
              backCategoryName: r.tefBackCategoryName,
              name: r.tefItemName,
              description: r.tefDescription,
              stock: '门店实时库存',
              boxPrice: r.tefBoxPrice,
              calorie: r.tefCalorie,
              skuSize: r.tefSkuSize,
              specId: 0,
              weight: r.tefWeight,
              unit: r.tefUnit,
              foodType: '',
              applicableNum: r.tefApplicableNum,
              minBuy: r.tefMinBuy,
              pictureUrl: r.tefPictureUrl
                ? [
                    {
                      name: '',
                      url: r.tefPictureUrl,
                    },
                  ]
                : [],
              otherAttrs: r.tefOtherAttrs,
              barCode: r.tefBarCode,
              lable: r.tefLable ? JSON.parse(r.tefLable) : [],
              saleTime: {
                beginDate: saleTime.beginDate,
                endDate: saleTime.endDate,
                times: [
                  {
                    beginTime: saleTime.beginTime,
                    endTime: saleTime.endTime,
                  },
                ],
                weeks: saleTime.weeks || [],
              },
              bTime: saleTime && saleTime.times && saleTime.times[0].beginTime,
              eTime: saleTime && saleTime.times && saleTime.times[0].endTime,
              saleDate: saleTime.beginDate
                ? [this.$day(saleTime.beginDate), this.$day(saleTime.endDate)]
                : [],
              timeType: Object.keys(saleTime).length > 0 ? 1 : 0,
              checkedCategory: [],
              video: [],
            }
            // this._imgUrl = r.tefPictureUrl
            this._tefId = r.tefId
            this.materials = r.tefMaterial
              ? JSON.parse(r.tefMaterial).map((item) => item.id)
              : []

            // console.log(this.formData)

            // const {
            //   tmfId,
            //   tmfCid,
            //   tfsEnergy,
            //   tmfsEnergy,
            //   tfsQuality,
            //   tfsUnit,
            //   tfsPrice,
            //   tmfPrice,
            //   tmfType,
            //   tmfCategory,
            //   tmfPublishStore,
            //   tmfSaleTime,
            //   tmfPictureUrl,
            //   mtPirtureUrl,
            //   storeAddrs,
            //   tmfSpeciality,
            //   cname,
            // } = res.result
            // let saleTime = tmfSaleTime ? JSON.parse(tmfSaleTime) : {}
            // this.formData = {
            //   ...res.result,
            //   category: tmfCategory,
            //   checkedCategory: [],
            //   tmfPictureUrl: [
            //     {
            //       name: '',
            //       url: mtPirtureUrl,
            //     },
            //   ],
            //   cateOptions: this.formData.cateOptions,
            //   timeType: Object.keys(saleTime).length == 0 ? 0 : 1,
            // }
            // this.formData.saleTime.weeks = []
            // this._imgUrl = tmfPictureUrl
            // if (tmfType == '01') this.formData.checkedCategory.push('套餐')
            // if (tmfSpeciality == 1) this.formData.checkedCategory.push('招牌')
            // // 自定义时间
            // if (Object.keys(saleTime).length > 0) {
            //   for (var key in saleTime) {
            //     this.formData.saleTime.weeks.push(key)
            //     this.formData.bTime = saleTime[key].split('-')[0]
            //     this.formData.eTime = saleTime[key].split('-')[1]
            //   }
            // }
            // 目标门店
            // JSON.parse(tmfPublishStore).forEach((item, index) => {
            //   this.tableSelection.push({
            //     name: storeAddrs[index].name,
            //     address: storeAddrs[index].address,
            //     app_poi_code: item,
            //   })
            // })
            // 菜品
            this._id = r.tefCid
            this.selectedGood = {
              tfsType: r.tefType,
              tfsCid: r.tefCid,
              tfsQuality: r.tfsQuality,
              tfsUnit: r.tfsUnit,
              tfsPrice: r.tfsPrice,
              tfsEnergy: r.tfsEnergy,
              tfsSkuname: r.cname,
            }
          }
        })
      )
    },
    // 未关联，直接取饿了么上的菜品信息
    getEleGoodData() {
      const r = JSON.parse(sessionStorage.getItem('good-data'))
      console.log(r)
      this.formData = {
        ...this.formData,
        backCategoryId: +r.tefBackCategoryId,
        boxPrice: r.tefBoxPrice,
        barCode: r.tefBarCode,
        calorie: r.tefCalorie == 'null' ? '' : r.tefCalorie,
        categoryId: r.tefCategoryId,
        categoryName: r.tefCategoryName,
        description: r.tefDescription,
        name: r.tefItemName,
        materials: JSON.parse(r.tefMaterial),
        minBuy: r.tefMinBuy,
        pictureUrl: r.tefPictureUrl
          ? [
              {
                name: '',
                url: r.tefPictureUrl,
              },
            ]
          : [],
        price: r.tefPrice,
        saleDate: {},
        tefSpecId: r.tefSpecId,
        tefStatus: 0,
        stock: r.tefStock,
        foodType: r.tefType,
        weight: r.tefWeight,

        // materials: JSON.parse(r.tefMaterial),
        // foodCode: '',
        // foodCid: r.tefCid,
        // backCategoryName: r.tefBackCategoryName,
        // name: r.cname,

        // skuSize: r.tefSkuSize,
        // specId: 0,
        // weight: r.tefWeight,
        // unit: r.tfsUnit,
        // foodType: '',
        // applicableNum: r.tefApplicableNum,

        // otherAttrs: r.tefOtherAttrs,
        // lable: JSON.parse(r.tefLable) || [],
        // saleTime: {
        //   beginDate: this.$day(saleTime.beginDate),
        //   endDate: this.$day(saleTime.endDate),
        //   times: [
        //     {
        //       beginTime: saleTime.beginTime,
        //       endTime: saleTime.endTime,
        //     },
        //   ],
        //   weeks: saleTime.weeks || [],
        // },
        // bTime: saleTime.beginDate,
        // eTime: saleTime.endDate,

        // timeType: Object.keys(saleTime).length > 0 ? 1 : 0,
        // checkedCategory: [],
        // video: [],
      }
      return

      const sku = JSON.parse(goodData.skus)[0]
      const availableTimes = sku.available_times
      this.formData = {
        ...this.formData,
        tmfBoxNum: goodData.box_num,
        category: goodData.category_name,
        tmfPictureUrl: [
          {
            name: '',
            url: goodData.pictures,
          },
        ],
        tmfPrice: goodData.price,
        tmfBoxPrice: goodData.box_price,
        tmfUnit: goodData.unit,
        tmfApplicableNum: '',
        tmfMinBuy: goodData.min_order_count,
        tmfIntroduce: goodData.description,
        tmfStock: sku.stock,
        tmfWeight: sku.weight,
        locationSize: sku.location_code,
        checkedCategory: [],
      }
      // 是否套餐or招牌
      // if (tmfType == '01') this.formData.checkedCategory.push('套餐')
      if (goodData.speciality == 1) this.formData.checkedCategory.push('招牌')
      // 自定义时间
      for (var key in availableTimes) {
        if (availableTimes[key]) {
          this.formData.saleTime.weeks.push(key)
          const saleTime = availableTimes[key].replace(/\"/g, '')
          this.formData.bTime = saleTime.split('-')[0]
          this.formData.eTime = saleTime.split('-')[1]
        }
      }
      this.formData.timeType = this.formData.saleTime.weeks.length > 0 ? 1 : 0
    },
    addGoods() {
      this.$request(
        'cn.nezha.api.meituan.Food/queryWeisSkuList',
        {},
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            this.tableDataByGoods = res.result
            this.goodsDialog = true
          }
        })
      )
    },
    async addStore() {
      await this.queryStore()
      const selected = this.tableSelection.map((item) => item.hpName)
      this.tableDataByStore.forEach((item) => {
        item.operate = selected.includes(item.hpName)
      })
      this.storeDialog = true
    },
    // 查询店内商品分类
    queryFoodCategorys() {
      this.$request(
        '/cn.nezha.api.eleme.Food/queryFoodCategorys',
        {},
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            res.result.forEach((item) => {
              this.formData.categoryOptions.push({
                label: item.name,
                value: item.id,
              })
            })
          }
        })
      )
    },
    // 查询商品类目
    queryElemeBackCategory() {
      this.$request(
        '/cn.nezha.api.eleme.Food/queryElemeBackCategory',
        {},
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            this.formData.cateOptions = this.getTreeData(res.result)
          }
        })
      )
    },
    // 查询原材料
    queryItemMaterialTree() {
      this.$request(
        '/cn.nezha.api.eleme.Food/queryItemMaterialTree',
        {},
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            this.formData.materialsOptions = this.getTreeData(res.result)
          }
        })
      )
    },
    getTreeData(data) {
      // 处理类目数据格式
      for (let index = 0; index < data.length; index++) {
        if (!data[index].children) {
          data[index].children = undefined
        } else {
          this.getTreeData(data[index].children)
        }
      }
      return data
    },
    updateFoodInfo() {
  
      let stores = []
      let saleTime = {}
      const { tfsCid, tfsType, tfsSkuname } = this.selectedGood
      // console.log(this.selectedGood)

      const hasNull = this.validateFn()
      if (hasNull) {
        this.$message.warning('必填值为空')
        return
      }
      this.tableSelection.forEach((item) => {
        stores.push(item.app_poi_code)
      })
      const params = { ...this.formData }
      // // tefId存在则为编辑，反之为新增
      // if(this._tefId) {

      // }
      params.materials = []
      const materials = this.$refs.yuanliao.getCheckedNodes()
      materials.forEach((item) => {
        params.materials.push({
          id: item.value,
          name: item.label,
        })
      })

      // console.log(this.$refs.leimu.getCheckedNodes()[0])
      // console.log(params)
      // return
      if (params.timeType == 1) {
        params.saleTime = {
          ...params.saleTime,
          beginDate: this.$day(params.saleDate[0]).format('YYYY-MM-DD'),
          endDate: this.$day(params.saleDate[1]).format('YYYY-MM-DD'),
          times: [
            {
              beginTime: params.bTime,
              endTime: params.eTime,
            },
          ],
        }
      } else params.saleTime = {}
      params.foodCid = tfsCid
      params.foodType = tfsType
      params.backCategoryName =
        this.$refs.leimu && this.$refs.leimu.getCheckedNodes()[0].label
      params.pictureUrl = this._imgUrl
      params.foodCode = this._code ? this._code : tfsCid
      params.otherAttrs = this.filterNullProp()
      params.foodType = params.checkedCategory.includes('套餐') ? '01' : '00'
      params.speciality = params.checkedCategory.includes('招牌') ? 1 : 2
      params.categoryOptions.forEach((v) => {
        if (v.value == params.categoryId) params.categoryName = v.label
      })
      // console.log(params)
      // return
      delete params.bTime
      delete params.eTime
      delete params.saleDate
      delete params.cateOptions
      delete params.categoryOptions
      delete params.checkedCategory
      delete params.materialsOptions
      // console.log(params)
      this.$request('/cn.nezha.api.eleme.Food/updateFoodInfo', {
        id: this._tefId || 0,
        foodCode: this._code || '',
        ...params,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$message.success('创建成功')
            this.$router.go(-1)
          } else {
            // console.log(err.errMsg)
            this.$message.warning(
              typeof err.errMsg == 'string'
                ? err.errMsg
                : JSON.parse(err.errMsg).msg
            )
          }
        })
      )
    },
    imgUploadSuccess(url) {
      // this._imgUploaded = true
      this._imgUrl = url
    },
    imgDeleteSuccess(filelist) {
      this._imgUrl = ''
      this.formData.tmfPictureUrl = []
    },
    backPage() {
      this.$router.go(-1)
    },
    validateFn() {
      let hasNull = false
      const validateTag = [
        'name',
        'categoryId',
        'backCategoryId',
        'price',
        'boxPrice',
        'weight',
        'stock',
        'minBuy',
      ]
      if (Object.keys(this.selectedGood).length == 0) hasNull = true
      // if (this.tableSelection.length == 0) hasNull = true
      const {
        bTime,
        eTime,
        saleDate,
        saleTime: { weeks },
        timeType,
        pictureUrl,
      } = this.formData
      for (var key in this.formData) {
        if (validateTag.includes(key) && !this.formData[key]) {
          hasNull = true
        }
      }
      if (pictureUrl.length == 0) hasNull = true
      if (
        timeType == 1 &&
        (!bTime || !eTime || weeks.length == 0 || saleDate.length == 0)
      )
        hasNull = true
      if (this.materials.length == 0) hasNull = true
      return hasNull
    },
    filterNullProp() {
      let custom = []
      this.customProps.forEach((item) => {
        if (item.label) custom.push(item.label)
      })
      return custom
    },
    validateIpt(key) {
      const float2 = ['price', 'boxPrice']
      const int = ['stock', 'tmfBoxNum', 'weight', 'minBuy']
      if (int.includes(key) && !isInt(this.formData[key])) {
        this.$msg('请输入整数', 'warning')
        this.formData[key] = ''
      }
      if (
        float2.includes(key) &&
        !isDecimal({
          num: this.formData[key],
          digitNum: 2,
        })
      ) {
        this.$msg('请输入2位小数', 'warning')
        this.formData[key] = ''
      }
    },
    // 查询美团门店
    queryStore() {
      return new Promise((resolve) => {
        this.$request('/cn.nezha.api.meituan.Store/queryStores', {}, true).then(
          this.$rw((err, res) => {
            if (!err) {
              this.tableDataByStore = res.result
              this.preTableSelection = this.tableSelection
              const selected = this.tableSelection
              this.tableDataByStore.forEach((item) => {
                item.operate = selected.includes(item.hpName)
              })
            }
            resolve()
          })
        )
      })
    },
  },
})
</script>

<style lang="less" scoped>
section {
  padding-top: 30px;
}
.medium-input {
  width: 240px;
  margin-right: 10px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}
.small-select {
  margin-left: 8px;
  width: 200px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  button {
    height: 30px;
    line-height: 5px;
  }
  &__part {
    margin-top: 20px;
  }
}

.ing-tag {
  margin-right: 6px;
}

.btn-footer {
  text-align: center;
}
.bold-label {
  font-weight: bold;
  font-size: 18px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3,
h3 {
  margin-left: 22px;
}
.add-form-btn-box {
  text-align: center;
}

.props-list {
  padding-left: 190px;
  &__apiece {
    float: left;
    margin: 0 20px 20px 0;
    &:last-of-type {
      margin: 0;
    }
  }
}
</style>

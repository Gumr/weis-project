<template>
  <div class="page-container">
    <section>
      <div v-if="!tfsId" class="section-item">
        <span class="section-label">
          <span style="color: red">*</span>目标门店：
        </span>
        <el-button type="primary" @click="addStore">添加门店</el-button>
        <div style="width: 100%; margin-top: 30px"></div>
        <div
          class="store-list"
          v-if="tableSelection.length > 0"
          style="
            padding-left: 30px;
            width: 100%;
            height: 400px;
            overflow-y: scroll;
          "
        >
          <!-- <span v-for="item in tableSelection" :key="item.id">{{
            item.name + '、'
          }}</span> -->
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
    </section>
    <section>
      <h3>新建美团商品：</h3>
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
    <!-- 成分信息 -->
    <section>
      <h3>美团平台上架信息：</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>商品分类
        </span>
        <BaseSelect
          placeholder="下拉选择分类"
          v-model="formData.category"
          :options="formData.cateOptions"
          filterable
          clearable
        />
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>商品名称：
        </span>
        <el-input
          clearable
          v-model="formData.tmfName"
          class="medium-input"
          placeholder="请输入商品名称"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>商品图片：
        </span>
        <ImageUpload
          v-model:file-list="formData.tmfPictureUrl"
          @upload-success="imgUploadSuccess"
          @delete-success="imgDeleteSuccess"
          :upload-data="{ flag: 'diet-tag' }"
          upload-path="/upload/meituanImage"
          :limit="1"
        />
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>商品类目：
        </span>
        <el-cascader
          :options="FoodDNACategorys"
          v-model="skuMenu"
          :props="optionProps"
          @change="gettags"
          ref="leimu"
        ></el-cascader>
      </div>
      <h3>商品规格：</h3>
      <div class="section-item">
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red">*</span>价格：
          </span>
          <el-input
            clearable
            v-model="formData.tmfPrice"
            @blur="validateIpt('tmfPrice')"
            class="medium-input"
            placeholder="精确到小数点后两位"
          />
        </div>
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red">*</span>库存：
          </span>
          <el-input
            v-if="_type != 'edit'"
            clearable
            v-model="formData.tmfStock"
            @blur="validateIpt('tmfStock')"
            class="medium-input"
            placeholder="请输入整数"
            :disabled="_type == 'edit' ? true : false"
          />
          <span v-if="_type == 'edit'">门店实时库存</span>
        </div>
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red">*</span>包装盒价格：
          </span>
          <el-input
            clearable
            max="8"
            v-model="formData.tmfBoxPrice"
            @blur="validateIpt('tmfBoxPrice')"
            class="medium-input"
            placeholder="精确到小数点后两位"
          />
        </div>
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red">*</span>包装盒数量：
          </span>
          <el-input
            clearable
            v-model="formData.tmfBoxNum"
            @blur="validateIpt('tmfBoxNum')"
            class="medium-input"
            placeholder="请输入整数"
          />
        </div>
        <div class="section-item__part">
          <span class="section-label label-1"> 主料: </span>
          <el-input clearable v-model="zhuliao" class="medium-input" />
        </div>
        <div class="section-item__part">
          <span class="section-label label-1"> 辅料： </span>
          <el-input clearable v-model="fuliao" class="medium-input" />
        </div>
        <div class="section-item__part">
          <span class="section-label label-1"> 口味： </span>
          <el-cascader
            :options="mainpretype"
            :props="optionProps2"
            v-model="kouwei"
            ref="myCascader"
            @change="getKowei"
          ></el-cascader>
        </div>
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red"></span>UPC码:
          </span>
          <el-input
            clearable
            v-model="formData.upcSize"
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
            v-model="formData.skuSize"
            class="medium-input"
            placeholder=""
          />
        </div>
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red"></span>位置码:
          </span>
          <el-input
            clearable
            v-model="formData.locationSize"
            class="medium-input"
            placeholder=""
          />
        </div>
        <div class="section-item__part">
          <span class="section-label label-1">
            <span style="color: red">*</span>份量:
          </span>
          <el-input
            clearable
            v-model="formData.tmfWeight"
            @blur="validateIpt('tmfWeight')"
            class="medium-input"
            placeholder="请输入整数"
          />
          <el-select
            v-model="formData.tmfUnit"
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
        </div>
      </div>

      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red"></span>菜品特殊：</span
        >
        <el-checkbox-group v-model="formData.checkedCategory">
          <el-checkbox label="招牌"></el-checkbox>
          <el-checkbox
            label="套餐"
            v-if="selectedGood.tfsType === '01'"
            :disabled="selectedGood.tfsType === '01'"
          ></el-checkbox>
        </el-checkbox-group>
      </div>

      <div
        class="section-item"
        v-if="formData.checkedCategory.includes('套餐')"
      >
        <span class="section-label label-1">
          <span style="color: red">*</span>套餐适用人数：
        </span>
        <el-input
          clearable
          v-model="formData.tmfApplicableNum"
          class="medium-input"
          placeholder="请输入整数"
        ></el-input>
      </div>
      <div class="section-item">
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
      </div>

      <!-- <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>商品单位：
        </span>
        <el-input
          clearable
          v-model="formData.tmfUnit"
          class="medium-input"
          placeholder="请输入商品单位"
        ></el-input>
      </div> -->
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>最小购买量：
        </span>
        <el-input
          clearable
          v-model="formData.tmfMinBuy"
          @blur="validateIpt('tmfMinBuy')"
          class="medium-input"
          placeholder="请输入整数"
        ></el-input>
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
          <el-checkbox-group v-model="formData.tmfDays">
            <el-checkbox label="monday">周一</el-checkbox>
            <el-checkbox label="tuesday">周二</el-checkbox>
            <el-checkbox label="wednesday">周三</el-checkbox>
            <el-checkbox label="thursday">周四</el-checkbox>
            <el-checkbox label="friday">周五</el-checkbox>
            <el-checkbox label="saturday">周六</el-checkbox>
            <el-checkbox label="sunday">周日</el-checkbox>
          </el-checkbox-group>
          <div style="margin: 10px 0; width: 100%"></div>
          <el-time-select
            placeholder="起始时间"
            v-model="formData.tmfBTime"
            v-bind="{ start: '07:30', step: '00:15', end: '23:30' }"
          />
          -
          <el-time-select
            placeholder="结束时间"
            v-model="formData.tmfETime"
            v-bind="{
              start: '07:30',
              step: '00:15',
              end: '23:30',
              minTime: formData.tmfBTime,
            }"
          />
        </div>
      </div>
    </section>
    <!-- 描述 -->
    <section>
      <h3>描述</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>菜品建议/描述：
        </span>
        <el-input
          clearable
          v-model="formData.tmfIntroduce"
          class="medium-input"
          type="textarea"
          :rows="4"
          placeholder="描述"
        ></el-input>
      </div>
    </section>
    <section class="add-form-btn-box">
      <el-button size="small" type="success" @click="updateFoodInfo">
        保存
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
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import { defineComponent } from 'vue'
import { isInt, isDecimal } from '@/utils/validator'
// import { forIn } from "node_modules/_@types_lodash@4.14.170@@types/lodash";
// import SelectTree from "@/components/SelectTree.vue";
export default defineComponent({
  components: {
    BasePageTable,
    ConfirmDialog,
    ImageUpload,
    // SelectTree,
  },
  data() {
    return {
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
      // 自定义属性
      zhuliao: '',
      fuliao: '',
      kouwei: '',
      customProps: [],
      optionProps: {
        value: 'categoryId',
        label: 'name',
        children: 'child',
        emitPath: false,
      },
      optionProps2: {
        value: 'code',
        label: 'name',
        children: 'child',
        emitPath: false,
      },
      // 选择菜品
      skuMenu: '',
      FoodDNACategorys: [],
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
      defaultProps: {
        children: 'child',
        label: 'name',
      },
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

      formData: {
        category: '', // 商品分类
        cateOptions: [],
        tmfPictureUrl: [],
        tmfPrice: '',
        tmfStock: '',
        tmfBoxPrice: '',
        tmfBoxNum: '',
        upcSize: '',
        skuSize: '',
        locationSize: '',
        tmfWeight: '',
        checkedCategory: ['招牌'],
        tmfUnit: '',
        tmfApplicableNum: '',
        tmfMinBuy: '',
        tmfDays: [],
        tmfBTime: '',
        tmfETime: '',
        tmfIntroduce: '',
        timeType: 0, // 0时间不限，1自定义时间
      },
      templateId: '',
      _type: '',
      tmfSpuExtendlist: '',
      mainName: '',
      mainpreName: '',
      mainpretype: '',
      catalogV: '', // 用户还原下拉框
      catalogF: '',
      skuTagVos: '',
      lastList: '',
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
    const { type, code, tmfId } = this.$route.query
    this._code = code
    this._tmfId = tmfId
    this._type = type
    this.queryFoodCategorys()
    if (type != 'edit') {
      this.queryStore() //查询门店
    }

    this.queryFoodDNACategorys() // 查询美团所有类目

    // 已关联菜品查详情，未关联从前一个页面取
    if (type === 'edit') {
      if (tmfId && code) {
        this.queryDetail()
      } else {
        this.getMeituanGoodData()
      }
    }
  },
  methods: {
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
    gettags() {
      let data = this.skuMenu
      this.templateId = this.$refs.leimu.getCheckedNodes()[0].data.templateId
      this.getPropertiesByCategoryId(data)
    },
    async getPropertiesByCategoryId(data) {
      //根据类目查询模板下所有属性
      // this.skuMenu
      // debugger
      this.$request(
        'cn.nezha.api.meituan.Food/getPropertiesByCategoryId',
        {
          categoryId: data,
        },
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            const object = res.result
            for (let i = 0; i < object.length; i++) {
              if (object[i].name == '主料') {
                this.mainName = object[i]
              }
              if (object[i].name == '辅料') {
                this.mainpreName = object[i]
              }
              if (object[i].name == '口味') {
                this.mainpretype = this.getTreeData(object[i].child)
                this.lastList = object[i]
              }
            }
          }
        })
      )
    },
    queryDetail() {
      this.$request(
        'cn.nezha.api.meituan.Food/queryFoodInfo',
        {
          appFoodCode: this._code,
          tmfId: this._tmfId,
        },
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            const {
              tmfId,
              tmfCid,
              tfsEnergy,
              tmfsEnergy,
              tfsQuality,
              tfsUnit,
              tfsPrice,
              tmfPrice,
              tmfType,
              tmfCategory,
              tmfPublishStore,
              tmfSaleTime,
              tmfPictureUrl,
              mtPirtureUrl,
              storeAddrs,
              tmfSpeciality,
              cname,
              tmfSpuExtendlist,
            } = res.result
            let saleTime = tmfSaleTime ? JSON.parse(tmfSaleTime) : {}
            this.formData = {
              ...res.result,
              category: tmfCategory,
              checkedCategory: [],
              tmfPictureUrl: [
                {
                  name: '',
                  url: mtPirtureUrl,
                },
              ],
              cateOptions: this.formData.cateOptions,
              tmfDays: [],
              timeType: Object.keys(saleTime).length == 0 ? 0 : 1,
            }
            this._imgUrl = tmfPictureUrl
            if (tmfType == '01') this.formData.checkedCategory.push('套餐')
            if (tmfSpeciality == 1) this.formData.checkedCategory.push('招牌')
            // 自定义时间
            if (Object.keys(saleTime).length > 0) {
              for (var key in saleTime) {
                this.formData.tmfDays.push(key)
                this.formData.tmfBTime = saleTime[key].split('-')[0]
                this.formData.tmfETime = saleTime[key].split('-')[1]
              }
            }
            // 目标门店
            JSON.parse(tmfPublishStore).forEach((item, index) => {
              this.tableSelection.push({
                name: storeAddrs[index].name,
                address: storeAddrs[index].address,
                app_poi_code: item,
              })
            })
            // 菜品
            this._id = tmfId
            this.selectedGood = {
              tfsType: tmfType,
              tfsCid: tmfCid,
              tfsQuality: tfsQuality,
              tfsUnit: tfsUnit,
              tfsPrice: tfsPrice,
              tfsEnergy: tmfType == '01' ? tmfsEnergy : tfsEnergy,
              tfsSkuname: cname,
            }
            //类目
            let listdata = JSON.parse(tmfSpuExtendlist)
            //  debugger
            this.zhuliao = listdata[0].value
            this.fuliao = listdata[1] ? listdata[1].value : ''
            this.skuMenu = listdata[0].category_id
            this.getPropertiesByCategoryId(listdata[0].category_id)
            this.kouwei = listdata[2] ? listdata[2].value_id : ''
            this.selkw = listdata[2] ? listdata[2] : ''

            this.templateId = listdata[0].template_id
          }
        })
      )
    },
    // 未关联，直接取美团上的菜品信息
    getMeituanGoodData() {
      const goodData = JSON.parse(sessionStorage.getItem('good-data'))
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
          this.formData.tmfDays.push(key)
          const saleTime = availableTimes[key].replace(/\"/g, '')
          this.formData.tmfBTime = saleTime.split('-')[0]
          this.formData.tmfETime = saleTime.split('-')[1]
        }
      }
      this.formData.timeType = this.formData.tmfDays.length > 0 ? 1 : 0
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
    // 查询美团门店
    queryStore() {
      return new Promise((resolve) => {
        this.$request('/cn.nezha.api.meituan.Store/queryStores', {}, true).then(
          this.$rw((err, res) => {
            if (!err) {
              this.tableDataByStore = res.result
              this.tableSelection = res.result
              // this.preTableSelection = this.tableSelection
              // const selected = this.tableSelection
              // this.tableDataByStore.forEach((item) => {
              //   item.operate = selected.includes(item.hpName)
              // })
            }
            resolve()
          })
        )
      })
    },

    queryFoodDNACategorys() {
      this.$request(
        '/cn.nezha.api.meituan.Food/queryFoodDNACategorys',
        {},
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            this.FoodDNACategorys = this.getTreeData(res.result)
            // res.result.forEach((item) => {
            //   this.options.push({
            //     label: item.name,
            //     value: item.categoryId,
            //   });
            // });
          }
        })
      )
    },
    getTreeData(data) {
      // 处理类目数据格式
      for (let index = 0; index < data.length; index++) {
        if (data[index].child.length < 1) {
          data[index].child = undefined
        } else {
          this.getTreeData(data[index].child)
        }
      }
      return data
    },
    // 查询商品分类
    queryFoodCategorys() {
      this.$request(
        '/cn.nezha.api.meituan.Food/queryFoodCategorys',
        {},
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            res.result.forEach((item) => {
              this.formData.cateOptions.push({
                label: item.name,
                value: item.name,
              })
            })
          }
        })
      )
    },
    getKowei() {
      this.selkw = this.$refs.myCascader.getCheckedNodes()[0]
    },
    updateFoodInfo() {
      let stores = []
      let saleTime = {}
      const {
        tmfName,
        category,
        tmfIntroduce,
        tmfPrice,
        tmfStock,
        tmfBoxPrice,
        tmfBoxNum,
        upcSize,
        skuSize,
        locationSize,
        tmfWeight,
        tmfApplicableNum,
        tmfUnit,
        tmfMinBuy,
        tmfDays,
        timeType,
        tmfETime,
        tmfBTime,
        checkedCategory,
        tmfPictureUrl,
      } = this.formData

      const { tfsCid, tfsSkuname } = this.selectedGood
      this.tableSelection.forEach((item) => {
        stores.push(item.app_poi_code)
      })
      tmfDays.forEach((day) => {
        saleTime[day] = `${tmfBTime}-${tmfETime}`
      })
      const hasNull = this.validateFn()
      // if (!this._imgUploaded) return
      if (hasNull) {
        this.$message.warning('必填值为空')
        return
      }

      //   mainpreName mainpretype
      debugger
      let wmProductSpuExtendList = []
      if (this.mainName) {
        this.mainName.value = this.zhuliao //主料
        this.mainName.category_id = this.skuMenu
        this.mainName.template_id = this.templateId
        wmProductSpuExtendList.push(this.mainName)
      }
      if (this.mainpreName) {
        //辅料
        this.mainpreName.value = this.fuliao
        this.mainpreName.category_id = this.skuMenu
        wmProductSpuExtendList.push(this.mainpreName)
      }
      if (this.selkw) {
        // 口味
        let kwlist = this.selkw.parent ? this.selkw.parent.data : this.lastList
        kwlist.value = this.selkw.parent
          ? this.selkw.data.name
          : this.selkw.label
        kwlist.value_id = this.selkw.parent
          ? this.selkw.data.code
          : this.selkw.value
        kwlist.category_id = this.skuMenu
        kwlist.template_id = this.templateId
        delete kwlist.child
        // this.selkw.data.category_id = this.skuMenu;
        // this.selkw.data.value_id = this.kouwei;
        // // this.selkw.value = this.selkw ? this.selkw.name : "";
        // this.selkw.data.code = this.selkw.parent?this.selkw.parent.data.code:this.selkw.data.code,
        // // this.selkw.name = this.lastList.name
        // this.selkw.data.template_id = this.templateId
        // // delete this.lastList.child;
        wmProductSpuExtendList.push(kwlist)
      }
      this.$request(
        '/cn.nezha.api.meituan.Food/updateFoodInfo',
        {
          id: this._id,
          foodCid: tfsCid,
          foodCode: this._code ? this._code : tfsCid,
          category: category,
          name: tmfName,
          description: tmfIntroduce,
          price: tmfPrice,
          stock: tmfStock,
          boxPrice: tmfBoxPrice,
          boxNum: tmfBoxNum,
          upcSize: upcSize,
          skuSize: skuSize,
          locationSize: locationSize,
          weight: tmfWeight,
          foodType: checkedCategory.includes('套餐') ? '01' : '00', // 套餐：01 单品：00
          speciality: checkedCategory.includes('招牌') ? 1 : 2, // 是否为招牌 1是 2否
          applicableNum: tmfApplicableNum,
          unit: tmfUnit,
          minBuy: tmfMinBuy,
          publishStore: stores, // 目标门店
          saleTime: timeType == '1' ? saleTime : {}, // 不传或传空则为 时间不限
          pictureUrl: this._imgUrl,
          otherAttrs: this.filterNullProp(),
          wmProductSpuExtendList: wmProductSpuExtendList,
        },
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$message.success('创建成功')
            this.$router.go(-1)
          } else {
            this.$message.warning(err.errMsg)
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
        'category',
        'tmfName',
        'tmfPictureUrl',
        'tmfPrice',
        'tmfStock',
        'tmfBoxPrice',
        'tmfBoxNum',
        'tmfMinBuy',
        'tmfIntroduce',
        'tmfApplicableNum',
      ]
      if (Object.keys(this.selectedGood).length == 0) hasNull = true
      if (this.tableSelection.length == 0) hasNull = true
      const { tmfBTime, tmfETime, tmfDays, timeType, checkedCategory } =
        this.formData
      for (var key in this.formData) {
        if (validateTag.includes(key)) {
          // 套餐下未填写适用人数
          if (key === 'tmfApplicableNum') {
            if (checkedCategory.includes('套餐') && !this.formData[key]) {
              hasNull = true
            }
          } else if (key === 'tmfPictureUrl') {
            if (this.formData[key].length == 0) hasNull = true
          } else if (key === 'timeType') {
            if (
              timeType == 1 &&
              (!tmfBTime || !tmfETime || tmfDays.length == 0)
            )
              hasNull = true
          } else if (!this.formData[key] && this.formData[key] != 0) {
            hasNull = true
          }
        }
      }
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
      const float2 = ['tmfPrice', 'tmfBoxPrice']
      const int = ['tmfStock', 'tmfBoxNum', 'tmfWeight', 'tmfMinBuy']
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

<template>
  <div class="page-container">
    <div class="section-item">
      <span class="section-label label-1">关联ERP组织：</span>
      <BaseSelect
        v-model="formData.thpKingdeeOrgId"
        class="medium-input"
        filterable
        clearable
        :options="erpOptions"
      ></BaseSelect>
    </div>
    <div class="section-item">
      <span class="section-label label-1">组织ID：</span>
      <span>{{ formData.thpKingdeeOrgId }}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">加热点负责人：</span>
      <BaseSelect
        v-model="formData.thpLeaderUid"
        class="medium-input"
        filterable
        clearable
        :options="heatPointUser"
      ></BaseSelect>
    </div>
    <div class="section-item">
      <span class="section-label label-1">手机：</span>
      <el-input
        v-model="formData.thpShopTel"
        class="medium-input"
        maxlength="11"
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">加热点名称：</span>
      <el-input
        v-model="formData.thpName"
        class="medium-input"
      ></el-input>
    </div>
      <div class="section-item">
      <span class="section-label label-1">所属区域仓：</span>
      <BaseSelect
        v-model="formData.thpStoreID"
        class="medium-input"
        filterable
        clearable
        :options="HeatPointWarehouse"
      ></BaseSelect>
    </div>
    <div class="section-item">
      <span class="section-label label-1">加热点性质：</span>
      <el-radio-group v-model="formData.thpIsOpen">
        <el-radio :label="1">正常</el-radio>
        <el-radio :label="2">虚拟</el-radio>
        <el-radio :label="0">虚拟（内部员工可见）</el-radio>
      </el-radio-group>
    </div>
    <div class="section-item">
      <span class="section-label label-1">是否限定配送范围：</span>
      <el-radio-group v-model="formData.thpScopeFlag">
        <el-radio label="10">是</el-radio>
        <el-radio label="00">否</el-radio>
      </el-radio-group>
    </div>
    <div class="section-item">
      <span class="section-label label-1">加热点位置：</span>
      <el-cascader
        v-model="address"
        class="medium-input"
        clearable
        size="large"
        :options="cityOptions"
        @change="handleChange"
      ></el-cascader>
    </div>
    <div class="section-item">
      <span class="section-label label-1">详细地址：</span>
      <el-input
        v-model="formData.thpShopAddress"
        class="medium-input"
        @blur="getlocation"
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">营业时间：</span>
      <el-time-select
        :key="count"
        v-model="formData.thpStime"
        class="mini-input"
        v-bind="{ start: '07:00', step: '00:01', end: '24:00' }"
        placeholder="选择时间"
      ></el-time-select>
      <span style="margin: 0 10px">-</span>
      <el-time-select
        :key="count"
        v-model="formData.thpEtime"
        class="mini-input"
        v-bind="{
          start: '07:00',
          step: '00:01',
          end: '24:00',
          minTime: formData.thpStime,
        }"
        placeholder="选择时间"
      ></el-time-select>
    </div>
    <div
      class="section-item"
      style="align-items: flex-start; margin: -20px 0"
    >
      <span
        class="section-label label-1"
        style="margin-top: 28px"
      >餐别供应时间：</span>
      <!--      <div class="day-group">
        <div :class="['radio', index == activeIndex ? 'active' : '']" v-for="(item, index) in supplyConfBeans" :key="index" @click="activeIndex = index">{{item.label}}</div>
      </div>-->
      <span v-if="supplyConfBeans.length">
        <div
          v-for="(item, index) in supplyConfBeans[activeIndex].tList"
          v-if="index != 3"
          :key="index"
          class="section-item"
        >
          <el-checkbox
            v-model="item.thscStt"
            :checked="item.thscStt == 'true'?true:false"           
            style="margin:6px 6px"
          ></el-checkbox>
          {{ item.thscCategoryName }}：
          <el-time-select
            v-model="item.thscStime"
            class="tiny-input"
            v-bind="{ start: '07:00', step: '00:01', end: '24:00' }"
            placeholder="选择时间"
          ></el-time-select>
          <span style="margin: 0 10px">-</span>
          <el-time-select
            v-model="item.thscEtime"
            class="tiny-input"
            v-bind="{
              start: '07:00',
              step: '00:01',
              end: '24:00',
              minTime: item.thscStime,
            }"
            placeholder="选择时间"
          ></el-time-select>
        </div>
      </span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">配送方式</span>
      <el-radio-group v-model="formData.thpSelfTaking">
        <el-radio :label="0">配送</el-radio>
        <el-radio :label="2">自取</el-radio>
        <el-radio :label="1">配送与自取</el-radio>
      </el-radio-group>
    </div>
    <div
      class="section-item"
      v-if="formData.thpSelfTaking == 1 || formData.thpSelfTaking == 0"
    >
      <span class="section-label label-1">配送冷热模式</span> 
        <el-checkbox-group v-model="test">
          <el-checkbox  label="01">冷链</el-checkbox>
          <el-checkbox  label="10">热食</el-checkbox>
        </el-checkbox-group> 
    </div>

    <div
      class="section-item"
      v-if="formData.thpSelfTaking == 1"
    >
      <span class="section-label label-1">默认取餐方式</span>
      <el-radio-group v-model="formData.thpTakeMeals">
        <el-radio label="01">配送</el-radio>
        <el-radio label="02">自取</el-radio>
      </el-radio-group>
    </div>
    <div
      v-if="formData.thpSelfTaking != '2'"
      class="section-item"
    >
      <span class="section-label label-1">配送公司：</span>
      <div class="day-group">
        <div
          v-for="(item, index) in shipConfBeans"
          :key="index"
          :class="['radio', index == shipIndex ? 'active' : '']"
          @click="shipIndex = index"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
    <div
      v-if="
        (formData.thpSelfTaking == '0' && shipConfBeans.length) ||
        (formData.thpSelfTaking == '1' && shipConfBeans.length)
      "
      class="section-item"
    >
      <span class="section-label label-1"></span>
      <div class="shipBlock">
        是否启用：
        <el-checkbox v-model="shipConfBeans[shipIndex].check"></el-checkbox>
      </div>
      <div
        v-for="(item, index) in shipConfBeans[shipIndex].tList"
        :key="index"
        class="shipBlock"
      >
        <span>{{ item.minKm }} ＜公里数 ≤ {{ item.maxKm }}</span>配送费
        <el-input
          v-model="item.shipFee"
          class="input"
          :disabled="!shipConfBeans[shipIndex].check"
          @blur="checkText(index, 'shipFee')"
        ></el-input>优惠金额
        <el-input
          v-model="item.discounts"
          class="input"
          :disabled="!shipConfBeans[shipIndex].check"
          @blur="checkText(index, 'discounts')"
        ></el-input>
      </div>
      <div class="shipBlock">
        <div
          class="section-label"
          style="margin-right: 10px"
        >对接配送ID：</div>
        <el-input
          v-model="shipConfBeans[shipIndex].exValue"
          class="medium-input"
        ></el-input>
      </div>
    </div>
    <div class="section-item">
      <span class="section-label label-1">有效状态</span>
      <el-radio-group v-model="formData.thpDataStt">
        <el-radio label="01">上线</el-radio>
        <el-radio label="00">下线</el-radio>
      </el-radio-group>
    </div>
    <h3>配送范围</h3>
    <div
      class="section-item"
      style="padding-left: 140px"
    >
      <el-button
        type="primary"
        class="mini-btn"
        :loading="loading"
        @click="handleConfrim"
      >确定</el-button>
      <el-button
        class="mini-btn"
        @click="cancel"
      >取消</el-button>
    </div>
    <div id="container"></div>
    <div class="mapBtn">
      <div style="width: 200px">
        <el-radio-group
          v-model="drawType"
          @change="radioChange"
        >
          <!-- <el-radio label="circle">画圆</el-radio> -->
          <el-radio label="polygon">画多边形</el-radio>
          <el-radio label="text">输入经纬度</el-radio>
        </el-radio-group>
      </div>
      <el-input
        v-model="mapLng"
        style="margin: 10px 0"
        :disabled="drawType != 'text'"
        @blur="drawEditor"
      />
      <div>
        <el-button
          v-if="!isEditMap && type == 'edit' && !isEditClear"
          type="primary"
          size="mini"
          @click="polyEditorStart"
        >
          开始编辑
        </el-button>
        <el-button
          v-if="isEditMap && type == 'edit' && !isEditClear"
          type="primary"
          size="mini"
          @click="polyEditorEnd"
        >
          结束编辑
        </el-button>
        <el-button
          v-if="!isEditMap"
          type="primary"
          size="mini"
          @click="endDraw"
        >关闭绘图</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="clear"
        >清除</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { regionData, CodeToText, TextToCode } from "@/utils/regon-data.js";
import BaseSelect from "@/components/BaseSelect.vue";

const AMap = window.AMap;

export default {
  components: {
    BaseSelect,
  },
  data() {
    return {
      HeatPointWarehouse:[],
      test: [],
      count: 0,
      // 地图
      mapLng: "",
      drawType: "",
      map: null,
      marker: [],
      mouseTool: null,
      isEditMap: false,
      isEditClear: false,
      overlays: [],
      polyEditor: null,
      polygon: null,
      // 基础数据
      type: "",
      activeIndex: 0,
      shipIndex: 0,
      loading: false,
      mapMaker: null,
      cityOptions: regionData,
      erpOptions: [], // 关联erp组织
      thpKingdeeOrgName: "",
      heatPointUser: [], // 加热点负责人
      shipTypeOpts: [], // 配送公司
      address: [],
      supplyConfBeans: [], // 餐别供应时间
      shipConfBeans: [], // 配送费
      formData: {
        thpStoreID:'',
        thpShipMode:'',
        thpScopeFlag: "10",
        thpShipType: "",
        thpShopLeader: "",
        thpLeaderUid: "",
        thpShopTel: "",
        thpName: "",
        thpType: "",
        thpShopAddress: "",
        thpLatitude: "",
        thpLongitude: "",
        thpDesc: "",
        thpFoodDeliveryPrice: "",
        thpIsOpen: 1,
        thpStime: "07:45",
        thpEtime: "19:30",
        thpDistributionScope: 0,
        thpHeatingPointRange: [],
        thpDrawingPath: [],
        thpSelfTaking: 1,
        thpTakeMeals: "01",
        thpDataStt: "01",
        thpKingdeeOrgId: "",
        thpKingdeeOrgName: "",
        thpShopAddrProvince: "",
        thpShopAddrCity: "",
        thpShopAddrArea: "",
      },
    };
  },
  watch: {},
  created() {
    this.type = this.$route.query.type;
    this.getHeatPointByUser();
    this.queryKingdeeOrgList();
    this.getQueryPointDetail();
    this.queryHeatPointWarehouseList()
  },
  unmounted() {
    this.map.destroy();
  },
  methods: {
    // 保存
    async handleConfrim() {
      const res = this.checkInfo();
      if (res) {
        const shipConfBeans = this.$deepClone(this.shipConfBeans);
        shipConfBeans.forEach((item) => {
          item.tList.forEach((pay) => {
            (pay.discounts *= 100), (pay.shipFee *= 100);
          });
        });
        this.supplyConfBeans.forEach((item) => {
          item.tList[3].thscStime = this.formData.thpStime;
          item.tList[3].thscEtime = this.formData.thpEtime;
        });
        const kingdee = this.erpOptions.find(
          (item) => item.value == this.formData.thpKingdeeOrgId
        );
        const params = {
          ...this.formData,
          thpShopLeader: this.formData.thpLeaderUid,
          shipConfBeans,
          supplyConfBeans: this.supplyConfBeans,
          thpKingdeeOrgName: kingdee ? kingdee.label : this.thpKingdeeOrgName,
        };
        if (this.$route.query.thpId) {
          params.thpId = this.$route.query.thpId;
        }
         
        params.thpShipMode = this.test.length>1?11:this.test.length>0?this.test[0]:'00'
        this.loading = true;
        const url =
          this.type === "add"
            ? "HeatingPoint/addPoint"
            : "HeatingPoint/updatePoint";
        const res = await this.$http(url, params);
        this.loading = false;

        if (!res.errMsg) {
          this.$msg("操作成功", "success");
          this.$closeRoute();
        } else {
          this.$msg(res.errMsg, "error");
        }
      }
    },
    cancel() {
      this.$closeRoute();
    },
    // 配送与配送费详情
    checkText(index, type) {
      let num = this.shipConfBeans[this.shipIndex].tList[index][type];
      num = isNaN(num) ? 0 : num;
      num = Number(Math.abs(num)).toFixed(1);
      this.shipConfBeans[this.shipIndex].tList[index][type] = num;
    },
    async getQueryPointDetail() {
      const params = this.$route.query.thpId
        ? { thpId: this.$route.query.thpId }
        : {};

      const res = await this.$http("HeatingPoint/queryPointDetail", params);

      this.supplyConfBeans = res.obj.pointBean.supplyConfBeans; // 餐别供应时间
      this.shipConfBeans = res.obj.pointBean.shipConfBeans; // 配送费
      this.thpKingdeeOrgName = res.obj.pointBean.thpKingdeeOrgName || "";

      const shipConfBeans = this.$deepClone(this.shipConfBeans);
      shipConfBeans.forEach((item) => {
        item.tList.forEach((pay) => {
          (pay.discounts = Number(pay.discounts) / 100),
            (pay.shipFee = Number(pay.shipFee) / 100);
        });
      });
      this.shipConfBeans = shipConfBeans;
      this.test = res.obj.pointBean.thpShipMode == '10'?['10']:res.obj.pointBean.thpShipMode == '01'?['01']:res.obj.pointBean.thpShipMode == '11'?['10','01']:['10']
      if (this.$route.query.thpId) {
        Object.assign(this.formData, res.obj.pointBean);
        this.formData.thpLeaderUid = String(this.formData.thpLeaderUid);
        this.count += 1;
        this.formData.thpStoreID =this.formData.thpStoreId == 0?'': String(this.formData.thpStoreId)
      
       this.address =
          TextToCode[this.formData.thpShopAddrProvince][
            this.formData.thpShopAddrCity
          ][this.formData.thpShopAddrArea].code;
        this.$nt(() => this.editMap());
      } else {
        this.$nt(() => this.initMap());
      }
    },
    // 加热点负责人
    async getHeatPointByUser() {
      const res = await this.$http("sys.User/queryUsersByPhone", {});
      this.heatPointUser = res.obj.userBeans.map((item) => ({
        label: `${item.phone} (${item.uname})`,
        value: String(item.uid),
      }));
    },
    // 关联erp组织
    async queryKingdeeOrgList() {
      const res = await this.$http("HeatingPoint/queryKingdeeOrgList", {});
      if (!res.obj) return;
      this.erpOptions = res.obj.map((item) => ({
        label: item.kingdeeOrgName,
        value: item.kingdeeOrgId,
      }));
    },
    //区域仓列表
    async queryHeatPointWarehouseList() {    
      const res = await this.$http("HeatPointWarehouse/queryHeatPointWarehouseList", {});
      if (!res.obj) return;
      this.HeatPointWarehouse = res.obj.map((item) => ({
        label: item.thpwName,
        value: item.thpwId,
      }));

    },
    // 选择地址
    handleChange(value) {
      this.formData.thpShopAddrProvince = CodeToText[value[0]];
      this.formData.thpShopAddrCity = CodeToText[value[1]];
      this.formData.thpShopAddrArea = CodeToText[value[2]];
      this.getlocation();
    },
    async getlocation() {
      if (this.address.length && this.formData.thpShopAddress) {
        const address = `中国${this.formData.thpShopAddrProvince}${this.formData.thpShopAddrCity}${this.formData.thpShopAddrArea}`;
        AMap.plugin("AMap.PlaceSearch", () => {
          const placeSearch = new AMap.PlaceSearch({
            city: this.formData.thpShopAddrCity,
            autoFitView: true,
            map: this.map,
            citylimit: true,
          });
          placeSearch.search(this.formData.thpShopAddress, (status, result) => {
            if (status == "no_data") {
              this.$msg("请输入正确的查询地址", "error");
              return;
            }
            this.formData.thpLatitude = "";
            this.formData.thpLongitude = "";
            this.map.clearMap();
            this.marker = [];
            for (const poi of result.poiList.pois) {
              const marker = new AMap.Marker({
                map: this.map,
                position: poi.location,
                title: poi.name,
                icon: new AMap.Icon({
                  image:
                    "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
                  size: new AMap.Size(25, 34),
                  imageSize: new AMap.Size(25, 34),
                }),
              });
              marker.on("click", this.markerClick);
              this.marker.push(marker);
            }
            this.map.add(this.marker);
          });
        });
      }
    },
    markerClick(e) {
      let index = 0;
      const target = e.target.getPosition();
      for (const i in this.marker) {
        this.marker[i].setIcon(
          new AMap.Icon({
            image:
              "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
            size: new AMap.Size(25, 34),
            imageSize: new AMap.Size(25, 34),
          })
        );
        const marker = this.marker[i].getPosition();
        if (marker.lat == target.lat && marker.lng == target.lng) {
          index = i;
        }
      }
      this.marker[index].setIcon(
        new AMap.Icon({
          image:
            "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
          size: new AMap.Size(25, 34),
          imageSize: new AMap.Size(25, 34),
        })
      );
      this.formData.thpLongitude = target.lng;
      this.formData.thpLatitude = target.lat;
    },
    // 高德地图
    initMap() {
      this.map = new AMap.Map("container", {
        zoom: 14, // 级别
        center: [113.953045, 22.54097],
        resizeEnable: true,
      });
      const marker = new AMap.Marker({
        position: [113.930478, 22.533191],
      });
      this.map.add(marker);
      this.map.plugin(["AMap.MouseTool"], () => {
        this.mouseTool = new AMap.MouseTool(this.map);
        this.mouseTool.on("draw", (e) => {
          this.refreshData();
          this.overlays.push(e.obj);
          const location = e.obj.getPath();
          for (const item of location) {
            this.formData.thpHeatingPointRange.push([item.lng, item.lat]);
            this.formData.thpDrawingPath.push({ lng: item.lng, lat: item.lat });
          }
        });
      });
    },
    editMap() {
      this.map = new AMap.Map("container", {
        zoom: 14,
        center: [
          Number(this.formData.thpLongitude),
          Number(this.formData.thpLatitude),
        ],
        resizeEnable: true,
      });
      const marker = new AMap.Marker({
        position: [
          Number(this.formData.thpLongitude),
          Number(this.formData.thpLatitude),
        ],
      });
      this.map.add(marker);
      const path = this.$deepClone(this.formData.thpHeatingPointRange);
      this.polygon = new AMap.Polygon({
        path,
        strokeWeight: 6,
        strokeOpacity: 0.2,
        fillOpacity: 0.4,
        fillColor: "#00b0ff",
        strokeColor: "#80d8ff",
        zIndex: 50,
      });
      this.map.add(this.polygon);
      this.polyEditor = new AMap.PolyEditor(this.map, this.polygon);

      this.polyEditor.on("end", (event) => {
        const location = event.target.getPath();
        this.formData.thpDrawingPath = location.map((item) => ({
          lng: item.lng,
          lat: item.lat,
        }));
        this.formData.thpHeatingPointRange = location.map((item) => [
          item.lng,
          item.lat,
        ]);
      });
      this.map.plugin(["AMap.MouseTool"], () => {
        this.mouseTool = new AMap.MouseTool(this.map);
        this.mouseTool.on("draw", (e) => {
          this.refreshData();
          this.overlays.push(e.obj);
          const location = e.obj.getPath();
          for (const item of location) {
            this.formData.thpDrawingPath.push({ lng: item.lng, lat: item.lat });
            this.formData.thpHeatingPointRange.push([item.lng, item.lat]);
          }
        });
      });
    },
    drawEditor() {
      if (!this.mapLng) return;
      this.refreshData();
      const paths = JSON.parse(this.mapLng);
      this.formData.thpHeatingPointRange = paths;
      this.formData.thpLongitude = this.formData.thpLongitude
        ? Number(this.formData.thpLongitude)
        : 113.953045;
      this.formData.thpLatitude = this.formData.thpLatitude
        ? Number(this.formData.thpLatitude)
        : 22.54097;
      this.editMap();
    },
    polyEditorStart() {
      this.isEditMap = true;
      this.radioChange("polygon");
      this.polyEditor.open();
    },
    polyEditorEnd() {
      this.isEditMap = false;
      this.polyEditor.close();
    },
    radioChange(type) {
      switch (type) {
        case "circle": {
          this.mouseTool.circle({
            fillColor: "#00b0ff",
            strokeColor: "#80d8ff",
          });
          break;
        }
        case "polygon": {
          this.mouseTool.polygon({
            fillColor: "#00b0ff",
            strokeColor: "#80d8ff",
          });
          this.mapLng = "";
          break;
        }
      }
    },
    endDraw() {
      this.drawType = "";
      this.isEditMap = false;
      this.mouseTool.close(false);
    },
    clear() {
      this.isEditClear = true;
      this.isEditMap = false;
      this.drawType = "";
      this.overlays = [];
      this.formData.thpHeatingPointRange = [];
      this.formData.thpDrawingPath = [];
      this.mouseTool.close(true);
      if (this.polygon) {
        this.map.remove(this.polygon);
        // this.polyEditor.close()
      }
    },
    refreshData() {
      this.isEditClear = true;
      this.overlays = [];
      this.formData.thpHeatingPointRange = [];
      this.formData.thpDrawingPath = [];
      this.map.remove(this.overlays);
      if (this.polygon) {
        this.map.remove(this.polygon);
        // this.polyEditor.close()
      }
    },
    // 数据校验
    checkInfo() {
      if (!this.formData.thpKingdeeOrgId) {
        this.$msg("请选择erp组织", "error");
        return false;
      }
      if (!this.formData.thpLeaderUid) {
        this.$msg("请选择加热点负责人", "error");
        return false;
      }
      if (!this.formData.thpShopTel) {
        this.$msg("请输入手机号", "error");
        return false;
      }
      if (!this.formData.thpName) {
        this.$msg("请输入加热点名称", "error");
        return false;
      }
      if (!this.address.length) {
        this.$msg("请选择加热点位置", "error");
        return false;
      }
      if (!this.formData.thpShopAddress) {
        this.$msg("请输入详细地址", "error");
        return false;
      }
      if (!this.formData.thpStime || !this.formData.thpEtime) {
        this.$msg("请选择营业时间", "error");
        return false;
      }
      // 校验餐别供应时间
      for (const index in this.supplyConfBeans) {
        const beans = this.supplyConfBeans[index];
        for (const inx in beans.tList) {
          const date = beans.tList[inx];
          if (inx != 3) {
            if (!date.thscStime || !date.thscEtime) {
              this.$msg(`请选择${date.thscCategoryName}供应时间`, "error");
              return false;
            }
            if (date.thscStime < this.formData.thpStime) {
              this.$msg(
                `${date.thscCategoryName}供应开始时间不能早于营业时间`,
                "error"
              );
              return false;
            }
            if (date.thscEtime > this.formData.thpEtime) {
              this.$msg(
                `${date.thscCategoryName}供应结束时间不能晚于营业时间`,
                "error"
              );
              return false;
            }
          }
        }
      }
      // 校验配送费
      if (this.formData.thpSelfTaking !== "2") {
        for (const index in this.shipConfBeans) {
          const beans = this.shipConfBeans[index];
          if (beans.check) {
            for (const pay of beans.tList) {
              if (!pay.shipFee) {
                this.$msg(`${beans.label}的配送费没有填写完成`, "error");
                return false;
              }
            }
            if (!beans.exValue) {
              this.$msg(`${beans.label}的对接配送ID不能为空`, "error");
              return false;
            }
          }
        }
      }
      if (!this.formData.thpLatitude) {
        this.$msg("请在地图上选择一个标记点", "error");
        return false;
      }
      if (!this.formData.thpHeatingPointRange.length) {
        this.$msg("请画出配送范围", "error");
        return false;
      }
      if (this.isEditMap) {
        this.$msg("尚未保存编辑，请结束编辑", "error");
        return false;
      }
      return true;
    },
  },
};
</script>

<style lang="less" scoped>
.page-container {
  position: relative;
}
.mapBtn {
  position: absolute;
  right: 50px;
  bottom: 40px;
  z-index: 999;
  background-color: white;
  display: flex;
  flex-wrap: wrap;
  word-wrap: break-word;
  width: 240px;
  height: 120px;
  border-width: 0;
  border-radius: 10px;
  box-shadow: 0 2px 6px 0 rgba(114, 124, 245, 0.5);
  padding: 10px 20px;
  div {
    display: flex;
    align-items: center;
  }
}
#container {
  min-width: 600px;
  min-height: 767px;
}
#panel {
  position: absolute;
  background-color: white;
  max-height: 90%;
  overflow-y: auto;
  top: 10px;
  right: 10px;
  width: 280px;
}

h3 {
  margin-right: 20px;
}
h4 {
  margin: 10px 0;
}
section {
  padding-top: 30px;
}
.mini-input {
  width: 162px;
}
.mini-btn {
  width: 172px;
}
.medium-picker {
  width: 300px;
}
.medium-input {
  width: 350px;
  margin-right: 20px;
}
.max-input {
  width: 350px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 138px;
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
  min-height: 30px;
  flex-wrap: wrap;
  button {
    height: 38px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 130px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 210px;
}

.label-3,
h3 {
  margin-left: 22px;
}
.day-group {
  width: 900px;
  height: auto;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.radio {
  width: 85px;
  font-size: 14px;
  height: 38px;
  border: 1px solid #dcdfe6;
  color: #606266;
  text-align: center;
  line-height: 38px;
  cursor: pointer;
  margin-right: -1px;
  margin-bottom: -1px;
}
.active {
  background-color: #409eff !important;
  border: 1px solid #409eff !important;
  color: white !important;
}
.success {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}
.shipBlock {
  display: block;
  width: 100%;
  margin-left: 140px;
  margin-bottom: 10px;
  span {
    width: 140px;
    display: inline-block;
    margin-right: 40px;
    text-align-last: justify;
  }
  .input {
    width: 100px !important;
    margin: 0 10px !important;
    text-align: center !important;
  }
}
</style>

<template>
  <div class="page-container">
    <div class="section-item">
      <span class="section-label label-1">自提点名称：</span>
      <el-input
        v-model="formData.thpsName"
        class="medium-input"
        filterable
        clearable
        :options="atmOptions"
      ></el-input>
    </div>

    <div class="section-item">
      <span class="section-label label-1">位置：</span>
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
        v-model="formData.thpsAddress "
        class="medium-input"
        @blur="getlocation"
        clearable
      ></el-input>
    </div>

    <div class="section-item">
      <span class="section-label label-1">关联门店：</span>
      <BaseSelect
        v-model="formData.thpsPointId"
        class="medium-input"
        filterable
        clearable
        :options="heatPointOptions"
      ></BaseSelect>
    </div>
    <div class="section-item">
      <span class="section-label label-1">餐别供应截止时间：</span>
      <div>
        <div class="section-item">
          <span>早餐：</span>
          <el-time-select
            class="tiny-input"
            v-model="formData.thpsBreakfastTime"
            v-bind="{
              start: '07:00',
              step: '00:30',
              end: '24:00',
            
            }"
            placeholder="选择时间"
          ></el-time-select>
        </div>
        <div class="section-item">
          <span>午餐：</span>
          <el-time-select
            class="tiny-input"
            v-model="formData.thpsLunchTime"
            v-bind="{
              start: '07:00',
              step: '00:30',
              end: '24:00',  
              minTime: formData.thpsBreakfastTime,        
            }"
            placeholder="选择时间"
          ></el-time-select>
        </div>
        <span>晚餐：</span>
        <el-time-select
          class="tiny-input"
          v-model="formData.thpsDinnerTime"
          v-bind="{
              start: '07:00',
             step: '00:30',
              end: '24:00',
              minTime: formData.thpsLunchTime,     
            
            }"
          placeholder="选择时间"
        ></el-time-select>
      </div>
    </div>

    <div class="section-item">
      <span class="section-label label-1">自提点联系方式：</span>
      <el-input
        v-model="formData.thpsContactNumber"
        class="medium-input"
        maxlength="11"
        clearable
      ></el-input>
    </div>

    <div class="section-item">
      <span class="section-label label-1">
        路标图：
      </span>
      <ImageUpload
        v-model:file-list="formData.thpsSignUrl"
        :upload-data="{ flag: 'diet' }"
        :limit="6"
      />
    </div>

    <div class="section-item">
      <span class="section-label label-1">有效状态</span>
      <el-radio-group v-model="formData.thpsStt ">
        <el-radio label="10">上线</el-radio>
        <el-radio label="00">下线</el-radio>
      </el-radio-group>
    </div>

    <h3>选择定位：</h3>
    <div id="container"></div>
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
  </div>
</template>

<script>
import { regionData, CodeToText, TextToCode } from "@/utils/regon-data.js";
import BaseSelect from "@/components/BaseSelect.vue";
import ImageUpload from "@/components/ImageUpload.vue";
const AMap = window.AMap;

export default {
  components: {
    BaseSelect,
    ImageUpload,
  },
  data() {
    return {
      thpAreaTypeList: [],
      heatPointOptions: [],
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
      atmOptions: [],
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
      thpsId: "",
      formData: {
        thpsId: "", // 自提点ID
        thpsName: "", // 名称
        thpsAddrProvince: "", // 地址:省
        thpsAddrCity: "", //  地址:市
        thpsAddrArea: "", //  地址:区
        thpsAddress: "", // 地址
        thpsLongitude: "", //  经度
        thpsLatitude: "", //  纬度
        thpsPointId: "", // 关联门店ID
        thpsPointName: "", //  关联门店名称
        thpsBreakfastTime: "", //早餐供应时间 eg: 0700
        thpsLunchTime: "", //午餐供应时间 eg: 1200
        thpsDinnerTime: "", //晚餐供应时间 eg: 1800
        thpsContactNumber: "", // 联系方式
        thpsSignUrl: [], //路标图 eg:[{"imageUrl":"图片url"}]
        thpsStt: "10", // 状态 00下线 10 上线
      },
    };
  },
  watch: {},
  created() {
    this.type = this.$route.query.type;
    this.getHeatPoint(); //加热点
    this.getthpAreaTypeList(); //片区场景

    this.queryHeatPointSubsInfo(this.$route.query.thpId);
    this.thpsId = this.$route.query.thpId;
  },
  unmounted() {
    if (this.map) {
      this.map.destroy();
    }
  },
  methods: {
    // 保存
    async handleConfrim() {
      const res = this.checkInfo();
      if (res) {
        const params = {
          ...this.formData,
        };
        params.thpsSignUrl = [];
        this.formData.thpsSignUrl.forEach((item) => {
          const img = item.response ? item.response.obj.imageUrl : item.url;
          params.thpsSignUrl.push(img);
        });
        params.thpsId = this.thpsId;

        this.loading = true;

        const url = "HeatPointSubs/updateHeatPointSubs";
        const res = await this.$http(url, params);
        this.loading = false;
        if (res.errCode == 0) {
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
    async queryHeatPointSubsInfo(id) {
      const res = await this.$http("HeatPointSubs/queryHeatPointSubsInfo", {
        thpsId: id,
      });
      if (this.$route.query.thpId) {
        Object.assign(this.formData, res.obj.pointBean);
        this.address =
          TextToCode[res.obj.thpsAddrProvince][res.obj.thpsAddrCity][
            res.obj.thpsAddrArea
          ].code;
        this.formData.thpLeaderUid = String(res.obj.thpLeaderUid);
        this.formData.thpsName = String(res.obj.thpsName);
        this.formData.thpStoreId = String(res.obj.thpStoreId);
        this.formData.thpKingdeeOrgId = String(res.obj.thpKingdeeOrgId);
        this.formData.thpsLunchTime =
          res.obj.thpsLunchTime.substring(0, 2) +
          ":" +
          res.obj.thpsLunchTime.substring(2, 4);
        this.formData.thpsDinnerTime =
          res.obj.thpsDinnerTime.substring(0, 2) +
          ":" +
          res.obj.thpsDinnerTime.substring(2, 4);
        this.formData.thpsBreakfastTime =
          res.obj.thpsBreakfastTime.substring(0, 2) +
          ":" +
          res.obj.thpsBreakfastTime.substring(2, 4);
        this.formData.thpId = res.obj.thpId;
        this.formData.thpsAddress = res.obj.thpsAddress;
        this.formData.thpAreaType = res.obj.thpAreaType;
        this.formData.thpsPointId = res.obj.thpsPointId;
        this.formData.thpsContactNumber = res.obj.thpsContactNumber;
        this.formData.thpQrcodeUrl = res.obj.thpQrcodeUrl;
        this.formData.thpsAddrProvince = res.obj.thpsAddrProvince;
        this.formData.thpsAddrCity = res.obj.thpsAddrCity;
        this.formData.thpsAddrArea = res.obj.thpsAddrArea;
        this.formData.thpsStt = res.obj.thpsStt;
        this.formData.thpsSignUrl = JSON.parse(res.obj.thpsSignUrl).map(
          (item) => ({
            url: item,
          })
        );

        this.formData.thpsLongitude = res.obj.thpsLongitude;
        this.formData.thpsLatitude = res.obj.thpsLatitude;
        this.editMap();
      } else {
        this.$nt(() => this.initMap());
      }
    },
    async getlocation() {
      if (this.address.length && this.formData.thpsAddress) {
        // const address = `中国${this.current.tgcaProvince}${this.current.tgcaCity}${this.current.tgcaArea}`;
        AMap.plugin("AMap.PlaceSearch", () => {
          const placeSearch = new AMap.PlaceSearch({
            city: this.formData.thpsAddrCity,
            citylimit: true,
            autoFitView: true,
            map: this.map,
          });
          placeSearch.search(this.formData.thpsAddress, (status, result) => {
            if (status == "no_data") {
              this.$msg("请输入正确的查询地址", "error");
              return;
            }
            this.formData.thpsLatitude = "";
            this.formData.thpsLongitude = "";
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
      this.formData.thpsLongitude = target.lng;
      this.formData.thpsLatitude = target.lat;
      // this.formData.thpStoreId = "";
      // this.getRecentlyPointId()
    },
    handleChange(value) {
      this.current.tgcaProvince = CodeToText[value[0]];
      this.current.tgcaCity = CodeToText[value[1]];
      this.current.tgcaArea = CodeToText[value[2]];
      this.getlocation();
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async getHeatPoint() {
      const res = await this.$http("groupmeal.Corp/queryEnabledPoint", {});
      this.heatPointOptions = res.obj[0].map((item) => ({
        label: item.thpName,
        value: item.thpId,
        type: item.thpShipTypeZhCn,
      }));
    },

    async getthpAreaTypeList() {
      const res = await this.$http(
        "machine.MachineSetting/queryMachineAreaType",
        {}
      );
      if (!res.obj) return;
      this.thpAreaTypeList = res.obj.map((item) => ({
        label: item.thpAreaTypeDesc,
        value: item.thpAreaType,
      }));
    },

    // 选择地址
    handleChange(value) {
      this.formData.thpsAddrProvince = CodeToText[value[0]];
      this.formData.thpsAddrCity = CodeToText[value[1]];
      this.formData.thpsAddrArea = CodeToText[value[2]];
      // this.getlocation();
    },
    // 地图初始化
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
    },
    editMap() {
      this.map = new AMap.Map("container", {
        zoom: 14, // 级别
        center: [
          Number(this.formData.thpsLongitude),
          Number(this.formData.thpsLatitude),
        ],
        resizeEnable: true,
      });
      const marker = new AMap.Marker({
        position: [
          Number(this.formData.thpsLongitude),
          Number(this.formData.thpsLatitude),
        ],
        icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
      });

      this.map.add(marker);
    },
    // 数据校验
    checkInfo() {
      if (!this.formData.thpsName) {
        this.$msg("请选择自提点名称", "error");
        return false;
      }

      if (!this.address.length) {
        this.$msg("请选择位置", "error");
        return false;
      }

      if (!this.formData.thpsAddress) {
        this.$msg("请输入详细地址", "error");
        return false;
      }

      if (!this.formData.thpsPointId) {
        this.$msg("请选择关联门店", "error");
        return false;
      }

      if (!this.formData.thpsContactNumber) {
        this.$msg("请输入自提点联系方式", "error");
        return false;
      }

      if (this.formData.thpsSignUrl.length == 0) {
        this.$msg("请上传路标图", "error");
        return false;
      }
      if (!this.formData.thpsStt) {
        this.$msg("请选择有效状态", "error");
        return false;
      }

      if (!this.formData.thpsLatitude) {
        this.$msg("请在地图上选择一个标记点", "error");
        return false;
      }

      return true;
    },
  },
};
</script>

<style lang="less" scoped>
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
  height: 600px;
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
  width: 160px;
  margin-right: 30px;
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

<template>
  <div class="page-container">
    <div class="section-item">
      <span class="section-label label-1">机器后台名称：</span>
      <BaseSelect
        v-model="formData.thpMachineCode"
        class="medium-input"
        filterable
        clearable
        :options="atmOptions"
      ></BaseSelect>
    </div>
    <div class="section-item">
      <span class="section-label label-1">机器编号：</span>
      <span>{{ formData.thpMachineCode }}</span>
    </div>
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
      <span class="section-label label-1">ERP编码：</span>
      <span>{{ formData.thpKingdeeOrgId }}</span>
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
        v-model="formData.thpShopAddress"
        class="medium-input"
        @blur="getlocation"
        clearable
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">片区场景：</span>
      <BaseSelect
        v-model="formData.thpAreaType"
        class="medium-input"
        filterable
        clearable
        :options="thpAreaTypeList"
      ></BaseSelect>
    </div>
    <div class="section-item">
      <span class="section-label label-1">供餐点名称：</span>
      <el-input
        v-model="formData.thpName"
        class="medium-input"
        @blur="getlocation"
        clearable
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">运营人员：</span>
      <BaseSelect
        v-model="formData.thpLeaderUid"
        class="medium-input"
        filterable
        clearable
        :options="heatPointUser"
      ></BaseSelect>
    </div>
    <div class="section-item">
      <span class="section-label label-1">电话：</span>
      <el-input
        v-model="formData.thpShopTel"
        class="medium-input"
        maxlength="11"
        clearable
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">所属区域仓:</span>
      <BaseSelect
        v-model="formData.thpStoreId"
        class="medium-input"
        filterable
        clearable
        :options="heatPointOptions"
      ></BaseSelect>
    </div>
    <div
      class="section-item"
      v-if="formData.thpQrcodeUrl"
    >
      <span class="section-label label-1">二维码:</span>
      <el-image
        class="el-upload-list__item-thumbnail"
        :src="formData.thpQrcodeUrl"
        alt
        style="width:120px;height:120px"
      ></el-image>
    </div>
    <div class="section-item">
      <span class="section-label label-1">
        路标图：
      </span>
      <ImageUpload
        v-model:file-list="formData.thpSignUrl"
        :upload-data="{ flag: 'diet' }"
        :limit="6"
      />
    </div>

    <div class="section-item">
      <span class="section-label label-1">有效状态</span>
      <el-radio-group v-model="formData.thpDataStt">
        <el-radio label="01">上线</el-radio>
        <el-radio label="00">下线</el-radio>
      </el-radio-group>
    </div>

    <h3>坐标</h3>
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
      formData: {
        thpMachineName: "",
        thpMachineCode: "",
        thpKingdeeOrgId: "",
        thpKingdeeOrgName: "",
        thpId: "",
        thpAreaType: "",
        thpName: "",
        thpShopTel: "",
        thpStoreId: "",
        thpSignUrl: [],
        thpShopLeader: "",
        thpLeaderUid: "",
        thpShopAddress: "",
        thpLatitude: "",
        thpLongitude: "",
        thpShopAddrProvince: "",
        thpShopAddrCity: "",
        thpShopAddrArea: "",
        thpDataStt: "01",
        thpQrcodeUrl: "",

        // thpHeatingPointRange: [],
        // thpDrawingPath: [],
      },
    };
  },
  watch: {},
  created() {
    this.type = this.$route.query.type;
    this.getHeatPointByUser(); //加热点负责人
    this.getHeatPoint(); //加热点
    this.queryKingdeeOrgList();
    this.queryAllMachine(); //机器列表
    this.getthpAreaTypeList(); //片区场景
    this.queryMachineDetail();
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
        const kingdee = this.erpOptions.find(
          (item) => item.value == this.formData.thpKingdeeOrgId
        );

        const atm = this.atmOptions.find(
          (item) => item.value == this.formData.thpMachineCode
        );
        this.formData.thpSignUrl = this.formData.thpSignUrl.map((item) => ({
          imageUrl: item.response ? item.response.obj.imageUrl : item.url,
        }));
        const params = {
          ...this.formData,
          thpShopLeader: this.formData.thpLeaderUid,
          thpKingdeeOrgName: kingdee ? kingdee.label : this.thpKingdeeOrgName,
          thpMachineName: atm ? atm.label : "",
        };

        this.loading = true;
        const url =
          this.type === "add"
            ? "machine.MachineSetting/addMachine"
            : "machine.MachineSetting/updateMachine";
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
    async queryMachineDetail() {
      const params = this.$route.query.thpId
        ? { thpId: this.$route.query.thpId }
        : {};

      const res = await this.$http(
        "machine.MachineSetting/queryMachineDetail",
        params
      );

      if (this.$route.query.thpId) {
        // Object.assign(this.formData, res.obj.pointBean);
        this.address =
          TextToCode[res.obj.pointBean.thpShopAddrProvince][
            res.obj.pointBean.thpShopAddrCity
          ][res.obj.pointBean.thpShopAddrArea].code;
        this.formData.thpLeaderUid = String(res.obj.pointBean.thpLeaderUid);
        this.formData.thpMachineCode = String(res.obj.pointBean.thpMachineCode);
        this.formData.thpStoreId = String(res.obj.pointBean.thpStoreId);
        this.formData.thpKingdeeOrgId = String(
          res.obj.pointBean.thpKingdeeOrgId
        );
        this.formData.thpId = res.obj.pointBean.thpId;
        this.formData.thpShopAddress = res.obj.pointBean.thpShopAddress;
        this.formData.thpAreaType = res.obj.pointBean.thpAreaType;
        this.formData.thpName = res.obj.pointBean.thpName;
        this.formData.thpShopTel = res.obj.pointBean.thpShopTel;
        this.formData.thpQrcodeUrl = res.obj.pointBean.thpQrcodeUrl;
        this.formData.thpShopAddrProvince =
          res.obj.pointBean.thpShopAddrProvince;
        this.formData.thpShopAddrCity = res.obj.pointBean.thpShopAddrCity;
        this.formData.thpShopAddrArea = res.obj.pointBean.thpShopAddrArea;
        this.formData.thpDataStt = res.obj.pointBean.thpDataStt;

        this.formData.thpSignUrl = JSON.parse(res.obj.pointBean.thpSignUrl).map(
          (item) => ({
            url: item.imageUrl,
          })
        );

        this.formData.thpLongitude = res.obj.pointBean.thpLongitude;
        this.formData.thpLatitude = res.obj.pointBean.thpLatitude;
        this.editMap();
      } else {
        this.$nt(() => this.initMap());
      }
    },
    async getlocation() {
      if (this.address.length && this.formData.thpShopAddress) {
        // const address = `中国${this.current.tgcaProvince}${this.current.tgcaCity}${this.current.tgcaArea}`;
        AMap.plugin("AMap.PlaceSearch", () => {
          const placeSearch = new AMap.PlaceSearch({
            city: this.formData.thpShopAddrCity,
            citylimit: true,
            autoFitView: true,
            map: this.map,
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
      const res = await this.$http(
        "HeatPointWarehouse/queryHeatPointWarehouseList",
        {}
      );

      if (!res.obj) return;
      this.heatPointOptions = res.obj.map((item) => ({
        label: item.thpwName,
        value: item.thpwId,
      }));
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
    queryAllMachine() {
      this.$request("machine.MachineSetting/queryMachineList", {}).then(
        this.$rw((err, res) => {
          if (!err) {
            const result = res.map((item) => {
              return {
                label: item.thpMachineName,
                value: item.thpMachineCode,
              };
            });
            this.atmOptions = result;
          }
        })
      );
    },

    // 选择地址
    handleChange(value) {
      this.formData.thpShopAddrProvince = CodeToText[value[0]];
      this.formData.thpShopAddrCity = CodeToText[value[1]];
      this.formData.thpShopAddrArea = CodeToText[value[2]];
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
        icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
      });

      this.map.add(marker);
    },
    // 数据校验
    checkInfo() {
      if (!this.formData.thpMachineCode) {
        this.$msg("请选择机器", "error");
        return false;
      }

      if (!this.formData.thpKingdeeOrgId) {
        this.$msg("请选择erp组织", "error");
        return false;
      }
      if (!this.address.length) {
        this.$msg("请选择位置", "error");
        return false;
      }

      if (!this.formData.thpShopAddress) {
        this.$msg("请输入详细地址", "error");
        return false;
      }
      if (!this.formData.thpAreaType) {
        this.$msg("请选择片区场景", "error");
        return false;
      }
      if (!this.formData.thpName) {
        this.$msg("请输入供餐点名称", "error");
        return false;
      }
      if (!this.formData.thpLeaderUid) {
        this.$msg("请选择运营人员", "error");
        return false;
      }
      if (!this.formData.thpShopTel) {
        this.$msg("请输入电话", "error");
        return false;
      }
      if (!this.formData.thpStoreId) {
        this.$msg("请选择所属区域仓", "error");
        return false;
      }

      if (this.formData.thpSignUrl.length == 0) {
        this.$msg("请上传路标图", "error");
        return false;
      }
      if (!this.formData.thpDataStt) {
        this.$msg("请选择有效状态", "error");
        return false;
      }

      if (!this.formData.thpLatitude) {
        this.$msg("请在地图上选择一个标记点", "error");
        return false;
      }
      // if (this.isEditMap) {
      //   this.$msg("尚未保存编辑，请结束编辑", "error");
      //   return false;
      // }
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

<template>
  <div class="page-container">
    <section>
      <div class="section-item">
        <span class="section-label label-1">客户需求：</span>
        <el-select
          v-model="selectValue"
          class="medium-input"
          @change="checkOrderInfo"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div class="section-item">
        <span class="section-label label-1">订单编码：</span>
        <el-input
          clearable
          class="medium-input"
          :disabled="selectValue === '' ? true : false"
          v-model="infolist.orderId"
          @blur="checkOrderInfo"
          placeholder="请输入订单编码"
        ></el-input>
        <span
          style="margin-left: 10px; color: red"
          v-show="hasOrder"
        >{{errMsg}}</span>
        <span
          style="margin-left: 10px; color: #409EFF;cursor: pointer;"
          v-show="showDetail"
          @click="toDetail"
        >订单详情</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">配送方式：</span>
        <span>{{orderInfo.tsmeDistributionMode == "" ? "" : orderInfo.tsmeDistributionMode == "0" ? "配送" : "自取"}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">当前状态：</span>
        <span>{{orderInfo.orderSttStr}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">取餐码：</span>
        <span>{{orderInfo.tsmeTakeMealCode}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">下单人手机：</span>
        <span>{{orderInfo.tsmePhone}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">供餐点：</span>
        <span>{{ orderInfo.tsmeHeatingPointName }}</span>
      </div>
      <div
        class="section-item"
        v-if="selectValue === '02' && orderInfo.tsmeMerge"
      >
        <span class="section-label label-1">请选择退款餐单：</span>
        <el-checkbox-group v-model="targetValue">
          <el-checkbox
            v-for="it in orderInfo.tsmeMergeInfo"
            :key="it.uid"
            :label="it.payNo"
          >{{ it.uname }} {{it.phone}} <span style="color:red">{{it.initiatorFlag == '01'?'(拼单发起人)':''}} </span></el-checkbox>
        </el-checkbox-group>

      </div>

      <!-- 异常情况 start -->
      <!-- 修改配送时间 -->
      <div v-if="selectValue === '04'">
        <div class="section-item">
          <span class="section-label label-1">原配送时间：</span>
          <span>{{ orderInfo.tsmeOriMealTakingTime }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">更改配送时间：</span>
          <el-time-select
            v-if="orderInfo.tsmeDistributionMode == 0"
            v-model="timeSelect"
            v-bind="{ start: '07:00', step: '00:10', end: '24:00'}"
            placeholder="选择时间"
          ></el-time-select>
          <el-time-picker
            v-if="orderInfo.tsmeDistributionMode == 1"
            is-range
            v-model="timePicker"
            value-format="HH:mm"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          ></el-time-picker>
        </div>
      </div>
      <!-- 修改配送地址 -->
      <div v-if="selectValue === '03'">
        <div class="section-item">
          <span class="section-label label-1">原配送地址：</span>
          <span>{{ orderInfo.tsmeOriAddress }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">配送地址：</span>
          <el-cascader
            style="width: 350px;"
            clearable
            size="large"
            :options="addressOptions"
            v-model="address"
            @change="handleChange"
          ></el-cascader>
        </div>
        <div class="section-item">
          <span class="section-label label-1"></span>
          <el-input
            clearable
            class="medium-input"
            v-model="infolist.address"
            placeholder="请输入地址"
            @blur="getlocation"
          ></el-input>
          <span
            style="margin-left: 10px; color: red"
            v-show="false"
          >不在配送范围</span>
        </div>
        <div id="container"></div>
      </div>
      <!-- 退款 -->
      <div>
        <div
          class="section-item"
          v-if="selectValue === '01'"
        >
          <span class="section-label label-1">请选择菜品：</span>
          <BasePageTable
            :data="orderInfo.tsmeSkuJson"
            :visible="false"
            v-model:selection="infolist.skuJson"
            border
            :row-style="rowStyle"
            :stripe="false"
          >
            <el-table-column
              v-for="col in tableCol"
              :key="col.prop"
              v-bind="col"
            >
              <template
                v-if="col.prop === 'num'"
                v-slot:default="{row}"
              >
                <NumberInput v-model="row.refundNum" />
              </template>
            </el-table-column>
          </BasePageTable>
        </div>
        <div
          class="section-item"
          v-if="selectValue === '01' || selectValue === '02'"
        >
          <span class="section-label label-1">退款原因：</span>
          <el-select
            v-model="infolist.cause"
            class="medium-input"
          >
            <el-option
              v-for="item in refundOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
        <div
          class="section-item"
          v-if="selectValue === '02'"
        >
          <span class="section-label label-1">是否增加端内库存：</span>
          <el-radio-group v-model="infolist.isInventory">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </div>
      </div>
      <!-- 重新发起配送 -->
      <div v-if="selectValue === '05'">
        <div class="section-item">
          <span class="section-label label-1">原手机号：</span>
          <span>{{ orderInfo.tsmeOriPhone }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">手机号：</span>
          <el-input
            clearable
            class="medium-input"
            v-model="infolist.phone"
            placeholder="请手机号"
          ></el-input>
        </div>
      </div>
      <!-- 异常情况 end -->
      <div class="section-item">
        <span class="section-label label-1">备注：</span>
        <el-input
          clearable
          type="textarea"
          class="medium-input"
          placeholder="请输入备注"
          :rows="6"
          v-model="infolist.remark"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">附件上传：</span>
        <ImageUpload
          :upload-data="{ flag: 'exception' }"
          :limit="6"
          v-model:file-list="infolist.imgs"
        />
      </div>
    </section>
    <footer class="btn-footer">
      <el-button
        type="primary"
        @click="submit"
        :loading="loading"
      >确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script >
import { regionData, CodeToText, TextToCode } from "@/utils/regon-data.js";
import ImageUpload from "@/components/ImageUpload.vue";
import BasePageTable from "@/components/BasePageTable.vue";

export default {
  components: {
    ImageUpload,
    BasePageTable,
  },
  watch: {
    selectValue() {
      if (this.selectValue == "03") {
        this.$nt(() => this.initMap());
      }
    },
  },
  data() {
    return {
      targetValue: [],
      map: null,
      marker: [],
      loading: false,
      selectValue: "", // 退款类别
      hasOrder: false, // 订单是否有效
      showDetail: false,
      errMsg: "",
      options: [
        { label: "申请单品退款", value: "01" },
        { label: "申请全额退款", value: "02" },
        { label: "修改配送地址", value: "03" },
        { label: "修改配送时间", value: "04" },
        { label: "重新发起配送", value: "05" },
        { label: "异常取消订单(不退款)", value: "06" },
        { label: "订单已完成", value: "07" },
      ],
      sheng: "",
      shi: "",
      qu: "",
      address: [],
      addressOptions: regionData,
      refundOptions: [
        { label: "产品出现异物", value: "1" },
        { label: "产品质量问题（口味、熟度、食安）", value: "2" },
        { label: "配货出现漏配错配", value: "3" },
        { label: "超时退款", value: "4" },
        { label: "商品缺货", value: "5" },
        { label: "第三方配送原因（如没送达、骑手原因送货延迟等）", value: "7" },
        { label: "其他", value: "6" },
      ],
      tableData: [],
      tableCol: [
        { label: "", type: "selection" },
        { label: "商品编码", prop: "cid" },
        { label: "昵称", prop: "uname" },
        { label: "手机号", prop: "phone" },
        { label: "商品品名", prop: "name" },
        { label: "规格", prop: "quality" },
        {
          label: "数量",
          prop: "num",
        },
        { label: "单价", prop: "price" },
        { label: "订单金额 ", prop: "totalPrice" },
      ],
      orderInfo: {
        tsmeDistributionMode: "",
        tsmeHeatingPointName: "",
        tsmeOriAddress: "",
        tsmeOriMealTakingTime: "",
        tsmeSkuJson: [],
      },
      timeSelect: "",
      timePicker: "",
      infolist: {
        orderId: "",
        tsmeOriPhone: "",
        phone: "",
        type: "",
        skuJson: [],
        cause: "",
        isInventory: "1",
        oriAddress: "",
        address: "",
        longitude: "",
        latitude: "",
        oriMealTakingTime: "",
        mealTakingTime: "",
        remark: "",
        imgs: [],
      },
    };
  },
  created() {
     this.tableRowStyle = {}
  },
  mounted() {},
  methods: {
    rowStyle({ row }) {
      const { tableRowStyle } = this;
      if (!tableRowStyle[row.phone]) {
        tableRowStyle[row.phone] = `rgba(${(255 * Math.random()) | 0}, ${
          (255 * Math.random()) | 0
        }, ${(255 * Math.random()) | 0}, 0.1)`;
      }
      console.log(tableRowStyle[row.phone]);
      return {
        backgroundColor: tableRowStyle[row.phone],
      };
    },
    // 校验订单合法性
    checkOrderInfo() {
      if (this.selectValue == "" || this.infolist.orderId == "") return;
      this.$request("shoperror.ShopManagerError/checkOrderInfo", {
        orderId: this.infolist.orderId,
        type: this.selectValue,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.hasOrder = false;
            this.showDetail = true;
            Object.assign(this.orderInfo, {
              ...dataPage,
              tsmeSkuJson: dataPage.tsmeSkuJson.map((i) => {
                i.refundNum = i.num;
                return i;
              }),
            });
          } else {
            this.hasOrder = true;
            this.showDetail = false;
            this.errMsg = err.errMsg;
            this.orderInfo = {
              tsmeDistributionMode: "",
              tsmeHeatingPointName: "",
              tsmeOriAddress: "",
              tsmeOriMealTakingTime: "",
              tsmeSkuJson: [],
            };
          }
        })
      );
    },
    // 搜索地址经纬度
    handleChange(value) {
      this.infolist.latitude = "";
      this.infolist.longitude = "";
      this.sheng = CodeToText[value[0]];
      this.shi = CodeToText[value[1]];
      this.qu = CodeToText[value[2]];
      this.getlocation();
    },

    // 地图
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
    getlocation() {
      if (this.address.length && this.infolist.address) {
        console.log(this.shi);
        AMap.plugin("AMap.PlaceSearch", () => {
          const placeSearch = new AMap.PlaceSearch({
            city: this.shi,
            citylimit: true,
            autoFitView: true,
            map: this.map,
          });
          placeSearch.search(this.infolist.address, (status, result) => {
            if (status == "no_data") {
              this.$msg("请输入正确的查询地址", "error");
              return;
            }
            this.infolist.longitude = "";
            this.infolist.latitude = "";
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
      this.infolist.longitude = target.lng;
      this.infolist.latitude = target.lat;
    },
    toDetail() {
      this.$store.state.keepRoutes.push("servingMeals_exception_edit");
      this.$router.push({
        path: "/scm/serving-meals/exception/orderDetail",
        query: {
          id: this.infolist.orderId,
        },
      });
    },
    submit() {
      const params = this.$deepClone(this.infolist);

      if (this.hasOrder) {
        this.$message({ type: "error", message: "请输入正确的订单号！" });
        return;
      }
      if (this.selectValue === "04") {
        const time =
          this.orderInfo.tsmeDistributionMode == "0"
            ? this.timeSelect
            : this.timePicker;
        if (!time) {
          this.$message({ type: "error", message: "请选择取餐时间！" });
          return;
        }
        params.mealTakingTime =
          this.orderInfo.tsmeDistributionMode == "0"
            ? this.timeSelect
            : this.timePicker.join("-"); // 配送时间点，自取为时间段
      }
      if (this.selectValue === "03" && !params.longitude) {
        this.$message({ type: "error", message: "请输入地址！" });
        return;
      }
      if (this.selectValue === "01" && !params.cause) {
        this.$message({ type: "error", message: "请选择退款原因！" });
        return;
      }
      if (this.selectValue === "01" && !params.skuJson.length) {
        this.$message({ type: "error", message: "请选择退款菜品！" });
        return;
      }
   
      if (this.selectValue === "02" && this.targetValue.length==0 && this.orderInfo.tsmeMerge) {
        this.$message({ type: "error", message: "请选择退款餐单！" });
        return;
      }
      params.imgs = [];
      this.infolist.imgs.forEach((item) => {
        const img = item.response ? item.response.obj.imageUrl : item.url;
        params.imgs.push(img);
      });
      params.oriMealTakingTime = this.orderInfo.tsmeOriMealTakingTime;
      params.oriPhone = this.orderInfo.tsmeOriPhone;
      params.oriAddress = this.orderInfo.tsmeOriAddress;
      params.type = this.selectValue;
      params.skuJson = params.skuJson.filter((i) => i.refundNum > 0);
      params.payNos = this.targetValue;
      this.loading = true;
      this.$request(
        "shoperror.ShopManagerError/saveShopManagerError",
        params
      ).then(
        this.$rw((err) => {
          this.loading = false;
          if (!err) {
            this.$closeRoute();
            this.$message({ type: "success", message: "操作成功！" });
          } else {
            this.$message({ type: "error", message: err.errMsg });
          }
        })
      );
    },
    cancel() {
      this.$confirm("确认取消操作吗?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          console.log("点击确定");
          this.$closeRoute();
        })
        .catch(() => {
          console.log("点击取消");
        });
    },
  },
};
</script>

<style lang="less" scoped>
.label-1 {
  width: 120px;
  margin-right: 12px;
  text-align: right;
}
#container {
  min-width: 600px;
  min-height: 767px;
}
</style>

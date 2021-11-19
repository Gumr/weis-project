<template>
  <div class>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="5"
        semi
      >
        <template #action>
          <!-- <el-button type="primary" @click="searchClick">搜索</el-button> -->
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
      >添加地址</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading.fullscreen.lock="loading"
        :height="tableHeight"
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
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="goEdit(row)"
            >编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="goDel(row)"
            >删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
      <ConfirmDialog
        v-model="editDialog"
        :title="title"
        :close-on-click-modal="false"
        :auto-confirm="false"
        :async-confirm="true"
        @on-confirm="editConfirm"
      >
        <div style="padding: 20px 0;">
          <div class="section-item">
            <span class="section-label label-1">名称：</span>
            <el-input
              v-model="current.tgcaName"
              class="small-input"
            ></el-input>
          </div>
          <div class="section-item">
            <span class="section-label label-1">地址：</span>
            <el-cascader
              v-model="current.address"
              class="small-input"
              clearable
              size="large"
              :options="cityOptions"
              @change="handleChange"
            ></el-cascader>
          </div>
          <div class="section-item">
            <span class="section-label label-1">详细地址：</span>
            <el-input
              v-model="current.tgcaAddress"
              class="small-input"
              @blur="getlocation"
            ></el-input>
          </div>
          <div class="section-item">
            <span class="section-label label-1">供餐点：</span>
            <BaseSelect
              v-model="current.tgcaHeatingPoint"
              class="small-input"
              :options="heatPointOptions"
              clearable
              @change="heatChange"
            ></BaseSelect>
            <span style="margin-left:10px" v-if="distance>0">距离：{{distance}} km</span>
          </div>
          <div class="section-item">
            <span class="section-label label-1">配送方式：</span>
            <el-radio-group v-model="current.tgcaDistributionType">
              <el-radio label="01">企业专送</el-radio>
              <el-radio label="02">供餐点配送方式{{ heatType }}</el-radio>
            </el-radio-group>
          </div>
          <div
            v-if="current.tgcaDistributionType !== '02'"
            class="section-item"
          >
            <span class="section-label label-1">配送费：</span>
            <NumberInput
              v-model="current.tgcaDistributionPrice"
              style="width: 200px"
              mode="digit"
              :precision="2"
            />
          </div>
          <!-- <div v-if="tgcType === '00'" class="section-item">
            <span class="section-label label-1">接口人（选填）：</span>
            <BaseSelect v-model="current.employeeId" :options="employeeOptions" :props="{label: '$label', value: 'tgeId'}" clearable></BaseSelect>
          </div>-->
          <div id="container"></div>
        </div>
      </ConfirmDialog>
    </div>
  </div>
</template>

<script>
import { regionData, CodeToText, TextToCode } from "@/utils/regon-data.js";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import exportExcel from "@/utils/export-excel";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import BaseSelect from "@/components/BaseSelect.vue";
// import XLSX from "@/utils/xlsx";
import { defineComponent } from "vue";
function createForm() {
  return {
    employeeId: "", // 接口人
    tgcaDistributionPrice: "",
    tgcaName: "",
    address: [],
    tgcaAddress: "",
    tgcaHeatingPoint: "",
    tgcaProvince: "",
    tgcaCity: "",
    tgcaArea: "",
    tgcaLat: "",
    tgcaLon: "",
    tgcaDistributionType: "01",
  };
}
export default defineComponent({
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    BaseSelect,
  },
  data() {
    return {
      distance:0,
      loading: false,
      map: null,
      marker: [],
      employeeList: [], // 接口人列表
      tgcId: "",
      page: {
        pageNo: 1,
        pageSize: 100,
      },
      title: "",
      editDialog: false,
      queryParams: {},
      queryComps: [],
      tableData: [],
      tableDataTotal: 0,
      tgcType: "",
      // tableCol: [
      //   { label: '序号', type: 'index', width: '80' },
      //   { label: '名称', prop: 'tgcaName' },
      //   { label: '详细地址', prop: 'tgcaAddress' },
      //   { label: '加热点', prop: 'tgcaHeatingPointName' },
      //   { label: '配送方式', prop: 'tgcaDistributionTypeDesc' },
      //   { label: '配送费', prop: 'tgcaDistributionPrice' },
      //   { label: '接口人名称', prop: 'employeeName' },
      //   { label: '接口人手机号', prop: 'employeePhone' }
      // ],
      cityOptions: regionData,
      heatPointOptions: [],
      heatType: "",
      employee: null,
      current: createForm(),
    };
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    },
    tableCol() {
      return this.tgcType === "00"
        ? [
            { label: "序号", type: "index", width: "80" },
            { label: "名称", prop: "tgcaName" },
            { label: "详细地址", prop: "tgcaAddress" },
            { label: "加热点", prop: "tgcaHeatingPointName" },
            { label: "配送方式", prop: "tgcaDistributionTypeDesc" },
            { label: "配送费", prop: "tgcaDistributionPrice" },
            // { label: '接口人名称', prop: 'employeeName' },
            // { label: '接口人手机号', prop: 'employeePhone' }
          ]
        : [
            { label: "序号", type: "index", width: "80" },
            { label: "名称", prop: "tgcaName" },
            { label: "详细地址", prop: "tgcaAddress" },
            { label: "加热点", prop: "tgcaHeatingPointName" },
            { label: "配送方式", prop: "tgcaDistributionTypeDesc" },
            { label: "配送费", prop: "tgcaDistributionPrice" },
          ];
    },
    employeeOptions() {
      return this.employeeList;
    },
  },
  watch: {
    editDialog(visible) {
      if (visible) {
        this.queryEmployeeList();
      }
    },
  },
  created() {
    this.tgcId = this.$route.query.id;
    const height = window.innerHeight;
    this.tableHeight = `${height - 330}px`;
    this.getHeatPoint();
    this.getInfo();
    this.getList();
  },
  unmounted() {
    if (this.map) {
      this.map.destroy();
    }
  },
  methods: {
    getInfo() {
      this.$http("groupmeal.Corp/queryCorpById", {
        tgcId: this.tgcId,
      }).thenwrap((err, data) => {
        if (!err) {
          this.tgcType = data.corpInfo.tgcType;
          // console.log(data, 'data')
        }
      });
    },
    queryEmployeeList() {
      this.$request("groupmeal.CorpAddress/getCorpEmpByAddress", {
        tgcId: this.tgcId,
      }).thenwrap((err, data) => {
        if (!err) {
          this.employeeList = data.res.map((item) => {
            item.$label = `${item.tgeName}（${item.tgePhone}）`;
            return item;
          });
        }
      });
    },
    async getlocation() {
      if (this.current.address.length && this.current.tgcaAddress) {
        // const address = `中国${this.current.tgcaProvince}${this.current.tgcaCity}${this.current.tgcaArea}`;
        AMap.plugin("AMap.PlaceSearch", () => {
          const placeSearch = new AMap.PlaceSearch({
            city: this.current.tgcaCity,
            citylimit: true,
            autoFitView: true,
            map: this.map,
          });
          placeSearch.search(this.current.tgcaAddress, (status, result) => {
            if (status == "no_data") {
              this.$msg("请输入正确的查询地址", "error");
              return;
            }
            this.current.tgcaLat = "";
            this.current.tgcaLon = "";
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
      this.current.tgcaLon = target.lng;
      this.current.tgcaLat = target.lat;
      this.current.tgcaHeatingPoint = "";
      this.getRecentlyPointId();
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
    async heatChange() {
      const val = this.heatPointOptions.find(
        (val) => val.value == this.current.tgcaHeatingPoint
      );
      this.heatType = val ? `（${val.type}）` : "";
      if (this.current.tgcaLat && this.current.tgcaAddress) {
        const res = await this.$http(
          "groupmeal.CorpAddress/checkAddressConform",
          {
            tgcaLat: this.current.tgcaLat,
            tgcaLon: this.current.tgcaLon,
            tgcaHeatingPoint: this.current.tgcaHeatingPoint,     
            tgcaDistributionType:this.current.tgcaDistributionType
          }
        );
        if (res.errMsg) {
          this.$msg(res.errMsg, "error");
          this.current.tgcaHeatingPoint = "";
          this.heatType = "";
          this.distance =0
        }else{
          this.distance = res.obj.distance
        }
      }
    },
    async getRecentlyPointId() {
      this.loading = true;
      const res = await this.$http("groupmeal.CorpAddress/getRecentlyPointId", {
        tgcaLat: this.current.tgcaLat,
        tgcaLon: this.current.tgcaLon,
      });
      if (res.errMsg) {
        this.$msg(res.errMsg, "error");
        this.distance =0
      } else {
        this.current.tgcaHeatingPoint = res.obj.pointId;
        this.distance = res.obj.distance
        const val = this.heatPointOptions.find(
          (val) => val.value == this.current.tgcaHeatingPoint
        );
        this.heatType = val ? `（${val.type}）` : "";
      }
      this.loading = false;
    },
    async getHeatPoint() {
      const res = await this.$http("groupmeal.Corp/queryEnabledPoint", {});
      this.heatPointOptions = res.obj[0].map((item) => ({
        label: item.thpName,
        value: item.thpId,
        type: item.thpShipTypeZhCn,
      }));
    },
    async getList() {
      this.$store.state.vloading = true;
      const params = { tgcId: this.tgcId, ...this.page };
      const res = await this.$http(
        "groupmeal.CorpAddress/queryCorpAddressList",
        params
      );
      this.tableData = res.obj.record;
      this.tableDataTotal = res.obj.totalRecordCount;
      this.$nt(() => {
        this.$refs.table.doLayout();
      });
    },
    showDialog() {
      this.title = "添加地址";
      // this.employee = null
      this.current = createForm();
      this.editDialog = true;
      this.distance = 0;
      this.$nt(() => this.initMap());
    },
    async goEdit(row) {
      this.title = "编辑地址";
      const res = await this.$http(
        "groupmeal.CorpAddress/queryCorpAddressById",
        { tgcaId: row.tgcaId }
      );
      Object.assign(this.current, res.obj);
      // this.current.tgeId = res.obj.employeeId
      const { employeeId } = res.obj;
      this.current.employeeId = employeeId;
      this.distance = res.obj.distance
      // this.employee = employeeId
      //   ? {
      //     tgeId: employeeId,
      //     $label: `${res.obj.employeeName}（${res.obj.employeePhone}）`
      //   }
      //   : null
      this.current.address =
        TextToCode[this.current.tgcaProvince][this.current.tgcaCity][
          this.current.tgcaArea
        ].code;

      const val = this.heatPointOptions.find(
        (val) => val.value == this.current.tgcaHeatingPoint
      );
      this.heatType = val ? `（${val.type}）` : "";
      this.editDialog = true;
      this.$nt(() => this.editMap());
    },
    async goDel(row) {
      try {
        await this.$confirm("确定删除？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true,
        });
        const res = await this.$http(
          "groupmeal.CorpAddress/deleteCorpAddress",
          { tgcaId: row.tgcaId }
        );
        if (!res.errMsg) {
          this.$msg("删除成功", "success");
          this.getList();
        } else {
          this.$msg(res.errMsg, "error");
        }
      } catch (e) {
        console.log("用户取消");
      }
    },
    async editConfirm(done) {
      const { current } = this;
      if (!current.tgcaName) {
        this.$msg("请输入名称", "error");
        done();
        return;
      }
      if (!current.address.length) {
        this.$msg("请选择地址", "error");
        done();
        return;
      }
      if (!current.tgcaAddress) {
        this.$msg("请输入详细地址", "error");
        done();
        return;
      }
      if (!current.tgcaHeatingPoint) {
        this.$msg("请选择供餐点", "error");
        done();
        return;
      }
      if (!current.tgcaDistributionType) {
        this.$msg("请选择配送方式", "error");
        done();
        return;
      }
      if (!current.tgcaLat) {
        this.$msg("请选择地图上的标点", "error");
        done();
        return;
      }
      // if (current.tgcaDistributionType === '00' && !current.tgcaDistributionPrice) {
      //   this.$msg('请输入配送费', 'error');
      //   done();
      //   return;
      // }
      const res = await this.$http("groupmeal.CorpAddress/updateCorpAddress", {
        ...current,
        tgcId: this.tgcId,
      });
      if (!res.errMsg) {
        this.$msg("操作成功", "success");
        this.editDialog = false;
        this.getList();
        this.$nt(() => {
          setTimeout(() => {
            done();
          }, 800);
        });
      } else {
        this.$msg(res.errMsg, "error");
        done();
      }
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = { tgcId: this.tgcId, pageSize: this.tableDataTotal };
      const res = await this.$http(
        "groupmeal.CorpAddress/queryCorpAddressList",
        params
      );
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record,
      });
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
        center: [Number(this.current.tgcaLon), Number(this.current.tgcaLat)],
        resizeEnable: true,
      });
      const marker = new AMap.Marker({
        position: [Number(this.current.tgcaLon), Number(this.current.tgcaLat)],
      });
      this.map.add(marker);
    },
  },
});
</script>

<style lang="less" scoped>
#container {
  min-width: 600px;
  min-height: 500px;
}
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.small-input {
  width: 300px;
}
.tiny-input {
  margin: 0 8px;
  width: 100px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
  align-items: center;
}

.section-item {
  margin: 20px 0;
  display: flex;
  min-height: 30px;
  flex-wrap: wrap;
  align-items: center;
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
.label-1 {
  width: 150px;
  margin-right: 12px;
  text-align: right;
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
.display-flex {
  padding: 0;
}
.download {
  margin-left: 20px;
  color: #409eff;
  cursor: pointer;
}
</style>

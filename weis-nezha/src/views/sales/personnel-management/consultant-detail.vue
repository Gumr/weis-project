<template>
  <div
    class="page-container"
    style="padding-top: 20px;"
  >
    <div>
      <ReturnButton back />
    </div>
    <div style="margin-top: 14px;">
      <ButtonTabs
        v-model="activeTab"
        :tabs="tabs"
        @change="changes"
      ></ButtonTabs>
    </div>
    <div>
      <div v-if="activeTab === 0">
        <h2>基本信息</h2>
        <div class="detail-section display-flex">
          <div>
            <span class="section-label">{{ counselor.tseRoleName }}名称：</span>
            <span>{{ counselor.tseName || '无' }}</span>
          </div>
        </div>

        <div class="detail-section display-flex">
          <div>
            <span class="section-label">{{ counselor.tseRoleName }}手机：</span>
            <span>{{ counselor.tsePhone || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">绑定主管名称：</span>
            <span>{{ counselor.tseParentName || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">绑定主管手机：</span>
            <span>{{ counselor.tseParentPhone || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">当前状态：</span>
            <span>{{ counselor.tseSttDesc || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">比例提成：</span>
            <NumberInput
              v-model="counselor.tseRatio"
              style="width: 200px"
              mode="digit"
              :precision="2"
            ></NumberInput>%
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">人员属性：</span>
            <el-select
              v-model="counselor.tseProperty"
              clearable
              filterable
              placeholder="选择关联维士销售"
              class="txt"
            >
              <el-option
                v-for="item in userType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>

          </div>
        </div>
        <h2>基本信息</h2>
        <div class="section-item">
          <span class="section-label label-1">微信号：</span>
          <el-input
            v-model="counselor.wxNumber"
            clearable
            class="medium-input"
          ></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">手机号：</span>
          <el-input
            v-model="counselor.coachPhone"
            clearable
            class="medium-input"
          ></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">个人介绍：</span>
          <el-input
            v-model="counselor.introduce"
            clearable
            class="medium-input"
            :rows="6"
            type="textarea"
          ></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">微信二维码：</span>
          <UploadImage
            v-model="counselor.wxQrcodeUrl"
            :upload-data="{ flag: 'sales' }"
            type="list"
            :limit="Infinity"
          />
        </div>
        <div class="section-item">
          <span class="section-label label-1">专业证书：</span>
          <UploadImage
            v-model="counselor.qualificationImageUrl"
            :upload-data="{ flag: 'sales' }"
            type="list"
            :limit="Infinity"
          />
        </div>
        <div class="section-item">
          <span class="section-label label-1">照片：</span>
          <UploadImage
            v-model="counselor.coachImageUrl"
            :upload-data="{ flag: 'sales' }"
            type="list"
            :limit="Infinity"
          />
        </div>
        <div
          class="section-item"
          v-if="counselor.tseRoleName!='客户经理(内部)'"
        >
          <span class="section-label label-1">选择关联维士销售:</span>
          <el-select
            v-model="counselor.tseExpandId"
            clearable
            filterable
            placeholder="选择关联维士销售"
            class="txt"
          >
            <el-option
              v-for="item in chargeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>

        </div>
        <div class="section-item">
          <span class="section-label label-1"></span>
          <el-button
            type="primary"
            style="width: 150px;"
            @click="confirm"
          >保存</el-button>
        </div>
      </div>
      <div v-if="activeTab === 1">
        <QueryComponents
          v-model="subQuery"
          style="margin: 12px 0;"
          :query-list="subQueryComps"
        >
          <template #action>
            <el-button
              type="priamry"
              @click="getSubTableData"
            >搜索</el-button>
          </template>
        </QueryComponents>
        <div style="margin: 12px 0;">
          当前绑定兼职客户经理人数
          <span class="count-label">
            {{
              subTable.total
            }}
          </span>
        </div>
        <BasePageTable
          v-model:current-page="subTable.pageNo"
          v-model:page-size="subTable.pageSize"
          :data="tableDataSlice"
          :total="subTable.data.length"
          border
          stripe
        >
          <el-table-column
            v-for="(col, index) in subTable.col"
            :key="index"
            v-bind="col"
          ></el-table-column>
        </BasePageTable>
      </div>
      <div v-if="activeTab === 2">
        <QueryComponents
          v-model="memberQuery"
          style="margin: 12px 0;"
          :query-list="memeberQueryComps"
        >
          <template #action>
            <el-button
              type="priamry"
              @click="getMemberTableData"
            >搜索</el-button>
          </template>
        </QueryComponents>
        <div style="margin: 12px 0;">
          当前绑定直级会员数
          <span class="count-label">
            {{
              memberTable.total
            }}
          </span>
        </div>
        <BasePageTable
          v-model:current-page="memberTable.pageNo"
          v-model:page-size="memberTable.pageSize"
          :data="memberTableDataSlice"
          :total="memberTable.data.length"
          border
          stripe
        >
          <el-table-column
            v-for="(col, index) in memberTable.col"
            :key="index"
            v-bind="col"
          ></el-table-column>
        </BasePageTable>
      </div>
      <div v-if="activeTab === 3">
        <Helper></Helper>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonTabs from "@/components/ButtonTabs.vue";
import ReturnButton from "@/components/ReturnButton.vue";
import QueryComponents from "@/components/QueryComponents.vue";
import { transformDaterange } from "@/utils/transform";
import { validArray } from "@/utils/common";
// import ImageUpload from '@/components/ImageUpload.vue'
import UploadImage from "@/components/UploadImage";
import { requestFactor } from "@/utils/request";
import Helper from "./components/Helper.vue";

const { request: req } = requestFactor("sale.SaleEmployee");

export default {
  name: "sales_personnel-management_consultant-detail",
  components: {
    ReturnButton,
    ButtonTabs,
    QueryComponents,
    Helper,
    UploadImage,
  },
  data() {
    return {
      tseId: [],
      activeTab: 0,
      userType: [
        // {
        //   label: "默认",
        //   value: "00",
        // },
        {
          label: "koc",
          value: "10",
        },
        {
          label: "教练",
          value: "20",
        },
        {
          label: "其他",
          value: "30",
        },
      ],
      tabs: [
        {
          label: "基础信息",
          value: 0,
        },
        // {
        //   label: '兼职客户经理',
        //   value: 1
        // },
        {
          label: "会员信息",
          value: 2,
        },
        {
          label: "助手信息",
          value: 3,
        },
      ],
      subQuery: {
        date: [],
        phone: "",
      },
      memberQuery: {
        date: [],
        phone: "",
      },
      memberTable: {
        data: [],
        pageNo: 1,
        pageSize: 50,
        total: 0,
        col: [
          {
            label: "序号",
            type: "index",
          },
          {
            label: "会员ID",
            prop: "uid",
          },
          {
            label: "会员名称",
            prop: "uname",
          },
          {
            label: "会员手机",
            prop: "phone",
          },
          {
            label: "绑定时间",
            prop: "ctime",
          },
          {
            label: "解绑时间",
            prop: "utime",
          },
          {
            label: "当前状态",
            formatter: (row) => ({ "00": "解绑", "01": "绑定" }[row.state]),
          },
          {
            label: "助手名称",
            prop: "helperName",
            formatter: (row) => row.helperName || "无",
          },
          {
            label: "助手手机",
            prop: "helperPhone",
            formatter: (row) => row.helperPhone || "无",
          },
        ],
      },
      subTable: {
        pageNo: 1,
        pageSize: 50,
        data: [],
        total: 0,
        col: [
          {
            label: "序号",
            type: "index",
            width: "100px",
          },
          {
            label: "兼职客户经理ID",
            prop: "uid",
          },
          {
            label: "兼职客户经理名称",
            prop: "uname",
          },
          {
            label: "兼职客户经理手机",
            prop: "phone",
          },
          {
            label: "绑定时间",
            prop: "ctime",
          },
          {
            label: "解绑时间",
            prop: "utime",
          },
          {
            label: "当前状态",
            prop: "state",
            formatter: (row) => ({ "00": "解绑", "01": "绑定" }[row.state]),
          },
        ],
      },
      subQueryComps: [
        {
          component: "el-date-picker",
          label: "日期",
          key: "date",
          props: {
            type: "daterange",
            clearable: true,
          },
        },
        {
          component: "el-input",
          label: "手机号",
          key: "phone",
          placeholder: "兼职客户经理手机号",
          props: {
            clearable: true,
          },
        },
      ],
      memeberQueryComps: [
        {
          component: "el-date-picker",
          label: "日期",
          key: "date",
          props: {
            type: "daterange",
            clearable: true,
          },
        },
        {
          component: "el-input",
          label: "手机号",
          key: "phone",
          placeholder: "会员手机号",
          props: {
            clearable: true,
          },
        },
      ],
      counselor: {
        wxNumber: "",
        coachPhone: "",
        introduce: "",
        tseRatio: "",
        qualificationImageUrl: [],
        coachImageUrl: [],
        wxQrcodeUrl: [],
        tseExpandId: "",
        tseProperty:'',
      },
      rejectDialogVisible: false,
      rejectMessage: "",
      transformer: {
        brokerType: (type) =>
          ({
            "01": "外部",
            "02": "自有",
          }[type]),
        brokerStatus: (status) =>
          ({
            "00": "删除",
            "01": "正常",
          }[status]),
      },
    };
  },
  computed: {
    memberTableDataSlice() {
      const { data, pageNo, pageSize } = this.memberTable;
      const result = data.slice((pageNo - 1) * pageSize, pageNo * pageSize);
      return result;
    },
    tableDataSlice() {
      const { data, pageNo, pageSize } = this.subTable;

      return data.slice((pageNo - 1) * pageSize, pageNo * pageSize);
    },
  },
  created() {
    this.id = this.$route.query && this.$route.query.id;
    this.SaleEmployeeList();
    this.getMemberTableData();
    this.getSubTableData();
  },
  methods: {
    changes() {
      if (this.activeTab == "2") {
        this.getMemberTableData();
      }
    },
    getCounselorDetail() {
      req("querySaleEmployeeInfo", { tseId: this.id }).then(
        this.$rw((err, res) => {
          if (!err) {
            Object.assign(this.counselor, res);
            this.counselor.coachPhone = res.tsePhone;
            this.counselor.qualificationImageUrl = res.qualificationImageUrl
              ? JSON.parse(res.qualificationImageUrl).map(
                  ({ imageUrl }) => imageUrl
                )
              : [];
            this.counselor.coachImageUrl = res.coachImageUrl
              ? JSON.parse(res.coachImageUrl).map(({ imageUrl }) => imageUrl)
              : [];
            this.counselor.wxQrcodeUrl = res.wxQrcodeUrl
              ? JSON.parse(res.wxQrcodeUrl).map(({ imageUrl }) => imageUrl)
              : [];

            // this.counselor.tseExpandId= res.tseExpandId?res.tseExpandId+'':null

            // res.agentDetailVo.qualificationImageUrl = res.agentDetailVo.qualificationImageUrl ? res.agentDetailVo.qualificationImageUrl : [];
            // this.counselor.qualificationImageUrl = res.agentDetailVo.qualificationImageUrl.map(item => ({ url: item }));
            // res.agentDetailVo.coachImageUrl = res.agentDetailVo.coachImageUrl ? res.agentDetailVo.coachImageUrl : [];
            // this.counselor.coachImageUrl = res.agentDetailVo.coachImageUrl.map(item => ({ url: item }));
            // res.agentDetailVo.wxQrcodeUrl = res.agentDetailVo.wxQrcodeUrl ? res.agentDetailVo.wxQrcodeUrl : [];
            // this.counselor.wxQrcodeUrl = res.agentDetailVo.wxQrcodeUrl.map(item => ({ url: item }));
            this.SaleEmployeeList("update");
          }
        })
      );
    },
    SaleEmployeeList(type) {
      // debugger
      req("querySaleEmployeeList", {
        tseRoleId: "100002,100003",
        tseStt: "01",
        tseDepartmentId: this.counselor.tseDepartmentId,
      }).thenwrap((err, res) => {
        if (!err) {
          this.chargeOptions = res.map((item) => ({
            label: item.tseRoleName + "--" + item.tseName,
            value: item.tseId,
          }));
          if (!type) {
            this.getCounselorDetail();
          }
        }
      });
    },
    getMemberTableData() {
      req("queryMemberLowerPage", {
        pageNo: 1,
        pageSize: 99999,
        tseId: this.id,
        ...this.transformQuery(this.memberQuery),
      }).then(
        this.$rw((err, data) => {
          if (!err) {
            this.memberTable.data = data.dataPage.record;
            this.memberTable.total = Number(data.count) || 0;
          }
        })
      );
    },
    getSubTableData() {
      req("queryCounselorLowerPage", {
        pageNo: 1,
        pageSize: 99999,
        tseId: this.id,
        ...this.transformQuery(this.subQuery),
      }).then(
        this.$rw((err, data) => {
          if (!err) {
            this.subTable.data = data.dataPage.record;
            this.subTable.total = Number(data.count) || 0;
          }
        })
      );
    },
    transformQuery(query) {
      query = { ...query };
      if (validArray(query.date)) {
        const [startDate, endDate] = transformDaterange(query.date);
        query.startDate = startDate.format("YYYY-MM-DD");
        query.endDate = endDate.format("YYYY-MM-DD");
      }

      return query;
    },
    cancelClick() {
      this.$router.back();
    },
    async confirm() {
      const qualificationImageUrl = this.counselor.qualificationImageUrl;
      // this.counselor.qualificationImageUrl.forEach((item) => {
      //   const img = item.response ? item.response.obj.imageUrl : item.url
      //   qualificationImageUrl.push(img)
      // })

      const coachImageUrl = this.counselor.coachImageUrl;
      // this.counselor.coachImageUrl.forEach((item) => {
      //   const img = item.response ? item.response.obj.imageUrl : item.url
      //   coachImageUrl.push(img)
      // })

      const wxQrcodeUrl = this.counselor.wxQrcodeUrl;
      // this.counselor.wxQrcodeUrl.forEach((item) => {
      //   const img = item.response ? item.response.obj.imageUrl : item.url
      //   wxQrcodeUrl.push(img)
      // })
      const res = (
        await req("updateCounselorInfo", {
          tseId: this.id,
          wxNumber: this.counselor.wxNumber,
          coachPhone: this.counselor.coachPhone,
          introduce: this.counselor.introduce,
          qualificationImageUrl,
          coachImageUrl,
          tseRatio: this.counselor.tseRatio,
          wxQrcodeUrl,
          tseExpandId: this.counselor.tseExpandId,
          tseProperty:this.counselor.tseProperty 
        })
      ).data;
      if (!res.errMsg) {
        this.$msg("保存成功", "success");
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
  },
};
</script>

<style lang="less" scoped>
.detail-footer {
  text-align: center;
}

.vertical-top {
  vertical-align: top;
}

.section-label {
  display: inline-block;
  width: 160px;
  text-align: left;
}
.label-1 {
  text-align: right;
  font-size: 15px;
}

.detail-section {
  margin: 22px 0 22px 6%;
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
</style>

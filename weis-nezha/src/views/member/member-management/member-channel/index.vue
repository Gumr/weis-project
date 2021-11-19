<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="7"
        :label-width="60"
        semi
      >
        <template #action>
          <el-button
            type="primary"
            @click="searchClick"
          >搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
            >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button
          >
        </template>
      </QueryComponents>
      <el-button style="float: right" type="danger" @click="showDialog"
        >添加渠道</el-button
      >
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="height"
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
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span
              v-if="row.type != '03'"
              class="brand-color cursor-pointer action-label"
              @click="toEdit(row)"
              >编辑</span
            >
            <span
              class="brand-color cursor-pointer action-label"
              @click="toDetail(row)"
              >详情</span
            >
            <!-- <span class="brand-color cursor-pointer action-label" @click="toDel(row)">删除</span> -->
          </template>
        </el-table-column>
      </BasePageTable>
      <ConfirmDialog
        v-model="hasDialog"
        :title="title"
        :close-on-click-modal="false"
        :auto-confirm="false"
        :async-confirm="true"
        @on-confirm="onConfirm"
      >
        <div style="padding: 20px 0">
          <div class="section-item">
            <span class="section-label label-1">渠道类型：</span>
            <span>
              活动
              <!-- <span style="font-size: 10px;color: #666666;margin-left: 20px">提示：若添加企业渠道，请前往企业管理模块</span> -->
            </span>
          </div>
          <div class="section-item">
            <span class="section-label label-1">
              <span style="color: red">*</span>来源名称：
            </span>
            <el-input
              v-model="current.channelName"
              class="small-input"
            ></el-input>
          </div>
          <div class="section-item">
            <span class="section-label label-1">关联客户经理（选填）：</span>
            <base-select
              v-model="current.tcaId"
              :options="counselorOptions"
              clearable
              :props="{ label: 'counselorName', value: 'id' }"
            />
          </div>
          <div class="section-item">
            <span class="section-label label-1">关联折扣组（选填）：</span>
            <base-select
              v-model="current.tdgId"
              :options="discountGroupOptions"
              clearable
              :props="{ label: 'groupName', value: 'groupId' }"
            />
          </div>
          <!-- <div class="section-item">
            <span class="section-label label-1">客户经理提成：</span>
            <div class="display-flex flex-items-center">
              <NumberInput v-model="current.tcaRatio" />
              <span>%</span>
            </div>
          </div>-->
          <div class="section-item">
            <span class="section-label label-1">
              <span style="color: red">*</span>备注：
            </span>
            <el-input
              v-model="current.remark"
              class="small-input"
            ></el-input>
          </div>
          <!-- <div class="section-item">
            <span class="section-label label-1">
              <span style="color:red">*</span>选择来源：
            </span>
            <el-checkbox-group v-model="current.source" style="width: 500px;line-height: 30px;">
              <el-checkbox label="01">饮食</el-checkbox>
              <el-checkbox label="07">数搭</el-checkbox>
              <el-checkbox label="04">糖三彩</el-checkbox>
              <el-checkbox label="03">健身</el-checkbox>
              <el-checkbox label="08">菜品众筹小程序</el-checkbox>
              <el-checkbox label="09">维士营养餐</el-checkbox>
              <el-checkbox label="10">SmartFood+</el-checkbox>
            </el-checkbox-group>
          </div>-->
          <div class="section-item">
            <span class="section-label label-1">小程序路径：</span>
            <el-button
              type="primary"
              icon="el-icon-plus"
              @click="addPathClick"
            >添加路径</el-button>
            <el-table
              style="margin: 8px 0 0 182px;"
              :data="current.qrcodeInfo"
              border
              stripe
            >
              <el-table-column
                v-for="col in pathColumns"
                :key="col.prop"
                v-bind="col"
              >
                <template #default="{ row }">
                  <el-input
                    v-model="row[col.prop]"
                    :disabled="row.code"
                  ></el-input>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="{ row, $index }">
                  <el-button
                    v-if="!row.code"
                    size="samll"
                    type="danger"
                    @click="deletePathClick($index)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </ConfirmDialog>
      <ConfirmDialog
        v-model="deDialog"
        :title="deTitle"
        :close-on-click-modal="false"
        :comfirm-visible="false"
        :auto-confirm="false"
      >
        <div>
          <div class="section-item">
            <span class="section-label label-1">渠道类型：</span>
            <span>活动</span>
          </div>
          <div class="section-item">
            <span class="section-label label-1">渠道名称：</span>
            <span>{{ currentD.channelName }}</span>
          </div>
          <div class="section-item">
            <span class="section-label label-1">备注：</span>
            <span>{{ currentD.remark }}</span>
          </div>
          <div class="section-item">
            <span class="section-label label-1">关联客户经理：</span>
            <span>{{ currentD.tcaName }}</span>
          </div>
          <div
            v-if="currentD.tdgName"
            class="section-item"
          >
            <span class="section-label label-1">关联折扣组：</span>
            <span>{{ currentD.tdgName }}</span>
          </div>
          <div class="section-item">
            <span class="section-label label-1">渠道码：</span>
            <el-table
              style="margin: 8px 0 0 182px"
              max-height="600px"
              width="800px"
              :data="currentD.channelQrcode"
              border
              stripe
            >
              <el-table-column
                v-for="col in pathColumns"
                :key="col.prop"
                v-bind="col"
                :width="160"
              ></el-table-column>
              <el-table-column
                label="二维码"
                :width="200"
                align="center"
              >
                <template #default="{ row }">
                  <el-image
                    style="width: 200px; height: 200px"
                    :src="row.url"
                    :preview-src-list="[row.url]"
                  ></el-image> 
                   <span class="brand-color cursor-pointer action-label"  @click="downloadCodeImg(row.url,row.code,currentD.channelName)">下载</span>
                </template>
              </el-table-column>  
              <el-table-column
                label="渠道ID"
                prop="code"
              ></el-table-column>
            
            </el-table>
          </div>
        </div>
      </ConfirmDialog>
    </div>
  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import BaseSelect from "@/components/BaseSelect.vue";
// import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { defineComponent } from "vue";
import { objectForeach } from "@/utils/common";

function createForm() {
  return {
    channelName: "",
    qrcodeInfo: [
      {
        desc: "首页",
        path: "pages/index/index",
      },
    ],
    tdgId: "",
    source: [],
    remark: "",
    tcaId: "", //客戶经理ID
    tcaRatio: "5", //客戶经理提成比
  };
}
export default defineComponent({
  name: "member_member-management_member-list",
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    BaseSelect,
  },
  data() {
    return {
      height: window.innerHeight - 280,
      pathColumns: [
        {
          label: "名称",
          prop: "desc",
        },
        {
          label: "路径",
          prop: "path",
          formatter: (row) =>
            row.code ? `${row.path}?scene=${row.code}` : row.path,
        },
      ],
      title: "",
      deTitle: "",
      hasDialog: false,
      deDialog: false,
      counselorOptions: [],
      tableData: [],
      current: createForm(),
      currentD: {
        channelName: "",
        channelQrcode: [],
        remark: "",
        tcaRatio: "",
        tcaName: "",
      },
      tableDataTotal: 0,
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "渠道ID",
          prop: "channelId",
        },
        {
          label: "渠道名称",
          prop: "channelName",
        },
        {
          label: "关联客户经理",
          prop: "counselorName",
        },
        {
          label: "客户经理手机号",
          prop: "counselorPhone",
        },
        // {
        //   label: '客户经理提成',
        //   prop: 'counselorRatio',
        //   formatter: (row) => `${row.counselorRatio}%`
        // },
        // {
        //   label: '类型',
        //   prop: 'typeDesc'
        // },
        {
          label: "渠道包含来源",
          prop: "source",
          formatter: (row) => (row.source ? row.source : "无"),
        },
        {
          label: "备注",
          prop: "remark",
          formatter: (row) => (row.remark ? row.remark : "无"),
        },
        {
          label: "创建人",
          prop: "creator",
          formatter: (row) => (row.creator ? row.creator : "无"),
        },
        {
          label: "编辑日期",
          prop: "ctime",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        channelName: "",
        source: "",
        type: "",
      },
      discountGroupOptions: [],
      queryComps: [
        {
          label: "渠道名称",
          key: "channelName",
          component: "el-input",
          placholder: "请输入渠道名称",
          props: {
            clearable: true,
          },
        },
        {
          component: "BaseSelect",
          key: "source",
          label: "来源",
          placeholder: "请选择来源",
          props: {
            clearable: true,
            options: [],
          },
        },
        // {
        //   component: "BaseSelect",
        //   key: "type",
        //   label: "类型",
        //   placeholder: "请选择类型",
        //   props: {
        //     clearable: true,
        //     options: [
        //       { label: "全部", value: "" },
        //       { label: "个人", value: "01" },
        //       { label: "企业", value: "02" }
        //       // { label: '渠道经理拓展', value: '03' },
        //     ]
        //   }
        // }
      ],
    };
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    },
  },
  created() {
    this.getAppAll();
    this.getList();
    this.queryDiscountGroup();
    this.$request("Channel/queryOwnCounselor", {
      marketType: "01",
      channel: "02",
      status: "03",
    }).thenwrap((err, data) => {
      if (err) return;
      this.counselorOptions = data;
    });
  },
  methods: {
    queryDiscountGroup() {
      this.$request("discount.DiscountGroup/queryDiscountGroup", {
        pageNo: 1,
        pageSize: 9999,
        readOnly: "01",
      }).thenwrap((err, data) => {
        if (!err) {
          this.discountGroupOptions = data.record.map((i) => ({
            groupId: String(i.groupId),
            groupName: i.groupName,
          }));
        }
      });
    },

    addPathClick() {
      this.current.qrcodeInfo.push({
        desc: "",
        path: "",
      });
    },
    deletePathClick(i) {
      this.current.qrcodeInfo.splice(i, 1);
    },
    async getAppAll() {
      const res = await this.$http("Dictionaries/getAppidAll", {});
      this.queryComps[1].props.options = res.obj;
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.queryParams,
      };
      this.$store.state.vloading = true;
      const res = await this.$http("UserChannel/getAll", params);
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
        this.$nt(() => {
          this.$refs.table.doLayout();
        });
      }
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.queryParams,
        pageNo: 1,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http("UserChannel/getAll", params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record,
      });
    },
    showDialog() {
      this.title = "添加渠道";
      this.hasDialog = true;
      this.current = createForm();
    },
    async toEdit(row) {
      this.title = "编辑渠道";
      const { obj } = await this.$http("UserChannel/channelInfo", {
        channelId: row.channelId,
      });
      const source = obj.channelQrcode.map((item) => item.source);
      const { current } = this;
      objectForeach(current, (_, k) => {
        current[k] = obj[k];
      });
      current.channelId = row.channelId;
      current.source = source;
      current.qrcodeInfo = obj.channelQrcode.map((item) => ({
        desc: item.desc,
        path: item.path,
        code: item.code,
      }));
      // this.current = {
      //   channelId: obj.channelId,
      //   channelName: obj.channelName,
      //   tcaId: obj.tcaId,
      //   tcaRatio: obj.tcaRatio,
      //   source,
      //   qrcodeInfo: obj.channelQrcode.map(item => ({ desc: item.desc, path: item.path, code: item.code })),
      //   remark: obj.remark,

      // }
      this.hasDialog = true;
    },
    async onConfirm(done) {
      const { current } = this;
      if (!current.channelName) {
        this.$msg("请输入渠道名称", "error");
        done();
        return;
      }
      if (!current.remark) {
        this.$msg("请输入备注", "error");
        done();
        return;
      }
      if (current.tcaId && !current.tcaRatio) {
        this.$msg("请输入客户经理提成", "error");
        done();
        return;
      }
      const index = current.qrcodeInfo.findIndex(
        (item) => !item.desc || !item.path
      );
      if (index !== -1) {
        this.$msg(`请填写完整第${index + 1}项路径`, "error");
        done();
        return;
      }
      const params = this.$deepClone(current);
      params.qrcodeInfo = params.qrcodeInfo.filter((item) => !item.code);
      const url = current.channelId
        ? "UserChannel/editChannel"
        : "UserChannel/addChannel";
      const res = await this.$http(url, params);
      if (!res.errMsg) {
        this.$msg("操作成功", "success");
        this.getList();
        this.hasDialog = false;
        if (res.obj.channelId) {
          this.deTitle = "添加成功";
          const res1 = await this.$http("UserChannel/channelInfo", {
            channelId: res.obj.channelId,
          });
          Object.assign(this.currentD, res1.obj);
          this.deDialog = true;
        }
      } else {
        this.$msg(res.errMsg, "error");
      }
      done();
    },
    async toDetail(row) {
      const res = await this.$http("UserChannel/channelInfo", {
        channelId: row.channelId,
      });
      this.deTitle = "详情";
      this.deDialog = true;
      Object.assign(this.currentD, res.obj);
      // this.currentD = {
      //   remark: res.obj.remark,
      //   channelName: res.obj.channelName,
      //   channelQrcode: res.obj.channelQrcode,
      //   tcaRatio: res.obj.tcaRatio,
      //   tcaName: res.obj.tcaName
      // };
    },
    downloadCodeImg(url,code,channelName) {
      // window.open(url);
      const link = document.createElement("a");
      link.href = url;
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          // 将链接地址字符内容转变成blob地址
          link.href = URL.createObjectURL(blob);
          link.download = "";
          link.download = `${channelName}${code}` // 下载后文件名
          document.body.appendChild(link);          
          link.click();
        });
    },
  },
});
</script>

<style lang="less" scoped>
.query-bar {
  padding: 20px 0;
  display: flex;
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
  width: 100px;
  margin-right: 20px;
}
.medium-picker {
  width: 300px;
}
.medium-input {
  width: 500px;
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
  width: 150px;
  margin: 0 20px;
}

.small-input {
  width: 300px;
  margin-right: 10px;
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
    height: 30px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 200px;
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
.action-label {
  margin-right: 10px;
}
</style>

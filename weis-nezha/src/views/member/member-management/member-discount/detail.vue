<template>
  <div class="page-container">
    <ReturnButton />
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="90"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >
            {{ $store.state.bloading ? '导出中' : '导出' }}
          </el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="toCreate()">添加用户</el-button>
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
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span class="brand-color cursor-pointer action-label" @click="toDel(row)">移除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <input
      ref="upload"
      type="file"
      accept=".xls, .xlsx"
      class="outputlist_upload"
      style="opacity: 0;"
    />
    <ConfirmDialog
      v-model="box"
      title="添加用户"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <div>
        <div class="section-item" style="align-items: flex-start;">
          <span class="section-label label-2" @click="downLoadTemplate">下载模板</span>
          <span class="section-label label-3" @click="choiceUpload">上传模板</span>
        </div>
        <div class="section-item" style="align-items: flex-start;">
          <span class="section-label label-1">用户手机：</span>
          <el-input v-model="phone" class="medium-input" clearable />
        </div>
        <div v-if="phoneList.length" class="section-item" style="align-items: flex-start;">
          <span class="section-label label-1"></span>
          <div class="section-label" style="width: 550px;height: auto;">
            <span v-for="(item, index) in phoneList" :key="index" class="phone-item">
              {{ item }}
              <span class="close" @click="close(index)">x</span>
            </span>
          </div>
        </div>
        <div class="section-item" style="align-items: flex-start;">
          <span class="section-label label-1"></span>
          <el-button type="primary" @click="verify">校验</el-button>
        </div>
        <div class="section-item" style="align-items: flex-start;">
          <span class="section-label label-1">可行的用户手机:</span>
          <span class="section-label" style="width: 500px;">{{ verifyArr.feasible }}</span>
        </div>
        <div class="section-item" style="align-items: flex-start;">
          <span class="section-label label-1">未注册的手机:</span>
          <span class="section-label" style="width: 500px;">{{ verifyArr.notRegister }}</span>
        </div>
        <div class="section-item" style="align-items: flex-start;">
          <span class="section-label label-1">已进组手机:</span>
          <span class="section-label" style="width: 500px;">{{ verifyArr.already }}</span>
        </div>
        <!-- <div class="section-item" style="align-items: flex-start;">
          <span class="section-label" style="margin-left: 100px;">已导入人数：{{loadIn.length - unIn.length}}；未导入人数：{{unIn.length}}</span>
        </div>
        <div class="section-item" style="align-items: flex-start;">
          <span class="section-label label-1">未导入手机号：</span>
          <el-input class="medium-input" type="textarea" :rows="6" clearable :value="unIn.join('，')"/></el-input>
        </div>-->
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import ReturnButton from '@/components/ReturnButton.vue';
import XLSX from '@/utils/xlsx';
import { defineComponent } from 'vue';
export default defineComponent({
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    ReturnButton
  },
  data() {
    return {
      height: window.innerHeight - 330,
      box: false,
      phone: '',
      phoneList: [],
      tableData: [],
      isVerify: false,
      verifyArr: {
        feasible: '',
        already: '',
        notRegister: ''
      },
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '用户昵称',
          prop: 'uname'
        },
        {
          label: '用户手机',
          prop: 'phone'
        },
        {
          label: '加入日期',
          prop: 'ctime'
        },
        {
          label: '折扣',
          prop: 'discount'
        },
        {
          label: '折扣类型',
          prop: 'discountType'
        },
        {
          label: '端口',
          prop: 'port'
        },
        {
          label: '开始时间',
          prop: 'stime'
        },
        {
          label: '结束时间',
          prop: 'etime'
        },
        {
          label: '每日消费限额',
          prop: 'dayLimit'
        },
        {
          label: '操作人',
          prop: 'operator'
        },
        {
          label: '状态',
          prop: 'stt'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        groupId: '',
        phone: '',
        date: []
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'phone',
          label: '用户手机',
          placeholder: '用户手机',
          props: {
            clearable: true
          }
        },
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        }
      ]
    };
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  watch: {
    phone() {
      if (this.phone.length >= 11) {
        const uPhone = this.phone.replace(/,/g, '，').split('，');
        this.phoneList = this.phoneList.concat(uPhone);
        this.isVerify = false;
        this.phone = '';
      }
      // if (this.phone.length == 11) {
      //   this.phoneList.push(this.phone);
      //   this.phone = '';
      // }
    }
  },
  created() {
    this.queryParams.groupId = this.$route.query.groupId || '';
    this.getList();
  },
  mounted() {
    this.$refs.upload.addEventListener('change', (e) => {
      // 绑定监听表格导入事件
      this.readExcel(e);
    });
  },
  methods: {
    close(index) {
      this.phoneList.splice(index, 1);
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('discount.DiscountGroup/queryDiscountGroupRecord', params);
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal
      };
      const res = await this.$http('discount.DiscountGroup/queryDiscountGroupRecord', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      });
    },
    toCreate() {
      this.phone = '';
      this.phoneList = [];
      this.box = true;
      this.isVerify = false;
      this.verifyArr = {
        feasible: '',
        already: '',
        notRegister: ''
      };
    },
    async toDel(row) {
      this.$confirm('确定移除？', '提示？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('discount.DiscountGroup/removeGroupRecord', {
          groupId: this.$route.query.groupId,
          uid: row.uid,
          port: row.port,
          recordId: row.recordId
        });
        if (!res.errMsg) {
          this.$msg('操作成功', 'success');
          this.getList();
        } else {
          this.$msg(res.errMsg, 'error');
        }
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format('YYYY-MM-DD');
        params.endDate = endDate.format('YYYY-MM-DD');
      }
      delete params.date;
      return params;
    },
    async verify() {
      if (!this.phoneList) {
        this.$msg('请输入用户手机', 'error');
        return;
      }

      const res = await this.$http('discount.DiscountGroup/phoneVerify', { groupId: this.$route.query.groupId, phone: this.phoneList });
      this.verifyArr.notRegister = res.obj.notRegister.join(',');
      this.verifyArr.feasible = res.obj.feasible.join(',');
      this.verifyArr.already = res.obj.already.join(',');
      this.isVerify = true;
    },
    async tagConfirm(done) {
      if (!this.isVerify) {
        this.$msg('请先校验', 'error');
        done();
        return;
      }
      let { feasible, notRegister } = this.verifyArr;
      if (!feasible) {
        this.$msg('没有可添加的用户', 'error');
        done();
        return;
      }
      // if (!this.phoneList) {
      //   this.$msg('请输入用户手机', 'error');
      //   done();
      //   return;
      // }
      // const lastChart = this.phoneList.charAt(this.phoneList.length - 1);
      // if (lastChart == '，' || lastChart == ',') {
      //   this.phoneList = this.phoneList.substring(0, this.phoneList.length - 1);
      // }
      // const uPhone = this.phoneList.replace(/,/g, '，').split('，');
      feasible = feasible ? feasible.split(',') : [];
      notRegister = notRegister ? notRegister.split(',') : [];

      const tdgrPhone = [...feasible, ...notRegister];
      const res = await this.$http('discount.DiscountGroup/addGroupRecord', { tdgrTdgId: this.$route.query.groupId, tdgrPhone });
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        // this.loadIn = uPhone;
        // this.unIn = res.obj;
        this.getList();
        this.box = false;
        done();
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    },
    // 表格导入
    choiceUpload() {
      this.$refs.upload.dispatchEvent(new MouseEvent('click'));
    },
    readExcel(e) {
      const { files } = e.target;
      if (files.length <= 0) {
        this.$message({ type: 'error', message: '没有文件名' });
        return;
      }
      if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        this.$message({ type: 'error', message: '上传格式不正确，请上传xls或者xlsx格式' });
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = (ev) => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const wsname = workbook.SheetNames[0]; // 取第一张表
          let ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); // 生成json表格内容
          ws = ws.filter((val) => val['手机号']);
          const outputs = ws.map((item) => item['手机号']);
          this.phoneList = this.phoneList.concat(outputs);
          this.$refs.upload.value = '';
        } catch (e) {
          this.$message({ type: 'error', message: e });
        }
      };
      fileReader.readAsBinaryString(files[0]);
    },
    downLoadTemplate() {
      const col = [
        { label: '序号', type: 'index' },
        { label: '姓名', prop: '' },
        { label: '手机号', prop: '' }
      ];
      exportExcel({
        columns: col,
        filename: '用户折扣导入模板',
        data: []
      });
    }
  }
});
</script>

<style lang="less" scoped>
.page-container {
  padding-top: 20px;
}
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.medium-input {
  width: 525px;
  margin-right: 20px;
}
.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.label-2 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
  cursor: pointer;
  color: #409eff;
}
.label-3 {
  cursor: pointer;
  color: #409eff;
}
.phone-item {
  padding: 5px 10px;
  border: 1px solid #cccccc;
  position: relative;
  margin-right: 10px;
  margin-bottom: 10px;
  float: left;
}
.close {
  color: red;
  padding: 0 0 0 5px;
  cursor: pointer;
}
</style>

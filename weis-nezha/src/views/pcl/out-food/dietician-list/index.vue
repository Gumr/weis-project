<template>
  <div class="page-container">
    <div style="margin: 20px 0;">
      <QueryComponents v-model="queryParams" :queryList="queryComps" :span="4">
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
        </template>
      </QueryComponents>
    </div>
    <BasePageTable
      ref="table"
      :height="height"
      :data="tableData"
      :total="tableTotal"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      @current-page-change="getTableData"
      @size-change="getTableData"
      border
    >
      <el-table-column label="序号" type="index"></el-table-column>
      <el-table-column label="菜品名称" prop="tduuName"></el-table-column>
      <el-table-column label="菜品编码" prop="tduuId"></el-table-column>
      <el-table-column label="食品图片" prop="tduuFoodImage">
        <template v-slot="{ row }">
          <el-image :src="row.tduuFoodImage" :preview-src-list="[row.tduuFoodImage]" />
        </template>
      </el-table-column>
      <el-table-column label="品牌" prop="tduuBrand"></el-table-column>
      <el-table-column label="联系方式" prop="tduuPhone"></el-table-column>
      <el-table-column label="主要食材" prop="foodLibrarystr"></el-table-column>
      <el-table-column label="能量（kcal）" prop="tduuTotalKcal"></el-table-column>
      <el-table-column label="蛋白质（g）" prop="tduuProteinTotal"></el-table-column>
      <el-table-column label="脂肪（g）" prop="tduuFatTotal"></el-table-column>
      <el-table-column label="碳水化合物（g）" prop="tduuCarbohydrateTotal"></el-table-column>
      <el-table-column label="状态" :formatter="transformDataStt">
        <template v-slot="{ row }">
          <el-tag :type="getStatusTagType(row.tduuStt)">
            {{
            transformDataStt(row)
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上传人" prop="uname"></el-table-column>
      <el-table-column label="上传时间" prop="tduuCtime"></el-table-column>
      <el-table-column label="操作" width="210" align="center">
        <template v-slot="{ row }">
          <el-button
            v-if="row.tduuStt === '10'"
            @click="editClick(row.tduuId)"
            type="info"
            size="small"
          >编辑</el-button>
          <el-button
            v-if="row.tduuStt === '00'"
            @click="successClick(row.tduuId)"
            type="success"
            size="small"
          >通过</el-button>
          <el-button
            v-if="row.tduuStt === '00'"
            @click="rejectClick(row.tduuId)"
            type="danger"
            size="small"
          >驳回</el-button>
          <el-button v-if="row.tduuStt === '10'" @click="onlineClick(row.tduuId)" size="small">上线</el-button>
          <el-button @click="detailClick(row.tduuId)" type="primary" size="small">详情</el-button>
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      title="驳回原因"
      v-model="rejectVisible"
      @on-confirm="handleRejectConfirm"
      :auto-confirm="false"
      width="500px"
      center
    >
      <el-input v-model="rejectMsg" type="textarea" maxlength="100" rows="4"></el-input>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import { transformDaterange } from '@/utils/transform';

const StatusOpts = [{
  label: '全部',
  value: null
}, {
  label: '已上线',
  value: '12'
}, {
  label: '已通过',
  value: '10'
}, {
  label: '已驳回',
  value: '11'
}, {
  label: '待审核',
  value: '00'
}];

export default {
  name: 'out-food_dietician-list',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      height: window.innerHeight - 280,
      rejectMsg: '',
      tableData: [],
      rejectVisible: false,
      tableCol: [{
        type: 'index',
        label: '序号',
      }, {
        label: '食品名称',
        prop: 'tduuName'
      }, {
        label: '食品编号',
        prop: 'tduuId'
      }, {
        label: '品牌',
        prop: 'tduuBrand'
      }, {
        label: '联系方式',
        prop: 'tduuPhone'
      }, {
        label: '食品图片',
        slot: 'image',
        prop: 'tduuFoodImage'
      },
      // {
      //   label: '口味',
      //   prop: ''
      // },
      {
        label: '主要食材',
        prop: 'foodLibrarystr'
      }, {
        label: '能量（kcal）',
        prop: 'tduuTotalKcal'
      }, {
        label: '蛋白质（g）',
        prop: 'tduuProteinTotal'
      }, {
        label: '脂肪（g）',
        prop: 'tduuFatTotal'
      }, {
        label: '碳水化合物（g）',
        prop: 'tduuCarbohydrateTotal'
      }, {
        label: '状态',
        prop: 'tduuStt',
        formatter: this.transformDataStt
      }, {
        label: '上传人',
        prop: ''
      }, {
        label: '上传时间',
        prop: ''
      }],
      tableTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        stt: '',
        date: [],
        phone: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          label: '日期',
          key: 'date',
          props: {
            clearable: true,
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '请输入手机号',
          props: {
            clearable: true,
          }
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '审核状态',
          placeholder: '请选择审核状态',
          props: {
            clearable: true,
            options: StatusOpts
          }
        }
      ]
    };
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getTableData();
    },
    editClick(id) {
      this.$pushRoute('edit', {
        query: {
          id
        }
      });
    },
    onlineClick(tduuid) {
      this.$request('Diet/setDietUserUploadSttOnlineBut', {
        tduuid
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: 'success',
            message: '一键上线成功'
          });
          this.getTableData();
        } else {
          this.$message({
            type: 'error',
            message: data.errMsg
          });
        }
      });
    },
    detailClick(id) {
      this.$pushRoute('detail', {
        query: {
          id
        }
      });
    },
    getStatusTagType(status) {
      return {
        '00': 'info',
        10: 'success',
        11: 'danger',
        12: ''
      }[status];
    },
    transformDataStt(row) {
      return {
        '00': '待审核',
        10: '已通过',
        11: '已驳回',
        12: '已上线'
      }[row.tduuStt];
    },
    getTableData() {
      this.$request('Diet/getDietUserUpload', {
        ...this.genParams(),
        ...this.page
      }).then(this.$rw((err, res) => {
        if (!err) {
          this.tableData = res.record;
          this.tableTotal = res.totalRecordCount;
          setTimeout(() => {
            this.$refs.table.doLayout();
          }, 0);
        }
      }));
    },
    handleRejectConfirm() {
      if (this.rejectMsg.length <= 0) {
        this.$message({
          type: 'warning',
          message: '请填写驳回信息'
        });
        return;
      }
      this.$request('Diet/setDietUserUploadSttReject', {
        tduuid: this.rejectId,
        rejectnote: this.rejectMsg
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: 'success',
            message: '驳回成功'
          });
          this.rejectVisible = false;
          this.getTableData();
        }

        this.$errorNotify(data);
      });
    },
    rejectClick(id) {
      this.rejectId = id;
      this.rejectVisible = true;
      this.rejectMsg = '';
    },
    successClick(id) {
      this.$request('Diet/setDietUserUploadSttPass', {
        tduuid: id
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: 'success',
            message: '通过成功'
          });
          this.getTableData();
        }
      });
    },
    genParams() {
      const params = { ...this.queryParams };

      if (this.queryParams.date && this.queryParams.date.length > 0) {
        const [startDate, endDate] = transformDaterange(this.queryParams.date);
        params.staDate = startDate.format('YYYY-MM-DD');
        params.endDate = endDate.format('YYYY-MM-DD');
      }
      delete params.date;

      return params;
    }
  },
  created() {
    this.getTableData();
  }
};

</script>

<style lang="less" scoped>
.create-section {
  margin-bottom: 22px;
}
</style>

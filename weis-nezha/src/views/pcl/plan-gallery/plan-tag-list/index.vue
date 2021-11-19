<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="7"
        :label-width="60"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="addtype('1')">添加标签</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        @current-page-change="getPlanList"
        @size-change="getPlanList"
        border
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="标签ID" prop="tclCid"></el-table-column>
        <el-table-column label="标签图片">
          <template class="action-cell" v-slot="{ row }">
            <el-image :src="row.tclImgUrl" :preview-src-list="[row.tclImgUrl]" class="food-cover" />
          </template>
        </el-table-column>
        <el-table-column label="标签名称" prop="tclName"></el-table-column>
        <el-table-column label="每单位标签能量">
          <template class="action-cell" v-slot="{ row }">{{ row.tclEnergy }}Kcal</template>
        </el-table-column>
        <el-table-column label="标签单位" prop="tclUnit"></el-table-column>
        <el-table-column label="标签状态">
          <template class="action-cell" v-slot="{ row }">
            {{
            row.tclStt === "00" ? "上线" : "下线"
            }}
          </template>
        </el-table-column>
        <el-table-column label="编辑人" prop="tclAlterName"></el-table-column>
        <el-table-column label="最后修改时间" prop="tclUtime"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 8px;"
              @click="addtype(row)"
            >编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 8px;"
              @click="hideTag('update', row)"
              v-if="row.tclStt === '01'"
            >上线</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 8px;"
              @click="hideTag('update', row)"
              v-if="row.tclStt === '00'"
            >下线</span>
            <span class="brand-color cursor-pointer action-label" @click="hideTag('delete', row)">删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="editDialogVisible"
      :title="datatitle"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <el-form :model="currentTag" label-width="130px">
        <el-form-item label="标签封面">
          <ImageUpload
            :upload-data="{ flag: 'case_label' }"
            v-model:file-list="currentTag.tclImgUrl"
            :limit="1"
          />
        </el-form-item>
        <el-form-item label="标签名称">
          <el-input
            class="small-input"
            maxlength="20"
            @blur="checkTag"
            v-model="currentTag.tclName"
          ></el-input>
        </el-form-item>
        <el-form-item label="标签单位">
          <el-input class="small-input" maxlength="20" v-model="currentTag.tclUnit"></el-input>
        </el-form-item>
        <el-form-item label="每标签单位能量">
          <el-input
            class="small-input"
            type="number"
            min="0"
            maxlength="5"
            @blur="checkText"
            v-model="currentTag.tclEnergy"
          ></el-input>Kcal
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import ImageUpload from '@/components/ImageUpload.vue';

export default {
  name: 'pcl_plan-gallery_plan-tag-list',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    ImageUpload
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    this.getPlanList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tclCid: '',
      currentTag: {
        tclName: '',
        tclUnit: '',
        tclEnergy: '',
        tclImgUrl: [],
      },
      datatitle: '新增标签',
      editDialogVisible: false,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        tclStt: '',
        tclName: '',
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'tclStt',
          label: '状态',
          props: {
            options: [
              {
                label: '全部标签状态',
                value: ''
              },
              {
                label: '上线',
                value: '00'
              },
              {
                label: '下线',
                value: '01'
              },
            ]
          }
        },
        {
          component: 'el-input',
          key: 'tclName',
          label: '标签名称',
          maxlength: '30',
          placeholder: '请输入标签名称',
          props: {
            clearable: true
          }
        }
      ],
      isEnter: false,
    };
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getPlanList();
    },
    checkText() {
      this.currentTag.tclEnergy = Number(this.currentTag.tclEnergy).toFixed(1);
      this.currentTag.tclEnergy = this.currentTag.tclEnergy > 5000 ? 5000 : (this.currentTag.tclEnergy < 0 ? 0 : this.currentTag.tclEnergy);
    },
    checkTag() {
      const params = {
        tclName: this.currentTag.tclName,
        tclCid: this.currentTag.tclCid
      };
      if (this.datatitle === '新增标签') {
        delete params.tclCid;
      }
      this.$request('plan.CaseLabel/checkCaseLabelName', params).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            if (dataPage.result === 0) {
              this.isEnter = true;
            } else {
              this.$message({
                type: 'error',
                message: '标签名称重复!'
              });
            }
          }
        })
      );
    },
    getPlanList() {
      this.$store.state.vloading = true;
      this.$request('plan.CaseLabel/queryCaseLabelList', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$store.state.vloading = false;
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
          }
        })
      );
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
    addtype(dateList) {
      if (dateList.tclCid) {
        this.datatitle = '编辑标签';
        this.currentTag = { ...dateList };
        this.currentTag.tclImgUrl = [{ url: this.currentTag.tclImgUrl }];
        this.tclCid = dateList.tclCid;
      } else {
        this.datatitle = '新增标签';
        this.currentTag = {
          flag: 'case',
          tclName: '',
          tclUnit: '',
          tclEnergy: '',
          tclImgUrl: [],
        };
      }
      this.editDialogVisible = true;
    },
    onconfirm() {
      const params = this.$deepClone(this.currentTag);
      if (!params.tclImgUrl[0]) {
        this.$message('请上传图片！');
        return;
      }
      params.tclImgUrl = params.tclImgUrl[0].response ? params.tclImgUrl[0].response.obj.imageUrl : params.tclImgUrl[0].url;
      const index = params.tclImgUrl.lastIndexOf('.');
      const ext = params.tclImgUrl.substr(index + 1);
      if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
        this.$message('图片格式错误！');
        return;
      }
      let url = '';
      if (params.tclName === '' || params.tclUnit === '' || params.tclEnergy === '') {
        this.$message({
          type: 'error',
          message: '参数不能为空!'
        });
        return;
      }
      url = 'plan.CaseLabel/updateCaseLabel';
      let message = '添加成功';
      if (this.datatitle !== '新增标签') {
        params.tclCid = this.tclCid;
        message = '修改成功';
      }
      this.$request(url, params).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({ type: 'success', message, });
            this.editDialogVisible = false;
            this.getPlanList();
          } else {
            this.$message({ type: 'error', message: err.errMsg });
          }
        })
      );
    },
    hideTag(type, datalist) {
      const tclStt = datalist.tclStt === '00' ? '01' : '00';
      const params = {
        tclCid: datalist.tclCid,
        tclStt,
      };
      let url = '';
      if (type === 'update') {
        url = 'plan.CaseLabel/updateCaseLabelStatus';
      } else {
        url = 'plan.CaseLabel/deleteCaseLabel';
        delete params.tclStt;
      }
      this.$request(url, params).then(
        this.$rw((err) => {
          console.log(err);
          if (!err) {
            this.$message({
              type: 'success',
              message: '操作成功!'
            });
            this.editDialogVisible = false;
            this.getPlanList();
          }
        })
      );
    }
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.small-input {
  margin: 0 8px;
  width: 300px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>

<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="60"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="create">新建内容</el-button>
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
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="tdcPageId" label="轮播ID"></el-table-column>
        <el-table-column prop="tdcTitle" label="标题"></el-table-column>
        <el-table-column label="封面" align="center">
          <template #default="{ row }" class="action-cell">
            <el-image
              v-if="row.tdcImgUrl"
              style="width: 100px;height:100px"
              :src="row.tdcImgUrl"
              :preview-src-list="[row.tdcImgUrl]"
            />
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="tdcLink" label="链接"></el-table-column>
        <el-table-column prop="tdcTargetDesc" label="所属市场"></el-table-column>
        <el-table-column prop="tdcTopDesc" label="是否首播"></el-table-column>
        <el-table-column prop="tdcSttDesc" label="当前状态"></el-table-column>
        <el-table-column prop="tdcRemark" label="备注"></el-table-column>
        <el-table-column prop="tdcUpdator" label="最后操作人"></el-table-column>
        <el-table-column prop="tdcUtime" label="最后操作时间"></el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template #default="{ row }" class="action-cell">
            <span class="brand-color cursor-pointer action-label" @click="edit(row, true)">编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="update(row)"
            >{{ row.tdcStt == '01' ? '下线' : '上线' }}</span>
            <span class="brand-color cursor-pointer action-label" @click="deleteById(row)">删除</span>
            <span class="brand-color cursor-pointer action-label" @click="edit(row, false)">详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
      <ConfirmDialog
        v-model="box"
        :title="isEdit ? '内容' : '详情'"
        :close-on-click-modal="false"
        :async-confirm="true"
        :comfirm-visible="isEdit"
        :auto-confirm="false"
        @on-confirm="onConfirm"
      >
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>内容封面：
          </span>
          <ImageUpload
            v-if="isEdit"
            v-model:file-list="currentTag.tdcImgUrl"
            :upload-data="{ flag: 'diet-tag' }"
            :limit="1"
          />
          <el-image
            v-else
            style="width: 200px"
            :src="currentTag.tdcImgUrl[0].url"
            :preview-src-list="[currentTag.tdcImgUrl[0].url]"
          ></el-image>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>标题：
          </span>
          <el-input
            v-if="isEdit"
            v-model="currentTag.tdcTitle"
            clearable
            class="medium-input"
            maxlength="100"
            placeholder="请输入标题"
          ></el-input>
          <span v-else>{{ currentTag.tdcTitle }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>跳转内容：
          </span>
          <el-radio-group v-model="currentTag.tdcLinkType" :disabled="!isEdit" @change="currentTag.tdcLink = ''">
            <el-radio v-for="item in linkTypeOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </div>
        <div class="section-item" style="padding-left: 182px">
          <div v-if="isEdit">
            <UploadImage v-if="currentTag.tdcLinkType === '03'" v-model="currentTag.tdcLink" :disabled="!isEdit" />
            <el-input v-else v-model="currentTag.tdcLink" :disabled="!isEdit" style="width: 200px" placeholder="请输入链接"></el-input>
          </div>
          <div v-else>
            <el-image v-if="currentTag.tdcLinkType === '03'" :src="currentTag.tdcLink" />
            <span v-else>{{ currentTag.tdcLink }}</span>
          </div>
        </div>
        <!-- <div class="section-item">
          <span class="section-label label-1">链接：</span>
          <el-input
            v-if="isEdit"
            v-model="currentTag.tdcLink"
            clearable
            class="medium-input"
            placeholder="请输入链接"
          ></el-input>
          <span v-else>{{ currentTag.tdcLink }}</span>
        </div> -->
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>上线周期：
          </span>
          <el-date-picker
            v-if="isEdit"
            v-model="currentTag.date"
            class="medium-input"
            type="daterange"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
          <span v-else>{{ currentTag.tdcStartDate }} - {{ currentTag.tdcEndDate }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>所属市场：
          </span>
          <span v-if="isEdit">
            <el-radio-group v-model="currentTag.tdcTarget">
              <el-radio
                v-for="(item, index) in radioGroup"
                :key="index"
                :label="item.value"
              >{{ item.label }}</el-radio>
            </el-radio-group>
          </span>
          <span v-else>{{ currentTag.tdcTargetDesc }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>是否首播：
          </span>
          <el-radio-group v-if="isEdit" v-model="currentTag.tdcTop">
            <el-radio label="01">是</el-radio>
            <el-radio label="00">否</el-radio>
          </el-radio-group>
          <span v-else>{{ currentTag.tdcTopDesc }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">备注：</span>
          <el-input
            v-if="isEdit"
            v-model="currentTag.tdcRemark"
            clearable
            class="medium-input"
            type="textarea"
            :rows="5"
            placeholder="请输入备注"
          ></el-input>
          <span v-else>{{ currentTag.tdcRemark }}</span>
        </div>
      </ConfirmDialog>
    </div>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import ImageUpload from '@/components/ImageUpload.vue';
import UploadImage from '@/components/UploadImage'
function createForm() {
  return {
    tdcLinkType: '01',
    tdcTitle: '',
    tdcImgUrl: [],
    tdcLink: '',
    date: [],
    tdcTarget: '',
    tdcTop: '00',
    tdcRemark: ''
  }
}

export default {
  name: 'goods_dish-unit',
  components: {
    UploadImage,
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    ImageUpload
  },
  data() {
    return {
      box: false,
      uname: '',
      height: window.innerHeight - 280,
      isEdit: true,
      tableData: [],
      tableDataTotal: 0,
      radioGroup: [],
      currentTag: createForm(),
      linkTypeOptions: [
        {
          label: '小程序路径',
          value: '01'
        },
        {
          label: '链接',
          value: '02'
        },
        {
          label: '图片',
          value: '03'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        title: '',
        top: '',
        target: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'title',
          label: '标题',
          placeholder: '标题',
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'top',
          label: '是否首播',
          placeholder: '请选择',
          props: {
            clearable: true,
            options: [{ label: '是', value: '01' }, { label: '否', value: '00' }]
          }
        },
        {
          component: 'BaseSelect',
          key: 'target',
          label: '所属市场',
          placeholder: '请选择',
          props: {
            clearable: true,
            options: []
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
  created() {
    this.getTarget();
    this.getList();
  },
  methods: {
    async getTarget() {
      const res = await this.$http('discover.DiscoverLabel/queryTargetList', {});
      this.queryComps[2].props.options = res.obj;
      this.radioGroup = res.obj;
    },
    create() {
      this.currentTag = createForm();
      this.box = true;
      this.isEdit = true;
    },
    edit(row, flag) {
      this.isEdit = flag;
      Object.assign(this.currentTag, row);
      this.currentTag.tdcImgUrl = this.currentTag.tdcImgUrl ? [{ url: this.currentTag.tdcImgUrl }] : [];
      this.currentTag.date = [this.$day(this.currentTag.tdcStartDate).format('YYYY-MM-DD'), this.$day(this.currentTag.tdcEndDate).format('YYYY-MM-DD')];
      this.box = true;
    },
    async update(row) {
      const opType = row.tdcStt == '01' ? '00' : '01';
      const res = await this.$http('discover.DiscoverCarousel/updateDiscoverCarouselState', { tdcId: row.tdcId, opType });
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.getList();
      } else {
        this.$msg(res.errMsg, 'error');
      }
    },
    async deleteById(row) {
      this.$confirm('确定删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('discover.DiscoverCarousel/deleteDiscoverCarousel', { tdcId: row.tdcId });
        if (!res.errMsg) {
          this.$msg('删除成功', 'success');
          this.getList();
        } else {
          this.msg(res.errMsg, 'error');
        }
      });
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('discover.DiscoverCarousel/queryDiscoverCarouselPage', params);
      if (!res.errMsg) {
        this.tableData = res.obj.dataPage.record;
        this.tableDataTotal = res.obj.dataPage.totalRecordCount;
        this.$nt(() => {
          this.$refs.table.doLayout();
        });
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
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
    async onConfirm(done) {
      const params = this.$deepClone(this.currentTag);
      if (!params.tdcImgUrl.length) {
        this.$msg('请上传内容封面', 'error');
        done();
        return;
      }
      if (!params.tdcTitle) {
        this.$msg('请输入标题', 'error');
        done();
        return;
      }
      if (!params.tdcTarget) {
        this.$msg('请选择市场', 'error');
        done();
        return;
      }
      if (!params.tdcLink) {
        this.$msg('请输入跳转内容', 'error');
        done();
        return;
      }
      if (!params.date || !params.date.length) {
        this.$msg('请选择周期', 'error');
        done();
        return;
      }
      params.tdcImgUrl =params.tdcImgUrl[0].response ? params.tdcImgUrl[0].response.obj.imageUrl : params.tdcImgUrl[0].url
      params.tdcStartDate = params.date[0];
      params.tdcEndDate = params.date[1];
      const res = await this.$http('discover.DiscoverCarousel/updateDiscoverCarousel', params);
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.box = false;
        this.getList();
        setTimeout(done, 500);
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    }
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.medium-input {
  width: 250px;
  margin-right: 20px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
.qrcode {
  display: inline-block;
  padding: 10px 0;
  img {
    width: 132px;
    height: 132px;
    background-color: #fff; //设置白色背景色
    padding: 6px; // 利用padding的特性，挤出白边
    box-sizing: border-box;
  }
}
</style>

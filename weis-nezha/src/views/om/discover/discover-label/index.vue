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
        <el-table-column prop="tdlPageId" label="内容ID"></el-table-column>
        <el-table-column prop="tdlTitle" label="标签"></el-table-column>
        <el-table-column label="挂件" align="center">
          <template #default="{ row }" class="action-cell">
            <el-image
              v-if="row.tdlImgUrl"
              style="width: 100px;height:100px"
              :src="row.tdlImgUrl"
              :preview-src-list="[row.tdlImgUrl]"
            />
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="tdlLink" label="链接"></el-table-column>
        <el-table-column prop="tdlTargetDesc" label="所属市场"></el-table-column>
        <el-table-column prop="tdlTopDesc" label="是否置顶"></el-table-column>
        <el-table-column prop="tdlSttDesc" label="当前状态"></el-table-column>
        <el-table-column prop="tdlRemark" label="备注"></el-table-column>
        <el-table-column prop="tdlUpdator" label="最后操作人"></el-table-column>
        <el-table-column prop="tdlUtime" label="最后操作时间"></el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template #default="{ row }" class="action-cell">
            <span class="brand-color cursor-pointer action-label" @click="edit(row, true)">编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="update(row)"
            >{{ row.tdlStt == '01' ? '下线' : '上线' }}</span>
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
          <span class="section-label label-1">挂件：</span>
          <ImageUpload
            v-if="isEdit"
            v-model:file-list="currentTag.tdlImgUrl"
            :upload-data="{ flag: 'diet-tag' }"
            :limit="1"
          />
          <el-image
            v-else-if="currentTag.tdlImgUrl && currentTag.tdlImgUrl.length > 0"
            style="width: 200px"
            :src="currentTag.tdlImgUrl[0].url"
            :preview-src-list="[currentTag.tdlImgUrl[0].url]"
          ></el-image>
          <span v-if="isEdit" style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 14 X 14</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>标签：
          </span>
          <el-input
            v-if="isEdit"
            v-model="currentTag.tdlTitle"
            clearable
            class="medium-input"
            maxlength="100"
            placeholder="请输入标签"
          ></el-input>
          <span v-else>{{ currentTag.tdlTitle }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">链接：</span>
          <el-input
            v-if="isEdit"
            v-model="currentTag.tdlLink"
            clearable
            class="medium-input"
            placeholder="请输入链接"
          ></el-input>
          <span v-else>{{ currentTag.tdlLink }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>所属市场：
          </span>
          <el-radio-group v-if="isEdit" v-model="currentTag.tdlTarget">
            <el-radio
              v-for="(item, index) in radioGroup"
              :key="index"
              :label="item.value"
            >{{ item.label }}</el-radio>
          </el-radio-group>
          <span v-else>{{ currentTag.tdlTargetDesc }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>是否置顶：
          </span>
          <el-radio-group v-if="isEdit" v-model="currentTag.tdlTop">
            <el-radio label="01">是</el-radio>
            <el-radio label="00">否</el-radio>
          </el-radio-group>
          <span v-else>{{ currentTag.tdlTopDesc }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">备注：</span>
          <el-input
            v-if="isEdit"
            v-model="currentTag.tdlRemark"
            clearable
            class="medium-input"
            type="textarea"
            :rows="5"
            placeholder="请输入备注"
          ></el-input>
          <span v-else>{{ currentTag.tdlRemark }}</span>
        </div>
      </ConfirmDialog>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ImageUpload from '@/components/ImageUpload.vue'

export default {
  name: 'goods_dish-unit',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    ImageUpload
  },
  data() {
    return {
      isEdit: true,
      box: false,
      uname: '',
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      radioGroup: [],
      currentTag: {
        tdlTitle: '',
        tdlImgUrl: [],
        tdlLink: '',
        tdlTarget: [],
        tdlTop: '',
        tdlRemark: ''
      },
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
          label: '标签',
          placeholder: '标签',
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'top',
          label: '是否置顶',
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
    }
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps]
      return list
    }
  },
  created() {
    this.getTarget()
    this.getList()
  },
  methods: {
    async getTarget() {
      const res = await this.$http('discover.DiscoverLabel/queryTargetList', {})
      this.queryComps[2].props.options = res.obj
      this.radioGroup = res.obj
    },
    create() {
      this.currentTag = {
        tdlTitle: '',
        tdlImgUrl: [],
        tdlLink: '',
        tdlTarget: '',
        tdlTop: '00',
        tdlRemark: ''
      }
      this.box = true
      this.isEdit = true
    },
    edit(row, flag) {
      this.isEdit = flag
      Object.assign(this.currentTag, row)
      this.currentTag.tdlImgUrl = this.currentTag.tdlImgUrl ? [{ url: this.currentTag.tdlImgUrl }] : []
      this.box = true
    },
    async update(row) {
      const opType = row.tdlStt == '01' ? '00' : '01'
      const res = await this.$http('discover.DiscoverLabel/updateDiscoverLabelState', { tdlId: row.tdlId, opType })
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.getList()
      } else {
        this.$msg(res.errMsg, 'error')
      }
    },
    async deleteById(row) {
      this.$confirm('确定删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('discover.DiscoverLabel/deleteDiscoverLabel', { tdlId: row.tdlId })
        if (!res.errMsg) {
          this.$msg('删除成功', 'success')
          this.getList()
        } else {
          this.msg(res.errMsg, 'error')
        }
      })
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      const res = await this.$http('discover.DiscoverLabel/queryDiscoverLabelPage', params)
      if (!res.errMsg) {
        this.tableData = res.obj.dataPage.record
        this.tableDataTotal = res.obj.dataPage.totalRecordCount
        this.$nt(() => {
          this.$refs.table.doLayout()
        })
      }
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date)
        params.startDate = startDate.format('YYYY-MM-DD')
        params.endDate = endDate.format('YYYY-MM-DD')
      }
      delete params.date
      return params
    },
    async onConfirm(done) {
      const params = this.$deepClone(this.currentTag)
      if (!params.tdlTitle) {
        this.$msg('请输入标签', 'error')
        done()
        return
      }
      if (!params.tdlTarget.length) {
        this.$msg('请选择市场', 'error')
        done()
        return
      }
      params.tdlImgUrl = params.tdlImgUrl.length ? (params.tdlImgUrl[0].response ? params.tdlImgUrl[0].response.obj.imageUrl : params.tdlImgUrl[0].url) : ''
      const res = await this.$http('discover.DiscoverLabel/updateDiscoverLabel', params)
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.box = false
        this.getList()
        setTimeout(done, 500)
      } else {
        this.$msg(res.errMsg, 'error')
        done()
      }
    }
  }
}
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

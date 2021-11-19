<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
          v-model="queryParams"
          :query-list="queryComps"
          :label-width="70"
          semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
              type="primary"
              :loading="$store.state.bloading"
              @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}
          </el-button>

        </template>
      </QueryComponents>
      <div class="flex-items-center">
        <el-button type="primary" @click="createClick()">新建</el-button>
      </div>
    </div>
    <div>
      <BasePageTable
          ref="table"
          v-model:current-page="page.pageNo"
          v-model:page-size="page.pageSize"
          v-loading="$store.state.vloading"
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
          <template #default="{ row }">
            <span class="table-action-label" @click="editClick(row)">编辑</span>
            <span
                v-if="row.stt !== '01'"
                class="table-action-label mg-left-8"
                @click="changeStatusClick(row, '01')"
            >上线</span
            >
            <span
                v-else
                class="table-action-label mg-left-8"
                @click="changeStatusClick(row, '00')"
            >下线</span
            >
            <!--            <span class="table-action-label mg-left-8" @click="detailClick(row)">详情</span>-->
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
  <ConfirmDialog
      v-model="coachDialog"
      async-confirm
      :auto-loading="false"
      @on-confirm="handleDialogConfirm"
  >
    <ButtonTabs v-model="tab" :tabs="!createDialog?tabs:createTabs" use-slot @change="handleTabChange">
      <template #info>
        <div>
          <h3>基本信息</h3>
          <el-form
              ref="form"
              :model="coach"
              label-width="100px"
              :rules="coachRules"
          >
            <el-form-item label="关联客户经理" prop="counselorPhone">
              <span v-if="detailDialog">{{ coach.counselorPhone }}</span>
              <BaseSelect
                  v-else
                  v-model="coach.counselorPhone"
                  :options="phoneList"
                  clearable
                  filterable
                  @update:modelValue="checkRole"
                  placeholder="请输入手机号"
              ></BaseSelect>
            </el-form-item>
            <el-form-item label="教练头像" prop="headPortrait">
              <el-image
                  v-if="detailDialog"
                  class="el-upload-list__item-thumbnail"
                  :src="headPortraitImages"
                  alt
                  style="width:120px;height:120px"
              ></el-image>
              <UploadImage
                  v-else
                  reupload
                  :model-value="headPortraitImages"
                  type="list"
                  :limit="Infinity"
                  @change="headPortraitChange"
              ></UploadImage>
            </el-form-item>
            <el-form-item label="姓名" prop="coachName">
              <span v-if="detailDialog">{{ coach.coachName }}</span>
              <el-input v-else v-model="coach.coachName"></el-input>
            </el-form-item>
            <el-form-item label="微信号" prop="wxNumber">
              <span v-if="detailDialog">{{ coach.wxNumber }}</span>
              <el-input v-else v-model="coach.wxNumber"/>
            </el-form-item>
            <el-form-item label="手机号" prop="coachPhone">
              <span v-if="detailDialog">{{ coach.coachPhone }}</span>
              <NumberInput v-else v-model="coach.coachPhone" :precision="11"/>
            </el-form-item>
            <el-form-item label="自我介绍" prop="introduce">
              <span v-if="detailDialog">{{ coach.introduce }}</span>
              <el-input
                  v-else
                  v-model="coach.introduce"
                  type="textarea"
                  :rows="4"
              ></el-input>
            </el-form-item>
            <el-form-item label="擅长领域" prop="adeptField">
              <span v-if="detailDialog">{{ coach.adeptField }}</span>
              <el-input
                  v-else
                  v-model="coach.adeptField"
                  type="textarea"
                  :rows="4"
              ></el-input>
            </el-form-item>
            <el-form-item label="服务领域" prop="territoryList">
              <el-button v-if="!detailDialog" type="primary" @click="addDomainClick"
              >添加领域
              </el-button
              >
              <div
                  v-for="(_, index) in coach.territoryList"
                  :key="index"
                  class="mg-tp-8"
              >
                <span v-if="!detailDialog">领域{{ index + 1 }}</span>
                <span v-if="detailDialog">{{ coach.territoryList[index] }}</span>
                <el-input
                    v-else
                    v-model="coach.territoryList[index]"
                    class="w-240 mg-left-8"
                ></el-input>
                <el-button
                    v-if="!detailDialog"
                    class="mg-left-8"
                    type="danger"
                    size="small"
                    @click="coach.territoryList.splice(index, 1)"
                >删除
                </el-button
                >
              </div>
            </el-form-item>
            <el-form-item label="教练风采" prop="exhibition">
              <el-image
                  v-if="detailDialog"
                  v-for="(url, inx) in exhibitionImages"
                  :key="inx"
                  style="width: 200px;margin-right:10px"
                  :src="url"
                  :preview-src-list="[url]"
              ></el-image>
              <UploadImage
                  v-else
                  reupload
                  :model-value="exhibitionImages"
                  type="list"
                  :limit="Infinity"
                  @change="exhibitionChange"
              ></UploadImage>
            </el-form-item>
            <el-form-item label="专业证书" prop="certificate">
              <el-image
                  v-if="detailDialog"
                  v-for="(url, inx) in certificateImages"
                  :key="inx"
                  style="width: 200px;margin-right:10px"
                  :src="url"
                  :preview-src-list="[url]"
              ></el-image>
              <UploadImage
                  v-else
                  reupload
                  :model-value="certificateImages"
                  type="list"
                  :limit="Infinity"
                  @change="certificateImageChange"
              >
                <!--                <template #footer="{ index }">-->
                <!--                  <el-input-->
                <!--                      v-model="coach.certificate[index].name"-->
                <!--                      class="image-input mg-tp-8"-->
                <!--                  ></el-input>-->
                <!--                </template>-->
              </UploadImage>
            </el-form-item>
            <!--            <el-form-item label="排序" prop="showRank">-->
            <!--              <NumberInput v-model="coach.showRank"/>-->
            <!--            </el-form-item>-->
          </el-form>
        </div>
      </template>
      <template #address>
        <div class="text-right">
          <el-button class="button-margin" @click="createAddressClick"
          >新建地址
          </el-button
          >
        </div>
        <BasePageTable
            v-model:current-page="address.page.pageNo"
            v-model:page-size="address.page.pageSize"
            :data="address.data"
            :total="address.total"
            @page-change="queryServiceAdders"
        >
          <el-table-column
              v-for="col in address.cols"
              :key="col.label"
              v-bind="col"
          ></el-table-column>
          <el-table-column key="address" label="操作">
            <template #default="{ row }">
              <span class="table-action-label" @click="editAddressClick(row)"
              >编辑</span
              >
              <span
                  class="table-action-label mg-left-8"
                  @click="deleteAddressClick(row)"
              >删除</span
              >
            </template>
          </el-table-column>
        </BasePageTable>
      </template>
      <template #course>
        <div class="text-right">
          <el-button class="button-margin" @click="createCourseClick"
          >新建课程
          </el-button
          >
        </div>
        <BasePageTable
            v-model:current-page="course.page.pageNo"
            v-model:page-size="course.page.pageSize"
            :data="course.data"
            :total="course.total"
            @page-change="queryCourse"
        >
          <el-table-column
              v-for="col in course.cols"
              :key="col.prop"
              v-bind="col"
          ></el-table-column>
          <el-table-column key="course" label="操作">
            <template #default="{ row }">
              <span class="table-action-label" @click="editCourseClick(row)"
              >编辑</span
              >
              <span
                  class="table-action-label mg-left-8"
                  @click="deleteCourseClick(row)"
              >删除</span
              >
            </template>
          </el-table-column>
        </BasePageTable>
      </template>
      <template #example>
        <div class="text-right">
          <el-button class="button-margin" @click="createExampleClick"
          >新建案例
          </el-button
          >
        </div>
        <BasePageTable
            v-model:current-page="example.page.pageNo"
            v-model:page-size="example.page.pageSize"
            :data="example.data"
            :total="example.total"
            @page-change="queryInstance"
        >
          <el-table-column
              v-for="(col, index) in example.cols"
              :key="index"
              v-bind="col"
          ></el-table-column>
          <el-table-column key="训练前" label="训练前">
            <template #default="{ row }">
              <el-image
                  v-for="(item, index) in row.drillBeforeImg"
                  :key="index"
                  :src="item.imageUrl"
                  :preview-src-list="[item.imageUrl]"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column key="训练后" label="训练后">
            <template #default="{ row }">
              <el-image
                  v-for="(item, index) in row.drillAfterImg"
                  :key="index"
                  :src="item.imageUrl"
                  :preview-src-list="[item.imageUrl]"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column key="效果" label="效果">
            <template #default="{ row }"
            >{{ row.drillBefore }}斤-{{ row.drillAfter }}斤
            </template
            >
          </el-table-column>
          <el-table-column key="example" label="操作">
            <template #default="{ row }">
              <span class="table-action-label" @click="editExampleClick(row)"
              >编辑</span
              >
              <span
                  class="table-action-label mg-left-8"
                  @click="deleteExampleClick(row)"
              >删除</span
              >
            </template>
          </el-table-column>
        </BasePageTable>
      </template>
      <template #comment>
        <div class="text-right button-margin">
          <el-button @click="exportCommentClick">导出</el-button>
        </div>
        <BasePageTable
            v-model:current-page="comment.page.pageNo"
            v-model:page-size="comment.page.pageSize"
            :data="comment.data"
            :total="comment.total"
            @page-change="queryCoachEvaluate"
        >
          <el-table-column
              v-for="col in comment.cols"
              :key="col.prop"
              v-bind="col"
          >
            <template v-if="col.label === '图片'" #default="{ row }">
              <el-image
                  v-for="img in row.evaluateImg"
                  :key="img"
                  :src="img"
                  :preview-src-list="row.evaluateImg"
              ></el-image>
            </template>
          </el-table-column>
        </BasePageTable>
      </template>
    </ButtonTabs>
  </ConfirmDialog>
  <ConfirmDialog
      v-model="addressDialog"
      async-confirm
      :auto-loading="false"
      @on-confirm="handleAddressConfirm"
  >
    <el-form
        ref="addressForm"
        :model="currentAddress"
        :rules="addressRules"
        label-width="80px"
    >
      <el-form-item key="addersName" label="名称" prop="addersName">
        <el-input
            v-model="currentAddress.addersName"
            placeholder="请输入地址名称"
        ></el-input>
      </el-form-item>
      <el-form-item key="adders" label="地址" prop="adders">
        <el-cascader
            v-model="currentAddress.adders"
            class="small-input"
            clearable
            size="large"
            :options="regionData"
            @change="handleAddressChange"
        ></el-cascader>
      </el-form-item>
      <el-form-item key="addersDetails" label="详细地址" prop="addersDetails">
        <el-input
            v-model="currentAddress.addersDetails"
            placeholder="请输入详细地址"
            @blur="handleAddressChange"
        ></el-input>
        <div id="map" class="mg-tp-8"></div>
      </el-form-item>
    </el-form>
  </ConfirmDialog>
  <ConfirmDialog
      v-model="courseDialog"
      title="教练课程"
      async-confirm
      :auto-loading="false"
      @on-confirm="handleCourseConfirm"
  >
    <el-form
        ref="courseForm"
        :model="currentCourse"
        :rules="courseRules"
        label-width="80px"
    >
      <el-form-item label="封面" prop="cover">
        <UploadImage
            v-model="currentCourse.cover"
            :limit="Infinity"
            type="list"
        />
      </el-form-item>
      <el-form-item label="名称" prop="courseName">
        <el-input
            v-model="currentCourse.courseName"
            placeholder="请输入名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="价格" prop="coursePrice">
        <NumberInput
            v-model="currentCourse.coursePrice"
            class="w-240"
            placeholder="请输入价格"
            mode="digit"
            :precision="2"
        ></NumberInput>
        <span>元/节</span>
      </el-form-item>
      <el-form-item label="内容" prop="courseContent">
        <el-input
            v-model="currentCourse.courseContent"
            placeholder="请输入内容"
            type="textarea"
            :rows="4"
        ></el-input>
      </el-form-item>
      <el-form-item label="适合人群" prop="becomingPers">
        <el-input
            v-model="currentCourse.becomingPers"
            placeholder="请输入适合人群"
            type="textarea"
            :rows="4"
        ></el-input>
      </el-form-item>
    </el-form>
  </ConfirmDialog>
  <ConfirmDialog
      v-model="exampleDialog"
      title="学员案例"
      async-confirm
      :auto-loading="false"
      @on-confirm="handleExampleConfirm"
  >
    <el-form
        ref="exampleForm"
        :model="currentExample"
        :rules="exampleRules"
        label-width="80px"
    >
      <el-form-item label="名称" prop="instanceName">
        <el-input
            v-model="currentExample.instanceName"
            placeholder="请输入名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="训练时长" prop="duration">
        <el-input
            v-model="currentExample.duration"
            placeholder="请输入训练时长"
        ></el-input>
      </el-form-item>
      <el-form-item label="训练前" prop="drillBefore">
        <div class="mg-tp-30">
          <FormItem label="体重" required>
            <NumberInput
                v-model="currentExample.drillBefore"
                class="w-240"
                mode="digit"
                :precision="2"
            ></NumberInput>
            <span>斤</span>
          </FormItem>
          <FormItem class="mg-tp-8" label="图片" required>
            <UploadImage
                v-model="currentExample.drillBeforeImg"
                :limit="Infinity"
                type="list"
            />
          </FormItem>
        </div>
      </el-form-item>
      <el-form-item label="训练后" prop="drillAfter">
        <div class="mg-tp-30">
          <FormItem label="体重" required>
            <NumberInput
                v-model="currentExample.drillAfter"
                class="w-240"
                mode="digit"
                :precision="2"
            ></NumberInput>
            <span>斤</span>
          </FormItem>
          <FormItem class="mg-tp-8" label="图片" required>
            <UploadImage
                v-model="currentExample.drillAfterImg"
                :limit="Infinity"
                type="list"
            />
          </FormItem>
        </div>
      </el-form-item>
    </el-form>
  </ConfirmDialog>
</template>

<script>
import { CodeToText, regionData, TextToCode } from '@/utils/regon-data.js'
import exportExcel from '@/utils/export-excel'
import { defineComponent } from 'vue'
import ButtonTabs from '@/components/ButtonTabs.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import UploadImage from '@/components/UploadImage'
import BasePageTable from '../../../components/BasePageTable.vue'
import FormItem from '@/components/FormItem.vue'
import dayjs from 'dayjs'

function createCurrentAddress() {
  return {
    addersName: '',
    adders: [],
    addersDetails: '',
    lat: '',
    lng: ''
  }
}

function createCurrentCourse() {
  return {
    courseName: '',
    coursePrice: [],
    courseContent: '',
    becomingPers: '',
    cover: []
  }
}

function createCurrentExample() {
  return {
    instanceName: '',
    duration: '',
    drillBefore: '',
    drillAfter: '',
    drillBeforeImg: [],
    drillAfterImg: []
  }
}

function createCoach() {
  return {
    coachName: '',
    wxNumber: '',
    coachPhone: '',
    introduce: '',
    territoryList: [],
    exhibition: [],
    certificate: [],
    showRank: '',
    headPortrait: '',
    adeptField: ''
  }
}

const { AMap } = window

const DefaultMarkerIcon = new AMap.Icon({
  image:
      '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
  size: new AMap.Size(25, 34),
  imageSize: new AMap.Size(25, 34)
})
const ActiveMarkerIcon = new AMap.Icon({
  image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
  size: new AMap.Size(25, 34),
  imageSize: new AMap.Size(25, 34)
})

export default defineComponent({
  name: 'business_coupon-data',
  components: {
    ButtonTabs,
    ConfirmDialog,
    FormItem,
    UploadImage,
    BasePageTable
  },
  data() {
    return {
      currentExample: createCurrentExample(),
      currentAddress: createCurrentAddress(),
      currentCourse: createCurrentCourse(),
      exampleRules: {
        instanceName: {
          required: true,
          message: '请输入名称',
          type: 'string',
          trigger: 'blur'
        },
        duration: {
          required: true,
          message: '请输入训练时长',
          type: 'string',
          trigger: 'blur'
        },
        drillBefore: {
          required: true,
          trigger: 'change',
          validator: (_1, _2, callback) => {
            const { drillBefore, drillBeforeImg } = this.currentExample
            if (!drillBefore) {
              callback('请输入训练前体重')
            } else if (drillBeforeImg.length <= 0) {
              callback('请上传训练前效果图')
            } else {
              callback()
            }
          }
        },
        drillAfter: {
          required: true,
          trigger: 'change',
          validator: (_1, _2, callback) => {
            const { drillAfter, drillAfterImg } = this.currentExample
            if (!drillAfter) {
              callback('请输入训练后体重')
            } else if (drillAfterImg.length <= 0) {
              callback('请上传训练后效果图')
            } else {
              callback()
            }
          }
        }
      },
      courseRules: {
        cover: {
          required: true,
          message: '请上传封面',
          type: 'array',
          trigger: 'change'
        },
        courseName: {
          required: true,
          message: '请输入名称',
          type: 'string',
          trigger: 'blur'
        },
        coursePrice: {
          required: true,
          message: '请输入价格',
          trigger: 'blur',
          type: 'string'
        },
        courseContent: {
          required: true,
          message: '请输入内容',
          trigger: 'blur',
          type: 'string'
        },
        becomingPers: {
          required: true,
          message: '请输入适合人群',
          trigger: 'blur',
          type: 'string'
        }
      },
      addressRules: {
        addersName: {
          required: true,
          message: '请输入地址名称',
          type: 'string',
          trigger: 'blur'
        },
        adders: {
          required: true,
          message: '请选择地址',
          type: 'array',
          trigger: 'change'
        },
        addersDetails: {
          required: true,
          trigger: 'blur',
          type: 'string',
          validator: (_, value, callback) => {
            const { currentAddress } = this
            if (
                !currentAddress.addersDetails ||
                !(currentAddress.lng && currentAddress.lat)
            ) {
              callback('请输入详细地址并选择地图上一个点')
            } else {
              callback()
            }
          }
        }
      },
      courseDialog: false,
      addressDialog: false,
      exampleDialog: false,
      exhibitionImages: [],
      certificateImages: [],
      headPortraitImages: '',
      tab: 'info',
      regionData,
      course: {
        page: {
          pageNo: 1,
          pageSize: 10
        },
        cols: [
          { width: 80, type: 'index', label: '序号' },
          { label: '名称', prop: 'courseName' },
          { label: '价格/节', prop: 'coursePrice' }
        ],
        total: 0,
        data: []
      },
      comment: {
        page: {
          pageNo: 1,
          pageSize: 10
        },
        cols: [
          { width: 80, type: 'index', label: '序号' },
          { label: '昵称', prop: 'userName' },
          { label: '手机号', prop: 'userPhone' },
          { label: '星级', prop: 'star' },
          { label: '内容', prop: 'comment' },
          { label: '图片', prop: 'evaluateImg' },
          { label: '评价时间', prop: 'ctime' }
        ],
        total: 0,
        data: []
      },
      example: {
        page: {
          pageNo: 1,
          pageSize: 10
        },
        cols: [
          { width: 80, type: 'index', label: '序号' },
          { label: '名称', prop: 'instanceName' },
          { label: '训练时长', prop: 'duration' }
        ],
        total: 0,
        data: []
      },
      address: {
        page: {
          pageNo: 1,
          pageSize: 10
        },
        cols: [
          { width: 80, type: 'index', label: '序号' },
          { label: '名称', prop: 'addersName' },
          { label: '详细地址', prop: 'addersDetails' }
        ],
        total: 0,
        data: []
      },
      tabs: [
        { label: '基本信息', value: 'info' },
        { label: '服务地址', value: 'address' },
        { label: '课程', value: 'course' },
        { label: '学员案例', value: 'example' },
        { label: '评价', value: 'comment' }
      ],
      createTabs: [
        { label: '基本信息', value: 'info' }
      ],
      tableData: [],
      phoneList: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '姓名',
          prop: 'coachName'
        },
        // {
        //   label: "微信号",
        //   prop: "wxNumber",
        // },
        {
          label: '手机号',
          prop: 'phone'
        },
        {
          label: '关联客户经理姓名',
          prop: 'counselorName'
        },
        {
          label: '关联客户经理手机号',
          prop: 'counselorPhone'
        },
        {
          label: '状态',
          prop: 'sttStr'
        },
        {
          label: '最后操作时间',
          prop: 'utime',
          formatter: (row) => dayjs(row.utime).format('YYYY/MM/DD HH:mm:ss')
        },
        {
          label: '最后操作人',
          prop: 'operatorName'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        phone: ''
      },
      coachDialog: false,
      createDialog: false,
      detailDialog: false,
      coachRules: {
        headPortrait: {
          required: true,
          message: '教练头像',
          type: 'string',
          trigger: 'change'
        },
        coachName: {
          required: true,
          message: '教练名称',
          type: 'string',
          trigger: 'blur'
        },
        coachPhone: {
          required: true,
          message: '请输入教练手机号',
          type: 'string',
          trigger: 'blur'
        },
        wxNumber: {
          required: true,
          message: '请输入教练微信号',
          type: 'string',
          trigger: 'blur'
        },
        introduce: {
          required: true,
          message: '请输入自我介绍',
          type: 'string',
          trigger: 'blur'
        },
        adeptField: {
          required: true,
          message: '请输入擅长领域',
          type: 'string',
          trigger: 'blur'
        },
        territoryList: {
          required: true,
          type: 'array',
          trigger: 'blur',
          validator: (_, value, callback) => {
            const valid = value.length > 0 && value.every(Boolean)
            if (!valid) {
              callback('请输入完整擅长领域')
            } else {
              callback()
            }
          }
        },
        exhibition: {
          required: true,
          message: '请上传教练风采',
          type: 'array',
          trigger: 'change'
        },
        certificate: {
          required: true,
          type: 'array',
          trigger: 'change',
          validator: (_, value, callback) => {
            // const valid = value.every((item) => item.imageUrl && item.name)
            const valid = value.every((item) => item.imageUrl)
            if (!valid) {
              callback('请输入完整证书')
            } else {
              callback()
            }
          }
        }
        // showRank: {
        //   required: true,
        //   message: '请输入排序',
        //   type: 'string',
        //   trigger: 'blur'
        // }
      },
      coach: createCoach(),
      queryComps: [
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '请输入手机号',
          props: {
            clearable: true
          }
        }
      ]
    }
  },
  watch: {
    'coach.exhibition': {
      handler(newValue) {
        this.exhibitionImages = newValue.map((item) => item.imageUrl)
      },
      deep: true
    },
    'coach.certificate': {
      handler(newValue) {
        this.certificateImages = newValue.map((item) => item.imageUrl)
      },
      deep: true
    },
    'coach.headPortrait': {
      handler(newValue) {
        this.headPortraitImages = newValue
      },
      deep: true
    }
  },
  created() {
    this.getList()
    this.queryAllCounselorPhone()
  },
  methods: {
    exportCommentClick() {
      this.$request('coach.BasicInfo/queryCoachEvaluate', {
        recordId: this.coach.recordId,
        pageNo: 1,
        pageSize: 999
      }).thenwrap((err, data) => {
        if (!err) {
          exportExcel({
            filename: `教练评价（${this.coach.coachName}）-导出`,
            data: data.record,
            columns: this.comment.cols
          })
        }
      })
    },
    handleExampleConfirm(loading) {
      this.$refs.exampleForm.validate((valid) => {
        if (valid) {
          const done = loading()
          this.editInstance().finally(done)
        }
      })
    },
    handleCourseConfirm(loading) {
      this.$refs.courseForm.validate((valid) => {
        if (valid) {
          const done = loading()
          this.editCourse().finally(done)
        }
      })
    },
    handleAddressConfirm(loading) {
      this.$refs.addressForm.validate((valid) => {
        if (valid) {
          const done = loading()
          this.editServiceAdders().finally(done)
        }
      })
    },
    editExampleClick(row) {
      Object.assign(this.currentExample, row)
      this.currentExample.drillBeforeImg =
          this.currentExample.drillBeforeImg.map((item) => item.imageUrl)
      this.currentExample.drillAfterImg = this.currentExample.drillAfterImg.map(
          (item) => item.imageUrl
      )
      this.exampleDialog = true
    },
    deleteExampleClick(row) {
      this.$request('coach.BasicInfo/delInstance', {
        recordId: this.coach.recordId,
        instanceId: row.instanceId
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success('删除成功')
          this.queryInstance()
        }
      })
    },
    editCourseClick(row) {
      Object.assign(this.currentCourse, row)
      this.currentCourse.cover = this.currentCourse.cover.map(
          (item) => item.imageUrl
      )
      this.courseDialog = true
    },
    deleteCourseClick(row) {
      this.$request('coach.BasicInfo/delCourse', {
        recordId: this.coach.recordId,
        courseId: row.courseId
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success('删除成功')
          this.queryCourse()
        }
      })
    },
    editInstance() {
      const { currentExample } = this
      return this.$request('coach.BasicInfo/editInstance', {
        recordId: this.coach.recordId,
        ...currentExample,
        drillAfterImg: currentExample.drillAfterImg.map((item) => ({
          imageUrl: item
        })),
        drillBeforeImg: currentExample.drillBeforeImg.map((item) => ({
          imageUrl: item
        }))
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success('操作成功')
          this.exampleDialog = false
          this.queryInstance()
        } else {
          this.$message.error(err.errMsg)
        }
      })
    },
    editCourse() {
      return this.$request('coach.BasicInfo/editCourse', {
        ...this.currentCourse,
        recordId: this.coach.recordId,
        cover: this.currentCourse.cover.map((item) => ({ imageUrl: item }))
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success('操作成功')
          this.courseDialog = false
          this.queryCourse()
        } else {
          this.$message.error(err.errMsg)
        }
      })
    },
    editServiceAdders() {
      return this.$request('coach.BasicInfo/editServiceAdders', {
        recordId: this.coach.recordId,
        ...this.currentAddress,
        adders: this.currentAddress.adders.map((id) => CodeToText[id])
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success('操作成功')
          this.addressDialog = false
          this.queryServiceAdders()
        } else {
          this.$message.error(err.errMsg)
        }
      })
    },
    handleAddressChange() {
      const { adders, addersDetails } = this.currentAddress
      this.currentAddress.lng = ''
      this.currentAddress.lat = ''
      this.$refs.addressForm.validateField('addersDetails')
      if (adders.length && addersDetails) {
        const address =
            adders.map((id) => CodeToText[id]).join('') + addersDetails
        AMap.plugin('AMap.PlaceSearch', () => {
          const placeSearch = new AMap.PlaceSearch({
            city: adders[1],
            citylimit: true,
            autoFitView: true,
            map: this.map
          })
          placeSearch.search(address, (status, result) => {
            if (status === 'no_data') {
              this.$msg('请输入正确的查询地址', 'error')
              return
            }
            this.map.clearMap()

            this.markers = result.poiList.pois.map((poi) => {
              console.log(poi.location, ', ')
              const marker = new AMap.Marker({
                map: this.map,
                position: poi.location,
                title: poi.name,
                icon: DefaultMarkerIcon
              })

              marker.on('click', this.markerClick)
              return marker
            })

            this.map.add([...this.markers])
          })
        })
      }
    },
    markerClick(e) {
      // console.log(e, 'e')
      const ePos = e.target.getPosition()
      const foundIndex = this.markers.findIndex((marker) => {
        const mPos = marker.getPosition()
        return mPos.lat === ePos.lat && mPos.lng === ePos.lng
      })
      if (foundIndex !== -1) {
        this.markers[foundIndex].setIcon(ActiveMarkerIcon)
        this.currentAddress.lng = ePos.lng
        this.currentAddress.lat = ePos.lat
        this.$refs.addressForm.validateField('addersDetails')
      }
    },
    createExampleClick() {
      this.currentExample = createCurrentExample()
      this.exampleDialog = true
    },
    createCourseClick() {
      this.currentCourse = createCurrentCourse()
      this.courseDialog = true
    },
    createAddressClick() {
      this.currentAddress = createCurrentAddress()
      this.addressDialog = true

      this.$nextTick(() => {
        this.map = new AMap.Map('map', {
          zoom: 14, // 级别
          center: [113.953045, 22.54097],
          resizeEnable: true
        })
      })
    },
    editAddressClick(row) {
      let code = TextToCode
      this.currentAddress = {
        ...row,
        adders: row.adders.reduce((list, label) => {
          code = code[label]
          return [...list, code.code]
        }, [])
      }
      console.log(this.currentAddress, 'this.currentAddress')

      this.addressDialog = true
      this.$nextTick(() => {
        const position = new AMap.LngLat(
            Number(this.currentAddress.lng),
            Number(this.currentAddress.lat)
        )

        console.log(position, 'position')
        this.map = new AMap.Map('map', {
          zoom: 17, // 级别
          center: position,
          resizeEnable: true
        })
        const marker = new AMap.Marker({
          map: this.map,
          position,
          title: 'selected',
          icon: ActiveMarkerIcon
        })
        this.map.add([marker])
      })
    },
    deleteAddressClick(row) {
      this.$request('coach.BasicInfo/delServiceAdders', {
        addersId: row.addersId
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success('删除成功')
          this.queryServiceAdders()
        }
      })
    },
    handleTabChange(tab) {
      switch (tab) {
        case 'address':
          this.queryServiceAdders()
          break
        case 'course':
          this.queryCourse()
          break
        case 'example':
          this.queryInstance()
          break
        case 'comment':
          this.queryCoachEvaluate()
          break
      }
    },
    queryCoachEvaluate() {
      this.$request('coach.BasicInfo/queryCoachEvaluate', {
        recordId: this.coach.recordId,
        ...this.comment.page
      }).thenwrap((err, data) => {
        if (!err) {
          this.comment.data = data.record
          this.comment.total = data.totalRecordCount
        }
      })
    },
    queryInstance() {
      this.$request('coach.BasicInfo/queryInstance', {
        recordId: this.coach.recordId,
        ...this.example.page
      }).thenwrap((err, data) => {
        if (!err) {
          this.example.data = data.record
          this.example.total = data.totalRecordCount
        }
      })
    },
    queryCourse() {
      this.$request('coach.BasicInfo/queryCourse', {
        recordId: this.coach.recordId,
        ...this.course.page
      }).thenwrap((err, data) => {
        if (!err) {
          this.course.data = data.record
          this.course.total = data.totalRecordCount
        }
      })
    },
    queryServiceAdders() {
      this.$request('coach.BasicInfo/queryServiceAdders', {
        recordId: this.coach.recordId,
        ...this.address.page
      }).thenwrap((err, data) => {
        if (!err) {
          this.address.data = data.record
          this.address.total = data.totalRecordCount
        }
      })
    },
    handleDialogConfirm(loading) {
      switch (this.tab) {
        case 'info':
          this.handleInfoConfirm(loading)
          break
        default:
          this.coachDialog = false
          this.createDialog = false
          this.detailDialog = false
      }
    },
    async handleInfoConfirm(loading) {
      this.$refs.form.validate((valid) => {
        if (valid) {

          // exhibition: e.imageUrl.split(',').map((item) => ({ imageUrl: item })),
          // certificate: e.qualificationImageUrl.split(',').map((item) => ({ imageUrl: item })),
          const params = {
            id: this.coach.id,
            headImage: this.coach.headPortrait,
            name: this.coach.coachName,
            phone: this.coach.coachPhone,
            wxNumber: this.coach.wxNumber,
            introduce: this.coach.introduce,
            adeptField: this.coach.adeptField,
            filed: this.coach.territoryList.join(','),
            imageUrl: this.coach.exhibition.map((item) => (item.imageUrl)).join(','),
            qualificationImageUrl: this.coach.certificate.map((item) => (item.imageUrl)).join(','),
            isShow: this.coach.stt,
            cid: this.coach.counselorPhone==='' ? '' : this.coach.cid
          }

          const done = loading()
          this.$request('coach.BasicInfo/addRoleInfo', params)
              .thenwrap(async (err) => {
                if (!err) {
                  this.$message.success('添加成功')
                  const coachs = await this.getList(this.createDialog)
                  if (this.createDialog && coachs) {
                    this.editAddress(coachs[0])
                  } else {
                    this.coachDialog = false
                    this.createDialog = false
                    this.detailDialog = false
                  }
                } else {
                  this.$message.error(err.errMsg)
                }
              })
              .finally(done)
        }
      })
    },
    addDomainClick() {
      this.coach.territoryList.push('')
    },
    editAddress(row) {
      Object.assign(this.coach, row)
      this.tab = 'address'
      this.coachDialog = true
      this.detailDialog = false
      this.createDialog = false
    },
    async editClick(row) {
      Object.assign(this.coach, row)
      this.tab = 'info'
      this.coachDialog = true
      this.detailDialog = false
      this.createDialog = false
    },
    detailClick(row) {
      Object.assign(this.coach, row)
      this.tab = 'info'
      this.detailDialog = true
      this.coachDialog = true
      this.createDialog = false
    },
    createClick() {
      this.coach = createCoach()
      this.tab = 'info'
      this.createDialog = true
      this.coachDialog = true
      this.detailDialog = false
    },
    exhibitionChange({ type, index, value }) {
      const list = this.coach.exhibition
      switch (type) {
        case 'delete':
          list.splice(index, 1)
          break
        case 'add':
          list.push({
            imageUrl: value
          })
          break
        case 'update':
          list[index].imageUrl = value
          break
      }
    },
    headPortraitChange({ type, value }) {
      let list = this.coach.headPortrait
      console.log(type, 'type')

      switch (type) {
        case 'delete':
          list = ''
          break
        case 'add':
          list = value
          break
        case 'update':
          list = value
          break
      }
      this.headPortraitImages = list
      this.coach.headPortrait = list
    },
    certificateImageChange({ type, index, value }) {
      const list = this.coach.certificate
      console.log(type, 'type')
      switch (type) {
        case 'delete':
          list.splice(index, 1)
          console.log(list, 'list')
          break
        case 'add':
          list.push({
            imageUrl: value,
            name: ''
          })
          break
        case 'update':
          list[index].imageUrl = value
          break
      }
    },
    checkRole(e) {
      if(e===''){
        this.coach.cid = ''
        this.coach.counselorPhone = ''
      }else
      this.getGetCoachInfo(e).thenwrap((err, data) => {
        if (!err&&data&&data.coachDTO) {
          this.coach.cid = data.coachDTO.uid
          this.coach.coachPhone = data.coachDTO.phone
          this.coach.counselorPhone = data.coachDTO.phone ?? this.coach.counselorPhone
          this.coach.introduce = data.coachDTO.introduce
          this.coach.territoryList = data.coachDTO.field.split(',')
          this.coach.headPortrait = data.coachDTO.headImageUrl
          this.coach.coachName = data.coachDTO.uname
          this.coach.wxNumber = data.coachDTO.wechat
          this.coach.certificate = data.coachDTO.qualificationImageUrlList
          this.coach.exhibition = data.coachDTO.coachImageUrlList.map((item) => ({ imageUrl: item }))
          this.coach.adeptField = data.coachDTO.domain
        } else {
          this.$message.error(err.errMsg)
        }
      })
    },
    getGetCoachInfo(phone) {
      return this.$request('coach.BasicInfo/queryRoleInfoByPhone', { phone })
    },
    changeStatusClick(row, isShow) {
      // const url = {
      //   "00": "coach.BasicInfo/closeCoach",
      //   "01": "coach.BasicInfo/openCoach",
      // }[isShow];
      this.$request('coach.BasicInfo/updateShow', { id: `${row.id}`, isShow }).thenwrap((err, data) => {
        if (data.result !== 0) {
          this.$message.success('操作成功')
          this.getList()
        } else {
          this.$message.error(err.errMsg)
        }
      })
    },
    async queryAllCounselorPhone() {
      // const res = await this.$http('sale.SaleEmployee/querySaleEmployeeList', {tseStt:'01',tseRoleId:'100002,100003,100004,100005'})
      const res = await this.$http('coach.BasicInfo/queryAllCounselorPhone', {})
      if (res.errCode===0) {
        // this.phoneList = res.obj.map((item) => ({ label: item.tseName+' '+item.tsePhone, value: item.tsePhone }))
        this.phoneList = res.obj.phoneList.map((item) => ({ label: item.coachName+' ('+item.wxPhone+')', value: item.wxPhone }))
      }
    },
    async getList() {
      this.$store.state.vloading = true
      const res = await this.$http('coach.BasicInfo/queryRoleInfoByPage', {
        ...this.page,
        ...this.queryParams
      })
      if (!res.errMsg) {
        const coachs = []
        res.obj.roleInfoPage.record.forEach((e) => {
          coachs.push({
            recordId: e.uid,
            coachName: e.name,
            wxNumber: e.wxNumber,
            coachPhone: e.phone,
            counselorPhone: e.counselorPhone,
            territoryList: e.filed.split(','),
            exhibition: e.imageUrl.split(',').map((item) => ({ imageUrl: item })),
            certificate: e.qualificationImageUrl.split(',').map((item) => ({ imageUrl: item })),
            headPortrait: e.headImage,
            stt: e.isShow,
            sttStr: e.isShow === '01' ? '上线' : '下线',
            showRank: '',
            // adeptField: e.adeptField,
            // introduce: e.introduce,
            ...e
          })
        })
        this.tableData = coachs
        this.tableDataTotal = res.obj.roleInfoPage.totalRecordCount
        return coachs
      }
      return null
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    async handleExport() {
      this.$store.state.bloading = true

      const res = await this.$http('coach.BasicInfo/queryRoleInfoByPage', {

        pageNo: 1,
        pageSize: this.tableDataTotal,
        ...this.queryParams
      })
      res.obj.roleInfoPage.record.forEach((e) => {
        e.sttStr = e.isShow === '01' ? '上线' : '下线'
        e.coachName = e.name
      })
      exportExcel({
        columns: this.tableCol,
        data: res.obj.roleInfoPage.record
      })
    }
  }
})
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}

.mg-left-8 {
  margin-left: 8px;
}

.mg-tp-8 {
  margin-top: 8px;
}

.mg-tp-30 {
  margin-top: 30px;
}

.button-margin {
  margin: 12px 0;
}

#map {
  height: 400px;
}

.image-input {
  width: 148px;
  margin-right: 7px;
}

.w-240 {
  width: 240px;
}
</style>


import {
  defineComponent, reactive, inject, ref, onActivated
} from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { requestFactor } from '@/utils/request'
import dayjs from 'dayjs';
import UploadImage from '@/components/UploadImage'
import { ElMessage } from 'element-plus';
import exportExcel from '../../../utils/export-excel';
// import { optionsToMap } from '@/utils/data-map'

const { http } = requestFactor('marketing.activity.CompanyLoseWeight');

export default defineComponent({
  name: 'om_enterprise-camp',
  setup() {
    const statusOptions = [
      {
        label: '未开始',
        value: '01'
      },
      {
        label: '报名期',
        value: '02'
      },
      {
        label: '审核分组期',
        value: '03'
      },
      {
        label: '比赛期',
        value: '04'
      },
      {
        label: '已结束',
        value: '05'
      },
    ]

    let activityId;
    const FormRef = ref(null);
    const EditFormRef = ref(null);
    const page = reactive({
      pageNo: 1,
      pageSize: 20,
    })
    const pushRoute = inject('pushRoute');
    const loading = inject('vloading');

    const form = reactive({
      rule: '',
      stt: '',
      activityName: '', // 活动名称
      coverImg: '', // 首页图片
      describe: '', // 活动简介
      principalName: '', // 负责人名称
      principalPhone: '', // 负责人联系方式
      discount: '', // 活动折扣
      applyStartDate: '', // 报名开始时间
      applyEndDate: '', // 报名结束时间
      auditStartDate: '', // 审核开始时间
      auditEndDate: '', // 审核结束时间
      startDate: '', // 比赛开始时间
      endDate: '', // 比赛结束时间
      groupNum: '', // 活动小组数量
    })
    const dialog = reactive({
      visible: false,
      title: '添加减脂营'
    });
    const editDialog = reactive({
      visible: false,
      title: '编辑减脂营'
    });
    const data = reactive({
      list: [],
      total: 0
    });
    const daterangeForm = reactive({
      applyDate: [],
      auditDate: [],
      date: []
    })

    function editClick(row) {
      activityId = row.activityId;
      // form.tsgId = row.tsgId
      Object.keys(form).forEach((key) => {
        form[key] = String(row[key])
      })

      form.principalName = row.principal;
      function formatDate(d) {
        return dayjs(d.slice(0, 8)).format('YYYY-MM-DD')
      }
      daterangeForm.applyDate = [formatDate(row.applyStartDate), formatDate(row.applyEndDate)]
      daterangeForm.auditDate = [formatDate(row.auditStartDate), formatDate(row.auditEndDate)]
      daterangeForm.date = [formatDate(row.startDate), formatDate(row.endDate)]

      editDialog.visible = true
    }
    const tableColumns = [
      {
        width: '60px',
        align: 'center',
        type: 'index',
        label: '序号',
      },
      {
        label: '活动名称',
        prop: 'activityName'
      },
      {
        label: '负责人名称',
        prop: 'principal'
      },
      {
        label: '负责人手机号',
        prop: 'principalPhone'
      },
      {
        label: '活动周期',
        prop: 'curActivityDatePeriod'
      },
      {
        label: '当前阶段',
        prop: 'sttStr'
      },
      {
        label: '当前阶段周期',
        prop: 'curDatePeriod'
        // formatter: row => `${row.curStartDate}-${row.curEndDate}`
      },
      {
        label: '点餐折扣',
        prop: 'discount'
      },
      {
        label: '小组数量',
        prop: 'groupNum'
      },
      {
        label: '总参与人数',
        prop: 'joinNum'
      },
      {
        label: '点餐金额',
        prop: 'orderAmount'
      },
      {
        label: '创建时间',
        prop: 'ctime',
        formatter: (row) => {
          const { ctime } = row;
          const day = dayjs(ctime.slice(0, 8))
            .set('hour', ctime.slice(8, 10))
            .set('minute', ctime.slice(10, 12))
            .set('second', ctime.slice(12, 14))
          return day.format('YYYY-MM-DD HH:mm:ss')
        }
      },
      {
        label: '创建人',
        prop: 'creator'
      },
      {
        label: '操作',
        slots: {
          default: ({ row }) => (
            <>
              <span v-show={['01', '02', '03'].includes(row.stt)} class="table-action-label" style="margin-right: 8px;" onClick={() => editClick(row)}>编辑</span>
              <span v-show={['04', '05'].includes(row.stt)} class="table-action-label" style="margin-right: 8px;" onClick={() => pushRoute('rank-detail', {
                query: {
                  id: row.activityId
                }
              })}>排行榜</span>
              <span class="table-action-label" onClick={() => pushRoute('detail', {
                query: {
                  id: row.activityId
                }
              })}>小组详情</span>
            </>
          )
        }
      }
    ]


    const formRules = {
      activityName: {
        type: 'string', message: '请输入活动名称', required: true, trigger: 'blur'
      },
      coverImg: {
        type: 'string', message: '请添加首页图片', required: true, trigger: 'blur'
      },
      rule: {
        type: 'string', message: '请输入活动介绍图片', required: true, trigger: 'blur'
      },
      describe: {
        type: 'string', message: '请输入活动简介', required: true, trigger: 'blur'
      },
      principalName: {
        type: 'string', message: '请输入负责人名称', required: true, trigger: 'blur'
      },
      principalPhone: {
        type: 'string', message: '请输入负责人联系方式', required: true, trigger: 'blur'
      },
      discount: {
        type: 'string', message: '请输入活动折扣', required: true, trigger: 'blur'
      },
      applyStartDate: {
        type: 'string', message: '请选择报名时间', required: true, trigger: 'change'
      },
      auditStartDate: {
        type: 'string', message: '请选择审核时间', required: true, trigger: 'change'
      },
      startDate: {
        type: 'string', message: '请选择比赛时间', required: true, trigger: 'change'
      },
      groupNum: {
        type: 'string', message: '请输入活动小组数量', required: true, trigger: 'change'
      },
    }

    // const editFormRules = formRules
    // editFormRules.groupNum = {
    //   type: 'number', message: '请输入活动小组数量', required: true, trigger: 'change'
    // }

    const queryProps = {
      modelValue: reactive({
        activityName: '',
        stt: ''
      }),
      queryList: [
        {
          component: 'el-input',
          label: '活动名称',
          key: 'activityName',
          placeholder: '领域名称',
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          label: '当前阶段',
          key: 'stt',
          props: {
            clearable: true,
            options: statusOptions
          }
        },
        {
          slot: 'actions'
        },
        {
          slot: 'create'
        }
      ]
    }
    function createClick() {
      activityId = '';
      Object.keys(form).forEach((key) => {
        form[key] = '';
      })
      Object.keys(daterangeForm).forEach((key) => {
        daterangeForm[key] = [];
      })
      dialog.visible = true
    }

    function exportClick() {
      http('getActivityList', {
        pageNo: 1,
        pageSize: 999,
        ...queryProps.modelValue
      })
        .thenwrap((err, res) => {
          if (!err) {
            exportExcel({
              data: res.record,
              columns: tableColumns
            })
          }
        })
    }

    function getList() {
      http('getActivityList', {
        ...page,
        ...queryProps.modelValue
      })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.record;
            data.total = res.totalRecordCount;
          }
        })
    }
    queryProps.slots = {
      actions: () => (
        <>
          <el-button onClick={getList} type="warning">搜索</el-button>
          <el-button onClick={exportClick}>导出</el-button>
        </>
      ),
      create: () => (
        <div style="text-align: right;">
          <el-button type="primary" onClick={createClick}>新建减脂营</el-button>
        </div>
      )
    }

    function addActivity() {
      return http('addActivity', form)
    }

    function editActivity() {
      return http('editActivity', {
        activityId,
        ...form
      })
    }

    function handleDialogConfirm() {
      FormRef.value.validate((valid) => {
        if (valid) {
          addActivity().thenwrap((err) => {
            if (!err) {
              getList();
              dialog.visible = false;
            } else {
              ElMessage.error(err.errMsg)
            }
          });
        }
      })
    }

    function handleEditDialogConfirm() {
      EditFormRef.value.validate((valid) => {
        if (valid) {
          editActivity().thenwrap((err) => {
            if (!err) {
              getList();
              editDialog.visible = false;
            } else {
              ElMessage.error(err.errMsg)
            }
          });
        }
      })
    }

    function handleDaterangeChange(dates, key) {
      const start = dayjs(dates[0]).format('YYYYMMDD')
      const end = dayjs(dates[1]).format('YYYYMMDD')
      switch (key) {
        case 'apply':
          form.applyStartDate = start
          form.applyEndDate = end
          break;
        case 'audit':
          form.auditStartDate = start
          form.auditEndDate = end
          break;
        case 'date':
          form.startDate = start
          form.endDate = end
          break;
      }
    }
    const todayMS = dayjs().startOf('day').valueOf()
    function disabledDate(date) {
      return date.valueOf() < todayMS
    }
    onActivated(getList)
    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents queryList={queryProps.queryList} v-model={queryProps.modelValue} span={4} v-slots={queryProps.slots} action={false} semi></QueryComponents>
        </div>
        <BasePageTable
          v-loading={loading.value}
          v-model={[page.pageNo, 'current-page']}
          v-model={[page.pageSize, 'page-size']}
          data={data.list}
          total={data.total}
          onCurrentPageChange={getList}
          onSizeChange={getList}
        >
          {
            tableColumns.map((col, index) => <el-table-column {...col} v-slots={col.slots} key={index}></el-table-column>)
          }
        </BasePageTable>
        <ConfirmDialog v-model={dialog.visible} title={dialog.title} auto-confirm={false} center onOnConfirm={handleDialogConfirm}>
          <el-form ref={FormRef} model={form} rules={formRules} label-width="100px">
            <el-form-item label="活动名称" prop="activityName" >
              <el-input v-model={form.activityName}></el-input>
            </el-form-item>
            <el-form-item label="活动封面" prop="coverImg">
              <UploadImage v-model={form.coverImg} limit={1}/>
            </el-form-item>
            <el-form-item label="活动介绍" prop="describe">
              <el-input v-model={form.describe} ></el-input>
            </el-form-item>
            <el-form-item label="活动介绍(图片)" prop="rule">
              <UploadImage v-model={form.rule} limit={1}/>
            </el-form-item>
            <el-form-item label="负责人名称" prop="principalName">
              <el-input v-model={form.principalName} ></el-input>
            </el-form-item>
            <el-form-item label="负责人手机" prop="principalPhone">
              <number-input v-model={form.principalPhone} precision={11}></number-input>
            </el-form-item>
            <el-form-item label="减脂营折扣" prop="discount">
              <number-input v-model={form.discount} precision={1}></number-input>
            </el-form-item>
            <el-form-item label="报名周期" prop="applyStartDate">
              <el-date-picker disabledDate={disabledDate} v-model={daterangeForm.applyDate} type="daterange" {...{
                'onUpdate:modelValue': v => handleDaterangeChange(v, 'apply')
              }}></el-date-picker>
            </el-form-item>
            <el-form-item label="审核分组周期" prop="auditStartDate">
              <el-date-picker disabledDate={disabledDate} v-model={daterangeForm.auditDate} type="daterange" {...{
                'onUpdate:modelValue': v => handleDaterangeChange(v, 'audit')
              }}></el-date-picker>
            </el-form-item>
            <el-form-item label="比赛周期" prop="startDate">
              <el-date-picker disabledDate={disabledDate} v-model={daterangeForm.date} type="daterange" {...{
                'onUpdate:modelValue': v => handleDaterangeChange(v, 'date')
              }}></el-date-picker>
            </el-form-item>
            <el-form-item label="小组数量" prop="groupNum">
              <number-input v-model={form.groupNum} ></number-input>
              <span>比赛未开始，数量可修改</span>
            </el-form-item>
          </el-form>
        </ConfirmDialog>
        <ConfirmDialog v-model={editDialog.visible} title={editDialog.title} auto-confirm={false} center onOnConfirm={handleEditDialogConfirm}>
          <el-form ref={EditFormRef} model={form} rules={formRules} label-width="100px">
            <el-form-item label="活动名称" prop="activityName" >
              <el-input v-model={form.activityName}></el-input>
            </el-form-item>
            <el-form-item label="活动封面" prop="coverImg">
              <UploadImage v-model={form.coverImg} limit={1}/>
            </el-form-item>
            <el-form-item label="活动介绍" prop="describe">
              <el-input v-model={form.describe} ></el-input>
            </el-form-item>
            <el-form-item label="活动介绍(图片)" prop="describe">
              <UploadImage v-model={form.rule} limit={1}/>
            </el-form-item>
            <el-form-item label="负责人名称" prop="principalName">
              <el-input v-model={form.principalName} ></el-input>
            </el-form-item>
            <el-form-item label="负责人手机" prop="principalPhone">
              <number-input v-model={form.principalPhone} precision={11}></number-input>
            </el-form-item>
            <el-form-item label="减脂营折扣" prop="discount">
              <number-input v-model={form.discount} precision={1} ></number-input>
            </el-form-item>
            <el-form-item label="报名周期" prop="applyStartDate">
              <el-date-picker disabledDate={disabledDate} disabled={form.stt === '02' || form.stt === '03'} v-model={daterangeForm.applyDate} type="daterange" {...{
                'onUpdate:modelValue': v => handleDaterangeChange(v, 'apply')
              }}></el-date-picker>
            </el-form-item>
            <el-form-item label="审核分组周期" prop="auditStartDate">
              <el-date-picker disabledDate={disabledDate} v-model={daterangeForm.auditDate} type="daterange" {...{
                'onUpdate:modelValue': v => handleDaterangeChange(v, 'audit')
              }}></el-date-picker>
            </el-form-item>
            <el-form-item label="比赛周期" prop="startDate">
              <el-date-picker disabledDate={disabledDate} v-model={daterangeForm.date} type="daterange" {...{
                'onUpdate:modelValue': v => handleDaterangeChange(v, 'date')
              }}></el-date-picker>
            </el-form-item>
            <el-form-item label="小组数量" prop="groupNum">
              <el-input v-model={form.groupNum} disabled />
              <div>已创建的营，无法修改</div>
            </el-form-item>
          </el-form>
        </ConfirmDialog>
      </div>
    )
  }
})

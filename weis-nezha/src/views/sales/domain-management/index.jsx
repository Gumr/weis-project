
import {
  defineComponent, reactive, inject, ref, nextTick
} from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { http } from '@/utils/request';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'sales_domain-management',
  setup() {
    const FormRef = ref(null);
    const page = reactive({
      pageNo: 1,
      pageSize: 20,
    })
    const pushRoute = inject('pushRoute');
    const loading = inject('vloading');

    const dialog = reactive({
      visible: false,
      title: '添加角色'
    });
    const tableColumns = [
      {
        width: '60px',
        align: 'center',
        type: 'index',
        label: '序号',
      },
      {
        label: '大标题',
        prop: 'tsgName'
      },
      {
        label: '小标题',
        prop: 'tsgTitle'
      },
      {
        label: '关联饮食顾问',
        prop: 'unionNum'
      },
      {
        label: '创建时间',
        prop: 'tsgCtime'
      },
      {
        label: '排序',
        prop: 'tsgSort',
        align: 'center',
        slots: {
          default: ({ row }) => (<span class="table-action-label">{row.tsgSort}</span>)
        }
      }
    ]
    const data = reactive({
      list: [],
      total: 0
    });
    const form = reactive({
      tsgId: '',
      tsgName: '',
      tsgTitle: '',
      tsgSort: '',
    })
    const formRules = {
      tsgName: {
        type: 'string', message: '请输入大标题', required: true, trigger: 'blur'
      },
      tsgSort: {
        type: 'string', message: '请输入排序', required: true, trigger: 'blur'
      }
    }
    const queryProps = {
      modelValue: reactive({
        tseName: ''
      }),
      queryList: [
        {
          component: 'el-input',
          label: '领域名称',
          key: 'tsgName',
          placeholder: '领域名称'
        },
        {
          slot: 'search'
        },
        {
          slot: 'create'
        }
      ]
    }
    function createClick() {
      Object.keys(form).forEach((key) => {
        form[key] = '';
      })
      dialog.title = '添加服务领域'
      dialog.visible = true
    }

    function getList() {
      http('sale.SaleGoal/querySaleGoalPage', {
        ...page,
        ...queryProps.modelValue
      })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.dataPage.record;
            data.total = res.dataPage.totalRecordCount;
          }
        })
    }
    queryProps.slots = {
      search: () => (
        <el-button onClick={getList}>搜索</el-button>
      ),
      create: () => (
        <div style="text-align: right;">
          <el-button type="primary" onClick={createClick}>添加领域</el-button>
        </div>
      )
    }

    function updateSaleGoal() {
      return http('sale.SaleGoal/updateSaleGoal', form)
    }

    function handleDialogConfirm() {
      FormRef.value.validate((valid) => {
        if (valid) {
          updateSaleGoal()
            .thenwrap((err) => {
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

    function editClick(row) {
      Object.keys(form).forEach((key) => {
        form[key] = row[key];
      })

      dialog.title = '编辑领域'
      dialog.visible = true
      nextTick(() => {
        FormRef.value.resetFields()
      })
    }

    function updateSaleGoalStt(id, status) {
      http('sale.SaleGoal/updateSaleGoalStt', {
        tsgId: id,
        tsgStt: status
      }).thenwrap((err) => {
        if (!err) getList();
      })
    }

    getList();
    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents queryList={queryProps.queryList} v-model={queryProps.modelValue} v-slots={queryProps.slots} action={false}></QueryComponents>
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
          <el-table-column label="操作" align="center" v-slots={{
            default: ({ row }) => (
              <>
                <span class="table-action-label" style="margin-right: 8px;" onClick={() => editClick(row)}>编辑</span>
                {row.tsgStt === '00'
                  ? <span class="table-action-label" style="margin-right: 8px;" onClick={() => updateSaleGoalStt(row.tsgId, '01')}>上架</span>
                  : <span class="table-action-label" style="margin-right: 8px;" onClick={() => updateSaleGoalStt(row.tsgId, '00')}>下架</span>}
                <span class="table-action-label" onClick={() => pushRoute('detail', {
                  query: {
                    id: row.tsgId
                  }
                })}>详情</span>
              </>
            )
          }}></el-table-column>
        </BasePageTable>
        <ConfirmDialog v-model={dialog.visible} title={dialog.title} auto-confirm={false} center onOnConfirm={handleDialogConfirm}>
          <el-form ref={FormRef} model={form} rules={formRules} label-width="80px">
            <el-form-item label="大标题" prop="tsgName" >
              <el-input v-model={form.tsgName}></el-input>
            </el-form-item>
            <el-form-item label="小标题" prop="tsgTitle">
              <el-input v-model={form.tsgTitle}></el-input>
            </el-form-item>
            <el-form-item label="排序" prop="tsgSort">
              <number-input v-model={form.tsgSort} ></number-input>
            </el-form-item>
          </el-form>
        </ConfirmDialog>
      </div>
    )
  }
})

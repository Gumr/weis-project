import { defineComponent, reactive, inject, computed, Ref, ref } from 'vue';
import { requestFactor } from '@/utils/request';
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import BaseSelect from '@/components/BaseSelect.vue'

import FormItem from '@/components/FormItem.vue'
import { ElMessage, ElMessageBox } from 'element-plus';
import styles from './index.module.less'
// import dayjs from 'dayjs';
// import exportExcel from '@/utils/export-excel';
// import SubmitButton from '@/components/SubmitButton.vue';

const { request, http } = requestFactor('groupmeal.ComboCategory', true);

export default defineComponent({
  name: 'goods_set-meal-types',
  setup() {
    const dialogVisible = reactive({
      create: false,
      edit: false
    })
    const loading = inject('vloading') as Ref<boolean>;
    const data = reactive({
      list: [],
      plans: [],
      total: 0,
    });
    let tgccId: string
    const form = reactive({
      tgccName: ''
    })
    const queryParams = reactive({
      tgccStt: ''
    });

    const querys = computed(() => [
      // {
      //   component: 'BaseSelect',
      //   label: '类型状态',
      //   key: 'tgccStt',
      //   placeholder: '请选择类型状态',
      //   props: {
      //     clearable: true,
      //     options: [
      //       {
      //         label: '禁用',
      //         value: '00'
      //       },
      //       {
      //         label: '正常',
      //         value: '01'
      //       }
      //     ]
      //   }
      // },
      // {
      //   slot: () => (
      //     <el-button type="primary" onClick={getList}>搜索</el-button>
      //   )
      // },
      {
        slot: () => (
          <el-button type="primary" onClick={createClick}>新建类型</el-button>
        ),
      },
    ]);

    const tableColumns = [
      {
        width: '60px',
        align: 'center',
        type: 'index',
        label: '序号',
      },
      {
        label: 'ID',
        prop: 'tgccId',
      },
      {
        label: '套餐类型',
        prop: 'tgccName',
      },
      // {
      //   label: '状态',
      //   prop: 'tgccSttDesc',
      // },
      {
        label: '操作人',
        prop: 'tgccUpdatorName',
      },
      {
        label: '最后操作时间',
        prop: 'tgccUtime',
      },
      {
        label: '操作',
        align: 'center',
        slots: {
          default: ({ row }: { row: any }) => (
            <>
              <span class="table-action-label" style="margin-right: 8px;" onClick={() => editClick(row)}>编辑</span>
              {/* {
                row.tgccStt === '00'
                  ? <span class={`table-action-label ${styles.statuslabel}`} onClick={() => toggleClick(row)}>启用</span>
                  : <span class={`table-action-label ${styles.statuslabel}`} onClick={() => toggleClick(row)}>禁用</span>
              } */}
              <span class="table-action-label" onClick={() => deleteClick(row)}>删除</span>
            </>
          )
        }
      }
    ];

    function createClick() {
      tgccId = ''
      form.tgccPlan = ''
      form.tgccName = ''
      dialogVisible.create = true
    }

    function editClick(row: any) {
      tgccId = row.tgccId
      form.tgccName = row.tgccName
      form.tgccPlan = row.tgccPlan
      dialogVisible.edit = true
    }

    function deleteClick(row: any) {
      ElMessageBox.confirm('是否删除该类型？', '提示')
        .then(() => {
          request('deleteComboCategory', {
            tgccId: row.tgccId
          }).thenwrap((err) => {
            if (!err) {
              ElMessage.success('删除成功')
              getList()
            } else {
              ElMessage.error(err.errMsg)
            }
          })

        })
    }

    function toggleClick(row: any) {
      request('updateComboCategoryState', {
        tgccId: row.tgccId,
        opType: row.tgccStt === '00' ? '01' : '00'
      }).thenwrap((err) => {
        if (!err) {
          ElMessage.success('修改状态成功')
          getList()
        } else {
          ElMessage.error(err.errMsg)
        }
      })
    }

    function handleDialogConfirm() {
      if (!form.tgccName) {
        ElMessage.error('请输入类型名称')
      } else {
        request('updateComboCategory', tgccId ? { tgccId, tgccName: form.tgccName, tgccPlan: form.tgccPlan } : { tgccName: form.tgccName, tgccPlan: form.tgccPlan })
          .thenwrap((err) => {
            if (!err) {
              ElMessage.success('操作成功')
              getList()
              dialogVisible.create = false
              dialogVisible.edit = false
            } else {
              ElMessage.error(err.errMsg)
            }
          })
      }
    }

    function getList() {
      http('queryComboCategoryList', {
        ...queryParams,
      }).thenwrap((err, res) => {
        if (!err) {
          data.list = res;
        }
      });
    }

    // 获取吃法
    function getPlan() {
      http('queryPlan', {}).thenwrap((err, res) => {
        if (!err) {
          data.plans = res
        }
      })
    }



    getList()
    getPlan()

    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents
            query-list={querys.value}
            v-model={queryParams}
            span={3}
            action={false}
          ></QueryComponents>
        </div>
        <BasePageTable
          v-loading={loading.value}
          data={data.list}
          total={data.total}
          onCurrentPageChange={getList}
          onSizeChange={getList}
          visible={false}
        >
          {tableColumns.map((col, index) => (
            <el-table-column {...col} key={index} v-slots={col.slots}></el-table-column>
          ))}
        </BasePageTable>
        <ConfirmDialog v-model={dialogVisible.create} title="新建类型" auto-confirm={false} center onOnConfirm={handleDialogConfirm}>
          <FormItem label="类型名称">
            <el-input v-model={form.tgccName}></el-input>
          </FormItem>
          <FormItem label="适用吃法（选填）" style="margin-top: 20px;">
            <BaseSelect
              v-model={form.tgccPlan}
              class="medium-input"
              filterable
              clearable
              options={data.plans}
            ></BaseSelect>
          </FormItem>
        </ConfirmDialog>
        <ConfirmDialog v-model={dialogVisible.edit} title="编辑类型" auto-confirm={false} center onOnConfirm={handleDialogConfirm}>
          <FormItem label="类型名称">
            <el-input v-model={form.tgccName}></el-input>
          </FormItem>
          <FormItem label="适用吃法（选填）" style="margin-top: 20px;">
            <BaseSelect
              v-model={form.tgccPlan}
              class="medium-input"
              filterable
              clearable
              options={data.plans}
            ></BaseSelect>
          </FormItem>
        </ConfirmDialog>
      </div >
    );
  },
});

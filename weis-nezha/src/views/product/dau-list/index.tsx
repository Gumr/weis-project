import { defineComponent, reactive, inject, computed, Ref } from 'vue';
import { requestFactor } from '@/utils/request';
import dayjs from 'dayjs';
import exportExcel from '@/utils/export-excel';
import SubmitButton from '@/components/SubmitButton.vue';

const { request, http } = requestFactor('data.SaleDaywork', true);

export default defineComponent({
  name: 'product_dau-list',
  setup() {
    const page = reactive({
      pageNo: 1,
      pageSize: 20,
    });
    const loading = inject('vloading') as Ref<boolean>;
    const data = reactive({
      list: [],
      total: 0,
    });
    const today = new Date()
    const queryParams = reactive({
      phone: '',
      date: [today, today],
      startTime: dayjs(today).format('YYYYMMDD'),
      endTime: dayjs(today).format('YYYYMMDD'),
    });

    const querys = computed(() => [
      {
        component: 'el-date-picker',
        label: '日期区间',
        key: 'date',
        props: {
          type: 'daterange',
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期',
          clearable: false
        },
        listeners: {
          change(dates: Date[]) {
            queryParams.startTime = dayjs(dates[0]).format('YYYYMMDD');
            queryParams.endTime = dayjs(dates[1]).format('YYYYMMDD');
          },
        },
      },
      {
        component: 'NumberInput',
        label: '手机号',
        key: 'phone',
        placeholder: '请输入手机号',
        props: {
          precision: 11
        }
      },
      {
        slot: 'motion',
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
        label: '日期',
        prop: 'shipTime',
      },
      {
        label: '手机号码',
        prop: 'personnelPhone',
      },
      {
        label: '成员',
        prop: 'personnelName',
      },
      {
        label: '部门',
        prop: 'departmentName',
      },
      {
        label: '2B',
        prop: 'tbNum',
      },
      {
        label: '2C',
        prop: 'tcNum',
      },
      {
        label: '汇总',
        prop: 'totalNum',
      },
      {
        label: '操作',
        slots: {
          default: ({ row }: { row: any }) => (<span class="table-action-label" onClick={() => detailClick(row)}>详情</span>)
        }
      }
    ];

    function detailClick(row: any) {
      request('querySaleDayworkDetailsData', {
        phone: row.personnelPhone,
        date:row.shipTime

      }).thenwrap((err, data) => {
        if (!err) {
          const detailColumns = [
            {
              type: 'index',
              label: '序号'
            },
            {
              prop: 'orderNumber',
              label: '餐单编码'
            },
            {
              prop: 'shipTime',
              label: '配送日期'
            },
            {
              prop: 'userName',
              label: '微信名'
            },
            {
              prop: 'userPhone',
              label: '手机号'
            },
            {
              prop: 'saleType',
              label: '销售端类型'
            },
            {
              prop: 'orderCategory',
              label: '餐别'
            },
            {
              prop: 'personnelName',
              label: '成员'
            },
            {
              prop: 'departmentName',
              label: '部门'
            }
          ]
          exportExcel({
            data: data.saleDayworkDetailsDataList,
            columns: detailColumns,
            filename: `（${row.personnelName}）日活统计详情-导出`
          })
        }
      })
    }

    const getList = () => {
      http('querySaleDayworkData', {
        // ...page,
        ...queryParams,
      }).thenwrap((err, res) => {
        if (!err) {
          data.list = res.saleDayworkDataList;
          // data.total = res.totalRecordCount;
        }
      });
    };

    function exportClick(done: () => void) {
      http('querySaleDayworkData', {
        ...queryParams,
        // pageNo: 1,
        // pageSize: 9999,
      })
        .thenwrap((err, res) => {
          if (!err) {
            exportExcel({
              data: res.saleDayworkDataList,
              columns: tableColumns,
            });
          }
        })
        .finally(done)
    }

    const querySlots = {
      motion: () => (
        <>
          <el-button onClick={getList}>搜索</el-button>
          <SubmitButton type="primary" onClick={exportClick}>
            导出
          </SubmitButton>
        </>
      ),
    };

    // getList();

    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents
            query-list={querys.value}
            v-model={queryParams}
            v-slots={querySlots}
            action={false}
          ></QueryComponents>
        </div>
        <BasePageTable
          v-loading={loading.value}
          v-models={[
            [page.pageNo, 'current-page'],
            [page.pageSize, 'page-size']
          ]}
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
      </div>
    );
  },
});

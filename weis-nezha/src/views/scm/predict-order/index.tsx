import { defineComponent, reactive, inject, computed, Ref } from 'vue';
import { requestFactor } from '@/utils/request';
import dayjs from 'dayjs';
import exportExcel from '@/utils/export-excel';

const { request, http } = requestFactor('data.GroupForecast', true);

export default defineComponent({
  name: 'product_predict-company-order',
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
      corpAddr: '',
      corpName: '',
      hpName: '',
      foodName: '',
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
        component: 'el-input',
        label: '企业',
        key: 'corpName',
        placeholder: '请输入企业',
        props: {
          clearable: true
        }
      },
      {
        component: 'el-input',
        label: '地址',
        key: 'corpAddr',
        placeholder: '请输入地址',
        props: {
          clearable: true
        }
      },
      {
        component: 'el-input',
        label: '加热点名称',
        key: 'hpName',
        placeholder: '请输入加热点名称',
        props: {
          clearable: true
        }
      },
      {
        component: 'el-input',
        label: '菜品名称',
        key: 'foodName',
        placeholder: '请输入菜品名称',
        props: {
          clearable: true
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
        label: '企业',
        prop: 'forecastCorpName',
      },
      {
        label: '地址',
        prop: 'forecastCorpAddr',
      },
      {
        label: '日期',
        prop: 'forecastDate',
      },
      {
        label: '类型',
        prop: 'forecastFoodType'
      },
      {
        label: '菜品编码',
        prop: 'forecastFoodId',
      },
      {
        label: '预测人',
        prop: 'forecastUname',
      },
      {
        label: '手机',
        prop: 'forecastPhone',
      },
      {
        label: '菜品',
        prop: 'forecastFoodName',
      },
      {
        label: '规格',
        prop: 'forecastFoodSpecs',
      },
      {
        label: '估值(盒)',
        prop: 'forecastFoodNum',
      },
      {
        label: '实际(盒)',
        prop: 'actualFoodNum',
      },
      {
        label: '差异',
        prop: 'diffFoodNum',
      }
    ];


    const getList = () => {
      http('queryGroupForecastData', {
        // ...page,
        ...queryParams,
      }).thenwrap((err, res) => {
        if (!err) {
          data.list = res.groupForecastDataList;
          // data.total = res.totalRecordCount;
        }
      });
    };

    function exportClick() {
      exportExcel({
        data: data.list,
        columns: tableColumns,
      });
    }

    const querySlots = {
      motion: () => (
        <>
          <el-button onClick={getList}>搜索</el-button>
          <el-button type="primary" onClick={exportClick}>
            导出
          </el-button>
        </>
      ),
    };

    getList();

    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents
            query-list={querys.value}
            v-model={queryParams}
            v-slots={querySlots}
            span={6}
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

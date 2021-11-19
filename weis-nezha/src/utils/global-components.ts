
import { App } from 'vue'
import BaseSelect from '@/components/BaseSelect.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import NumberInput from '@/components/NumberInput'
import DatePicker from '@/components/DatePicker'
import ReturnButton from '@/components/ReturnButton.vue'

function install(app: App): void {
  // app.component('query-components', () => import(/** webpackChunkName query-components */'@/components/QueryComponents.vue'));
  app.component('QueryComponents', QueryComponents);
  app.component('BasePageTable', BasePageTable)
  app.component('BaseSelect', BaseSelect);
  app.component('NumberInput', NumberInput);
  app.component('DatePicker', DatePicker)
  app.component('ReturnButton', ReturnButton)
}

export default install;

<template>
  <div class="query-components-wrap">
    <div
      v-for="(item, index) in queryList"
      :key="index"
      class="query-item"
      :style="{ width: `${100 / span}%`, 'min-width': $labelWidth + 130 + 'px' }"
    >
      <span
        v-if="item.label"
        class="query-label overflow-ellipsis"
        :style="{ width: $labelWidth + 'px', 'font-size': '14px' }"
      >{{ semi ? item.label + "：" : item.label }}</span>
      <div
        class="query-component-box"
        :style="{
          width: `calc(100% - ${(item.label ? $labelWidth : 0) + 28}px)`,
          marginTop: (index + 1) / span > 1 ? rowGap : '',
          'min-width': '100px'
        }"
      >
        <Render v-if="typeof item.slot === 'function'" :render="item.slot"></Render>
        <slot v-else-if="item.slot" :name="item.slot"></slot>
        <component
          v-bind="item.props"
          :is="item.component"
          v-model="modelValue[item.key]"
          :placeholder="item.placeholder"
          :maxlength="item.maxlength"
          v-on="item.listeners || {}"
        ></component>
      </div>
    </div>
    <!-- 查询按钮 -->
    <div
      v-if="action"
      class="query-item query-actions"
      style="min-width: 220px;"
      :style="actionStyle"
    >
      <slot name="action">
        <el-button
          v-for="btn in actionButtons"
          :key="btn.$type"
          class="action-btn"
          :type="btn.type"
          :size="buttonSize"
          @click="handleActionClick(btn.$type)"
        >{{ btn.$text }}</el-button>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QueryItem } from './types'
import Render from './Render'
import SelectTree from './SelectTree.vue'

const DEFAULT_ACTIONS = {
  reset: {
    $text: '重置',
    $type: 'reset',
    type: 'warning'
  },
  query: {
    $text: '查询',
    $type: 'query',
    type: 'primary'
  }
} as const

const defaultActions = ['reset', 'query'] as const
type ActionsValueOf<T extends readonly string[]> = T[keyof T]

export default defineComponent({
  components: {
    Render,
    SelectTree
  },

  props: {
    modelValue: {
      type: Object,
      required: true
    },
    // label宽度
    labelWidth: {
      type: Number,
      default: 80
    },
    // label是否自动加分号
    semi: {
      type: Boolean,
      default: false
    },
    queryList: {
      type: Array as PropType<QueryItem[]>,
      required: true,
      default: () => ([])
    },
    rowGap: { // 控制组件换行的间距
      type: String,
      default: '12px'
    },
    span: { // 控制一行显示几个query组件
      type: Number,
      default: 3
    },
    buttonSize: {
      type: String,
      default: 'medium'
    },
    // 控制是否有操作按钮
    action: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'on-query'],
  data() {
    return {
      actionButtons: defaultActions.map(act => DEFAULT_ACTIONS[act])
    }
  },
  computed: {
    actionStyle(): { width: string, marginTop: string } {
      return {
        width: `${100 / this.span}%`,
        marginTop: (this.queryList.length / this.span) >= 1 ? this.rowGap : ''
      }
    },
    $labelWidth(): number {
      return this.labelWidth + 10
    }
  },
  methods: {
    // handleComponentInput(key, value) {
    //   console.log('handleComponentInput', key, value)

    //   this.$emit('update:modelValue', {
    //     ...this.modelValue,
    //     [key]: value
    //   });
    // },
    handleActionClick(type: ActionsValueOf<typeof defaultActions>) {
      switch (type) {
        case 'reset':
          this.$emit('update:modelValue', {})
          break
        default:
          this.$emit('on-query')
          break
      }
    }
  }
})
</script>

<style lang="less" scoped>
.query-components-wrap {
  width: 100%;
}

.query-item,
.query-label,
.query-component-box {
  display: inline-block;
}

.query-label {
  vertical-align: middle;
  text-align: right;
  margin-right: 14px;
}

.query-component-box {
  margin-right: 14px;
}

.query-item {
  overflow: hidden;
  // white-space: nowrap;
}

.actions {
  &.action-btn:last-child {
    margin-right: 0;
  }
  .action-btn {
    margin-right: 6px;
  }
}

.query-item :deep(.el-date-editor) {
  width: 100%;
}
.query-actions {
  min-width: 150px;
}
</style>

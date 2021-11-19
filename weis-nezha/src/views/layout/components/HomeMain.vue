<template>
  <main ref="main" class="app-main">
    <div
      class="app-content"
      :class="[{ fullscreen: fullscreen }, isLive ? '' : 'nezha']"
      style="overflow: hidden"
    >
      <router-view v-slot="{ Component, route }">
        <!-- <transition mode="out-in" name="fade-transform"> -->
        <keep-alive :include="keepRoutes">
          <component :is="Component" :key="route.path"></component>
        </keep-alive>
        <!-- </transition> -->
      </router-view>
      <HomeCopyFooter />
    </div>
  </main>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import * as mutationTypes from '@/store/types'
import HomeCopyFooter from './HomeCopyFooter.vue'
import { defineComponent, computed } from 'vue'
import Render from '@/components/Render'

export default defineComponent({
  name: 'HomeMain',
  components: {
    Render,
    HomeCopyFooter,
  },
  provide() {
    return {
      mainHeight: computed(() => this.mainHeight),
    }
  },
  data() {
    return {
      isLive: false,
      isDev: process.env.NODE_ENV === 'development',
      mainHeight: 0,
      keepMatcher: null,
    }
  },
  computed: mapGetters(['fullscreen', 'keepRoutes']),
  watch: {
    $route: {
      immediate: true,
      handler(to, from) {
        const { keepRoutes } = this.$store.state
        if (!keepRoutes.includes(to.name)) {
          if (!(to.meta && to.meta.deactivated)) {
            // 如果路由声明了deactivated则不缓存
            keepRoutes.push(to.name)
          }
        }
        const { tagViews } = this.$store.state
        const tag = tagViews.find((val) => to.name == val.name)
        if (!tag) {
          tagViews.push(to)
        }

        let idx = -1
        // 有from存在
        // 那就查看to的页面是否是from页面的子页面 如果不是 有就把from从缓存中删除

        // eslint-disable-next-line
        if (
          from &&
          !to.name.startsWith(from.name) &&
          (idx = keepRoutes.indexOf(from.name)) !== -1
        ) {
          keepRoutes.splice(idx, 1)
        }
      },
    },
  },
  created() {
    this.isLive = window.location.href.includes('prodnezha')
  },
  mounted() {
    this.mainHeight = this.$refs.main.offsetHeight
  },
  methods: {
    getComponent(comp) {
      console.log(comp, 'comp')
      return comp
    },
    ...mapMutations({
      setFullscreen: mutationTypes.SET_FULLSCREEN,
    }),
    fullscreenClick() {
      this.setFullscreen(!this.fullscreen)
    },
  },
})
</script>

<style>
a {
  text-decoration: none;
  color: #333333;
}
.el-dialog__body {
  padding: 10px 20px !important;
}
.el-select-dropdown__item {
  font-size: 13px !important;
}
.el-scrollbar__wrap {
  overflow-x: hidden !important;
}
.el-submenu__title,
.el-menu-item {
  font-size: 13px !important;
}
.el-breadcrumb {
  font-size: 13px !important;
}
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.2s;
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-30px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.2s;
}

.breadcrumb-enter,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-move {
  transition: all 0.3s;
}

.breadcrumb-leave-active {
  position: absolute;
}
::-webkit-scrollbar {
  width: 5px; /* 纵向滚动条*/
  height: 10px; /* 横向滚动条 */
  background-color: #fff;
}
/*定义滚动条轨道 内阴影*/
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
  background-color: #ccc;
}

/*定义滑块 内阴影*/
::-webkit-scrollbar-thumb {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
  background-color: #aaaaaa;
  border-radius: 10px;
}
</style>

<style lang="less" scoped>
@import '../../../styles/base.less';
:deep(.el-scrollbar__wrap) {
  overflow-x: hidden !important;
}
:deep(.el-table__body tr.current-row > td) {
  background-color: #409eff;
  color: white;
}
@nezhaColor: #f78400;
.nezha {
  :deep(.el-table__body tr.current-row > td) {
    background-color: @nezhaColor;
    color: white;
  }
  // 按钮样式
  :deep(.el-button--primary) {
    background-color: @nezhaColor !important;
    border-color: @nezhaColor !important;
  }
  // 单选框样式
  :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
    background-color: @nezhaColor;
    border-color: @nezhaColor;
    box-shadow: -1px 0 0 0 @nezhaColor;
    &:hover {
      color: white;
    }
  }
  :deep(.el-radio__input.is-checked + .el-radio__label) {
    color: @nezhaColor !important;
  }
  :deep(.el-radio__input.is-checked .el-radio__inner) {
    border-color: @nezhaColor;
    background: @nezhaColor;
  }
  :deep(.el-radio__inner:hover) {
    border-color: @nezhaColor;
  }
  :deep(.el-radio-button__inner:hover) {
    color: @nezhaColor;
  }
  // 输入框样式
  :deep(.el-input__inner:focus) {
    border-color: @nezhaColor;
    outline: 0;
  }
  :deep(.el-textarea__inner:focus) {
    border-color: @nezhaColor;
  }
  // 下拉框样式
  :deep(.el-select .el-input.is-focus .el-input__inner) {
    border-color: @nezhaColor;
  }
  :deep(.el-select-dropdown__item.selected) {
    color: @nezhaColor !important;
  }
  // 多选框
  :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
    color: @nezhaColor;
  }
  :deep(.el-checkbox__input.is-checked
      .el-checkbox__inner, .el-checkbox__input.is-indeterminate
      .el-checkbox__inner) {
    border-color: @nezhaColor;
    background: @nezhaColor;
  }
  :deep(.el-checkbox__inner:hover) {
    border-color: @nezhaColor;
  }
  :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
    color: @nezhaColor;
  }
  :deep(.el-checkbox.is-bordered.is-checked) {
    border-color: @nezhaColor;
  }
  :deep(.el-checkbox__input.is-focus .el-checkbox__inner) {
    border-color: @nezhaColor;
  }
  // 图片
  :deep(.el-upload--picture-card:hover),
  .el-upload:focus {
    border-color: @nezhaColor;
    color: @nezhaColor;
  }
  // 日期
  :deep(.el-range-editor.is-active, .el-range-editor.is-active:hover) {
    border-color: @nezhaColor;
  }
}

:deep(.el-submenu__title) {
  font-size: 13px;
}

.app-main {
  height: calc(100vh - 115px);
  background-color: white;
  overflow-y: auto;
}

.app-content {
  background-color: #fff;
  border-radius: 2px;
}
@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale3d(0.4, 0.4, 0.4);
  }

  50% {
    opacity: 1;
  }
}

.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  background: #fff;
  width: 100vw;
  height: 100vh;
  animation: zoomIn 0.4s;
  overflow: hidden;
}
</style>

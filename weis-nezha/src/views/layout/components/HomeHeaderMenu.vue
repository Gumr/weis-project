<template>
  <div class="header-menu-wrap">
    <el-menu
      :default-active="activeHeaderMenu"
      mode="horizontal"
      v-bind="color"
      @select="handleMenuSelect"
    >
      <el-menu-item
        class="header-menu-item"
        v-for="menu in headerMenus"
        :key="menu.name"
        :index="menu.name"
      >{{ menu.text }}</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import * as types from '@/store/types';

export default {
  computed: {
    ...mapGetters(['activeHeaderMenu', 'headerMenus'])
  },
  data() {
    return {
      // menus: HEADER_MENUS,
      color: {
        activeTextColor: '#1890FF',
        textColor: '#333  '
      }
    };
  },
  created() {
    if (window.location.href.includes('prodnezha')) {
      this.isLive = true;
    } else {
      this.isLive = false;
      this.color.activeTextColor = '#F78400';
    }
  },
  methods: {
    ...mapMutations({
      setActiveHeaderMenu: types.SET_ACTIVE_HEADER_MENU
    }),
    handleMenuSelect(menu) {
      this.setActiveHeaderMenu(menu);
    }
  }
};
</script>

<style lang="less" scoped>
.header-menu-wrap,
.header-menu-wrap :deep(.el-menu),
.header-menu-wrap :deep(.el-menu-item) {
  height: 100%;
}

.header-menu-wrap :deep(.el-menu--horizontal) {
  border-bottom: none;
}
.header-menu-item {
  color: #e6e6e6;
}
</style>

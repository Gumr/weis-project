<template>
  <aside class="app-sidebar">
    <el-menu
      :class="['sidebar-menu', isLive ? 'prod' : 'nezha']"
      v-bind="color"
      :unique-opened="true"
      :default-active="activeSidebar"
      @select="handleMenuSelect"
    >
      <SidebarMenu v-for="(menu, index) in menus" :menu="menu" :key="index"></SidebarMenu>
    </el-menu>
  </aside>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { isVisibleMenu } from '@/utils/common';
import * as mutationTypes from '@/store/types';
import RouteController from '@/utils/route-controller';
import SidebarMenu from './SidebarMenu.vue';

export default {
  components: {
    SidebarMenu
  },
  computed: {
    ...mapGetters(['activeSidebar']),
    menus() {
      // headerMenu更改后 用新的headerMenu从route中读取对应的路由 显示在侧边栏
      const menus = RouteController.routes || [];

      function convertMenus(menuList, parentIndex) {
        menuList = menuList.filter(isVisibleMenu);
        return menuList.map((menu) => {
          menu = { ...menu }; // 浅复制
          // 侧边栏index需要是唯一 route的name可能是重复的 用&符把它连接起来
          // menu.index = parentIndex ? `${parentIndex}&${menu.path}` : menu.path;
          if (Array.isArray(menu.children)) menu.children = convertMenus(menu.children, menu.index);
          return menu;
        });
      }

      return convertMenus(menus);
    },
  },
  data() {
    return {
      isLive: false,
      color: {
        backgroundColor: '#071c4d',
        textColor: '#fff',
        activeTextColor: '#FFFFFF'
      }
    };
  },
  created() {
    if (window.location.href.includes('prodnezha')) {
      this.isLive = true;
      this.color.backgroundColor = '#071c4d';
    } else {
      this.isLive = false;
      this.color.backgroundColor = '#20222A';
    }
  },
  methods: {
    ...mapMutations({
      setActiveSidebar: mutationTypes.SET_ACTIVE_SIDEBAR
    }),
    handleMenuSelect(name) {
     
      this.setActiveSidebar(name);
      // 判断select的路由是否是当前路由
      // paths = paths.slice(1);
      // const keys = key.split('&');
      // const path = `${keys[0]}/${keys[keys.length - 1]}`;
      if (name !== this.$route.name) {
        this.$router.push({
          name
        });
      }
    }
  }
};

</script>
<style lang="less" scoped>
@import "../../../styles/common.less";

.app-sidebar {
  width: @side-width;
}

.sidebar-menu {
  overflow-y: auto;
  height: 100%;
  &::-webkit-scrollbar {
    display: none;
  }
}

.app-sidebar :deep(.el-menu) {
  border-right: none;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}

.app-sidebar :deep(.el-menu-item) {
  background-color: #000a22 !important;
}

.prod :deep(.el-menu-item) {
  background-color: #000a22 !important;
}
.prod :deep(.homecss) {
  background-color: #071c4d !important;
}
.prod :deep(.submenu-1 .el-submenu__title) {
  background-color: #000a22 !important;
}
.prod :deep(.is-active) {
  background-color: #1890ff !important;
  color: #fff !important;
}
.nezha :deep(.el-menu-item) {
  background-color: #000 !important;
}
.nezha :deep(.homecss) {
  background-color: #20222a !important;
}
.nezha :deep(.submenu-1 .el-submenu__title) {
  background-color: #000 !important;
}
.nezha :deep(.is-active) {
  background-color: #f78400 !important;
  color: #fff !important;
  position: relative;
  &::before {
    position: absolute;
    left: 0;
    content: "";
    width: 4px;
    height: 100%;
    background-color: #f78400;
  }
}
</style>

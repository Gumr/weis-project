<template>
  <div>
    <el-submenu
      v-if="menu.children && menu.children.length > 0"
      :index="menu.name"
      :class="`submenu-${id}`"
    >
      <template #title>
        <span>{{ menu.meta.title }}</span>
      </template>
      <SidebarMenu :id="id + 1" v-for="(item, index) in menu.children" :key="index" :menu="item" />
    </el-submenu>
    <el-menu-item v-else :index="menu.name" :class="menu.meta.title == '首页' ? 'homecss' : ''">
      <template #title>{{ menu.meta.title }}</template>
    </el-menu-item>
  </div>
</template>

<script>
export default {
  name: 'SidebarMenu',
  props: {
    menu: Object,
    id: {
      type: Number,
      default: 0
    }
  }
};
</script>

<style scoped>
.homecss {
  background-color: red !important;
}
.submenu-1 :deep(.el-submenu__title) {
  background-color: #000 !important;
}
</style>

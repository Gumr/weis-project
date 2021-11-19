<template>
  <el-breadcrumb>
    <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
      <i :class="item.meta.icon" style="margin-right: 5px"></i>
      <span>{{ item.meta.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import * as mutationTypes from '@/store/types';
import RouteController from '@/utils/route-controller';
import { isVisibleMenu } from '@/utils/common';

export default {
  computed: mapGetters(['activeHeaderMenu', 'headerMenus']),
  watch: {
    $route: {
      immediate: true,
      handler(route) {
       
        const names = route.name.split('_').filter(Boolean);

        const flattenRoutes = RouteController.getFlattenRoutes(false);

        // names 0项去匹配路由 匹配后去掉
        const matchRoutes = flattenRoutes.find((r) => r.name === names[0]);
        names.shift();

        if (!matchRoutes) {
          this.setActiveSidebar(route.name)
          this.breadcrumbList = [route];
          return;
        }

        const breadcrumbList = [matchRoutes]; // 从module里读出顶层的菜单;
        const matchChildren = matchRoutes.children || []; // 用match route的children做匹配

        let matchName = matchRoutes.name; // 对多层的name一层一层拼接 然后进行匹配;
        names.forEach((name) => {
          matchName = `${matchName}_${name}`;
          const matchRoute = matchChildren.find((r) => r.name === matchName);
          if (matchRoute) breadcrumbList.push(matchRoute);
        });

        const routeArr = breadcrumbList.filter((val) => isVisibleMenu(val));
        this.setActiveSidebar(routeArr[routeArr.length - 1].name);

        this.breadcrumbList = breadcrumbList;
      }
    }
  },
  data() {
    return {
      breadcrumbList: []
    };
  },
  methods: {
    ...mapMutations({
      setActiveSidebar: mutationTypes.SET_ACTIVE_SIDEBAR
    })
  }
};
</script>

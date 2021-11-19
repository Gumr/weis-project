<template>
  <header class="app-header">
    <div
      class="header-title cursor-pointer"
      :class="isLive ? '' : 'nezha'"
      @click="$pushRoute('/welcome')"
    >
      <img
        src="/images/sideba_logo.png"
        alt
        style="width: 160px"
      />
    </div>
    <div class="header-menus-wrap">
      <div class="header-menus">
        <HomeBreadcrumb />
      </div>
      <div class="header-toolbar">
       
       
        <el-tooltip
          class="item"
          effect="light"
          :content="$store.getters.online?'在线中':' 已下线...'"
          placement="left-start"
          v-if="userData.shopLeader"
        >
          <el-button
            :type="$store.getters.online ?'success':'danger'"
            :icon="$store.getters.online?'el-icon-circle-check':'el-icon-circle-close'"
            circle
            style="margin-right:10px"
            :loading="$store.getters.online ?false:true"
          ></el-button>
        </el-tooltip>
       

        <el-switch
          v-if="isDev"
          style="margin-right: 12px;"
          :model-value="printMode"
          active-value="preview"
          :inactive-value="false"
          active-text="预览打印"
          inactive-text="普通打印"
          @change="setPrintMode"
        ></el-switch>

        <!-- <el-tooltip v-if="isDev" effect="dark" content="添加菜单页面" placement="bottom">
          <i class="toolbar-item el-icon-plus cursor-pointer" @click="createPageClick"></i>
        </el-tooltip>-->

        <el-tooltip
          effect="dark"
          content="扫描取餐码"
          placement="bottom"
        >
          <img
            class="scan-code-icon toolbar-item cursor-pointer"
            src="/images/qr.png"
            @click="$pushRoute('/scm/serving-meals/scan-code')"
          />
        </el-tooltip>

        <div class="toolbar-item user-info-box">
          <img
            class="avatar-image"
            src="/images/top_head.png"
            alt
          />
          <el-dropdown>
            <span class="cursor-pointer el-dropdown-link">{{ userData.uname }}</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logoutClick">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    <ConfirmDialog
      v-model="pageVisible"
      title="添加菜单页面"
      :close-on-click-modal="false"
      async-confirm
      @on-confirm="createPageConfirm"
    >
      <el-form
        ref="page"
        :rules="page.rules"
        :model="page.model"
        label-width="100px"
      >
        <el-form-item
          label="顶部菜单"
          prop="root"
        >
          <BaseSelect
            v-model="page.model.root"
            :options="pageOptions.root"
            @change="pageRootChange"
          ></BaseSelect>
        </el-form-item>
        <el-form-item
          label="侧边菜单组"
          prop="group"
        >
          <div style="margin-bottom: 10px">
            <el-radio-group
              v-model="groupStatus"
              @change="groupStatusChange"
            >
              <el-radio-button :label="0">选择已有</el-radio-button>
              <el-radio-button :label="1">新建组</el-radio-button>
            </el-radio-group>
          </div>
          <div>
            <div
              v-if="groupStatus === 1"
              class="display-flex"
            >
              <el-input
                v-model="page.model.group.path"
                clearable
                placeholder="组路径"
              ></el-input>
              <el-input
                v-model="page.model.group.title"
                clearable
                placeholder="组菜单名"
              ></el-input>
            </div>
            <BaseSelect
              v-else
              v-model="page.model.group.path"
              :options="pageOptions.group"
              @change="pageGroupChange"
            ></BaseSelect>
          </div>
        </el-form-item>
        <el-form-item
          label="是否隐藏"
          prop="hidden"
        >
          <div>
            <el-switch v-model="page.model.hidden"></el-switch>
          </div>

          <span class="tips">隐藏页面即是不出现在菜单的页面</span>
        </el-form-item>
        <el-form-item
          label="菜单页面"
          prop="page"
        >
          <div class="display-flex">
            <el-input
              v-model="page.model.page.path"
              clearable
              placeholder="页面路径"
              @blur="handlePathBlur"
            ></el-input>
            <el-input
              v-model="page.model.page.title"
              clearable
              placeholder="页面名"
            ></el-input>
            <el-input
              v-model="page.model.page.file"
              clearable
              placeholder="页面文件名"
            ></el-input>
          </div>
          <span class="tips">
            新建隐藏页面时页面路径为中划线分割如: goods-list/create,
            商品列表里的新建页面
          </span>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </header>
</template>

<script>
import Cookeis from "js-cookie";
import * as types from "@/store/types";
import { mapGetters, mapMutations } from "vuex";
import axios from "axios";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import RouteModule from "@/router/module/index";
import HomeBreadcrumb from "./HomeBreadcrumb.vue";
// import HomeHeaderMenu from './HomeHeaderMenu.vue';
import { defineComponent } from "vue";
function requrestCreatePage(page) {
  return axios.post("/_create_page", page);
}

export default defineComponent({
  components: {
    // HomeHeaderMenu,
    HomeBreadcrumb,
    ConfirmDialog,
  },
  inject: ["reload"],
  data() {
    return {
      outLine: false,
      isLive: false,
      isDev: process.env.NODE_ENV === "development",
      avatar: "",
      pageVisible: false,
      groupStatus: 0,
      pageOptions: {
        root: [],
        group: [],
      },
      page: {
        model: {
          root: "",
          group: {
            path: "",
            title: "",
          },
          hidden: false,
          page: {
            path: "",
            title: "",
            file: "index",
          },
        },
        rules: {
          root: {
            trigger: "change",
            message: "请选择顶部菜单",
            require: true,
          },
          group: {
            trigger: "change",
            validator: (rule, value, callback) => {
              if (!value.path || !value.title) {
                callback("请输入页面组信息");
              } else {
                callback();
              }
            },
            require: true,
          },
          page: {
            trigger: "change",
            validator: (rule, value, callback) => {
              if (!value.path || !value.title || !value.file) {
                callback("请输入页面信息");
              } else {
                callback();
              }
            },
            require: true,
          },
        },
      },
    };
  },
  computed: {
    ...mapGetters({
      printMode: "printMode",
      storeUserData: "userData",
      online: "online",
    }),
    userData() {
      // eslint-disable-next-line
      return this.storeUserData || {};
     
    },
  },

  created() {
    if (window.location.href.includes("prodnezha")) {
      this.isLive = true;
    } else {
      this.isLive = false;
    }
  },
  mounted() {
  },
  methods: {
    ...mapMutations({
      setPrintMode: types.SET_PRINT_MODE,
    }),
    // getStore(a) {
    //   debugger;
    // },
    internetStatus() {
      window.addEventListener("offline", () => {
        this.outLine = true;
      });
      window.addEventListener("online", () => {
        this.outLine = false;
      });
    },
    refesh() {
      // this.reload()
    },
    handlePathBlur() {
      const { path } = this.page.model.page;
      if (path.indexOf("/") !== -1) {
        const pathSplit = path.split("/");
        this.page.model.page.file = pathSplit[pathSplit.length - 1];
      }
    },
    groupStatusChange() {
      this.page.model.group = {
        title: "",
        path: "",
      };
    },
    pageGroupChange(path) {
      const group = this.pageOptions.group.find((i) => i.value === path);
      this.page.model.group.title = group.label;
    },
    pageRootChange(root) {
      const groupOptions = RouteModule.module[root].map((r) => ({
        label: r.meta.title,
        value: r.name,
      }));
      this.pageOptions.group = groupOptions;
      // eslint-disable-next-line
      this.page.model.group = groupOptions[0] && {
        title: groupOptions[0].label,
        path: groupOptions[0].value,
      };
    },
    createPageClick() {
      this.pageVisible = true;
      this.groupStatus = 0;
      // eslint-disable-next-line
      const pageModel = (this.page.model = this.$options.data().page.model);
      pageModel.root =
        this.pageOptions.root[0] && this.pageOptions.root[0].value;
      if (pageModel.root) {
        this.pageRootChange(pageModel.root);
      }
    },
    createPageConfirm(next) {
      this.$refs.page.validate(async (valid) => {
        if (valid) {
          const { data } = await requrestCreatePage(this.page.model);
          if (data.errCode === 0) {
            this.$emit("on-create-page", data.path);
          }
          this.$errorNotify(data);
          next();
        }
      });
    },
    handleData(data) {
      for (const item of data) {
        item.url = item.name;
        item.name = item.meta.title;
        delete item.meta;
        delete item.path;
        delete item.component;
        delete item.hidden;
        if (item.children) {
          this.handleData(item.children);
        }
      }
      return data;
    },
    logoutClick() {
      this.$confirm("是否要退出登录？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        Cookeis.remove("token");
        this.$pushRoute("/login");
      });
    },
  },
});
</script>

<style lang="less" scoped>
@import "../../../styles/base.less";
@import "../../../styles/common.less";

.app-header {
  display: flex;
  align-items: center;
  height: 50px;
  box-sizing: border-box;
  box-shadow: 0px 1px 4px 0px rgba(0, 21, 41, 0.12);
  color: @main-text;
}

.header-title {
  width: @side-width;
  height: 100%;
  background-color: #071c4d;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}
.nezha {
  background-color: #20222a;
}
// @media screen and (max-width: 1350px) {
//   .header-title {
//     width: 160px;
//     min-width: 160px;
//   }
// }

.header-menus-wrap {
  display: flex;
  height: 100%;
}

.header-menus {
  flex-grow: 1;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 20px;
}

.header-toolbar {
  // flex-basis: 240px;
  display: flex;
  align-items: center;
  .user-info-box {
    display: flex;
    align-items: center;
  }
  .avatar-image {
    width: 36px;
    height: 36px;
    margin-right: 12px;
    border-radius: 72px;
  }
  .toolbar-item {
    margin-right: 24px;
  }
}

.logout-text:hover,
.message-icon:hover {
  color: @brand-color;
}

.scan-code-icon {
  width: 20px;
  height: 20px;
}

.tips {
  font-size: 12px;
  color: #909399;
}
</style>

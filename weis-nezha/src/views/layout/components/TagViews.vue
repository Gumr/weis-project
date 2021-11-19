<template>
  <div
    id="tags-view-container"
    ref="tags"
    :class="['tags-view-container', isLive ? 'prod' : 'nezha']"
  >
    <el-tabs
      v-model="tabsValue"
      type="card"
      @tab-remove="removeTab"
      @tab-click="tabClick"
      @contextmenu.prevent="openContextMenu($event)"
    >
      <el-tab-pane
        v-for="item in tagViews"
        :key="item.meta.title"
        class="tags-view-item"
        :label="item.meta.title"
        :name="item.name"
        :closable="item.meta.title != '首页'"
      ></el-tab-pane>
    </el-tabs>
    <ul v-show="contextMenuVisible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="closeAllTabs">关闭所有</li>
      <li @click="closeOtherTabs('left')">关闭左边</li>
      <li @click="closeOtherTabs('right')">关闭右边</li>
      <li @click="closeOtherTabs('other')">关闭其他</li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
function getTagValue(tag) {
  return tag.name
}
export default {
  data() {
    return {
      isLive: false,
      tabsValue: 'home',
      contextMenuVisible: false,
      left: 0,
      top: 0,
      textContent: ''
    }
  },
  computed: {
    ...mapGetters(['tagViews'])
  },
  watch: {
    $route(to, from) {
      this.$nt(() => {
        const tag = this.tagViews.find(val => val.path == this.$route.path)
        this.tabsValue = tag.name
      })
    },
    contextMenuVisible() {
      if (this.contextMenuVisible) {
        document.body.addEventListener('click', this.closeContextMenu)
      } else {
        document.body.removeEventListener('click', this.closeContextMenu)
      }
    }
  },
  created() {
    this.isLive = window.location.href.includes('prodnezha')
  },
  mounted() {
    this.tabsValue = getTagValue(this.tagViews.find(val => val.path == this.$route.path))
  },
  methods: {
    tabClick(e) {
      const { name } = e.props
      this.tabsValue = name
      const tag = this.tagViews.find(val => getTagValue(val) == name)

      if (tag.path === this.$route.path) return
      this.$router.push({
        path: tag.path,
        query: tag.query
      })
    },
    removeTab(name) {
      const { tagViews } = this.$store.state
      const view = tagViews.filter(val => getTagValue(val) == name)
      const index = tagViews.findIndex(val => getTagValue(val) == name)
      tagViews.splice(index, 1)
      if (view[0].path == this.$route.path) {
        this.$router.push({
          path: tagViews[index - 1].path,
          query: tagViews[index - 1].query
        })
      }
    },
    openContextMenu(e) {
      if (e.srcElement.textContent != '首页') {
        this.textContent = e.srcElement.textContent
        // const currentContextTabId = e.srcElement.id.split('-')[1]
        this.contextMenuVisible = true
        this.left = e.clientX
        this.top = e.clientY + 10
      }
    },
    closeAllTabs() {
      this.$store.state.tagViews = [this.tagViews.shift()]
      this.contextMenuVisible = false
      this.$router.push({ path: '/welcome' })
    },
    // 关闭其它标签页
    closeOtherTabs(par) {
      const index = this.tagViews.findIndex(val => val.path == this.$route.path)
      if (par == 'left') {
        const head = this.tagViews.shift()
        this.tagViews.splice(0, index - 1)
        this.$store.state.tagViews = [head].concat(this.tagViews)
      } else if (par == 'right') {
        this.$store.state.tagViews.splice(index + 1, this.tagViews.length)
      } else {
        const val = this.tagViews.find(val => val.path == this.$route.path)
        const head = this.tagViews.shift()
        this.$store.state.tagViews = [head, val]
      }
      this.contextMenuVisible = false
    },
    // 关闭contextMenu
    closeContextMenu() {
      this.contextMenuVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-tabs__item) {
  position: relative;
  cursor: pointer;
  height: 32px;
  line-height: 32px;
  border: 1px solid #ebeef5;
  background: #ffffff;
  font-size: 12px;
  border-radius: 2px;
  margin-right: 5px;
  margin-top: 6px;
  display: inline-flex;
  justify-items: center;
  align-items: center;
  padding: 0 15px 0 15px;
  &:hover .el-icon-close {
    width: 15px;
    opacity: 1;
    margin-left: 5px;
    margin-right: -5px;
  }
}
.prod :deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  border: 1px solid #409eff;
  background-color: #409eff;
  color: white;
}
.nezha :deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  border: 1px solid #f78400;
  background-color: #f78400;
  color: white;
}
.nezha :deep(.el-tabs__item:hover) {
  color: #f78400;
}
:deep(.el-tabs__active-bar) {
  display: none !important;
}
:deep(.el-tabs--card > .el-tabs__header) {
  width: calc(100% - 20px);
}
:deep(.el-tabs__header),
:deep(.el-tabs__nav-wrap),
:deep(.el-tabs__nav-scroll) {
  margin: 0;
  height: 45px !important;
}
:deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  height: 45px !important;
  border: none;
}
:deep(.el-tabs--card
    > .el-tabs__header
    .el-tabs__item.is-active.is-closable
    .el-icon-close) {
  width: 0;
}
:deep(.el-tabs--card
    > .el-tabs__header
    .el-tabs__item.is-closable:hover
    .el-icon-close) {
  width: 15px;
}
:deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
  border: 1px solid #e4e7ed;
}
:deep(.el-tabs--card > .el-tabs__header .el-tabs__item:first-child) {
  border: 1px solid #e4e7ed;
}
:deep(.el-tabs--card > .el-tabs__header .el-tabs__item:first-child.is-active) {
  border: 1px solid #409eff;
}
.nezha
  :deep(.el-tabs--card
    > .el-tabs__header
    .el-tabs__item:first-child.is-active) {
  border: 1px solid #f78400;
}

.tags-view-container {
  float: left;
  margin-left: 10px;
  width: 100%;
}
.contextmenu {
  width: 80px;
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 3px 0;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.2);
}
.contextmenu li {
  margin: 0;
  padding: 7px 16px;
}
.contextmenu li:hover {
  background: #f2f2f2;
  cursor: pointer;
}
</style>

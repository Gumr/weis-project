<template>
  <div class="page-container">
    <div class="name-bar display-flex">
      <span class="name-label">角色名称：</span>
      <el-tag class="name-input">{{ role.rname }}</el-tag>
    </div>
    <div class="tree-select-wrap display-flex">
      <div class="tree-select-section">
        <h3>页面功能权限</h3>
        <div class="tree-box">
          <el-tree
            ref="authTree"
            node-key="id"
            :props="authTreeProps"
            :data="authTreeData"
          ></el-tree>
        </div>
      </div>
      <div class="tree-select-control">
        <!-- <div>
          <el-button
            type="primary"
            style="margin-bottom: 20px;"
            @click="removeAuthClick"
          >
            <i class="el-icon-arrow-left"></i>
            移出
          </el-button>
        </div>
        <div>
          <el-button type="primary" @click="insertAuthClick"
            >移入<i class="el-icon-arrow-right"></i
          ></el-button>
        </div> -->
      </div>
      <div class="tree-select-section">
        <h3>已选择</h3>
        <div class="tree-box">
          <el-tree
            ref="selectTree"
            node-key="url"
            :data="selectedTreeData"
            :props="authTreeProps"
          ></el-tree>
        </div>
      </div>
    </div>
    <!-- <footer class="inline-center" style="margin-top: 24px;">
      <el-button type="primary" @click="confirmClick">确认</el-button>
      <el-button @click="() => $router.back()">取消</el-button>
    </footer> -->
  </div>
</template>

<script>
import { cloneDeep } from '@/utils/common';
import { validArray } from '@/utils/common';

function nodeHandler(node, parent, level = 0) {
  node.level = level;

  if (parent) {
    node.parent = parent;
  }

  if (validArray(node.children)) {
    node.children.forEach(child => nodeHandler(child, node, level + 1));
  }

  return node;
}

export default {
  data() {
    return {
      role: {
        rname: '',
        menuid: []
      },
      authTreeProps: {
        label: 'name',
        // children: 'children',
        // disabled: 'disabled'
      },
      authTreeData: [],
      selectedTreeData: [],
    };
  },
  created() {
    this.authNodes = [];

    const getAuthMenus = this.getAuthMenus();

    this.id = this.$route.query.id;
    if (this.id) {
      getAuthMenus.then(this.getRoleData);
    }
  },
  mounted() {
    this.authTree = this.$refs.authTree;
    this.selectTree = this.$refs.selectTree;
  },
  methods: {
    getAuthMenus() {
      return this.$request('sys.Role/getMenu').then(({ data }) => {
        if (data.errCode === 0) {
          this.authTreeData = data.obj.result.map(node => nodeHandler(node));
        }
      });
    },
    getRoleMenuIds() {
      const ids = [];
      function trace(node) {
        ids.push(node.id);
        if (validArray(node.children)) {
          node.children.forEach(trace);
        }
      }

      this.selectedTreeData.forEach(trace);

      return ids;
    },
    // confirmClick() {
    //   if (!this.role.rname) {
    //     this.$message({
    //       type: 'error',
    //       message: '请输入角色名称'
    //     });

    //     return;
    //   }

    //   this.role.menuid = this.getRoleMenuIds();

    //   if (this.status === 0) {
    //     this.addRole();
    //   } else if (this.status === 1) {
    //     this.editRole();
    //   }
    // },
    // editRole() {
    //   this.$request('sys.Role/editRole', this.role).then(({ data }) => {
    //     if (data.errCode === 0) {
    //       this.$message({
    //         type: 'success',
    //         message: '修改角色成功'
    //       });
    //       this.$router.back();
    //     }
    //   });
    // },
    // addRole() {
    //   this.$request('sys.Role/addRole', this.role).then(({ data }) => {
    //     if (data.errCode === 0) {
    //       this.$message({
    //         type: 'success',
    //         message: '添加角色成功'
    //       });
    //       this.$router.back();
    //     }
    //   });
    // },
    getSelectedTreeData(tree, ids) {
      const nodeFilter = node => ids.includes(node.id);

      tree = tree.filter(nodeFilter);

      const trace = (node, index) => {
        // eslint-disable-next-line
        let { id, children } = node;

        if (!ids.includes(id)) {
          node.parent.children.splice(index, 1);
        }
        if (validArray(children)) {
          node.children = children.filter(nodeFilter);
          node.children.forEach(trace);
        }
      };

      tree.forEach(trace);

      return tree;
    },
    getRoleData() {
      this.$request('sys.Role/getRoleInfo', {
        intValue: this.id
      }).then(({ data }) => {
        if (data.errCode === 0) {
          // eslint-disable-next-line
          let { menu, result } = data.obj;
          menu = menu.map(({ value }) => value);

          this.selectedTreeData = this.getSelectedTreeData(cloneDeep(this.authTreeData), menu);

          this.role = {
            rname: result.trName,
            roleid: result.trId,
            menuid: menu
          };
        }
      });
    }
  }
};

</script>

<style lang="less" scoped>
.name-bar {
  align-items: center;
  .name-label {
    flex-shrink: 0;
  }
  .name-input {
    width: 260px;
  }
}

.tree-select-wrap {
  justify-content: space-between;
  .tree-select-section {
    flex-grow: 1;
  }
  .tree-select-control {
    width: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}

.tree-box {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
}
</style>

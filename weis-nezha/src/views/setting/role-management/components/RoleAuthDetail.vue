<template>
  <div class="page-container">
    <div class="name-bar display-flex">
      <span class="name-label">角色名称：</span>
      <el-input v-model="role.rname" class="name-input" ></el-input>
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
            show-checkbox
            check-on-click-node
          ></el-tree>
        </div>
      </div>
      <div class="tree-select-control">
        <div>
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
          <el-button type="primary" @click="insertAuthClick">
            移入<i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
      </div>
      <div class="tree-select-section">
        <h3>已选择</h3>
        <div class="tree-box">
          <el-tree
            ref="selectTree"
            node-key="url"
            :data="selectedTreeData"
            :props="authTreeProps"
            show-checkbox
            check-on-click-node
          ></el-tree>
        </div>
      </div>
    </div>
    <footer class="inline-center" style="margin-top: 24px;">
      <el-button type="primary" @click="confirmClick">确认</el-button>
      <el-button @click="() => $closeRoute()">取消</el-button>
    </footer>
  </div>
</template>

<script>
import { cloneDeep } from '@/utils/common'
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

function mergeCheckNodes(newNodes, oldNodes) {
  function findPaths(node, paths = []) {
    while (node) {
      node = { ...node };
      paths.unshift(node);

      if (node.parent) {
        node.parent = { ...node.parent };
        node.parent.children = [node];
      }

      node = node.parent;
    }

    return paths;
  }
  newNodes.forEach((node) => {
    const paths = findPaths(node);

    let matches = oldNodes;
    // eslint-disable-next-line
    for (const path of paths) {
      const matchItem = matches.find(item => item.id === path.id);

      if (matchItem) {
        matches = matchItem.children;
      } else {
        matches.push(path);
        return;
      }
    }
  });
}

export default {
  props: ['status'],
  data() {
    return {
      role: {
        rname: '',
        menuid: []
      },
      authTreeProps: {
        label: 'name'
        // children: 'children',
        // disabled: 'disabled'
      },
      authTreeData: [],
      selectedTreeData: []
    };
  },
  created() {
    this.authNodes = [];

    this.id = this.$route.query.id;
    if (this.id) {
      this.getAuthMenus().then(this.getRoleData);
    } else {
      this.getAuthMenus();
    }
  },
  mounted() {
    this.authTree = this.$refs.authTree;
    this.selectTree = this.$refs.selectTree;
  },
  methods: {
    insertAuthClick() {
      const checkedNodes = this.authTree.getCheckedNodes(true, true);

      if (checkedNodes.length <= 0) return;
      mergeCheckNodes(checkedNodes, this.selectedTreeData);

      // this.selectedTreeData = newNodes;
      this.authTree.setCheckedNodes([]);
    },
    removeAuthClick() {
      const checkedNodes = this.selectTree.getCheckedNodes();

      if (checkedNodes.length <= 0) return;

      checkedNodes.forEach((node) => {
        const { parent } = node;
        if (parent && validArray(parent.children)) {
          parent.children = parent.children.filter(n => n.id !== node.id);
        }

        this.selectTree.remove(node);
      });
      this.selectTree.setCheckedNodes([]);
    },
    getAuthMenus() {
      return this.$request('sys.Role/getMenu')
        .then(({ data }) => {
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
    confirmClick() {
      if (!this.role.rname) {
        this.$message({
          type: 'error',
          message: '请输入角色名称'
        });

        return;
      }

      this.role.menuid = this.getRoleMenuIds();

      if (this.status === 0) {
        this.addRole();
      } else if (this.status === 1) {
        this.editRole();
      }
    },
    editRole() {
      this.$request('sys.Role/editRole', this.role).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: 'success',
            message: '修改角色成功'
          });
          this.$closeRoute();
        }
      });
    },
    addRole() {
      this.$request('sys.Role/addRole', this.role).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: 'success',
            message: '添加角色成功'
          });
          this.$closeRoute();
        }
      });
    },
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
          // const obj = {
          //   a: 1
          // }
          // obj.b = obj
          // cloneDeep(obj)
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
.page-container {
  margin: 20px 0;
}
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

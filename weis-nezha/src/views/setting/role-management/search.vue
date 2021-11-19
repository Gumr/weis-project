<template>
  <div class="page-container">

    <div class="tree-select-wrap display-flex">
      <div class="tree-select-section">
        <h3>请选择页面</h3>
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

        <div style="margin-left:40px;margin-right:40px">
          <el-button
            type="primary"
            @click="insertAuthClick"
          >
            查询<i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
      </div>
      <div class="tree-select-section">
        <h3>人员名单</h3>
        <div class="tree-box">
          <el-button
            type="primary"
            style="margin-bottom: 10px;float:right;margin-right:120px"
            @click="handleExport"
          >导出</el-button>
          <BasePageTable
            :height="height"
            :data="userData.filter(data => !search || data.phone.toLowerCase().includes(search.toLowerCase()))"
            :visible="false"
            border
            size="small"
          >

            <el-table-column
              type="index"
              label="序号"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="uname"
              label="用户姓名"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="trName"
              label="用户角色"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="phone"
              label="用户手机"
              align="center"
            >
              <template #header>
                <div style="display:inline-flex;">
                  <label style="padding-top: 10px;">用户手机</label>
                  <el-input
                    v-model="search"
                    style="width:200px;margin-left:20px"
                    placeholder="输入手机号筛选"
                    clearable
                  />

                </div>

              </template>

            </el-table-column>
          </BasePageTable>

        </div>
      </div>
    </div>
    <!-- <footer class="inline-center" style="margin-top: 24px;">
      <el-button type="primary" @click="confirmClick">确认</el-button>
      <el-button @click="() => $closeRoute()">取消</el-button>
    </footer> -->
  </div>
</template>

<script>
import { cloneDeep } from "@/utils/common";
import { validArray } from "@/utils/common";
import BasePageTable from "@/components/BasePageTable.vue";
import exportExcel from "@/utils/export-excel";
function nodeHandler(node, parent, level = 0) {
  node.level = level;

  if (parent) {
    node.parent = parent;
  }

  if (validArray(node.children)) {
    node.children.forEach((child) => nodeHandler(child, node, level + 1));
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
      const matchItem = matches.find((item) => item.id === path.id);

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
  props: ["status"],
  data() {
    return {
      search:'',
      userData: [],
      role: {
        rname: "",
        menuid: [],
      },
      authTreeProps: {
        label: "name",
        // children: 'children',
        // disabled: 'disabled'
      },
      authTreeData: [],
      selectedTreeData: [],
    };
  },
  created() {
    this.authNodes = [];

    this.getAuthMenus();
  },
  mounted() {
    this.authTree = this.$refs.authTree;
    this.selectTree = this.$refs.selectTree;
  },
  methods: {
    insertAuthClick() {
      const checkedNodes = this.authTree.getCheckedNodes(true, true);
    
      // debugger

      if (checkedNodes.length <= 0) return;
      // mergeCheckNodes(checkedNodes, this.selectedTreeData);

      this.selectedTreeData = checkedNodes
      this.role.menuid = this.getRoleMenuIds();

      return this.$request("sys.Role/queryUserForMenu", {
        mid: this.role.menuid,
      }).then(({ data }) => {
        this.userData = data.obj;
      });
    },

    getAuthMenus() {
      return this.$request("sys.Role/getMenu").then(({ data }) => {
        if (data.errCode === 0) {
          this.authTreeData = data.obj.result.map((node) => nodeHandler(node));
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
    handleExport() {
      const filename = `${this.$route.meta.title}-导出`;
      const columns = [
        { label: "序号", type: "index" },
        { label: "用户姓名", prop: "uname" },
        { label: "用户角色", prop: "trName" },
        { label: "用户手机", prop: "phone" },
      ];
      exportExcel({
        columns: columns,
        filename,
        data: this.userData,
      });
    },
    // confirmClick() {
    //   if (!this.role.rname) {
    //     this.$message({
    //       type: 'error',
    //       message: '请输入角色名称'
    //     });

    //     return;
    //   }

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
    //       this.$closeRoute();
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
    //       this.$closeRoute();
    //     }
    //   });
    // },
    getSelectedTreeData(tree, ids) {
      const nodeFilter = (node) => ids.includes(node.id);

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
  },
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

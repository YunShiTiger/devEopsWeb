<template>
  <div class="manager-group-container">
    <div class="filter-container">
      <el-row style="margin-bottom:20px;">
        <el-switch
        v-model="detailSearch"
        inactive-text="详细检索">
        </el-switch>
        <el-button class="filter-item" @click="resetSearch()" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" :disabled="btnStatus">清除</el-button>
        <el-button class="filter-item" @click="handleCreate()" style="float:right;" type="primary" icon="el-icon-edit" :disabled="btnStatus">新增</el-button>
      </el-row>
      <el-row style="margin-bottom:20px;" v-show="detailSearch">
        <el-col :span="7" :offset="1">
          信息： <el-input size="medium" style="width: 300px;" v-model="search_obj.info" class="filter-item" placeholder="根据应用组名称及信息检索"></el-input>
        </el-col>
        <el-col :span="7" :offset="1">
          管理员信息： <el-input size="medium" style="width: 300px;" v-model="search_obj.ops" class="filter-item" placeholder="根据管理员信息搜索"></el-input>
        </el-col>
        <el-col :span="5" :offset="1">
          应用组状态
          <el-select v-model="search_obj.status" placeholder="请选择应用组状态" disabled="">
            <el-option v-for="option in optionState" :key="option.label" :label="option.label" :value="option.value"></el-option>
          </el-select>
        </el-col>

        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="searchGroup" style="float:right;" :disabled="btnStatus">搜索</el-button>
      </el-row>
    </div>

    <el-table :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%">

      <el-table-column width="260px" align="center" label="UUID">
        <template slot-scope="group">
          <span>{{ group.row.uuid }}</span>
        </template>
      </el-table-column>

      <el-table-column width="260px" align="center" label="应用系统名称">
        <template slot-scope="group">
          <span>{{ group.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column width="150px" align="center" label="状态" class-name="status-col" >
        <template slot-scope="group">
          <el-tag :type="group.row._status | statusFilter">{{ optionState[group.row._status].label }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column width="500px" align="center" label="应用系统信息">
        <template slot-scope="group">
          <span>{{ group.row.info }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="500px" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="group">
          <el-button type="primary" @click="handleImage(group.row)" :disabled="btnStatus">架构图</el-button>
          <el-button type="warning" @click="handleVariable(group.row)" :disabled="btnStatus">参数</el-button>
          <el-button type="warning" @click="handleUpdate(group.row)" :disabled="btnStatus">编辑</el-button>
          <el-button type="warning" @click="handlePermission(group.row)" :disabled="btnStatus">权限组</el-button>
          <el-button type="danger" @click="handleDelete(group.row)" :disabled="btnStatus">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background layout="total, prev, pager, next, jumper" @current-change="handleCurrentChange" :total="pagination.count">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="60%" top="2vh">
      <el-form :rules="rules" ref="dataForm" :model="commit_obj" label-position="left" label-width="100px" style='width: 700px; margin-left:40px;'>
        <el-form-item label="应用组UUID" prop="uuid">
          <el-input v-model="commit_obj.uuid" disabled></el-input>
        </el-form-item>
        <el-form-item label="应用组名称" prop="name">
          <el-tooltip content="请输入您的业务系统名称，如:[预发布]新媒体云服务平台" placement="top" effect="light">
            <el-input v-model="commit_obj.name"></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="应用组信息" prop="info">
          <el-tooltip content="请简要描述您业务系统的作用和所属" placement="top" effect="light">
            <el-input type="textarea" v-model="commit_obj.info"></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="状态" prop="_status">
          <el-select v-model="commit_obj._status" placeholder="请选择应用组状态">
            <el-option v-for="option in optionState" :key="option.label" :label="option.label" :value="option.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="管理用户" prop="users">
            <el-transfer v-model="commit_obj.users" :data="users" placeholder="请选择管理用户" filterable>
            </el-transfer>
        </el-form-item>
        <el-form-item label="添加密钥对" prop="key">
          <el-select v-model="commit_obj.key" placeholder="请选择密钥对">
            <el-option v-for="key in this.keys" :key="key.label" :label="key.label" :value="key.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="添加跳板机" prop="key">
          <el-select v-model="commit_obj.jumper" placeholder="请选择密钥对">
            <el-option v-for="jumper in this.jumpers" :key="jumper.label" :label="jumper.label" :value="jumper.value"></el-option>
          </el-select>
        </el-form-item>
        <!--v-if="dialogStatus=='update'"-->
        <el-form-item label="修改架构图片" prop="framework">
          <el-upload
            action="string"
            :http-request="uploadFramework"
            :limit="1"
            class="upload-demo">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false" :disabled="btnStatus">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData" :disabled="btnStatus">提交</el-button>
        <el-button v-else type="primary" @click="updateData" :disabled="btnStatus">提交</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogPermissionVisible" width="60%" top="2vh">
      <el-form ref="permissionForm" :model="commit_obj" label-position="left" label-width="100px" style='width: 700px; margin-left:40px;'>

        <el-form-item label="所属权限组" prop="pmn_groups">
          <el-transfer v-model="commit_obj.pmn_groups" :data="pmn_groups" placeholder="请选择所属用户组" filterable>
          </el-transfer>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogPermissionVisible = false" :disabled="btnStatus">取消</el-button>
        <el-button type="primary" @click="updatePermission" :disabled="btnStatus">提交</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogVariableVisible" width="60%" top="2vh">
        <el-table :data="var_data" border fit highlight-current-row
                      style="width: 100%">
          <el-table-column width="120px" align="center" label="ID">
            <template slot-scope="vars">
              <span>{{ vars.row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column width="230px" align="center" label="Key">
            <template slot-scope="vars">
              <span>{{ vars.row.key }}</span>
            </template>
          </el-table-column>

          <el-table-column width="250px" align="center" label="Value">
            <template slot-scope="vars">
              <span>{{ vars.row.value }}</span>
            </template>
          </el-table-column>
          <el-table-column width="220px" align="center" label="删除">
            <template slot-scope="vars">
              <el-button type="danger" size="mini" @click="handleVariableDelete(vars.row)" :disabled="btnStatus">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div slot="footer" class="dialog-footer">
          <el-button type="warning" @click="handleVariableCreate" :disabled="btnStatus">新增操作</el-button>
          <el-button @click="dialogVariableVisible = false" :disabled="btnStatus">关闭</el-button>
        </div>
        <el-form ref="variableForm" :model="tempvar" label-position="left" label-width="100px" style='width: 700px; margin-left:40px;'>
          <el-dialog
            width="30%"
            title="新增参数"
            :visible.sync="dialogCreateVariableVisible"
            append-to-body>
              <div :model="tempvar">
                  <el-input placeholder="NGINX_HOME" v-model="tempvar.key">
                    <template slot="prepend">Key</template>
                  </el-input>
                  <el-input placeholder="/usr/local/nginx" v-model="tempvar.value">
                    <template slot="prepend">Value</template>
                  </el-input>
              </div>
            <div slot="footer" class="dialog-footer">
              <el-button type="primary" @click="createVariable" :disabled="btnStatus">提交</el-button>
              <el-button @click="dialogCreateVariableVisible = false" :disabled="btnStatus">关闭</el-button>
            </div>
          </el-dialog>
      </el-form>
    </el-dialog>


    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogImgVisible" width="80%" top="2vh">
      <img :src="commit_obj.framework" style="width:100%;height:100%;">
    </el-dialog>

  </div>
</template>

<script>
  import { fetch_GroupListByPage,update_Group,delete_Group,create_Group,framework_Group } from '@/api/manager'
  import { fetch_OpsUserList,fetch_PmnGroupList,fetch_KeyList,fetch_JumperList } from '@/api/auth'
  import { fetch_VariableList,create_Variable,delete_Variable} from '@/api/variable'
  import { create_Image } from '@/api/utils'
  export default {
    data(){
      return {
        list: null,
        hosts_list: null,
        listLoading: true,
        dialogFormVisible: false,
        dialogImgVisible: false,
        dialogPermissionVisible:false,
        dialogKeyVisible:false,
        dialogVariableVisible:false,
        dialogCreateVariableVisible:false,
        dialogStatus: '',
        btnStatus: false,
        keys: [],
        jumpers: [],
        var_data: [],
        vars_group: null,
        pmn_groups:[],
        users:[],
        pagination: {
          page: 1,
          count: 0
        },
        textMap: {
          update: '编辑应用组',
          create: '新建应用组',
          img: '应用组架构图',
          permission: '权限组修改',
          key: '选择密钥对',
          variable: '修正参数',
          host: '主机列表'
        },
        detailSearch: false,
        tempvar:{},
        commit_obj: {},
        search_obj: {},
        rules: {
          name: [{ required: true, message: '应用组名称是必填的', trigger: 'change' }],
          info: [{ required: true, message: '应用组信息是必填的', trigger: 'change' }],
          _status: [{ required: true, message: '应用组状态是必填的', trigger: 'change' }]
        },
        optionState:[
          {
            value: 0,
            label: '禁用中'
          }, {
            value: 1,
            label: '使用中'
          }, {
            value: 2,
            label: '暂停中'
          }, {
            value: 3,
            label: '不可达'
          }]
      }
    },
    created(){
      this.init()
    },
    filters: {
      uuidFilter(detail) {
        if (detail.aliyun_id){
          return detail.aliyun_id
        }else if(detail.vmware_id){
          const ary = detail.vmware_id.split('-')
          return ary[0] + '-' + ary[1] + '-'+ ary[2]
        }else{
          return 'None'
        }
      },
      statusFilter(_status) {
        const statusMap = {
          0: 'danger',
          1: 'success',
          2: 'warning',
          3: 'info'
        }
        return statusMap[_status]
      }
    },
    methods:{
      uploadFramework(item){
        const formData=new FormData()
        formData.append('image',item.file)
        create_Image(formData).then(response=>{
          this.commit_obj._framework = response.data.id
        }).catch((error)=>{
          this.commit_obj._framework = ''
        })
      },
      reset_commit(){
        this.commit_obj = {}
      },
      reset_search(){
        this.search_obj = {}
      },
      init_jumper(){
        fetch_JumperList().then(response=>{
          this.jumpers = []
          for (const jumper of response.data){
            this.jumpers.push({
              value: jumper.id,
              label: jumper.name
            })
          }
        })
      },
      init_key(){
        fetch_KeyList().then(response=>{
          this.keys = []
          for (const key of response.data){
            this.keys.push({
              value: key.id,
              label: key.name
            })
          }
        })
      },
      init(){
        this.listLoading = true
        fetch_GroupListByPage(this.pagination,this.search_obj).then(response =>{
          this.pagination.count = response.data.count
          this.list=response.data.results
          this.listLoading = false
        })
      },
      handleCurrentChange(val) {
        this.pagination.page = val
        this.init()
      },
      init_ops(){
        fetch_OpsUserList().then(response=>{
          this.users = []
          for (const user of response.data){
            this.users.push({
              key: user.id,
              label: user.full_name,
              disabled: false
            })
          }
        })
      },
      init_pmngroup(){
        fetch_PmnGroupList().then(response => {
          this.pmn_groups = []
          for (const pmn of response.data){
            this.pmn_groups.push({
              key: pmn.id,
              label: pmn.name,
              disabled: false
            })
          }
        })
      },
      deleteConfirm() {
        this.$confirm('此操作将删除应用组, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(()=>{
          delete_Group(this.commit_obj).then((response) => {
            this.$message({
              showClose: true,
              message: '删除成功',
              type: 'success'
            })
            this.init()
          })
        })
      },
      searchGroup(){
        this.init()
      },
      handleImage(row){
        this.commit_obj = Object.assign({},row)
        this.dialogImgVisible = true
        this.dialogStatus = 'img'
      },
      handleDelete(row){
        this.commit_obj = Object.assign({},row)
        this.btnStatus=true
        this.deleteConfirm()
        this.btnStatus=false
      },
      handleVariable(row){
        this.dialogStatus = 'variable'
        this.vars_group = row.id
        this.getVars()
        this.dialogVariableVisible = true
      },
      handleVariableCreate(){
        this.tempvar={group:this.vars_group}
        this.dialogCreateVariableVisible=true
      },
      handleVariableDelete(row){
        this.btnStatus=true
        this.tempvar = Object.assign({},row)
        this.deleteVariableConfirm()
        this.btnStatus=false
      },
      getVars(){
        fetch_VariableList(this.vars_group).then(response =>{
          this.var_data = response.data
        })
      },
      deleteVariableConfirm() {
        this.$confirm('此操作将删除参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(()=>{
          delete_Variable(this.tempvar).then((response) => {
            this.$message({
              showClose: true,
              message: '删除成功',
              type: 'success'
            })
            this.getVars()
            this.dialogCreateVariableVisible = false
          })
        })
      },
      createVariable(){
        this.$refs['variableForm'].validate((valid) => {
          if (valid) {
            this.btnStatus=true
            create_Variable(this.tempvar).then(() => {
              this.dialogFormVisible = false
              this.$message({
                showClose: true,
                message: '创建成功',
                type: 'success'
              })
              this.getVars()
              this.btnStatus=false
              this.dialogCreateVariableVisible = false
            }).catch((error)=>{
              this.btnStatus=false
              this.dialogCreateVariableVisible = false
            })
          }
        })
      },
      handleUpdate(row){
        this.init_key()
        this.init_jumper()
        this.init_pmngroup()
        this.init_ops()
        this.commit_obj = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handlePermission(row){
        this.init_pmngroup()
        this.commit_obj = Object.assign({}, row) // copy obj
        this.dialogStatus = 'permission'
        this.dialogPermissionVisible = true
        this.$nextTick(() =>{
          this.$refs['permissionForm'].clearValidate()
        })
      },
      updatePermission(){
        this.$refs['permissionForm'].validate((valid) => {
          if (valid) {
            this.btnStatus=true
            update_Group(this.commit_obj).then(() => {
              this.dialogPermissionVisible = false
              this.init()
              this.$message({
                showClose: true,
                message: '创建成功',
                type: 'success'
              })
              this.btnStatus=false
            }).catch((error)=>{
              this.dialogPermissionVisible = false
              this.btnStatus=false
            })
          }
        })
      },
      handleCreate(){
        this.init_pmngroup()
        this.init_ops()
        this.init_key()
        this.init_jumper()
        this.reset_commit()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      resetSearch(){
        this.reset_search()
        this.init()
      },
      createData(){
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.btnStatus=true
            create_Group(this.commit_obj).then(() => {
              this.dialogFormVisible = false
              this.$message({
                showClose: true,
                message: '创建成功',
                type: 'success'
              })
              this.init()
              this.btnStatus=false
            }).catch((error)=>{
              this.btnStatus=false
              this.dialogFormVisible = false
            })
          }
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.btnStatus=true
            const tempData = Object.assign({}, this.commit_obj)
            update_Group(tempData).then((response) => {
              this.dialogFormVisible = false
              this.init()
              this.$message({
                showClose: true,
                message: '更新成功',
                type: 'success'
              })
              this.btnStatus=false
            }).catch((error)=>{
              this.btnStatus=false
              this.dialogFormVisible = false
            })
          }
        })
      },
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .manager-group-container {
    padding: 32px;
    /*background-color: rgb(240, 242, 245);*/
  }
</style>

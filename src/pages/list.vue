<script setup lang="tsx">
import { MessagePlugin, TableProps, Button, FormProps, FormInstanceFunctions, Tag, DialogPlugin, Textarea } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';
import { fetch, returnData } from '../utils/fetch';
import dayjs from 'dayjs';

const columns = ref<TableProps['columns']>([
  {
    colKey: 'domain',
    title: '域名',
  },
  {
    colKey: 'state',
    title: '状态',
    width: 90,
    cell: (_h, { row }) => {
      let state = <Tag variant="light-outline">无证书</Tag>
      switch (row.state) {
        case 'domain_verify':
          state = <Tag theme='warning' variant="light-outline">待验证</Tag>
          break;
        case 'process':
          state = <Tag theme='primary' variant="light-outline">审核中</Tag>
          break;
        case 'verify_fail':
          state = <Tag theme='danger' variant="light-outline">审核失败</Tag>
          break;
        case 'payed':
          state = <Tag theme='warning' variant="light-outline">待申请</Tag>
          break;
        case 'unknow':
          state = <Tag variant="light-outline">状态未知</Tag>
          break;
        case 'certificate':
          state = <Tag theme='success' variant="light-outline">已签发</Tag>
          break;
        default:
          break;
      }
      return state
    }
  },
  {
    colKey: 'startTime',
    title: '创建时间',
    width: 190,
    cell: (_h, { row }) => {
      return (
        row.startTime ? <span>{dayjs(row.startTime).format('YYYY-MM-DD HH:mm:ss')}</span> : <span>无</span>
      );
    },
  },
  {
    colKey: 'createTime',
    title: '过期时间',
    width: 190,
    cell: (_h, { row }) => {
      return (
        row.endTime ? <span>{dayjs(row.endTime).format('YYYY-MM-DD HH:mm:ss')}</span> : <span>无</span>
      );
    },
  },
  {
    colKey: 'remainingTime',
    title: '剩余时长',
    width: 100,
    cell: (_h, { row }) => {
      return (
        row.endTime ? <span>{dayjs(row.endTime).diff(dayjs(), 'day')}天</span> : <span>无</span>
      );
    },
  },
  {
    colKey: 'renewTime',
    title: '提前',
    width: 80,
    cell: (_h, { row }) => {
      return <Tag theme="success" variant="light">{row.renewTime}天</Tag>;
    }
  },
  {
    colKey: 'autoRenew',
    title: '续签',
    width: 70,
    cell: (_h, { row }) => {
      return row.autoRenew ? <Tag theme="primary">开启</Tag> :
        <Tag theme="danger">关闭</Tag>;
    }
  },
  {
    colKey: 'orderId',
    title: '订单号',
    width: 120,
    cell: (_h, { row }) => {
      return <span>{row.orderId || '无'}</span>;
    }
  },
  {
    colKey: 'action',
    title: '操作',
    fixed: 'right',
    width: 170,
    cell: (_h, { row }) => {
      return (
        <div>
          <Button
            theme='default' size="small" style={{ marginRight: '8px' }}
            onClick={() => detail(row)}
          >详情</Button>
          <Button theme='primary' size="small" style={{ marginRight: '8px' }}
            onClick={() => apply(row.id)}>
            {row.orderId ? '续签' : '签发'}
          </Button>
          <Button theme='danger' size="small" onClick={() => del(row.id)}>删除</Button>
        </div>
      );
    }
  },
]);

const data = ref<TableProps['data']>([]);
const loading = ref(true)
const header = ref('')
const detailVis = ref(false)
const addLoading = ref(false)

let detailId = 0

//#region 表单相关
const FORM_RULES: FormProps['rules'] = {
  domain: [{ required: true, message: '域名必填' }],
  keyPath: [{ required: true, message: '密钥路径必填' }],
  autoRenew: [{ required: true, message: '密钥路径必填' }],
  renewTime: [{ required: true, message: '续签时间必填' }],
  certPath: [{ required: true, message: '证书路径必填' }],
  command: [{ required: true, message: '重启命令必填' }],
};

const formData = reactive({
  domain: '',
  orderId: '',
  autoRenew: true,
  renewTime: 7,
  keyPath: '',
  certPath: '',
  command: '',
  keyContent: '',
  certContent: '',
});
const form = ref<FormInstanceFunctions | null>(null);
//#endregion

const getData = async () => {
  loading.value = true
  const res = await fetch('/certificate')
  loading.value = false
  if (res?.code === 0) {
    data.value = res.data
    return
  }
  MessagePlugin.error(res?.msg || '获取数据失败')
}

onMounted(getData)

const add = () => {
  header.value = '添加证书'
  detailVis.value = true
  detailId = 0
}

const cancel = () => {
  if (form.value) {
    form.value.reset()
  }
  detailVis.value = false
}

const del = (id: number) => {
  const confirmDia = DialogPlugin.confirm({
    header: '确认删除',
    body: '确定删除证书监听吗?，改操作不会删除证书，只会删除续签任务',
    confirmBtn: '确定',
    cancelBtn: '取消',
    onConfirm: async () => {
      const res = await fetch(`/certificate/${id}`, {
        method: 'DELETE'
      })
      if (res?.code === 0) {
        MessagePlugin.success('删除成功')
        getData()
        confirmDia.destroy()
        return
      }
      MessagePlugin.error(res?.msg || '删除失败')
    },
    onClose: () => {
      confirmDia.destroy();
    },
  })
}

const detail = (row: any) => {
  detailId = row.id
  header.value = '证书详情'
  detailVis.value = true
  formData.domain = row.domain
  formData.keyPath = row.keyPath
  formData.certPath = row.certPath
  formData.command = row.command
  formData.autoRenew = row.autoRenew
  formData.renewTime = row.renewTime
  formData.orderId = row.orderId
  formData.keyContent = row.keyContent
  formData.certContent = row.certContent
}

const addOk = async () => {
  if (form.value) {
    const result = await form.value.validate()
    if (result === true) {
      addLoading.value = true
      let res: returnData<any> | null = null
      if (detailId) {
        res = await fetch(`/certificate/${detailId}`, {
          method: 'PUT',
          data: formData
        })
      }
      else {
        res = await fetch('/certificate', {
          method: 'POST',
          data: formData
        })
      }
      addLoading.value = false
      if (res?.code === 0) {
        MessagePlugin.success(detailId ? '修改成功' : '添加成功')
        detailVis.value = false
        form.value.reset()
        getData()
        return
      } else {
        MessagePlugin.error(res?.msg || '添加失败')
      }
    }
  }
}

const apply = (id: number) => {
  const confirmDia = DialogPlugin.confirm({
    header: '确认申请',
    body: '确认申请新的证书吗？',
    confirmBtn: '确定',
    cancelBtn: '取消',
    onConfirm: async () => {
      const res = await fetch(`/certificate/apply/${id}`, {
        method: 'POST'
      })
      if (res?.code === 0) {
        MessagePlugin.success('申请成功')
        getData()
        confirmDia.destroy()
        return
      }
      MessagePlugin.error(res?.msg || '申请失败')
    },
    onClose: () => {
      confirmDia.destroy();
    },
  })
}
</script>

<template>
  <div class="list">
    <div class="list-header">
      <TButton @click="add" :loading="addLoading || loading">添加</TButton>
      <TButton theme='default' @click="getData" :loading="addLoading || loading">刷新</TButton>
    </div>
    <div class="list-table">
      <TBaseTable :data="data" :columns="columns" row-key="id"
        :headerAffixedTop="{ container: '.list-table', offsetTop: 1 }" :loading="loading" />
    </div>
    <TDialog class="list-dialog" v-model:visible="detailVis" :header="header" width="600px" :close-btn="false"
      @confirm="addOk" @cancel="cancel" :confirm-loading="addLoading" :confirmBtn="detailId ? '修改' : '添加'"
      placement="center">
      <t-form ref="form" :rules="FORM_RULES" :data="formData" :colon="true" reset-type='initial'>
        <TFormItem label="域名" name="domain">
          <TInput v-model="formData.domain" placeholder="请输入域名" :readonly="!!detailId" />
        </TFormItem>
        <TFormItem label="是否续签" name="autoRenew">
          <TSwitch v-model="formData.autoRenew" :label="['是', '否']" />
        </TFormItem>
        <TFormItem label="续签时间" name="renewTime">
          <TInputNumber v-model="formData.renewTime" :min="1" suffix="天" />
        </TFormItem>
        <TFormItem label="密钥路径" name="keyPath">
          <Textarea v-model="formData.keyPath" placeholder="密钥绝对路径，精确到文件名，例如: /etc/nginx/ssl/ssl.key" />
        </TFormItem>
        <TFormItem label="证书路径" name="certPath">
          <Textarea v-model="formData.certPath" placeholder="证书绝对路径，精确到文件名，例如: /etc/nginx/ssl/ssl.pem" />
        </TFormItem>
        <TFormItem label="重启命令" name="command">
          <Textarea v-model="formData.command" placeholder="服务重启命令，用于更新证书后重启服务，例如: nginx -s reload" />
        </TFormItem>
        <TFormItem v-if="!!detailId && formData.orderId" label="订单号" name="orderId">
          <TInput :value="formData.orderId" readonly />
        </TFormItem>
        <TFormItem v-if="!!detailId && formData.keyContent" label="私钥" name="keyContent">
          <Textarea class="dialog-textarea" :value="formData.keyContent" readonly />
        </TFormItem>
        <TFormItem v-if="!!detailId && formData.certContent" label="证书" name="certContent">
          <Textarea class="dialog-textarea" :value="formData.certContent" readonly />
        </TFormItem>
      </t-form>
    </TDialog>
  </div>
</template>

<style scoped lang="less">
.list {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .list-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .t-button {
      margin-right: 20px;
    }
  }

  .list-table {
    flex: 1;
    overflow: auto;
    border: 1px solid var(--td-component-border);
  }

  :deep(.list-dialog) {
    .t-dialog {
      padding: 20px;
    }

    .t-dialog__body {
      overflow: hidden;
    }

    .dialog-textarea .t-textarea__inner {
      min-height: 80px;
    }

  }
}
</style>
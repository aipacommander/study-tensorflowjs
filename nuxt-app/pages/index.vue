<template>
    <h1>Index page</h1>
    <ClientOnly>
        <FormKit
            type="form"
            @submit="submit"
            submit-label="登録する"
            incomplete-message="入力内容に不備があるよ">
            <FormKitSchema :schema="schema"/>
        </FormKit>
    </ClientOnly>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormKitSchemaNode } from '@formkit/core'

const nameFormSchema: FormKitSchemaNode = {
  $cmp: "FormKit",
  props: {
    type: "file",
    label: "画像",
    name: "nameForm",
    accept: ".gif,.png,jpg",
    help: "画像を選択してください。",
    multiple: true,
  }
}
const schema = [nameFormSchema]
const submit = async (e: {nameForm: string}) => {
  // 好きな処理を実装してね （フォームのname属性をキー、入力値がvalueのオブジェクトが手に入る）
  console.log(e)
};
</script>
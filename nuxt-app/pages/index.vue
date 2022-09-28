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
    <pre>{{ predictions }}</pre>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import { FormKitSchemaNode } from '@formkit/core'
import { MobileNet } from '@tensorflow-models/mobilenet';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';

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
const loadMobilenetModel = async () => {
  tf.setBackend("webgl")
  const model:MobileNet = await mobilenet.load();

  return model
};

const schema = [nameFormSchema]
const predictions = ref([])
const model = await loadMobilenetModel()
const submit = async (e: {nameForm: string}) => {
  // 好きな処理を実装してね （フォームのname属性をキー、入力値がvalueのオブジェクトが手に入る）
  console.log(e)
  const reader = new FileReader()
  // ファイルオブジェクトの一番最初のファイルのローカルURLを読み取り、それをreaderインスタンスのresultプロパティにセット
  reader.readAsDataURL(e.nameForm[0].file)

  //読み取り終了後、読み取ったローカルURLをimgタグのsrc属性に代入する。
  const image = new Image() as HTMLImageElement
  reader.onload = async function() {
    image.src = reader.result
    image.width = 100
    image.height = 200
    const classifyPredictions = await model.classify(image)
    predictions.value = classifyPredictions
    console.log(classifyPredictions)
  }
};

</script>
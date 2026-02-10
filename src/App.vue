<template>
  <ElConfigProvider :locale="locale">
    <RouterView v-slot="props">
      <KeepAlive>
        <component :is="props.Component" />
      </KeepAlive>
    </RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
// import en from "element-plus/es/locale/en.mjs";
const locale = zhCn;

</script>

<style scoped></style>

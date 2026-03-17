<!-- src/views/dictAbout.vue -->
<template>
  <div class="dict-about-container">
    <div class="build-time-wrapper">
      <h2>Build Information</h2>
      <p class="build-time">Build Time: {{ buildTime }}</p>
    </div>
    <div class="confirm-btn-wrapper">
      <el-button type="primary" @click="navigateBackToDict">
        Confirm
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ElButton } from 'element-plus';

// Get injected build time
const buildTime = __BUILD_TIME__;

// Initialize router
const router = useRouter();

// Navigate back to dictDict.vue (/dict/dict or /dict)
const navigateBackToDict = () => {
  // Use the path matching your router config (default route)
  router.push('/dict');
  // Or use named route: router.push({ name: 'dictDict' })
}
</script>

<style scoped>
/* Container takes full height of the layout's content area */
.dict-about-container {
  position: absolute;
  left: 0px;
  top: 35px;
  width: 701px;
  height: 478px;
  /* For absolute positioning of the button */
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* Center build time vertically */
  align-items: center;
  /* Center build time horizontally */
}

/* Build time styling (optional) */
.build-time-wrapper {
  text-align: center;
}

.build-time {
  font-size: 18px;
  color: #666;
  margin-top: 16px;
}

/* Confirm button fixed at bottom right */
.confirm-btn-wrapper {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

/* Optional: Style the button (match Element Plus theme) */
:deep(.el-button) {
  padding: 10px 20px;
}
</style>

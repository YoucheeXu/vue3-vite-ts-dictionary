<template>
  <div class="title_panel titlebar" @mousedown="handleMouseDown" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
    <el-dropdown id="menu_dropdown" @command="handleDropdownCommand" ref="dropdownRef" trigger="click">
      <!-- <button class="btn" type="button" id="btn_menu" data-toggle="dropdown" aria-haspopup="true"
                aria-expanded="false"></button> -->
      <imgButton3 id="btn_dropmenu" img="./skin/menu_btn.bmp" :width="31" :height="21" @btn-cliked="handleBtnCliked" />
      <!-- <div class="dropdown-menu dropdown-menu-right" id="sys_menu" aria-labelledby="btn_menu">
                <a class="dropdown-item active" href="#Action2">Another action</a>
            </div> -->
      <template #dropdown>
        <el-dropdown-menu>
          <!-- Custom menu items (adjust as needed) -->
          <el-dropdown-item command="switch2Recite">Recite Words</el-dropdown-item>
          <el-dropdown-item divided></el-dropdown-item>
          <el-dropdown-item command="about">About</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <div class="min_max_close fr">
      <!-- <button type="button" id="btn_min" style="border: none;"></button> -->
      <imgButton3 id="btn_min" img="./skin/minimize_btn.bmp" :width="33" :height="21" @btn-cliked="handleBtnCliked" />
      <!-- <button type="button" id="btn_max" style="border: none;"></button> -->
      <imgButton3 id="btn_max" img="./skin/maxmize_btn.bmp" :width="33" :height="21" @btn-cliked="handleBtnCliked" />
      <!-- <button type="button" id="btn_restore" style="border: none; display: none;"></button> -->
      <imgButton3 id="btn_restore" img="./skin/restore_btn.bmp" :width="33" :height="21"
        @btn-cliked="handleBtnCliked" />
      <!-- <button type="button" id="btn_close" style="border: none;"></button> -->
      <imgButton3 id="btn_close" img="./skin/close_btn.bmp" :width="43" :height="21" @btn-cliked="handleBtnCliked" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import imgButton3 from "@/base-ui/imgButton3.vue";
import { throttle } from '@/utilities/utilities';

const emit = defineEmits<{
  "moveWindow": [payload: { deltaX: number, deltaY: number }],
  "quit": [];
  "minimize": [];
}>();

// Reference to the title bar DOM element
let isDragging = ref(false);
let initialMouseX = ref(0); // Initial mouse position (on mousedown)
let initialMouseY = ref(0);

const router = useRouter()
// Ref for dropdown (to manually control show/hide if needed)
const dropdownRef = ref(null)

const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return; // Only left-click
  isDragging.value = true;

  // Init mouse position (screen coordinates = no mismatch)
  initialMouseX.value = e.screenX;
  initialMouseY.value = e.screenY;

  // Add global listeners (only when dragging)
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('mouseleave', handleMouseUp);

  e.preventDefault();
};

const handleMouseMove = throttle((e: MouseEvent) => {
  if (!isDragging.value) return;

  // Calculate mouse offset from initial position
  const deltaX = e.screenX - initialMouseX.value;
  const deltaY = e.screenY - initialMouseY.value;

  // Emit absolute position (1 call per throttle interval → no delay)
  emit('moveWindow', { deltaX, deltaY });

  initialMouseX.value = e.screenX;
  initialMouseY.value = e.screenY;
}, 16); // 16ms = ~60fps (smooth, no overload)

const handleMouseUp = (e: MouseEvent) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('mouseleave', handleMouseUp);
};

// Clean up listener when component unmounts
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('mouseleave', handleMouseUp);
});

const handleBtnCliked = (id: string) => {
  console.log(id + " was clicked!");
  switch (id) {
    case "btn_close":
      // this.WaitAsyncTasksFnshd(async () => {
      //     await this.Quit();
      // })
      emit("quit");
      break;
    case "btn_min":
      emit("minimize");
      break;
    default:
    // rootState.info(id);
  }
};

// Handle dropdown menu item click event
const handleDropdownCommand = (command: string) => {
  switch (command) {
    case 'switch2Recite':
      // Navigate to /recite route
      router.push('/recite').catch(err => {
        // Catch navigation errors (e.g., duplicate navigation)
        if (err.name !== 'NavigationDuplicated') {
          console.error('Failed to navigate to /recite:', err)
        }
      })
      break;
    case 'about':
      // Navigate to /dict/about route
      router.push('/dict/about').catch(err => {
        // Catch navigation errors (e.g., duplicate navigation)
        if (err.name !== 'NavigationDuplicated') {
          console.error('Failed to navigate to /dict/about:', err)
        }
      })
      break;
  }
}

</script>

<style scoped>
.title_panel {
  background-color: #43a0ff;
  position: absolute;
  left: 0px;
  top: 0px;
  width: 701px;
  /* width: 100%; */
  height: 35px;
  margin: 0;
  padding: 0;
  border: 0;
  box-sizing: border-box;
  overflow: hidden;
}

#menu_dropdown {
  position: absolute;
  left: 560px;
  top: 1px;
}

#btn_min {
  position: absolute;
  left: 591px;
  top: 1px;
}

#btn_max {
  position: absolute;
  left: 624px;
  top: 1px;
}

#btn_restore {
  position: absolute;
  left: 624px;
  top: 1px;
}

#btn_close {
  position: absolute;
  left: 657px;
  top: 1px;
}
</style>

<template>
  <div class="bottom_panel">
    <label id="status" style="height: 20px; margin: 5px 0px 0px 5px">
      {{ statusInfo }}
    </label>
    <input id="chk_TOPMOST" type="checkbox" name="TopMost" value="TopMost" @click="handleTopMostOrNot" />
    <p id="txt_TOPMOST">Always TOP</p>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  // Prop name: statusInfo
  statusInfo: {
    type: String, // Label type (string)
    required: false, // Not mandatory (set default value)
    default: '' // Default label if parent doesn't pass
  }
})

const handleTopMostOrNot = () => {
  console.log("Top Most or Not");
};
</script>

<style scoped>
.bottom_panel {
  position: absolute;
  left: 0px;
  top: 513px;
  height: 35px;
  width: 701px;
  margin: 0;
  padding: 0;
  border: 0;
  box-sizing: border-box;
  overflow: hidden;
  background-color: #43a0ff;
}

#status {
  line-height: 35px;
  /* Line-height = container height → single-line vertical center */
}

#chk_TOPMOST {
  position: absolute;
  left: 585px;
  bottom: 10px;
}

#txt_TOPMOST {
  position: absolute;
  left: 605px;
  bottom: -10px;
}
</style>

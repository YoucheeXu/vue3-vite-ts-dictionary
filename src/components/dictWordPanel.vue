<template>
  <div class="word_panel">
    <!-- <div id="queryword" style="display: none;">such</div> -->
    <div class="text">
      {{ props.word }}
    </div>
    <JPlayer ref="childJPlayerRef" :audio-u-r-l="props.audioURL" />
    <div class="newMmark">NEW</div>
    <div class="level">
      {{ props.level }}
    </div>
    <ul class="stars">
      <li>★</li>
      <li>★</li>
      <li>★</li>
      <li>★</li>
      <li>★</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import JPlayer from "@/base-ui/jPlayer.vue";

const props = defineProps<{
  word: string;
  audioURL: string;
  bNew: boolean;
  level: string;
  nStars: number;
}>();

const childJPlayerRef = ref<InstanceType<typeof JPlayer> | null>(null);

const play = () => {
  const childJPlayer = childJPlayerRef.value;
  childJPlayer?.play();
};

defineExpose({
  play,
});
</script>

<style scoped>
.word_panel {
  position: absolute;
  left: 0px;
  top: 83px;
  width: 701px;
  /* width: 100%; */
  height: 60px;
  margin: 0;
  padding: 0;
  border: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.text {
  color: #0000ff;
  /*text-transform:capitalize;*/
  margin: 10px auto 20px 0px;
  font-size: 25pt;
  font-weight: bold;
}

.phonetic {
  /* margin:0px 0px 20px 10px; */
  margin: 0px 0px 0px 5px;
  /*margin-top:-25px;*/
  vertical-align: middle;
  /*display: inline-block;
    display: inline;*/
}

.text,
.phonetic {
  display: inline-block;
  display: inline;
}

.newMmark {
  color: Gainsboro;
  margin: 0px 0px 0px 5px;
  vertical-align: middle;
  font-size: 15pt;
  font-weight: normal;
  display: inline-block;
  display: inline;
}

.level {
  color: #ff0080;
  position: absolute;
  top: 10px;
  right: 150px;
  font-size: 15pt;
  font-weight: bold;
}

.stars {
  white-space: nowrap;
  text-align: right;
  margin-right: 10px;
  margin-top: 10px;
  margin-bottom: 0px;
  float: right;
}

.stars li {
  display: inline-block;
  color: #adadad;
  font-size: 20px;
}
</style>

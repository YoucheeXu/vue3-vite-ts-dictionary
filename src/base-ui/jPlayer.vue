<template>
   <div id="Player" class="sound">
        <button id="playpause" ref="btnPlayPauseRef" class="jp-play" @click="handleClickAudio" />
        <audio id="wordAudio" ref="audioWordRef" autoplay @play="handlePlay" @ended="handleEnded">
            <source :src="props.audioURL" type="audio/mpeg" />
            Your browser does not support the audio tag.
        </audio>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
    audioURL: string;
}>();

const btnPlayPauseRef = ref<HTMLButtonElement>();
const audioWordRef = ref<HTMLAudioElement>();

const handlePlay = () => {
    const btnPlayPause = btnPlayPauseRef.value;
    btnPlayPause?.classList.add("jp-state-playing");
};

const handleEnded = () => {
    const btnPlayPause = btnPlayPauseRef.value;
    btnPlayPause?.classList.remove("jp-state-playing");
};

const play = () => {
    const audioElemnt = audioWordRef.value;
    // console.debug("Play: ", audioElemnt);
    if (audioElemnt) {
        /* if (audioElemnt.paused || audioElemnt.ended) {
          audioElemnt.play();
          console.log("word: allow to play!");
          // updatePlayBtnSt(false);
        } else {
          audioElemnt.pause();
          console.log("word: not allow to play!");
          // updatePlayBtnSt(true);
        } */
        audioElemnt.pause();
        audioElemnt.currentTime = 0;
        audioElemnt.load();
        audioElemnt.play().catch((error) => {
            console.error("Error to play: ", error);
            console.error("url: ", props.audioURL);
            console.error("src: ", audioElemnt.src);
        });
    }
};

const handleClickAudio = () => {
    play();
};

defineExpose({
    play,
});

</script>

<style scoped>

.sound button {
    /* display:inline-block; */
    /* display: inline; */
    /* float:left; */
    /* overflow:hidden; */
    /* text-indent:-9999px; */
    border: none;
    cursor: pointer;
}

.sound {
    display: inline-block;
    display: inline;
}

.jp-play {
    width: 40px;
    height: 40px;
    /* background: url(./assets/images/jplayer.blue.monday.png) no-repeat; */
    background: url(/images/jplayer.blue.monday.png) no-repeat;
}

.jp-play:focus {
    background: url(/images/jplayer.blue.monday.png) -41px 0 no-repeat;
}

.jp-state-playing.jp-play {
    background: url(/images/jplayer.blue.monday.png) 0 -42px no-repeat;
}

.jp-state-playing.jp-play:focus {
    background: url(/images/jplayer.blue.monday.png) -41px -42px no-repeat;
}

</style>
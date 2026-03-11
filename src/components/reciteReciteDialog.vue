<template>
    <el-dialog :model-value="visible" :title="titleRef" width="500px" :close-on-click-modal="false"
        :close-on-press-escape="false" :modal="false" modal-penetrable>
        <div class="study-container">
            <!-- Header with word display input -->
            <div class="header">
                <el-input v-model="inputWordRef" class="word-input" :disabled="disaWordInputRef" />
            </div>

            <div class="audio">
                <div class="phonetic">
                    {{ phoneticRef }}
                </div>
                <div class="sound">
                    <jPlayer ref="childJPlayerRef" :audio-u-r-l="audioURLRef" />
                </div>
            </div>

            <!-- Word details card (iframe for HTML content) -->
            <div class="word-card">
                <!-- <iframe ref="wordIframe" class="word-html-container" :srcdoc="currentWordHtml" frameborder="0" -->
                <iframe ref="wordIframe" class="word-html-container" :src="dictURLRef" frameborder="0"
                    scrolling="no"></iframe>
            </div>

            <!-- Action area -->
            <div class="action">
                <!-- Buttons -->
                <div class="button-group">
                    <el-button @click="handleReadAgain" type="primary" plain>Again(F5)</el-button>
                    <el-button :disabled="disaForgetBtnRef" @click="handleForget" type="warning"
                        plain>Forgotten(F6)</el-button>
                    <el-button @click="handleMaster" type="success" plain>Chop(F7)</el-button>
                </div>
                <div class="cur-count">
                    {{ curCountRef }}
                </div>
                <!-- Operation tip -->
                <div class="operation-tip"
                    :class="[{ 'forgotten': tipTypeRef === 'forgotten' }, { 'chopped': tipTypeRef === 'chopped' }]">
                    {{ tipTextRef }}
                </div>
            </div>

            <!-- Footer stats section -->
            <div class="footer">
                <div class="stats-row">
                    <span>{{ num2LearnRef }} words to Learn</span>
                    <span>
                        {{ idxOfCurRef }} of {{ numOfTotalRef }}
                    </span>
                    <span>{{ num2TestRef }} words to Test</span>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ActEnum } from '@/stores/recite/types';
import { useReciteStore } from "@/stores/recite/reciteStore";
import jPlayer from "@/base-ui/jPlayer.vue";

const props = defineProps({
    // Control dialog visibility (two-way binding)
    visible: {
        type: Boolean,
        required: true,
        default: false
    }
})

const reciteStore = useReciteStore();
const titleRef = ref("");

// Define custom events for parent component communication
const emit = defineEmits<{
    'finish': []
}>()

// input area state
const inputWordRef = ref("");
const disaWordInputRef = ref(true);

//
const phoneticRef = ref("");
const childJPlayerRef = ref<InstanceType<typeof jPlayer> | null>(null);
const audioURLRef = ref("");

const dictURLRef = ref("");

const disaForgetBtnRef = ref(false);

const curCountRef = ref("");

// Operation tip state
const tipTextRef = ref('')
const tipTypeRef = ref<'forgotten' | 'chopped' | ''>('')

const num2LearnRef = ref(0)
const idxOfCurRef = ref(0)
const numOfTotalRef = ref(0)
const num2TestRef = ref(0);

function changeTitle(title: string) {
    titleRef.value = title;
}

function goStudyMode() {
    changeTitle("Study Mode");
    disaWordInputRef.value = true;
    disaForgetBtnRef.value = true;
    curCountRef.value = ""
    tipTypeRef.value = "";

    reciteStore.goStudyMode().then((num2Learn: number) => {
        if (num2Learn > 0) {
            num2LearnRef.value = num2Learn;
            num2TestRef.value = reciteStore.reciteState.num2Test;
            studyNext();
        }
        else {
            goTestMode();
        }
    })
}

function studyNext() {
    reciteStore.studyNext().then(([score, word, phonetic, audioURL, dictURL, curLearnIndex, num2Learn]:
        [string, string, string, string, string, number, number]) => {

        inputWordRef.value = word;
        phoneticRef.value = phonetic;
        audioURLRef.value = audioURL;

        dictURLRef.value = dictURL;

        tipTextRef.value = score;

        idxOfCurRef.value = curLearnIndex + 1;
        numOfTotalRef.value = num2Learn;

        play();
    });
}

function testNext() {
    reciteStore.testNext().then(([audio1URL, dict2URL, curTestPos, curTestNum]: [string, string, number, number]) => {
        inputWordRef.value = ""

        audioURLRef.value = audio1URL;
        play()

        if (dict2URL) {
            phoneticRef.value = "";
            dictURLRef.value = dict2URL;
        }

        idxOfCurRef.value = curTestPos;
        numOfTotalRef.value = curTestNum;
    });
}

function goTestMode() {
    changeTitle("Test Mode");
    disaWordInputRef.value = false;
    disaForgetBtnRef.value = false
    reciteStore.goTestMode().then(([ret, curCount, testTimes, num2Test]: [number, number, number, number]) => {
        dealWithRet(ret, curCount, testTimes, num2Test);
    })
}

function dealWithRet(action: ActEnum, curCount: number = 0, testTimes: number = 0, num2Test: number = 0) {
    switch (action) {
        case ActEnum.STUDY_MODE:
            goStudyMode()
        case ActEnum.STUDY_NEXT:
            studyNext()
        case ActEnum.TEST_MODE:
            goTestMode()
        case ActEnum.TEST_NEXT:
            curCountRef.value = `Count: ${curCount} of ${testTimes}`;
            numOfTotalRef.value = testTimes;
            // clearContent()
            num2TestRef.value = num2Test;
            reciteStore.reciteState.num2Test = num2Test;
            inputWordRef.value = ""
            testNext()
        case ActEnum.FINISH:
            emit('finish');
    }
}

function checkInput() {
    const word = inputWordRef.value;
    reciteStore.checkInput(word).then(([score, action, audioURL, dictURL, num2Learn, curCount, testTimes, num2Test]:
        [string, ActEnum, string, string, number, number, number, number]) => {
        tipTextRef.value = score;
        tipTypeRef.value = ""
        // in study mode, score = ""
        switch (score) {
            case "OK!": // Test OK
                break;
            case "Go on!":  // Test fail, move on to next word
                audioURLRef.value = audioURL;
                play();
                dictURLRef.value = dictURL;
                inputWordRef.value = word;
                num2LearnRef.value = num2Learn;
                reciteStore.reciteState.num2Learn = num2Learn;
            case "Wrong!":  // Test fail, try again
                num2LearnRef.value = num2Learn;
                reciteStore.reciteState.num2Learn = num2Learn;
        }
        tipTextRef.value = score;
        dealWithRet(action, curCount, testTimes, num2Test);
    })
}

const play = () => {
    const childJPlayer = childJPlayerRef.value;
    childJPlayer?.play();
};

// Button handler functions
const handleReadAgain = () => {
    // console.log(`Re-reading word: ${currentWord.value.word}`)
    // ElMessage.info(`Re-reading: ${currentWord.value.word}`)
    tipTextRef.value = ''
    tipTypeRef.value = ''

    play();
}

const handleForget = () => {
    tipTextRef.value = `${curCountRef.value} was forgotten`
    tipTypeRef.value = 'forgotten'

    reciteStore.forget().then(([action, curCount, testTimes, num2Test]: [ActEnum, number, number, number]) => {
        dealWithRet(action, curCount, testTimes, num2Test);
    })
}

const handleMaster = () => {
    tipTextRef.value = `${curCountRef.value} was chopped`
    tipTypeRef.value = 'chopped'
    reciteStore.chop().then(([action, curCount, testTimes, num2Test]: [ActEnum, number, number, number]) => {
        dealWithRet(action, curCount, testTimes, num2Test);
    })
}

// Keyboard shortcut listener
const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F5') e.preventDefault()

    switch (e.key) {
        case 'F5':
            handleReadAgain()
            break
        case 'F6':
            handleForget()
            break
        case 'F7':
            handleMaster()
            break
        case 'Enter':
            checkInput();
            // tipTextRef.value = ''
            // tipTypeRef.value = ''
            // nextWord()
            // ElMessage.info(`Next word: ${currentWord.value.word}`)
            break
        default:
            break
    }
}

// Lifecycle hooks
onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

defineExpose({
    goStudyMode,
    goTestMode
})

</script>

<style scoped>
/* Main container styling */
.study-container {
    width: 480px;
    height: 360px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 0 auto;
}

/* Header (word display input) */
.header {
    background: #f3f4f6;
    padding: 8px 12px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    height: 40px;
}

/* Word card (contains iframe for dynamic content) */
.word-card {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
}

/* Disabled input for word display (centered) */
.word-input {
    width: 200px;
    margin: 0 auto;
    text-align: center;
    font-size: 18px;
    font-weight: 500;
}

.phonetic {
    /* margin:0px 0px 20px 10px; */
    margin: 0px 0px 0px 5px;
    /*margin-top:-25px;*/
    vertical-align: middle;
    /*display: inline-block;
    display: inline;*/
}

.phonetic,
.sound {
    display: inline-block;
    display: inline;
}

/* IFrame container (integrates word definition + examples) */
.word-html-container {
    width: 100%;
    min-height: 150px;
    border: none;
    flex: 1;
}

/* CORE FIX: Action area with fixed height + relative positioning */
.action {
    /* Fixed height to prevent button movement (matches button group height) */
    height: 60px;
    /* Relative container for absolute tip positioning */
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    border-top: 1px solid #e5e7eb;
}

/* Button group (stationary, fixed position) */
.button-group {
    display: flex;
    justify-content: space-around;
    padding: 8px 12px;
    width: 100%;
    /* Buttons never move - fixed space */
    margin: 0;
}

/* CORE FIX: Operation tip (absolute overlay, no layout shift) */
.operation-tip {
    /* Absolute position: overlays buttons, no space occupation */
    position: absolute;
    top: 45px;
    left: 0;
    right: 0;
    text-align: center;
    font-weight: 500;
    font-size: 14px;
    line-height: 1.2;
}

/* Tip color variants */
.operation-tip.forgotten {
    color: #e64340;
}

.operation-tip.chopped {
    color: #52c41a;
}

/* Footer (stats section with gray background) */
.footer {
    background: #f3f4f6;
    padding: 4px 12px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    height: 15px;
    justify-content: center;
}

/* Stats row (three-column layout) */
.stats-row {
    display: flex;
    justify-content: space-between;
    text-align: center;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.0;
    width: 100%;
}
</style>

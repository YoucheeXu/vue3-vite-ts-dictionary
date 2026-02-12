<template>
    <div class="start-container">
        <div class="stats-card">
            <h2>今日学习统计</h2>
            <ul class="stats-list">
                <li>All words: <span class="highlight">{{ stats.allWords }}</span></li>
                <li>Need to learn Word: <span class="highlight">{{ stats.needLearn }}</span></li>
                <li>New words to learn: <span class="highlight">{{ stats.newWords }}</span></li>
                <li>Words has recited: <span class="highlight">{{ stats.recited }}</span></li>
            </ul>
        </div>

        <el-button :disabled="isFinishedRef" type="primary" size="large" @click="start2Recite" class="start-btn">
            {{ strtBtnTextRef }}
        </el-button>

        <el-dialog v-model="dialogVisibleRef" :title="titleRef" width="500px" :close-on-click-modal="false"
            :close-on-press-escape="false" :modal="false" modal-penetrable>
            <StudyTestMode ref="studyTestModeRef" @change-title="handleChangeTitle" @update-stats="handleStatsUpdate"
                @finish="handleReciteFinish" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRootStore } from "@/stores/root";
import { useReciteStore } from "@/stores/recite/reciteStore";
import StudyTestMode from '@/components/studyTestMode.vue'

const titleRef = ref("Study Mode");
const dialogVisibleRef = ref(false)
const isFinishedRef = ref(false)
const strtBtnTextRef = ref('Start to Recite(␣)')

const rootState = useRootStore();
const reciteStore = useReciteStore();

const stats = reactive({
    allWords: 0,
    needLearn: 0,
    newWords: 0,
    recited: 0
})

const studyTestModeRef = ref<InstanceType<typeof StudyTestMode> | null>(null);

const start2Recite = () => {
    // reciteStore.reciteState

    dialogVisibleRef.value = true

    if (reciteStore.reciteState.num2Learn > 0) {
        studyTestModeRef.value?.goStudyMode();
    } else {
        studyTestModeRef.value?.goTestMode();
    }
}

const handleChangeTitle = (payload: { title: string }) => {
    titleRef.value = payload.title;
}

const handleStatsUpdate = (payload: { recited: number; needLearn: number }) => {
    stats.recited = 1088 + payload.recited
    stats.needLearn = payload.needLearn
    stats.allWords = stats.recited + stats.needLearn
}

const handleReciteFinish = () => {
    dialogVisibleRef.value = false
    isFinishedRef.value = true
    strtBtnTextRef.value = "You have finished the today's target. Press Esc to quit!"
}

const handleKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        if (!isFinishedRef.value) {
            start2Recite()
        }
    } else if (e.key == 'Esc') {
        ElMessage.info('正在退出学习模式...');
        // setTimeout(() => window.location.reload(), 1000)
        await reciteStore.saveProgress();
        await rootState.quit();
    }
}

onMounted(async () => {
    window.addEventListener('keydown', handleKeyDown);

    rootState.rootState.isPyWebviewReady = await rootState.waitForPyWebview();
    if (!rootState.rootState.isPyWebviewReady) {
        ElMessage.warning('pywebview API unavailable');
    }

    await rootState.fullscreen();
    // reciteStore.start2Recite()
    //     .then(([allCount, newCount, fnshdCount, inProgressCount]: [number, number, number, number]) => {
    //         stats.allWords = allCount;
    //         stats.newWords = newCount;
    //         stats.needLearn = inProgressCount;
    //         stats.recited = fnshdCount;
    //     });
    const [allCount, newCount, fnshdCount, inProgressCount]: [number, number, number, number] = await reciteStore.start2Recite();
    stats.allWords = allCount;
    stats.newWords = newCount;
    stats.needLearn = inProgressCount;
    stats.recited = fnshdCount;
})

onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<style scoped>
.start-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    padding: 20px;
}

.stats-card {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 32px;
    min-width: 320px;
}

.stats-card h2 {
    margin: 0 0 16px 0;
    text-align: center;
    color: #303133;
}

.stats-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.stats-list li {
    padding: 8px 0;
    color: #606266;
    display: flex;
    justify-content: space-between;
}

.highlight {
    color: #409eff;
    font-weight: 500;
}

.start-btn {
    width: 240px;
    font-size: 16px;
}
</style>

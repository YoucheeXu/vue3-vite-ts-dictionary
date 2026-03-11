<template>
    <div class="start-container">
        <div class="stats-card">
            <h2>今日学习统计</h2>
            <ul class="stats-list">
                <li class="user-level-item" @click="handleItemClick">
                    <span class=" user-name">{{ currentUserRef }}</span>
                    <span class="level-name">{{ currentLevelRef }}</span>
                </li>
                <li>All words: <span class="highlight">{{ stats.allWords }}</span></li>
                <li>Need to learn Word: <span class="highlight">{{ stats.needLearn }}</span></li>
                <li>New words to learn: <span class="highlight">{{ stats.newWords }}</span></li>
                <li>Words has recited: <span class="highlight">{{ stats.recited }}</span></li>
            </ul>
        </div>

        <el-button :disabled="isFinishedRef" type="primary" size="large" @click="start2Recite" class="start-btn">
            {{ strtBtnTextRef }}
        </el-button>

        <UserLevelDialog v-model:visible="usrLvlDlgVisibleRef" :user-list="userListRef" :level-list="levelListRef"
            :user-level-map="userLevelMapRef" @confirm="handleUsrLvlDlgConfirm" @cancel="handleUsrLvlDlgCancel" />

        <reciteReciteDialog ref="reciteDialogRef" v-model:visible="reciteDlgVisibleRef"
            @update-stats="handleStatsUpdate" @finish="handleReciteFinish" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useConfigStore } from "@/stores/configStore";
import { useRootStore } from "@/stores/rootStore";
import { useReciteStore } from "@/stores/recite/reciteStore";
import type { IUser, ILevel, IConfirmResult, TUserLevelMap } from "@/stores/recite/types";
import UserLevelDialog from '@/components/userLevelDialog.vue';
import reciteReciteDialog from '@/components/reciteReciteDialog.vue';

const currentUserRef = ref('');
const currentLevelRef = ref('');

const usrLvlDlgVisibleRef = ref(false)
const userListRef = ref<IUser[]>([]);
const levelListRef = ref<ILevel[]>([]);
const userLevelMapRef = ref<TUserLevelMap>({});

const reciteDlgVisibleRef = ref(false)
const isFinishedRef = ref(false)
const strtBtnTextRef = ref('Start to Recite(␣)')

const configStore = useConfigStore();
const rootState = useRootStore();
const reciteStore = useReciteStore();

const stats = reactive({
    allWords: 0,
    needLearn: 0,
    newWords: 0,
    recited: 0
})

const reciteDialogRef = ref<InstanceType<typeof reciteReciteDialog> | null>(null);

const handleItemClick = async () => {

    userListRef.value = await reciteStore.listUsers();

    levelListRef.value = await reciteStore.listLevels();

    userLevelMapRef.value = await reciteStore.getUserLevelMap();

    usrLvlDlgVisibleRef.value = true;
}

const handleUsrLvlDlgConfirm = (caseType: number, ...rest: any[]) => {
    const [, , newMap, newUser] = rest
    userLevelMapRef.value = newMap
    if (newUser) userListRef.value.push(newUser)
    console.log('Confirmed Case:', caseType)
}

// Handle dialog cancel
const handleUsrLvlDlgCancel = () => {
    console.log('Dialog canceled')
}

const start2Recite = async () => {
    reciteDlgVisibleRef.value = true

    nextTick(async () => {
        if (reciteDialogRef.value) {
            if (reciteStore.reciteState.num2Learn > 0) {
                reciteDialogRef.value.goStudyMode();
            } else {
                reciteDialogRef.value.goTestMode();
            }
        } else {
            console.error("component StudyTestMode is not ready!")
        }
    })
}

const handleStatsUpdate = (payload: { recited: number; needLearn: number }) => {
    stats.recited = 1088 + payload.recited
    stats.needLearn = payload.needLearn
    stats.allWords = stats.recited + stats.needLearn
}

const handleReciteFinish = () => {
    reciteDlgVisibleRef.value = false
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

    currentUserRef.value = configStore.config.ReciteWords.LastUser;
    currentLevelRef.value = configStore.config.ReciteWords.LastTarget;

    await reciteStore.selectUserLevel(currentUserRef.value, currentLevelRef.value);
    const [allCount, newCount, fnshdCount, inProgressCount]: [number, number, number, number] = await reciteStore.start2Recite();
    stats.allWords = allCount;
    stats.newWords = newCount;
    stats.needLearn = inProgressCount;
    stats.recited = fnshdCount;
})

onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<style scoped>
.user-level-map-display {
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 4px;
    max-width: 500px;
}

pre {
    margin: 0;
    font-size: 12px;
    white-space: pre-wrap;
}

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

/* Key: Use flex to align left/right, ensure the li has enough width */
.user-level-item {
    display: flex;
    /* Enable flex layout */
    justify-content: space-between;
    /* Left for first child, right for last child */
    align-items: center;
    /* Vertically center the text (optional) */
    width: 100%;
    /* Ensure the li takes full width (critical for alignment) */
    padding: 8px 12px;
    /* Optional: Add padding for better spacing */
    list-style: none;
    /* Optional: Remove default li bullet point */
    border-bottom: 1px solid #eee;
    /* Optional: Add separator line */
}

/* Optional: Customize text style */
.user-name {
    text-align: left;
    padding-left: 60px;
    /* Explicit left align (redundant for flex, but safe) */
    font-weight: bold;
    font-size: 20px;
}

.level-name {
    text-align: right;
    padding-right: 60px;
    /* Explicit right align (redundant for flex, but safe) */
    font-weight: bold;
    font-size: 20px;
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

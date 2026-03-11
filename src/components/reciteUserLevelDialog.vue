<template>
    <el-dialog :model-value="visible" @update:model-value="handleModelValueChange" title="Assign User & Level"
        width="500px" @close="handleDialogClose" destroy-on-close>
        <el-form :model="formData" :rules="formRules" ref="formRef" label-width="80px">
            <!-- User Module: Select / New -->
            <el-form-item label="User" prop="user">
                <el-select v-model="formData.selectedUserKey" placeholder="Select a user"
                    style="width: 60%; margin-right: 8px;" @change="handleUserSelectChange">
                    <!-- Existing Users -->
                    <el-option v-for="user in userList" :key="user.name" :label="`${user.name} (${user.desc})`"
                        :value="user.name" />
                    <!-- Separator -->
                    <el-option disabled value="__SEPARATOR__" label="——————" />
                    <!-- New User Option -->
                    <el-option key="__NEW_USER__" label="New User" value="__NEW_USER__" style="color: #409eff;" />
                </el-select>

                <!-- New User Input (with unique name check) -->
                <div v-if="isSelectNewUser" class="new-user-fields">
                    <el-input v-model="formData.newUserName" placeholder="Enter new user name (must be unique)"
                        style="width: 60%; margin-bottom: 8px;" />

                    <!-- New User Description Input (optional) -->
                    <el-input v-model="formData.newUserDesc" placeholder="Enter user description (e.g., Student)"
                        style="width: 60%;" />
                </div>
            </el-form-item>

            <!-- Level Module: Select / New -->
            <el-form-item label="Level" prop="level">
                <!-- Level Select (show only for existing users; include "New Level" at bottom) -->
                <el-select v-model="formData.selectedLevelKey" placeholder="Select a level (user-specific)"
                    style="width: 60%; margin-bottom: 8px;" @change="handleLevelSelectChange" v-if="!isSelectNewUser"
                    :disabled="!currentUserLevelList.length">
                    <!-- Existing Levels (from backend) -->
                    <el-option v-for="level in currentUserLevelList" :key="level" :label="level" :value="level" />
                    <!-- Separator -->
                    <el-option disabled value="__SEPARATOR__" label="——————" v-if="currentUserLevelList.length" />
                    <!-- New Level Option (fixed at bottom) -->
                    <el-option key="__NEW_LEVEL__" label="New Level" value="__NEW_LEVEL__" style="color: #409eff;"
                        v-if="currentUserLevelList.length" />
                </el-select>

                <!-- No Levels Hint (If User Has No Available Levels) -->
                <div v-if="!isSelectNewUser && !currentUserLevelList.length" class="no-levels-hint">
                    <span style="color: #999; font-size: 12px;">
                        No available levels for this user
                    </span>
                </div>

                <!-- New Level Input Field (show when: 1. Select New User OR 2. Select New Level for existing user) -->
                <div v-if="isSelectNewUser || isSelectNewLevel" class="new-level-fields">
                    <el-input v-model="formData.newLevel" placeholder="e.g. CET4+CET6, IELTS-CET6, TOEFL"
                        style="width: 60%;" />
                    <!-- Validation Hint -->
                    <div class="validation-hint">
                        <span style="font-size:12px; color:#999">
                            Rules: Use levels from list ({{ validLevelValues.join(', ') }}) and only + / -
                        </span>
                    </div>
                </div>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="handleCancel">Cancel</el-button>
            <el-button type="primary" @click="handleConfirm" :disabled="!isFormValid">Confirm</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, type Ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { IUser, ILevel, IConfirmResult, TUserLevelMap } from "@/stores/recite/types";

// ------------------------------
// Props & Emits
// ------------------------------
const props = defineProps({
    // Control dialog visibility (two-way binding)
    visible: {
        type: Boolean,
        required: true,
        default: false
    },
    // Existing user list (passed from parent)
    userList: {
        type: Array as () => IUser[],
        required: true,
        default: () => []
    },
    // Existing level list (passed from parent)
    levelList: {
        type: Array as () => ILevel[],
        required: true,
        default: () => []
    },
    userLevelMap: {
        type: Object as () => TUserLevelMap, // Use imported UserLevelMap type
        required: true,
        default: () => ({})
    }
})

// Emits: confirm (return selected/new user & level), cancel
const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'confirm', caseType: 1 | 2 | 3, userRes: IConfirmResult, levelRes: IConfirmResult, newMap: TUserLevelMap, newUser?: IUser): void;
    (e: 'cancel'): void;
}>()

// ------------------------------
// Type Definitions (TypeScript)
// ------------------------------
// Form data type
interface FormData {
    // User
    selectedUserKey: string;     // 'Alice' (existing) or '__NEW_USER__' (new)
    newUserName: string;             // New user name (when select __NEW_USER__)
    newUserDesc: string;        // New user description
    // Level
    selectedLevelKey: string; // 'CET4' (existing) or '__NEW_LEVEL__' (new)
    newLevel: string;        // New level (when select __NEW_LEVEL__ or __NEW_USER__)
}

// ------------------------------
// Reactive State
// ------------------------------
// Form instance (for validation)
const formRef: Ref<FormInstance | undefined> = ref()
const currentUserLevelList = ref<string[]>([]);

// Form data (reactive)
const formData = reactive<FormData>({
    selectedUserKey: '',
    newUserName: '',
    newUserDesc: '',
    selectedLevelKey: '',
    newLevel: ''
})

// Derived States (for UI display/logic)
const isSelectNewUser = computed(() => formData.selectedUserKey === '__NEW_USER__')
const isSelectNewLevel = computed(() => formData.selectedLevelKey === '__NEW_LEVEL__')

/**
 * Check if form is valid (for disable confirm button)
 */
const isFormValid = computed(() => {
    // New User: Need new username + new level
    if (isSelectNewUser.value) {
        return !!formData.newUserName.trim() && !!formData.newLevel.trim()
    }
    // Existing User: Need selected user + (selected level or new level)
    if (!formData.selectedUserKey) return false
    if (isSelectNewLevel.value) return !!formData.newLevel.trim()
    return !!formData.selectedLevelKey
})

// ====================== Level Validation (Backend levels + +/- only) ======================
const validLevelValues = computed(() => props.levelList.map(level => level.value))
const validOperators = ['+', '-']
const existingUserNames = computed(() => props.userList.map(user => user.name))

/**
 * Validate custom new level (backend levels + only +/-)
 */
const validateCustomLevel = (customLevel: string): { isValid: boolean; message: string } => {
    const trimmed = customLevel.trim()

    // Case 1: Single valid level
    if (validLevelValues.value.includes(trimmed)) return { isValid: true, message: '' }

    // Case 2: Composite level (split by +/-)
    const parts = trimmed.split(/([\+\-])/).filter(p => p.trim() !== '')
    if (!parts.length) return { isValid: false, message: 'Level cannot be empty' }
    if (validOperators.includes(parts[0]) || validOperators.includes(parts.at(-1)!))
        return { isValid: false, message: 'Cannot start/end with + or -' }

    // Check alternate level/operator
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (i % 2 === 1 && !validOperators.includes(part))
            return { isValid: false, message: `Only + / - are allowed (invalid: ${part})` }
        if (i % 2 === 0 && !validLevelValues.value.includes(part))
            return { isValid: false, message: `Invalid level: ${part} (only use: ${validLevelValues.value.join(', ')})` }
    }

    return { isValid: true, message: '' }
}

/**
 * Check if new username is duplicate
 */
const isDuplicateUserName = (name: string): boolean => {
    return existingUserNames.value.includes(name.trim())
}

// ====================== Dropdown Change Handlers ======================
/**
 * Handle user dropdown selection change
 */
const handleUserSelectChange = (selectedKey: string) => {
    // Reset level state when user changes
    formData.selectedLevelKey = ''
    formData.newLevel = ''

    // If select New User: auto reset level (will force new level input)
    if (selectedKey === '__NEW_USER__') {
        formData.newUserName = ''
        formData.newUserDesc = ''
    }
    // If select existing user: auto fill their first level (for convenience)
    else {
        currentUserLevelList.value = props.userLevelMap[selectedKey] || []
        formData.selectedLevelKey = currentUserLevelList.value[0] || ''
    }
}

/**
 * Handle level dropdown selection change (only for existing users)
 */
const handleLevelSelectChange = (selectedKey: string) => {
    // Reset new level input when level selection changes
    if (selectedKey !== '__NEW_LEVEL__') {
        formData.newLevel = ''
    }
}

/**
 * Reset entire form
 */
const resetForm = () => {
    formData.selectedUserKey = ''
    formData.newUserName = ''
    formData.newUserDesc = ''
    formData.selectedLevelKey = ''
    formData.newLevel = ''
    formRef.value?.clearValidate()
}

// ====================== Form Validation Rules ======================
const formRules = reactive<FormRules>({
    user: [{
        validator: (_, __, callback) => {
            // Case A: Select existing user
            if (!isSelectNewUser.value) {
                if (!formData.selectedUserKey) {
                    callback(new Error('Please select a user'))
                } else {
                    callback()
                }
            }
            // Case B: Select New User (validate new username)
            else {
                const trimmedName = formData.newUserName.trim()
                if (!trimmedName) {
                    callback(new Error('New user name cannot be empty'))
                } else if (isDuplicateUserName(trimmedName)) {
                    callback(new Error(`Username "${trimmedName}" already exists`))
                } else {
                    callback()
                }
            }
        },
        trigger: ['change', 'blur']
    }],
    level: [{
        validator: (_, __, callback) => {
            // Case A: New User (must validate new level)
            if (isSelectNewUser.value) {
                const { isValid, message } = validateCustomLevel(formData.newLevel)
                isValid ? callback() : callback(new Error(message))
            }
            // Case B: Existing User + Select Existing Level
            else if (!isSelectNewLevel.value) {
                if (!formData.selectedLevelKey) {
                    callback(new Error('Please select a level'))
                } else {
                    callback()
                }
            }
            // Case C: Existing User + Select New Level (validate new level)
            else {
                const { isValid, message } = validateCustomLevel(formData.newLevel)
                isValid ? callback() : callback(new Error(message))
            }
        },
        trigger: ['change', 'blur']
    }]
})

// ====================== Dialog Events ======================
const handleModelValueChange = (value: boolean) => {
    emit('update:visible', value)
    if (!value) resetForm()
}

// Handle cancel (close dialog)
const handleCancel = () => {
    emit('update:visible', false)
    emit('cancel')
    resetForm()
}

/**
 * Confirm handler (only 3 allowed cases)
 */
const handleConfirm = async () => {
    try {
        // Step 1: Validate form
        await formRef.value?.validate()

        // Step 2: Determine case type
        let caseType: 1 | 2 | 3
        // Case 1: Existing User + Existing Level
        if (!isSelectNewUser.value && !isSelectNewLevel.value) caseType = 1
        // Case 2: Existing User + New Level
        else if (!isSelectNewUser.value && isSelectNewLevel.value) caseType = 2
        // Case 3: New User + New Level
        else if (isSelectNewUser.value) caseType = 3
        // Forbidden case (should never reach here due to validation/UI)
        else throw new Error('Forbidden combination')

        // Step 3: Assemble user data
        let userResult: IConfirmResult
        let newUser: IUser | undefined = undefined
        const targetUserName = isSelectNewUser.value
            ? formData.newUserName.trim()
            : formData.selectedUserKey

        if (isSelectNewUser.value) {
            userResult = {
                type: 'user',
                isNew: true,
                value: targetUserName
            }
            // Create new user object
            newUser = {
                name: targetUserName,
                desc: formData.newUserDesc.trim() || 'No description'
            }
        } else {
            userResult = {
                type: 'user',
                isNew: false,
                value: targetUserName
            }
        }

        // Step 4: Assemble level data
        let levelResult: IConfirmResult
        const targetLevel = isSelectNewUser.value || isSelectNewLevel.value
            ? formData.newLevel.trim()
            : formData.selectedLevelKey

        levelResult = {
            type: 'level',
            isNew: isSelectNewUser.value || isSelectNewLevel.value,
            value: targetLevel
        }

        // Step 5: Update 1:N user-level map (dedup)
        const updatedUserLevelMap: TUserLevelMap = { ...props.userLevelMap }
        const existingLevels = props.userLevelMap[targetUserName] || []
        updatedUserLevelMap[targetUserName] = [...new Set([...existingLevels, targetLevel])]

        // Step 6: Emit to parent
        emit('confirm', caseType, userResult, levelResult, updatedUserLevelMap, newUser)
        ElMessage.success(`Case ${caseType} confirmed successfully!`)

        // Step 7: Close dialog and reset form
        emit('update:visible', false)
        resetForm()

    } catch (error: any) {
        ElMessage.error(error.message || 'Please fix validation errors and try again')
        console.error('Confirm failed:', error)
    }
}

// Handle dialog close (sync with parent)
const handleDialogClose = () => {
    emit('update:visible', false)
    //   resetForm()
}
</script>

<style scoped>
/* New user/level input fields style */
.new-user-fields,
.new-level-fields {
    margin-top: 4px;
}

/* Hint text style */
.hint {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
}

.validation-hint {
    font-size: 11px;
    color: #999;
    margin-top: 4px;
    padding-left: 2px;
}

.text-blue {
    color: #409eff;
    font-weight: 500;
}

/* Dropdown separator style */
:deep(.el-select-dropdown__item--disabled) {
    color: #e5e5e5 !important;
}

/* New option style */
:deep(.el-select-dropdown__item[style*="color: #409eff"]) {
    font-weight: 500;
}
</style>

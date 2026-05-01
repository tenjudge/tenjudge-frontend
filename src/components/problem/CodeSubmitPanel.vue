<script setup lang="ts">
import { ref } from 'vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import { SUBMIT_LANGUAGES, type SubmitLanguage } from '@/constants/languages'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [language: SubmitLanguage, code: string]
}>()

const language = ref<SubmitLanguage>(SUBMIT_LANGUAGES[0].value)
const code = ref('')
</script>

<template>
  <div class="submit-panel">
    <h3 class="submit-panel__heading">Submit</h3>

    <BaseSelect
      id="submit-language"
      label="Language"
      :options="SUBMIT_LANGUAGES"
      v-model="language"
    />

    <BaseTextarea
      id="submit-code"
      label="Code"
      v-model="code"
      :rows="14"
      placeholder="Write your solution here..."
    />

    <div class="submit-panel__actions">
      <BaseButton
        variant="primary"
        :loading="loading"
        :disabled="!code.trim()"
        @click="emit('submit', language, code)"
      >
        Submit
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.submit-panel {
  display: grid;
  gap: 16px;
  padding: 24px 28px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  margin-top: 22px;
}

.submit-panel__heading {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.submit-panel__actions {
  display: flex;
}
</style>

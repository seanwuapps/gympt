<template>
  <dialog ref="dialogRef" :class="{ modal: modal }" @close="handleClose">
    <div class="dialog-container">
      <div v-if="header || closable" class="dialog-header">
        <h2 v-if="header">{{ header }}</h2>
        <BaseButton v-if="closable" @click="close" class="close-button" aria-label="Close">
          ✕
        </BaseButton>
      </div>

      <div class="dialog-content">
        <slot />
      </div>

      <div v-if="$slots.footer" class="dialog-footer">
        <slot name="footer" />
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
interface Props {
  visible?: boolean
  header?: string
  modal?: boolean
  closable?: boolean
  dismissableMask?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  modal: true,
  closable: true,
  dismissableMask: true,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)

watch(
  () => props.visible,
  (newVal) => {
    if (!dialogRef.value) return

    if (newVal) {
      if (props.modal) {
        dialogRef.value.showModal()
      } else {
        dialogRef.value.show()
      }
    } else {
      dialogRef.value.close()
    }
  },
  { immediate: true }
)

function close() {
  emit('update:visible', false)
}

function handleClose() {
  emit('update:visible', false)
}

// Handle backdrop click for modal dialogs
onMounted(() => {
  if (!dialogRef.value) return

  if (props.dismissableMask) {
    dialogRef.value.addEventListener('click', (e) => {
      const rect = dialogRef.value!.getBoundingClientRect()
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width

      if (!isInDialog) {
        close()
      }
    })
  }
})
</script>

<style scoped>
dialog {
  border: 1px solid;
  border-radius: 0.5rem;
  padding: 0;
  max-width: 90vw;
  max-height: 90vh;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.dialog-container {
  display: flex;
  flex-direction: column;
  min-width: 300px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid;
}

.dialog-header h2 {
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;
}

.dialog-content {
  padding: 1rem;
  overflow-y: auto;
}

.dialog-footer {
  padding: 1rem;
  border-top: 1px solid;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>

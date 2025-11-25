// Page-level message banner system (replacement for toast notifications)
// Shows messages as inline banners on the page for better UX

export interface PageMessage {
  severity: 'success' | 'info' | 'warn' | 'error'
  summary: string
  detail?: string
  id?: string
}

const messages = ref<PageMessage[]>([])

export function useToast() {
  function add(message: Omit<PageMessage, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9)
    const pageMessage: PageMessage = { ...message, id }

    // Clear previous messages of same severity to avoid clutter
    messages.value = messages.value.filter((m) => m.severity !== pageMessage.severity)

    // Add new message
    messages.value.push(pageMessage)

    // Auto-clear success messages after 5 seconds
    // Keep error/warn messages until user dismisses
    if (message.severity === 'success' || message.severity === 'info') {
      setTimeout(() => {
        remove(id)
      }, 5000)
    }
  }

  function remove(id: string) {
    const index = messages.value.findIndex((m) => m.id === id)
    if (index > -1) {
      messages.value.splice(index, 1)
    }
  }

  function clear() {
    messages.value = []
  }

  return {
    messages: readonly(messages),
    add,
    remove,
    clear,
  }
}

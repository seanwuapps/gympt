<template>
  <div class="progress-spinner">
    <div class="spinner"></div>
  </div>
</template>

<script setup lang="ts">
// No props needed for basic spinner
</script>

<style scoped>
.progress-spinner {
  display: inline-block;
  width: 2rem;
  height: 2rem;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>





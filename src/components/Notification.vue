<script setup lang="ts">
  import { computed, onMounted, onUnmounted } from "vue";
  import X from "./svg/X.vue";
  import CheckCircle from "./svg/CheckCircle.vue";
  import AlertCircle from "./svg/AlertCircle.vue";

  import type { NotificationType } from "../shared";

  const props = defineProps<{ type: NotificationType }>();

  const emit = defineEmits<{ (e: "closeNotification"): void }>();

  const notificationStyle = computed(() => {
    return {
      width: "24px",
      height: "24px",
      stroke: props.type === "success" ? "var(--text-success)" : "var(--text-error)"
    };
  });

  const icons = { success: CheckCircle, error: AlertCircle };

  let timeoutID: number | undefined = undefined;

  onMounted(() => timeoutID = setTimeout(() => emit("closeNotification"), 5_000));

  onUnmounted(() => clearTimeout(timeoutID));
</script>

<template>
  <div class="notification" :class="{ success: type === `success`, error: type === `error` }">
    <div>
      <component :is="icons[type]" :style="notificationStyle"></component>
      <slot></slot>
    </div>
    <button class="no-btn" @click="emit(`closeNotification`)">
      <X :style="{ width: `16px`, height: `16px` }" />
    </button>
  </div>
</template>

<style scoped>
  .notification {
    align-items: flex-start;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    display: flex;
    justify-content: space-between;
    left: 50%;
    max-width: 800px;
    min-width: 500px;
    padding: 0.5rem;
    position: fixed;
    top: 20px;
    transform: translate(-50%, 0);
    z-index: 10;
  }

  .notification> div {
    align-items: center;
    column-gap: 0.3rem;
    display: flex;
  }

  .success {
		background-color: var(--background-success);
		border: 1px solid var(--stroke-success);
		color: var(--text-success);
  }

	.error {
		background-color: var(--background-error);
		border: 1px solid var(--stroke-error);
		color: var(--text-error);
	}
</style>

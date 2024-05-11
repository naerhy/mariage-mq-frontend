<script setup lang="ts">
  import { ref, watch } from "vue";
  import { sources, staticBaseURL, subjects } from "../shared";
  import X from "./svg/X.vue";
  import Download from "./svg/Download.vue";
  import ChevronLeft from "./svg/ChevronLeft.vue";
  import ChevronRight from "./svg/ChevronRight.vue";

  import type { AuthInfo, Photo } from "../shared";

  const props = defineProps<{
    id: number;
    photo: Photo;
    authInfo: AuthInfo
  }>();

	const emit = defineEmits<{
    (e: "modalClose"): void;
    (e: "deletePhoto", id: number, photo: Photo): void;
    (e: "updatePhoto", id: number, photo: Photo, source: string, subjects: string[]): void;
    (e: "switchPhoto", id: number, side: "left" | "right"): void;
    (e: "downloadPhoto", photo: Photo): void;
  }>();

  const subjectsOnPicture = ref(props.photo.subjects);
  const selectedSource = ref(props.photo.source);

  watch(props, (newProps) => {
    subjectsOnPicture.value = newProps.photo.subjects;
    selectedSource.value = newProps.photo.source;
  });
</script>

<template>
  <div class="modal">
    <div class="buttons">
      <button class="no-btn" type="button" @click="emit(`downloadPhoto`, photo)">
        <Download :style="{ width: `24px`, height: `24px` }" />
      </button>
      <button class="no-btn" type="button" @click="emit(`modalClose`)">
        <X :style="{ width: `24px`, height: `24px` }" />
      </button>
    </div>
    <div class="admin-panel" v-if="authInfo.role === `admin`">
      <ul>
        <li v-for="subject in subjects">
          <label>
            <input type="checkbox" v-model="subjectsOnPicture" :value="subject" />
            <span>{{ subject }}</span>
          </label>
        </li>
      </ul>
      <select v-model="selectedSource">
        <option v-for="source in sources.filter((s) => s !== `Toutes`)">{{ source }}</option>
      </select>
      <button
        class="btn"
        type="button"
        @click="emit(`updatePhoto`, id, photo, selectedSource, subjectsOnPicture)"
      >
        Mettre à jour
      </button>
      <button class="btn" type="button" @click="emit(`deletePhoto`, id, photo)">
        Supprimer
      </button>
    </div>
    <button class="no-btn" type="button" @click="emit(`switchPhoto`, id, `left`)">
      <ChevronLeft :style="{ width: `24px`, height: `24px` }" />
    </button>
    <figure>
      <img :src="`${staticBaseURL}/compressed/${photo.name}`" alt="Photo mise en avant" />
      <figcaption><small>{{ photo.name }}</small></figcaption>
    </figure>
    <button class="no-btn" type="button" @click="emit(`switchPhoto`, id, `right`)">
      <ChevronRight :style="{ width: `24px`, height: `24px` }" />
    </button>
  </div>
</template>

<style scoped>
  .modal {
    align-items: center;
    background-color: var(--background);
    column-gap: 2rem;
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1;
  }

  figure {
    display: flex;
    flex-direction: column;
    height: 90%;
    width: 90%;
  }

  figure img {
    min-height: 0;
    min-width: 0;
    object-fit: contain;
  }

  figcaption {
    text-align: center;
  }

  .admin-panel {
    background-color: var(--background);
    border: 1px solid var(--stroke);
    border-radius: 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    left: 20px;
    padding: 1rem;
    position: absolute;
    top: 20px;
    z-index: 1;
  }

  .admin-panel ul {
    display: flex;
    flex-direction: column;
  }

  .admin-panel label {
    column-gap: 0.2rem;
    display: flex;
    padding: 0.2rem 0;
  }

  .admin-panel button {
    width: 100%;
  }

  .buttons {
    column-gap: 1rem;
    display: flex;
    position: absolute;
    right: 20px;
    top: 20px;
  }
</style>

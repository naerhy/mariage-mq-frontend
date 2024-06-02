<script setup lang="ts">
  import { computed, ref } from "vue";
  import axios from "axios";
  import X from "./svg/X.vue";
  import Loading from "./Loading.vue";
  import { baseURL, getErrorMessage } from "../shared";
  import UndrawDownload from "./svg/UndrawDownload.vue";

  interface Zip {
    name: string;
  }

  const props = defineProps<{
    token: string;
    filenames: string[];
  }>();

  const emit = defineEmits<{ (e: "modalClose"): void }>();

  const nbFiles = computed(() => props.filenames.length);

  const email = ref("");

  const isFetching = ref(false);
  const zip = ref<Zip | null>(null);
  const errMsg = ref("");

  async function handleSubmit(): Promise<void> {
    try {
      isFetching.value = true;
      const { data } = await axios.post<{ name: string }>(
        `${baseURL}/zip`,
        {
          filenames: props.filenames,
          email: email.value
        },
        {
          headers: {
            Authorization: `Bearer ${props.token}`
          }
        }
      );
      zip.value = data;
    } catch (err: unknown) {
      errMsg.value = getErrorMessage(err);
    } finally {
      isFetching.value = false;
    }
  }
</script>

<template>
  <div class="modal">
    <div>
      <button class="no-btn close" type="button" @click="emit(`modalClose`)">
        <X :style="{ width: `24px`, height: `24px` }" />
      </button>
      <h3>Téléchargement de photos</h3>
      <Loading v-if="isFetching" text="Préparation du fichier... Ne fermez pas la fenêtre !" />
      <p v-else-if="errMsg">{{ errMsg }}</p>
      <div class="zip-dl" v-else-if="zip">
        <p>
          Votre fichier est en cours de création, un email vous sera envoyé dès qu'il sera prêt.
          <br />
          Vous pouvez fermer cette fenêtre.
        </p>
        <UndrawDownload :style="{ maxWidth: `400px` }" />
      </div>
      <form class="recap-dl" v-else @submit.prevent="handleSubmit">
        <p>Vous etes sur le point de créer un fichier zip contenant {{ nbFiles }} photos.</p>
        <label>
          Email
          <input type="email" v-model="email" required />
        </label>
        <button class="btn">Confirmer</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
  .modal {
    background-color: rgba(0, 0, 0, 0.4);
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1;
  }

  .modal > div {
    background-color: var(--background);
    border-radius: 0.25rem;
    margin: 4rem auto 0;
    max-width: 48rem;
    padding: 1rem;
    position: relative;
  }

  h3 {
    margin-bottom: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    row-gap: 0.25rem;
  }

  .zip-dl {
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
  }

  .recap-dl {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
  }

  .close {
    position: absolute;
    right: 10px;
    top: 10px;
  }
</style>

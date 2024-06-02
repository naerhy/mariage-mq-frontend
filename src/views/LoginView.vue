<script setup lang="ts">
  import axios from "axios";
  import { ref } from "vue";
  import { baseURL, getErrorMessage } from "../shared";

  import type { AuthInfo } from "../shared";

  const emit = defineEmits<{ (e: "login", authInfo: AuthInfo): void }>();

  const password = ref("");
  const passwordErrMsg = ref("");

  async function handleSubmit() {
    try {
      const { data: authInfo } = await axios.post<AuthInfo>(`${baseURL}/auth`, {
        password: password.value
      });
      emit("login", authInfo);
    } catch (err: unknown) {
      passwordErrMsg.value = getErrorMessage(err);
      password.value = "";
    }
  }
</script>

<template>
  <section>
    <h2>Se connecter</h2>
    <form @submit.prevent="handleSubmit">
      <label>
        Mot de passe
        <input type="password" v-model="password" :aria-invalid="passwordErrMsg ? `true` : `false`" />
      </label>
      <small v-if="passwordErrMsg">{{ passwordErrMsg }}</small>
      <button class="btn">Valider</button>
    </form>
  </section>
</template>

<style scoped>
  section {
    margin-top: 4rem;
  }

  h2 {
    margin-bottom: 1rem;
    text-align: center;
  }

  form {
    display: flex;
    flex-direction: column;
    margin: auto;
    max-width: 32rem;
    row-gap: 0.5rem;
  }

  label {
    display: flex;
    flex-direction: column;
    row-gap: 0.25rem;
  }

  small {
    color: var(--text-error);
  }

  button {
    width: 100%;
  }
</style>

<script setup lang="ts">
  import { ref } from "vue";
  import LoginView from "./views/LoginView.vue";
  import ListView from "./views/ListView.vue";
  import UploadView from "./views/UploadView.vue";

  import type { AuthInfo } from "./shared";

  type View = "login" | "list" | "upload";

  const authInfo = ref<AuthInfo | null>(null);

  const currentView = ref<View>("login");

  function handleLogin(_authInfo: AuthInfo): void {
    authInfo.value = _authInfo;
    currentView.value = "list";
  }

  function handleDisconnect(): void {
    authInfo.value = null;
    currentView.value = "login";
  }
</script>

<template>
  <header>
    <h1>Mariage MQ</h1>
    <nav>
      <ul>
        <template v-if="authInfo?.role === `admin`">
          <li><button class="no-btn" type="button" @click="currentView = `list`">Liste</button></li>
          <li>
            <button class="no-btn" type="button" @click="currentView = `upload`">Mettre en ligne</button>
          </li>
        </template>
        <li v-if="authInfo">
          <button class="no-btn" type="button" @click="handleDisconnect">Déconnexion</button>
        </li>
      </ul>
    </nav>
  </header>
  <main>
    <UploadView v-if="authInfo && currentView === `upload`" :auth-info="authInfo" />
    <ListView v-else-if="authInfo && currentView === `list`" :auth-info="authInfo" />
    <LoginView v-else @login="handleLogin" />
  </main>
  <footer>
    <p>
      <small
        >Fille de Gaïa et d'Ouranos, la Titanide Mnémosyne à la belle chevelure était la déesse de la mémoire.</small
      >
    </p>
  </footer>
</template>

<style scoped>
  header {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  nav ul {
    display: flex;
  }

  nav button {
    padding: 0.75rem;
  }

  nav button:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  main {
    flex: 1 1 auto;
  }

  footer {
    padding: 0.5rem 0;
    text-align: center;
  }
</style>

<script setup lang="ts">
  import { ref } from 'vue';
  import axios from 'axios';
  import { baseURL } from '../shared';

  import type { AuthInfo, Photo } from '../shared';

  interface FileWithUpload {
    file: File;
    isUploaded: boolean | null;
  }

  const props = defineProps<{ authInfo: AuthInfo }>();

  const files = ref<FileWithUpload[]>([]);

  function handleChange(event: Event): void {
    const _files = (event.target as HTMLInputElement).files;
    if (_files && _files.length > 0) {
      files.value = Array.from(_files).map((file) => ({ file, isUploaded: null }));
    }
  }

  async function handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (files.value.length > 0) {
      for (const file of files.value) {
        const formData = new FormData();
        formData.append("file", file.file, file.file.name);
        try {
          await axios.post<Photo>(`${baseURL}/photos`, formData, {
            headers: {
              "Authorization": `Bearer ${props.authInfo.token}`,
              "Content-Type": "multipart/form-data"
            }
          });
          file.isUploaded = true;
        } catch (err: unknown) {
          console.error(err);
          file.isUploaded = false;
        }
      }
    }
  }

  // https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
  function formatBytes(bytes: number, decimals: number = 2): string {
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["octets", "Ko", "Mo", "Go"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
</script>

<template>
  <section>
    <h2>Mettre en ligne</h2>
    <form @submit="handleSubmit">
      <label>
        <span>Sélectionner des photos</span>
        <input
          type="file"
          @change="handleChange"
          accept="image/jpeg"
          multiple
          required
        />
        <small>Format .jpeg uniquement</small>
      </label>
      <button class="btn">Mettre en ligne</button>
    </form>
  </section>
  <section v-if="files.length > 0">
    <h2>Status des mises en ligne</h2>
    <table>
      <thead>
        <tr>
          <th v-for="v in [`Nom`, `Taille`, `Mis en ligne`]" scope="col">{{ v }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="file in files"
          :key="file.file.name"
          :class="[{ success: file.isUploaded === true, error: file.isUploaded === false }]"
        >
          <td>{{ file.file.name }}</td>
          <td>{{ formatBytes(file.file.size) }}</td>
          <td>{{ file.isUploaded === true ? `Oui` : file.isUploaded === false ? `Non` : `En attente` }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
  section:first-child {
    margin-bottom: 4rem;
  }

  h2 {
    margin-bottom: 1rem;
    text-align: center;
  }

  form {
    margin: auto;
    max-width: 32rem;
  }

  form label {
    display: flex;
    flex-direction: column;
    row-gap: 0.25rem;
  }

  form button {
    margin-top: 1rem;
    width: 100%;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  table,
  th,
  td {
    border: 1px solid var(--stroke);
  }

  thead tr {
    background-color: #d4d4d8;
  }

  td,
  th {
    padding: 0.5rem;
    text-align: center;
  }

  .success {
		background-color: var(--background-success);
    color: var(--text-success);
  }

  .error {
		background-color: var(--background-error);
    color: var(--text-error);
  }
</style>

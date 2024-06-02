<script setup lang="ts">
  import axios from "axios";
  import { computed, onMounted, onUnmounted, ref } from "vue";
  import PhotoModal from "../components/PhotoModal.vue";
  import { baseURL, getErrorMessage, sources, staticBaseURL, subjects } from "../shared";
  import Notification from "../components/Notification.vue";
  import ZipModal from "../components/ZipModal.vue";

  import type { AuthInfo, NotificationType, Photo } from "../shared";

  interface Message {
    type: NotificationType;
    message: string;
  }

  const props = defineProps<{ authInfo: AuthInfo }>();

  const fetching = ref(true);

  const selectedSource = ref("Toutes");
  const selectedSubjects = ref<string[]>([]);

  const subjectsMenuOpen = ref(false);

  const includeAll = ref(true);

  const notification = ref<Message | null>(null);

  const photos = ref<Photo[]>([]);
  const displayedPhotos = computed(() => {
    return photos.value.map((photo) => {
      if (selectedSource.value !== "Toutes" && photo.source !== selectedSource.value) {
        return false;
      }
      if (includeAll.value) {
        for (const subject of selectedSubjects.value) {
          if (!photo.subjects.includes(subject)) {
            return false;
          }
        }
        return true;
      } else {
        return selectedSubjects.value.length ? selectedSubjects.value.some((s) => photo.subjects.includes(s)) : true;
      }
    });
  });
  const nbDisplayedPhotos = computed(() => {
    return displayedPhotos.value.reduce((nb, value) => {
      if (value) {
        nb++;
      }
      return nb;
    }, 0);
  });

  const focusedPhoto = ref<{ id: number; photo: Photo } | null>(null);

  const zipModalOpen = ref(false);

  function getNextPhotoIndex(index: number, direction: "left" | "right"): number {
    if (direction === "left") {
      for (let i = index - 1; i > -1; i--) {
        if (displayedPhotos.value[i]) {
          return i;
        }
      }
    } else {
      for (let i = index + 1; i < displayedPhotos.value.length; i++) {
        if (displayedPhotos.value[i]) {
          return i;
        }
      }
    }
    return -1;
  }

  function handleKeyPress(evt: KeyboardEvent): void {
    if (focusedPhoto.value !== null) {
      if (evt.code === "Escape") {
        focusedPhoto.value = null;
      } else {
        if (evt.code === "ArrowLeft" || evt.code === "ArrowRight") {
          const nextIndex = getNextPhotoIndex(focusedPhoto.value.id, evt.code === "ArrowLeft" ? "left" : "right");
          if (nextIndex !== -1) {
            focusedPhoto.value = { id: nextIndex, photo: photos.value[nextIndex] };
          }
        }
      }
    }
  }

  function handleSwitchPhoto(id: number, side: "left" | "right"): void {
    const nextIndex = getNextPhotoIndex(id, side);
    if (nextIndex !== -1) {
      focusedPhoto.value = { id: nextIndex, photo: photos.value[nextIndex] };
    }
  }

  onMounted(async () => {
    try {
      const { data: _photos } = await axios.get<Photo[]>(`${baseURL}/photos`, {
        headers: {
          Authorization: `Bearer ${props.authInfo.token}`
        }
      });
      const photosWithTs = _photos
        .filter((photo) => photo.timestamp !== "0")
        .sort((a, b) => {
          // photos from Patrick have a different timestamp than others -> increase of 7270000ms
          const patrickTs = BigInt(7270000);
          const aTs = a.source === "Patrick" ? BigInt(a.timestamp) - patrickTs : BigInt(a.timestamp);
          const bTs = b.source === "Patrick" ? BigInt(b.timestamp) - patrickTs : BigInt(b.timestamp);
          if (aTs > bTs) {
            return 1;
          } else if (aTs < bTs) {
            return -1;
          } else {
            return 0;
          }
        });
      const photosWithoutTs = _photos.filter((photo) => photo.timestamp === "0");
      // workaround for photos to be correctly sorted
      photos.value = [...photosWithTs, ...photosWithoutTs];
      fetching.value = false;
    } catch (err: unknown) {
      notification.value = { type: "error", message: getErrorMessage(err) };
    }
    window.addEventListener("keydown", handleKeyPress);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyPress);
  });

  async function handleUpdatePhoto(id: number, photo: Photo, source: string, subjects: string[]): Promise<void> {
    try {
      const { data: updatedPhoto } = await axios.patch<Photo>(
        `${baseURL}/photos/${photo.id}`,
        {
          newSource: source !== "" ? source : undefined,
          newSubjects: subjects
        },
        {
          headers: {
            Authorization: `Bearer ${props.authInfo.token}`
          }
        }
      );
      focusedPhoto.value = null;
      photos.value[id] = updatedPhoto;
      notification.value = { type: "success", message: `${photo.name} a été modifiée.` };
    } catch (err: unknown) {
      notification.value = { type: "error", message: getErrorMessage(err) };
    }
  }

  async function handleDeletephoto(id: number, photo: Photo): Promise<void> {
    try {
      await axios.delete(`${baseURL}/photos/${photo.id}`, {
        headers: {
          Authorization: `Bearer ${props.authInfo.token}`
        }
      });
      focusedPhoto.value = null;
      photos.value.splice(id, 1);
      notification.value = { type: "success", message: `${photo.name} a été supprimée.` };
    } catch (err: unknown) {
      notification.value = { type: "error", message: getErrorMessage(err) };
    }
  }

  async function handleDownloadPhoto(photo: Photo): Promise<void> {
    try {
      const { data: imgBlob } = await axios.get(`${staticBaseURL}/${photo.url}`, {
        responseType: "blob"
      });
      const url = URL.createObjectURL(imgBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = photo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      notification.value = { type: "error", message: getErrorMessage(err) };
    }
  }
</script>

<template>
  <Teleport to="body">
    <Notification v-if="notification" @close-notification="notification = null" :type="notification.type">
      <p>{{ notification.message }}</p>
    </Notification>
    <PhotoModal
      v-if="focusedPhoto !== null"
      :id="focusedPhoto.id"
      :photo="focusedPhoto.photo"
      :auth-info="authInfo"
      @modal-close="focusedPhoto = null"
      @update-photo="handleUpdatePhoto"
      @delete-photo="handleDeletephoto"
      @switch-photo="handleSwitchPhoto"
      @download-photo="handleDownloadPhoto"
    />
    <ZipModal
      v-if="zipModalOpen"
      :token="authInfo.token"
      :filenames="photos.filter((_, i) => displayedPhotos[i]).map((photo) => photo.name)"
      @modal-close="zipModalOpen = false"
    />
  </Teleport>
  <section v-if="!fetching">
    <h2>Liste des photos</h2>
    <div class="explanations">
      <p>
        Toutes les photos de notre mariage sont répertoriées ci-dessous. Vous pouvez les filtrer par sujet ainsi que par
        provenance.
      </p>
      <p>
        Cliquer sur une miniature permet d'afficher la photo en haute résolution. Une fois dans ce mode, vous pouvez
        faire défiler les photos avec les flèches directionnelles de votre clavier, et quitter avec la touche échap.
        Vous pouvez tout aussi bien utiliser les différentes icones affichées pour effectuer ces actions, en plus de
        pouvoir télécharger chaque photo individuellement via le bouton situé en haut a droite.
      </p>
      <p>
        Si vous souhaitez télécharger toutes les photos actuellement visibles dans la liste, un bouton est prévu à cet
        effet. Après avoir renseigné votre addresse mail et attendu quelques minutes, un lien vous sera envoyé pour
        télécharger le fichier finalisé.
      </p>
    </div>
    <div class="filters">
      <div>
        <button class="btn" type="button" @click="subjectsMenuOpen = !subjectsMenuOpen">Filter par sujet</button>
        <select v-model="selectedSource">
          <option v-for="source in sources">{{ source }}</option>
        </select>
        <p>
          <small> {{ `Affichage de ${nbDisplayedPhotos} photo(s) sur ${photos.length}` }}</small>
        </p>
      </div>
      <button class="btn" type="button" @click="zipModalOpen = true">Télécharger toutes les photos visibles</button>
    </div>
    <div v-if="subjectsMenuOpen" class="subjects-menu">
      <ul>
        <li v-for="subject in subjects">
          <label>
            <input type="checkbox" v-model="selectedSubjects" :value="subject" />
            <span>{{ subject }}</span>
          </label>
        </li>
      </ul>
      <label>
        <input type="checkbox" v-model="includeAll" />
        Afficher uniquement les photos incluant tous les sujets
      </label>
    </div>
    <ul class="list-photos">
      <li
        v-for="(photo, index) in photos"
        :key="photo.id"
        v-show="displayedPhotos[index]"
        @click="focusedPhoto = { id: index, photo: photos[index] }"
      >
        <img :src="`${staticBaseURL}/${photo.thumbnailURL}`" :loading="index < 20 ? `eager` : `lazy`" />
      </li>
    </ul>
  </section>
  <section v-else>
    <p>Chargement...</p>
  </section>
</template>

<style scoped>
  section {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
  }

  section > h2 ~ p {
    color: var(--text-secondary);
  }

  .explanations {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
  }

  .filters {
    display: flex;
    justify-content: space-between;
  }

  .filters > div:nth-child(1) {
    align-items: center;
    column-gap: 1rem;
    display: flex;
  }

  .subjects-menu {
    border: 1px solid var(--stroke);
    border-radius: 0.25rem;
    padding: 1rem;
  }

  .subjects-menu ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .subjects-menu label {
    column-gap: 0.2rem;
    display: flex;
  }

  .list-photos {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .list-photos > li {
    cursor: pointer;
    height: 300px;
  }

  .list-photos img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  @media (max-width: 767px) {
    .filters {
      flex-direction: column;
      row-gap: 1rem;
    }

    .filters > div:nth-child(1) {
      align-items: stretch;
      flex-direction: column;
      row-gap: 0.5rem;
    }
  }
</style>

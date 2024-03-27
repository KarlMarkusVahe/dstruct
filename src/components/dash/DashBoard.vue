<template>
  <div class="dashboard-container">
    <h1>Welcome to Dashboard</h1>
    <div v-if="folders.length > 0">
      <h2>Folders</h2>
      <ul>
        <template v-for="folder in folders" :key="folder.ID">
          <li>
            <span @click="toggleFolder(folder)" class="folder-title">{{ folder.title }}</span>
            <ul v-show="isOpen(folder)">
              <template v-for="subfolder in folder.subfolders" :key="subfolder.ID">
                <li>
                  <span @click="toggleFolder(subfolder)" class="folder-title">{{ subfolder.title }}</span>
                  <ul v-show="isOpen(subfolder)">
                    <li v-for="nestedSubfolder in subfolder.subfolders" :key="nestedSubfolder.ID">
                      {{ nestedSubfolder.title }}
                    </li>
                  </ul>
                </li>
              </template>
            </ul>
          </li>
        </template>
      </ul>
    </div>
    <div v-else>
      <p>No folders found.</p>
    </div>
    <div v-if="documents.length > 0">
      <h2>Documents</h2>
      <ul>
        <li v-for="document in documents" :key="document.ID">
          {{ document.title }} - {{ document.document_type }}
          <!-- Display other document information as needed -->
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No documents found.</p>
    </div>
  </div>
  <div class="logout-container">
    <!-- Add a logout button -->
    <button class="logout-button" @click="logout">Logout</button>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import router from "@/router";

export default {
  data() {
    return {
      folders: [],
      documents: [],
      openFolders: [],
    };
  },
  methods: {
    ...mapActions(['unAuthorize']),
    async fetchFolders() {
      try {
        const response = await this.$http.get('/docs/folders');
        this.folders = response.data;
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    },
    async fetchDocuments() {
      try {
        const response = await this.$http.get('/docs/documents');
        this.documents = response.data;
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    },
    async logout() {
      await this.$http.delete('/sessions')
          .then(response => {
            if(response.status === 200) { // OK
              this.unAuthorize();
              router.push('/login');
            } else {
              console.error('Unexpected status code: ', response.status);
              alert('Failed to logout. Please try again.')
            }
          })
          .catch(error => {
            console.error('Logout error:', error.message);
            alert('Failed to logout. Please try again.')
          });
    },
    toggleFolder(folder) {
      const index = this.openFolders.indexOf(folder.ID);
      if (index === -1) {
        this.openFolders.push(folder.ID);
      } else {
        this.openFolders.splice(index, 1);
      }
    },
    isOpen(item) {
      return this.openFolders.includes(item.ID);
    },
  },
  async created() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      await this.fetchFolders();
      await this.fetchDocuments();
    } else {
      console.error('User not logged in.');
      router.push('/login');
    }
  },
}
</script>

<style scoped>
.logout-container {
  display: flex;
  justify-content: center;
  margin-top: 20px; /* Adjust margin as needed */
}

.logout-button {
  background-color: var(--inactive-input);
  color: #6d6d6d;
  border-radius: 7px;
  border-style: solid;
  border-color: var(--bg);
  width: 150px; /* Adjust width as needed */
  height: 40px;
  font-size: 16px; /* Adjust font size as needed */
  transition: background-color 0.6s ease;
}

.logout-button:hover {
  background-color: var(--button-active);
  color: white;
}

.folder-title {
  cursor: pointer;
}
</style>
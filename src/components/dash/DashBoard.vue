<template>
  <div class="dashboard-container">
    <h1>Welcome to Dashboard</h1>
 <div v-if="isLoading">Loading...</div>
    <div v-else>
      <div>
        <label for="filterType">Filter By:</label>
        <select id="filterType" v-model="filterType">
          <option value="all">All</option>
          <option value="documents">Documents</option>
          <option value="folders">Folders</option>
        </select>
      </div>
    <div>
      <label for="searchInput">Search {{ getFilterTypeName() }}:</label>
      <input type="text" id="searchInput" v-model="searchQuery" placeholder="Enter keywords">
    </div>
      <ul v-if="filterType === 'folders' || filterType === 'all'">
      <h2>Folders</h2>
      <ul>
        <li v-for="folder in filteredFolders" :key="folder.ID">{{ folder.TITLE }}</li>
      </ul>
      </ul>
      <ul v-if="filterType === 'documents' || filterType === 'all'">
      <h2>Documents</h2>
      <ul>
        <li v-for="document in filteredDocuments" :key="document.ID" @click="showDocumentDetails(document)">{{ document.TITLE }}</li>
        <div id="documentDetails" class="mt-4">
          <h3>Document Details</h3>
          <p><strong>Title:</strong> <span id="documentTitle"></span></p>
          <p><strong>Document Type:</strong> <span id="documentType"></span></p>
          <p><strong>ID:</strong> <span id="documentId"></span></p>
        </div>
      </ul>
      </ul>
    </div>
  </div>
  <div class="logout-container">
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
      searchQuery: '', // Added search query data property
      filterType: 'all', // Default to filtering documents
      docFilterType: 'title', // Default document filter type
      folderFilterType: 'title', // Default folder filter type
      isLoading: true
    };
  },
  computed: {
     filteredFolders() {
      return this.filterItems(this.folders, this.searchQuery, this.filterType, 'folder');
    },
    filteredDocuments() {
      return this.filterItems(this.documents, this.searchQuery, this.filterType, 'document');
    }
  },
  methods: {
    ...mapActions(['unAuthorize']),
    filterItems(items, searchQuery, filterType, itemType) {
      return items.filter(item => {
        if ((filterType === 'all' || filterType === itemType) &&
            (searchQuery === '' || item.TITLE.toLowerCase().includes(searchQuery.toLowerCase()))) {
          return true;
        } else if ((filterType === 'folders' || filterType === 'all') && itemType === 'folder' &&
            (searchQuery === '' || item.TITLE.toLowerCase().includes(searchQuery.toLowerCase()))) {
          return true;
        } else if ((filterType === 'documents' || filterType === 'all') && itemType === 'document' &&
            (searchQuery === '' || item.TITLE.toLowerCase().includes(searchQuery.toLowerCase()))) {
          return true;
        }
        return false;
      });
    },
    getFilterTypeName() {
      switch (this.filterType) {
        case 'all':
          return 'All';
        case 'folders':
          return 'Folders';
        case 'documents':
          return 'Documents';
        default:
          return '';
      }
    },
    async fetchData() {
      this.isLoading = true;
      this.$http.get('/docs/folders')
          .then(response => {
              this.folders = response.data.data;
              this.$http.get('/docs/documents')
                  .then(response => {
                      this.documents = response.data.data;
                  })
                  .catch(error => {
console.error('Error fetching data:', error);
                  });
          })
          .catch(error => {
console.error('Error fetching data:', error);
          });
      this.isLoading = false;
    },
    async showDocumentDetails(doc) {
      const documentTitle = document.getElementById('documentTitle');


      // Display document details in the UI
      documentTitle.textContent = doc.TITLE;


      // Show the document details container
      document.getElementById('documentDetails').style.display = 'block';
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
    },
  async created() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      await this.fetchData();
    } else {
      console.error('User not logged in.');
      router.push('/login');
    }
  },
  watch: {
    searchQuery() {

    },
    filterType() {

    }
  }
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--bg);
}

.dashboard-container h1 {
  font-size: 36px;
  color: var(--input-text);
  margin-bottom: 20px;
}

.dashboard-container li {
  font-size: 20px;
  color: var(--input-text);
  margin-bottom: 20px;
}

.dashboard-container > div {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.dashboard-container label {
  color: var(--label);
  margin-right: 10px;
}

.dashboard-container select,
.dashboard-container input {
  background-color: var(--inactive-input);
  color: var(--input-text);
  border-radius: 4px;
  border-style: solid;
  border-color: var(--bg);
  padding: 5px 10px;
  height: 30px;
  width: 100%;
  transition: background-color 0.1s ease, border-color 0.1s ease;
}

.dashboard-container select:focus,
.dashboard-container input:focus {
  background-color: var(--active-input);
  border-color: var(--primary);
  outline: none;
}

.dashboard-container ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dashboard-container h2 {
  font-size: 24px;
  color: var(--input-text);
  margin-bottom: 10px;
}

.dashboard-container li {
  margin-bottom: 5px;
  cursor: default;
}

.folder-title {
  cursor: pointer;
  color: var(--input-text);
}

.logout-container {
  display: flex;
  justify-content: center;
  margin-top: 20px; /* Adjust margin as needed */
}

.logout-button {
  background-color: var(--inactive-input);
  color: #FFFFFF;
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
</style>
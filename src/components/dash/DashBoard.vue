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
        <li v-for="folder in filteredFolders" :key="folder.ID" @click="navigateToFolderDocuments(folder)">
          {{ folder.TITLE }}
          <button @click="deleteFolder(folder.ID)">Delete</button>
        </li>
      </ul>
      </ul>
      <ul v-if="filterType === 'documents' || filterType === 'all'">
      <h2>Documents</h2>
      <ul>
        <li v-for="document in filteredDocuments" :key="document.ID" @click="showDocumentDetails(document)">
          {{ document.TITLE }}
          <button @click="deleteDocument(document.ID)">Delete</button>
        </li>
        <div id="documentDetails" class="document-details">
          <h3>Document Details</h3>
          <p><strong>Title:</strong> <span id="documentTitle"></span></p>
          <p><strong>Document Type:</strong> <span id="documentType"></span></p>
          <p><strong>ID:</strong> <span id="documentId"></span></p>
        </div>
      </ul>
      </ul>
    </div>
  </div>
  <h2>Add folder</h2>
  <div class="create-folder">
    <label for="foldertitle">Title</label>
    <div class="create">
      <input type="text" class="form-control" id="foldertitle" v-model="foldertitle">
    </div>
    <label for="foldercategory">category</label>
    <div class="create">
      <input type="text" class="form-control" id="foldercategory" v-model="foldercategory">
    </div>
    <label for="folder_ID">Folder ID</label>
    <div class="create">
      <input type="number" class="form-control" id="folder_ID" v-model="folder_ID">
    </div>
    <button @click="CreateFolder">Create Folder</button>
  </div>
  <h2>Add document</h2>
  <div class="create-document">
    <label for="documenttitle">Title</label>
    <div class="create">
      <input type="text" class="form-control" id="documenttitle" v-model="documenttitle">
    </div>
    <label for="documenttype">type</label>
    <div class="create">
      <input type="text" class="form-control" id="documenttype" v-model="documenttype">
    </div>
    <label for="document_fid">folder ID</label>
    <div class="create">
      <input type="number" class="form-control" id="document_fid" v-model="document_fid">
    </div>
    <button @click="CreateDocument">Create Document</button>
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
      isLoading: true,
      selectedFolder: [],
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
                      console.log(this.documents);
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
      const documentType = document.getElementById('documentType');
      const documentId = document.getElementById('documentId');

      // Display document details in the UI
      documentTitle.textContent = doc.TITLE;
      documentType.textContent = doc.document_type;
      documentId.textContent = doc.ID;

      // Show the document details container
      document.getElementById('documentDetails').style.display = 'block';
    },
    async CreateFolder() {
      // Create a new folder
      const folder = {
        title: this.foldertitle,
        category: this.foldercategory,
        _ID: this.folder_ID,
      };
      await this.$http.put('/docs/folders', folder)
          .then(response => {
            if(response.status === 201) { // Created
              alert('Folder created successfully.');
              this.fetchData();
            } else {
              console.error('Unexpected status code: ', response.status);
              alert('Failed to create folder. Please try again.')
            }
          })
          .catch(error => {
            console.error('Folder creation error:', error.message);
            alert('Failed to create folder. Please try again.')
          });
    },
    async CreateDocument() {
      // Create a new document
      const document = {
        title: this.documenttitle,
        document_type: this.documenttype,
        folder_id: this.document_fid,
      };
      await this.$http.put('/docs/documents', document)
          .then(response => {
            if(response.status === 201) { // Created
              alert('Document created successfully.');
              this.fetchData();
            } else {
              console.error('Unexpected status code: ', response.status);
              alert('Failed to create document. Please try again.')
            }
          })
          .catch(error => {
            console.error('Document creation error:', error.message);
            alert('Failed to create document. Please try again.')
          });
    },
    async deleteFolder(folderId) {
      await this.$http.delete(`/docs/folders/${folderId}`)
          .then(response => {
            if(response.status === 200) { // OK
              alert('Folder deleted successfully.');
              this.fetchData();
            } else {
              console.error('Unexpected status code: ', response.status);
              alert('Failed to delete folder. Please try again.')
            }
          })
          .catch(error => {
            console.error('Folder deletion error:', error.message);
            alert('Failed to delete folder. Please try again.')
          });
    },
    async deleteDocument(documentId) {
      await this.$http.delete(`/docs/documents/${documentId}`)
          .then(response => {
            if(response.status === 200) { // OK
              alert('Document deleted successfully.');
              this.fetchData();
            } else {
              console.error('Unexpected status code: ', response.status);
              alert('Failed to delete document. Please try again.')
            }
          })
          .catch(error => {
            console.error('Document deletion error:', error.message);
            alert('Failed to delete document. Please try again.')
          });
    },
    async navigateToFolderDocuments(folder) {
      this.selectedFolder = folder;
      await this.$http.get(`/docs/folders/${folder.ID}/documents`)
          .then(response => {
            this.documents = response.data.data;
          })
          .catch(error => {
            console.error('Error fetching folder documents:', error);
          });
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

    },
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

.document-details h3 {
  font-size: 16px;
  color: var(--input-text);
}

.document-details p {
  font-size: 12px;
  color: var(--input-text);
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
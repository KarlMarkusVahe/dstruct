<template>
    <div class="dashboard-container">
        <div class="filter-by-container">
            <button class="filter-button" :class="{ active: filterType === 'all' }" @click="setFilter('all')">All</button>
            <button class="filter-button" :class="{ active: filterType === 'documents' }" @click="setFilter('documents')">Documents</button>
            <button class="filter-button" :class="{ active: filterType === 'folders' }" @click="setFilter('folders')">Folders</button>
            <button class="filter-button" :class="{ active: filterType === 'students' }" @click="setFilter('students')">Students</button>
        </div>
        <div class="search-container">
            <label for="searchInput">Search {{ getFilterTypeName() }}:</label>
            <input type="text" id="searchInput" v-model="searchQuery" :placeholder="searchPlaceholder" :style="{ borderRadius: '20px' }">
        </div>
        <div v-if="addingFolder" class="adding-section">
            <h2>Add folder</h2>
            <div>
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
                <button class="create-button" @click="CreateFolder">Create Folder</button>
            </div>
            <button class="add-button" @click="toggleAddFolderMode">Go Back</button>
        </div>
        <div v-if="addingDocument" class="adding-section">
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
                <button class="create-button" @click="CreateDocument">Create Document</button>
            </div>
            <div>
                <button class="add-button" @click="toggleAddDocumentMode">Go Back</button>
            </div>
        </div>
        <div class="logout-container">
            <button class="logout-button" @click="logout">Logout</button>
        </div>
        <div v-if="!addingFolder && !addingDocument">
            <ul v-if="filterType === 'folders' || filterType === 'all'">
                <h2 v-if="!selectedDocument">Folders</h2>
                <button v-show="!selectedDocument" class="add-button" @click="toggleAddFolderMode">Add</button>
                <ul>
                    <div v-if="Object.keys(selectedFolder).length > 0">
                        <h2>Current Folder: {{ selectedFolder.title }}</h2>
                        <h2>Current Folder ID: {{ selectedFolder.ID }}</h2>
                        <div class="button-container">
                            <button class="share-button" v-if="selectedFolder && selectedFolder.ID === folder.ID" @click="toggleShareFolderForm">Share</button>
                            <button class="update-button" v-if="selectedFolder && selectedFolder.ID === folder.ID" @click="toggleUpdateFolderForm">Update</button>
                        </div>
                        <button class="delete-button"  @click="deleteFolder(selectedFolder.ID)">Delete</button>
                        <button class="add-button" v-if="!selectedDocument && Object.keys(selectedFolder).length > 0" @click="goBack">Go Back</button>
                    </div>
                </ul>
                <li v-for="folder in displayedFolders" :key="folder.ID">
                    <button class="folder-button" @click="navigateToFolderDocuments(folder)">
                        <div class="folder-info">
                            <span class="folder-title">{{ folder.title }}</span>
                            <button class="update-button" @click="toggleUpdateForm($event)">Update</button>
                            <button class="share-button" @click="toggleShareForm($event)">Share</button>
                        </div>
                    </button>
                </li>
                <form class="share-form" v-show="showShareForm">
                    <div v-if="Object.keys(selectedFolder).length > 0" id="shareFolder" class="share-folder">
                        <h2>Share Folder</h2>
                        <input type="email" id="shareEmail" placeholder="Enter email address">
                        <div>
                            <input type="checkbox" id="readPrivilege" v-model="readPrivilege">
                            <label class="share-form-label" for="readPrivilege">Read</label>
                        </div>
                        <div>
                            <input type="checkbox" id="writePrivilege" v-model="writePrivilege">
                            <label class="share-form-label" for="writePrivilege">Write</label>
                        </div>
                        <div>
                            <input type="checkbox" id="deletePrivilege" v-model="deletePrivilege">
                            <label class="share-form-label" for="deletePrivilege">Delete</label>
                        </div>
                        <button class="form-button" @click="shareFolder(selectedFolder.ID)">Share</button>
                    </div>
                </form>
                <form class="update-form" v-show="showUpdateForm">
                    <div v-if="Object.keys(selectedFolder).length > 0" id="updateFolder" class="update-folder">
                        <h2>Update Folder</h2>
                        <label for="foldertitle">Title</label>
                        <div class="create">
                            <input type="text" class="form-control" id="foldertitle" v-model="foldertitle">
                        </div>
                        <label for="foldercategory">Category</label>
                        <div class="create">
                            <input type="text" class="form-control" id="foldercategory" v-model="foldercategory">
                        </div>
                        <button class="form-button" @click="updateFolder(selectedFolder.ID)">Update</button>
                    </div>
                </form>
            </ul>
        </div>
        <div class="header-container" v-if="!addingFolder && !addingDocument">
            <ul v-if="filterType === 'documents' || filterType === 'all'">
                <h2>Documents</h2> <button class="add-button" @click="toggleAddDocumentMode">Add</button>
                <ul>
                    <li v-for="document in displayedDocuments" :key="document.ID">
                        <button class="document-button" @click="showDocumentDetails(document)">
                            <div class="document-info">
                                <span class="document-type">{{ document.document_type }}</span>
                                <span class="document-title">{{ document.title }}</span></div>
                            <button class="update-button" @click="toggleUpdateForm($event)">Update</button>
                            <button class="share-button" @click="toggleShareForm($event)">Share</button>
                        </button>
                        <button class="add-button" v-if="selectedDocument" @click="clearSelectedDocument">Go Back</button>
                        <button class="delete-button" v-if="selectedDocument && selectedDocument.ID === document.ID" @click="deleteDocument(document.ID)">Delete</button>
                    </li>
                    <div id="documentDetails" class="document-details" v-if="selectedDocument">
                        <h2>Document Details</h2>
                        <p><strong>Title:</strong> <span id="documentTitle">{{ selectedDocument.title }}</span></p>
                        <p><strong>Document Type:</strong> <span id="documentType">{{ selectedDocument.document_type }}</span></p>
                        <p><strong>ID:</strong> <span id="documentId">{{ selectedDocument.ID }}</span></p>
                    </div>
                    <form class="share-form" v-show="showShareForm">
                        <div v-if="selectedDocument" id="shareDocument" class="share-document">
                            <h2>Share Document</h2>
                            <input type="email" id="shareEmail" placeholder="Enter email address">
                            <div>
                                <input type="checkbox" id="readPrivilege" v-model="readPrivilege">
                                <label class="share-form-label" for="readPrivilege">Read</label>
                            </div>
                            <div>
                                <input type="checkbox" id="writePrivilege" v-model="writePrivilege">
                                <label class="share-form-label" for="writePrivilege">Write</label>
                            </div>
                            <div>
                                <input type="checkbox" id="deletePrivilege" v-model="deletePrivilege">
                                <label class="share-form-label" for="deletePrivilege">Delete</label>
                            </div>
                            <button class="form-button" @click="shareDocument(selectedDocument.ID)">Share</button>
                        </div>
                    </form>
                    <form class="update-form" v-show="showUpdateForm">
                        <div v-if="selectedDocument" id="updateDocument" class="update-document">
                            <h2>Update Document</h2>
                            <label for="documenttitle">Title</label>
                            <div class="create">
                                <input type="text" class="form-control" id="documenttitle" v-model="documenttitle">
                            </div>
                            <label for="documenttype">Type</label>
                            <div class="create">
                                <input type="text" class="form-control" id="documenttype" v-model="documenttype">
                            </div>
                            <label for="document_fid">Folder ID</label>
                            <div class="create">
                                <input type="number" class="form-control" id="document_fid" v-model="document_fid">
                            </div>
                            <button class="form-button" @click="updateDocument(selectedDocument.ID)">Update</button>
                        </div>
                    </form>
                </ul>
            </ul>
        </div>
        <ul v-if="filterType === 'students'">
            <h2>Students</h2>
            <ul>
                <li v-for="student in students" :key="student.ID">
                    {{ student.EMAIL }}
                </li>
            </ul>
            <h2>Add student</h2>
            <div class="create-student">
                <label for="studentEmail">Email</label>
                <div class="create">
                    <input type="email" class="form-control" id="studentEmail" v-model="studentEmail">
                </div>
                <button class="add-button" @click="addStudent">Add Student</button>
            </div>
            <h2>Delete student</h2>
            <div class="delete-student">
                <label for="studentEmail">Email</label>
                <div class="create">
                    <input type="email" class="form-control" id="studentEmail" v-model="studentEmail">
                </div>
                <button class="add-button" @click="deleteStudent">Delete Student</button>
            </div>
            <h2>Reset password</h2>
            <div class="reset-password">
                <label for="studentEmail">Email</label>
                <div class="create">
                    <input type="email" class="form-control" id="studentEmail" v-model="studentEmail">
                </div>
                <button class="add-button" @click="resetPassword(studentEmail)">Reset Password</button>
            </div>
        </ul>
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
            selectedDocument: null,
            addingFolder: false,
            addingDocument: false,
            readPrivilege: false,
            writePrivilege: false,
            deletePrivilege: false,
            showUpdateForm: false,
            showShareForm: false,
            students: [],
            canViewStudents: false,
        };
    },
    computed: {
        searchPlaceholder() {
            switch (this.filterType) {
                case 'all':
                    return 'Search All';
                case 'documents':
                    return 'Search Documents';
                case 'folders':
                    return 'Search Folders';
                default:
                    return 'Enter keywords';
            }
        },
        filteredFolders() {
            return this.filterItems(this.folders, this.searchQuery, this.filterType, 'folder');
        },
        filteredDocuments() {
            return this.filterItems(this.documents, this.searchQuery, this.filterType, 'document');
        },
        displayedDocuments() {
            if (this.selectedDocument) {
                return this.filteredDocuments.filter(document => document.ID === this.selectedDocument.ID);
            }
            if (Object.keys(this.selectedFolder).length === 0) {
                // If no folder is selected, filter out documents that don't have a "_ID"
                return this.filteredDocuments.filter(document => document.FOLDER_ID === null);
            }
            return this.filteredDocuments;
        },
        displayedFolders() {
            if (this.selectedDocument) {
                return this.filteredFolders.filter(folder => folder.ID === this.selectedDocument.folder_id);
            }
            return this.filteredFolders;
        },
    },
    methods: {
        toggleUpdateForm(event) {
            // Toggle the visibility of the update form
            this.showUpdateForm = !this.showUpdateForm;

            // Close the share form if it's open
            this.showShareForm = false;

            // Prevent default behavior (e.g., page scroll)
            event.preventDefault();
        },
        toggleShareForm(event) {
            // Toggle the visibility of the share form
            this.showShareForm = !this.showShareForm;

            // Close the update form if it's open
            this.showUpdateForm = false;

            // Prevent default behavior (e.g., page scroll)
            event.preventDefault();
        },
        setFilter(type) {
            this.filterType = type;
        },
        ...mapActions(['unAuthorize']),
        filterItems(items, searchQuery, filterType, itemType) {
            return items.filter(item => {
                if ((filterType === 'all' || filterType === itemType) &&
                    (searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase()))) {
                    return true;
                } else if ((filterType === 'folders' || filterType === 'all') && itemType === 'folder' &&
                    (searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase()))) {
                    return true;
                } else if ((filterType === 'documents' || filterType === 'all') && itemType === 'document' &&
                    (searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase()))) {
                    return true;
                }
                return false;
            });
        },
        toggleAddFolderMode() {
            this.addingFolder = !this.addingFolder;
        },
        toggleAddDocumentMode() {
            this.addingDocument = !this.addingDocument;
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
                    // Only get the root folders (folders with no parent)
                    this.folders = response.data.filter(folder => !folder._ID);
                    console.log(this.folders);
                    this.$http.get('/docs/documents')
                        .then(response => {
                            this.documents = response.data;
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
            this.selectedDocument = doc;

            const documentTitle = document.getElementById('documentTitle');
            const documentType = document.getElementById('documentType');
            const documentId = document.getElementById('documentId');

            // Display document details in the UI
            documentTitle.textContent = this.selectedDocument.title;
            documentType.textContent = this.selectedDocument.document_type;
            documentId.textContent = this.selectedDocument.ID;

            // Show the document details container
            document.getElementById('documentDetails').style.display = 'block';
        },
        clearSelectedDocument() {
            this.selectedDocument = null;
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
                FOLDER_ID: this.document_fid,
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
                        this.folders = this.folders.filter(folder => folder.ID !== folderId);
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
                        this.documents = this.documents.filter(document => document.ID !== documentId);
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
        async updateFolder(folderId) {
            const body = {
                title: this.foldertitle,
                category: this.foldercategory,
            };
            await this.$http.post(`/docs/folders/${folderId}`, body)
                .then(response => {
                    if(response.status === 200) { // OK
                        alert('Folder updated successfully.');
                        // Update the selectedFolder data property
                        this.selectedFolder = {
                            ...this.selectedFolder,
                            title: this.foldertitle,
                            category: this.foldercategory,
                        };
                        this.fetchData();
                        this.navigateToFolderDocuments(this.selectedFolder)
                    } else {
                        console.error('Unexpected status code: ', response.status);
                        alert('Failed to update folder. Please try again.')
                    }
                })
                .catch(error => {
                    console.error('Folder update error:', error.message);
                    alert('Failed to update folder. Please try again.')
                });
        },
        async updateDocument(documentId) {
            const body = {
                title: this.documenttitle,
                document_type: this.documenttype,
                FOLDER_ID: this.document_fid,
            };
            await this.$http.post(`/docs/documents/${documentId}`, body)
                .then(response => {
                    if(response.status === 200) { // OK
                        alert('Document updated successfully.');
                        this.selectedDocument = {
                            ...this.selectedDocument,
                            title: this.documenttitle,
                            document_type: this.documenttype,
                            ID: documentId,
                        };
                        this.fetchData();
                        this.showDocumentDetails(this.selectedDocument);
                    } else {
                        console.error('Unexpected status code: ', response.status);
                        alert('Failed to update document. Please try again.')
                    }
                })
                .catch(error => {
                    console.error('Document update error:', error.message);
                    alert('Failed to update document. Please try again.')
                });
        },

        async navigateToFolderDocuments(folder) {
            this.selectedFolder = folder;
            await this.$http.get(`/docs/folders/${folder.ID}/documents`)
                .then(response => {
                    this.documents = response.data;
                })
                .catch(error => {
                    console.error('Error fetching folder documents:', error);
                });

            await this.$http.get(`/docs/folders`)
                .then(response => {
                    // Filter the subfolders of the selected folder
                    this.folders = response.data.filter(subfolder => subfolder._ID === folder.ID);
                })
                .catch(error => {
                    console.error('Error fetching subfolders:', error);
                });
        },
        goBack() {
            // Clear selected folder and fetch all folders again
            this.selectedFolder = [];
            this.fetchData();
        },
        async getStudents() {
            await this.$http.get('/sessions/students')
                .then(response => {
                    this.students = response.data;
                    console.log(this.students);
                    this.canViewStudents = true; // Add this line
                })
                .catch(error => {
                    console.error('Error fetching students:', error);
                    this.canViewStudents = false; // Add this line
                });
        },
        async addStudent() {
            const student = {
                email: this.studentEmail,
            };
            await this.$http.post('/sessions/students', student)
                .then(response => {
                    if(response.status === 201) { // Created
                        alert('Student added successfully. ' + response.data.message);
                        this.getStudents();
                    } else {
                        console.error('Unexpected status code: ', response.status);
                        alert('Failed to add student. Please try again.')
                    }
                })
                .catch(error => {
                    console.error('Student addition error:', error.message);
                    alert('Failed to add student. Please try again.')
                });
        },
        async deleteStudent() {
            const email = {
                email: this.studentEmail,
            };
            await this.$http.delete('/sessions/students', { data: email })
                .then(response => {
                    if(response.status === 200) { // OK
                        alert('Student deleted successfully.');
                        this.getStudents();
                    } else {
                        console.error('Unexpected status code: ', response.status);
                        alert('Failed to delete student. Please try again.')
                    }
                })
                .catch(error => {
                    console.error('Student deletion error:', error.message);
                    alert('Failed to delete student. Please try again.')
                });
        },
        async resetPassword(email) {
            await this.$http.post(`/sessions/students/${email}/reset-password`)
                .then(response => {
                    if(response.status === 200) { // OK
                        alert('Password reset successful. ' + response.data.message);
                    } else {
                        console.error('Unexpected status code: ', response.status);
                        alert('Failed to reset password. Please try again.')
                    }
                })
                .catch(error => {
                    console.error('Password reset error:', error.message);
                    alert('Failed to reset password. Please try again.')
                });
        },
        async shareDocument(documentId) {
            console.log('Sharing document... ' + documentId);
            const privileges = {
                email: document.getElementById('shareEmail').value,
                READ_PRIVILEGE: this.readPrivilege,
                WRITE_PRIVILEGE: this.writePrivilege,
                DELETE_PRIVILEGE: this.deletePrivilege,
            };
            await this.$http.put(`/docs/documents/${documentId}/share`, privileges)
                .then(response => {
                    if(response.status === 200) { // OK
                        alert('Document shared successfully.');
                    } else {
                        console.error('Unexpected status code: ', response.status);
                        alert('Failed to share document. Please try again.')
                    }
                })
                .catch(error => {
                    console.error('Document sharing error:', error.message);
                    alert('Failed to share document. Please try again.')
                });
        },
        async shareFolder(folderId) {
            console.log('Sharing folder... ' + folderId);
            const privileges = {
                email: document.getElementById('shareEmail').value,
                READ_PRIVILEGE: this.readPrivilege,
                WRITE_PRIVILEGE: this.writePrivilege,
                DELETE_PRIVILEGE: this.deletePrivilege,
            };
            await this.$http.put(`/docs/folders/${folderId}/share`, privileges)
                .then(response => {
                    if(response.status === 200) { // OK
                        alert('Folder shared successfully.');
                    } else {
                        console.error('Unexpected status code: ', response.status);
                        alert('Failed to share folder. Please try again.')
                    }
                })
                .catch(error => {
                    console.error('Folder sharing error:', error.message);
                    alert('Failed to share folder. Please try again.')
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
            await this.getStudents();
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

        selectedFolder: {
            handler(newVal) {
                if (newVal && newVal.ID) {
                    this.document_fid = newVal.ID;
                    this.folder_ID = newVal.ID;
                }
            },
            deep: true,
        },
    }
};
</script>

<style scoped>

.share-form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background-color: var(--bg);
    color: var(--input-text);
}


.share-form-label {
    font-size: 16px; /* Adjust font size */
    margin-bottom: px; /* Adjust margin bottom */
    color: #333; /* Adjust text color */
    /* Add any other desired styling */
}
.create-button {
    background-color: var(--inactive-input);
    color: var(--input-text);
    border-radius: 20px;
    padding: 5px 15px;
    margin-bottom: 10px;
    cursor: pointer;
    border: 2px;
    transition: background-color 0.3s ease;
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}


.add-button {
    background-color: var(--inactive-input);
    color: var(--input-text);
    border-radius: 20px; /* Adjust to make the button round */
    border: none;
    padding: 5px 15px;
    margin-bottom: 10px;
    cursor: pointer;
    text-align: right;
}

.adding-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
    background-color: var(--bg);
    color: var(--input-text);
}

.filter-by-container {
    position: absolute;
    top: 0;
    left: 0; /* Align to the right */
    display: flex;
    flex-direction: column; /* Stack buttons vertically */
    align-items: flex-end; /* Align buttons to the right */
    margin-top: 20px; /* Adjust top margin as needed */
}



.filter-button {
    background-color: var(--inactive-input);
    color: var(--input-text);
    border-radius: 20px; /* Adjust to make the button round */
    border: none;
    padding: 5px 15px;
    margin-right: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.filter-button.active {
    background-color: var(--primary); /* Adjust to indicate active filter */
    color: white;
}

.filter-button:hover {
    background-color: var(--primary-hover); /* Adjust hover color */
}

.search-container {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px;
    background-color: var(--bg); /* Adjust background color as needed */
    z-index: 1000; /* Ensure it's on top of other elements */
}

.search-container label {
    margin-right: 5px;
}

.search-container input {
    background-color: var(--inactive-input);
    color: var(--input-text);
    border-radius: 20px;
    border-style: solid;
    border-color: var(--bg);
    padding: 5px 10px;
    height: 30px;
    width: 250px; /* Adjust the width as needed */
    transition: background-color 0.1s ease, border-color 0.1s ease;
}

.delete-button {
    background-color: #fff;
    color: #ff3333; /* Adjust button color */
    border: 0;
    padding: 5px 10px;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.search-container input:focus {
    background-color: var(--active-input);
    border-color: var(--primary);
    outline: none;
}
ul {
    list-style: none;
    padding: 0;
}

h2 {
    font-size: 20px;
    margin-bottom: 10px;
}

.document-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 500px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 20px;
    background-color: #fff;
    margin-bottom: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.folder-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 500px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 20px;
    background-color: #fff;
    margin-bottom: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.button-container {
    display: flex;
    align-items: center;
}

.folder-info, .document-info {
    display: flex;
    flex-direction: column;
}

.folder-title {
    font-size: 16px;
}

.document-title {
    font-size: 16px;
    position: absolute;
}

.document-type {
    font-size: 14px;
    color: #666;
    padding-left: 220px;
}

.update-button, .share-button {
    background-color: #fff;
    color: #33b9ff; /* Adjust button color */
    border: 0;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.update-button:hover, .share-button:hover {
    background-color: #0e0707; /* Adjust button hover background color */
}

.form-button {
    background-color: var(--inactive-input);
    color: var(--input-text);
    border-radius: 20px; /* Adjust to make the button round */
    border: none;
    padding: 5px 15px;
    margin-bottom: 10px;
    cursor: pointer;
    text-align: right;
}


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
    color:  var(--bg);
}

.logout-container {
    display: flex;
    position: absolute;
    top: 0;
    right: 0;
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
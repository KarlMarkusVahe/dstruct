<template>
  <div>
    <main>
      <h1>Welcome to the DashBoard!</h1>
    </main>

    <li><button @click="logout">Logout</button></li>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import router from "@/router";

export default {
  methods: {
    ...mapActions(['unAuthorize']),
    async logout() {
      await this.$http.delete('/sessions')
          .then(response => {
            if(response.status === 200) { // OK
              this.unAuthorize();
              router.push('/login');
            } else {
              console.error('Unexpected status code: ', response.status);
            }
          })
          .catch(error => {
            console.error('Logout error:', error.message);
          });
    }
  }
}
</script>

<style scoped>
nav {
  background-color: #333;
  color: white;
  padding: 10px;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

li {
  display: inline;
  margin-right: 10px;
}

button {
  background-color: #ff0000;
  color: white;
  border: none;
  padding: 8px 16px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: #cc0000;
}
</style>

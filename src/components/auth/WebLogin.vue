<template>
  <div id="particles-js">

  </div>
</template>

<script>
import { mapActions } from 'vuex';
import router from "@/router";

import {loadScript} from "vue-plugin-load-script";

export default {
  data() {
    return {
      username: '',
      password: '',
      error: ''
    };
  },
  mounted() {
    loadScript('https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js');
    loadScript('../../../public/javascripts/particles.js');
  },
  methods: {
    ...mapActions(['authorize']),
    async login() {
      try {
        const response = await this.$http.post('/sessions', {
          username: this.username,
          password: this.password
        });

        if (response.status === 202) {
          await this.authorize(response.data.data);
          await router.push('/dashboard');
        }
      } catch (error) {
        await this.setError('Login failed. Please try again.');
        console.error('Login error:', error);
      }
    },
    async setError(message) {
      this.error = message;
      setTimeout(() => {
        this.clearError();
      }, 8000);
    },
    async clearError() {
      this.error = '';
    },
  }
};
</script>

<style scoped>

</style>
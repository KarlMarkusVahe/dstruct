<template>
    <div class="container mt-4">
      <router-view></router-view>
    </div>
</template>

<script>

export default {
  name: 'App'
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Montserrat&display=swap');

::before, ::after, * {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Montserrat', sans-serif;
}

#app {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(20, 20, 20);
}
</style>

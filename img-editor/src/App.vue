<template>
  <div id="app">
    <!-- <div class="wrap-top"></div> -->
    <ImageEditor :minWidth="50" :maxWidth="1000"></ImageEditor>
  </div>
</template>

<script>
import ImageEditor from './image-editor.vue'
export default {
  name: 'App',
  components: {
    'ImageEditor': ImageEditor
  }
}
</script>

<style>
#app{
  width: 100%;
  height: 100%;
  background-color: #f9f9f9;
  overflow: hidden;
}
.wrap-top{
  width: calc(100% - 293px) !important;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  height: 90px;
  border-right: 1px solid #EEEEEE;
  position: fixed;
  z-index: 123;
}
</style>

<script setup lang="ts">
import docsearch from '@docsearch/js'

onMounted(() => {
  docsearch({
    container: '#docsearch',
    appId: import.meta.env.VITE_ALGOLIA_APP_ID,
    apiKey: import.meta.env.VITE_ALGOLIA_API_KEY,
    indexName: import.meta.env.VITE_ALGOLIA_INDEX_NAME,
  })
})

function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const { y: scroll } = useWindowScroll()
</script>

<template>
  <header class="header z-40">
    <RouterLink
      class="w-12 h-12 absolute xl:fixed m-5 select-none outline-none"
      to="/"
      focusable="false"
    >
      <Logo />
    </RouterLink>
    <button
      title="Scroll to top"
      fixed right-3 bottom-3 w-10 h-10 hover:op100 rounded-full
      hover-bg-hex-8883 transition duration-300 z-100 print:hidden
      :class="scroll > 300 ? 'op30' : 'op0! pointer-events-none'"
      @click="toTop()"
    >
      <div i-ri-arrow-up-line />
    </button>
    <nav class="nav">
      <div class="spacer" />
      <div class="right" print:op0>
        <RouterLink to="/nav" title="Nav">
          <span class="lt-md:hidden">导航</span>
          <div i-ri-lightbulb-line class="md:hidden" />
        </RouterLink>
        <RouterLink to="/posts" title="Blog">
          <span class="lt-md:hidden">博客</span>
          <div i-ri-article-line md:hidden />
        </RouterLink>
        <RouterLink to="/archive" title="Archive" class="lt-md:hidden">
          <span>归档</span>
        </RouterLink>
        <RouterLink to="/links" title="Links">
          <span class="lt-md:hidden">友链</span>
          <div i-ri-links-line md:hidden />
        </RouterLink>
        <div id="docsearch" class="lt-md:hidden" />
        <!-- <a href="https://www.travellings.cn/go.html" target="_blank" title="Travelling">
          <div i-ri-train-line />
        </a> -->
        <a href="https://github.com/BINGWU2003" target="_blank" title="GitHub" class="lt-md:hidden">
          <div i-uil-github-alt />
        </a>
        <ToggleTheme />
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header h1 {
  margin-bottom: 0;
}

.logo {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
}

.nav {
  padding: 2rem;
  width: 100%;
  display: grid;
  grid-template-columns: auto max-content;
  box-sizing: border-box;
}

.nav > * {
  margin: auto;
}

.nav img {
  margin-bottom: 0;
}

.nav a {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
  opacity: 0.6;
  outline: none;
}

.nav a:hover {
  opacity: 1;
  text-decoration-color: inherit;
}

.nav .right {
  display: grid;
  grid-gap: 1.2rem;
  grid-auto-flow: column;
}

.nav .right > * {
  margin: auto;
}
</style>

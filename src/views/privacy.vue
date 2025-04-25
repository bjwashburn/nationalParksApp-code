<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
</script>

<template>
  <div class="container privacy-vue">
    <header class="header">
      <div class="logo">ParkQuest</div>
      <nav class="nav">
        <router-link to="/">Home</router-link>
        <router-link to="/about">About</router-link>
        <router-link to="/sign-in">Sign In</router-link>
        <router-link to="/create-account">Create Account</router-link>
      </nav>
    </header>

    <main class="main-content">
      <section class="policy-content">
        <h1>Privacy Policy</h1>
        <p class="subtitle">
          Your privacy is important to us. This Privacy Policy explains how ParkQuest collects, uses, and protects your personal information.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create an account, plan a trip, or contact us. This may include:
        </p>
        <ul class="policy-list">
          <li>Name, email address, and username.</li>
          <li>Trip details, such as park preferences and travel dates.</li>
          <li>Communications with us, including support inquiries.</li>
        </ul>
        <p>
          For questions about this Privacy Policy, email us at
          <a href="mailto:support@parkquest.com">support@parkquest.com</a>.
        </p>
      </section>
    </main>

    <footer class="footer">
      <router-link to="/contact">Contact Us</router-link>
      <router-link to="/terms">Terms of Use</router-link>
      <router-link to="/privacy">Privacy Policy</router-link>
    </footer>
  </div>
</template>

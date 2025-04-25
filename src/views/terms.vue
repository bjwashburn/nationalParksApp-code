<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
</script>

<template>
  <div class="container terms-vue">
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
        <h1>Terms of Use</h1>
        <p class="subtitle">
          By using ParkQuest, you agree to these Terms of Use
        </p>

        <h2>Acceptance of Terms</h2>
        <p>
          By accessing or using ParkQuest, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, please do not use our services.
        </p>

        <h2>Contact Us</h2>
        <p>
          For questions about these Terms, email us at
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

<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
</script>

<template>
  <div class="container contact-vue">
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
      <section class="contact-content">
        <h1>Contact Us</h1>
        <p class="subtitle">
          Get in touch with the ParkQuest team for support, feedback, or inquiries.
        </p>

        <h2>How to Reach Us</h2>
        <p>
          We're here to help you plan your next national park adventure. Reach out to us via email or connect with us on social media.
        </p>

        <ul class="contact-list">
          <li>
            <strong>Email:</strong>
            <a href="mailto:support@parkquest.com">support@parkquest.com</a>
          </li>
        </ul>

        <h2>General Inquiries</h2>
        <p>
          For any questions, suggestions, or feedback, please email us at
          <a href="mailto:support@parkquest.com">support@parkquest.com</a>.
          We aim to respond within 48 hours.
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

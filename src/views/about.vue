<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
</script>

<template>
    <div class="container about-vue">
        <header class="header">
            <div class="logo">ParkQuest</div>
            <nav class="nav">
                <router-link to="/">Home</router-link>
            </nav>
        </header>

        <main class="main-content">
            <section class="about-us-content">
                <h1>About Us</h1>
                <p class="subtitle">
                    Learn more about our mission to connect adventurers with the beauty of national parks.
                </p>

                <h2>Welcome to ParkQuest</h2>
                <p>
                    We’re passionate about the great outdoors and believe that every adventure is better when shared with friends—whether they’re old pals or new connections you meet right here on our platform.
                </p>
                <p>
                    At ParkQuest, we make it easy to plan unforgettable trips to national parks across the country. Our site lets you craft custom excursions, coordinate with friends, and keep track of the parks you’ve visited—all in one place. Whether you’re chasing breathtaking vistas, rugged trails, or serene campgrounds, we’re here to help you map out every step of the journey.
                </p>

                <h2>What Sets Us Apart</h2>
                <ul class="features-list">
                    <li><strong>Plan with Ease:</strong> Design your perfect national park adventure with our intuitive trip planner, tailored to your group’s interests and schedules.</li>
                    <li><strong>Connect with Friends:</strong> Invite your crew or link up with fellow park enthusiasts you meet on the site to share the experience.</li>
                    <li><strong>Track Your Journey:</strong> Log the parks you’ve conquered and build a personal record of your outdoor achievements.</li>
                </ul>

                <h2>Our Mission</h2>
                <p>
                    We’re here to inspire exploration, foster connection, and celebrate the beauty of our national parks. From the towering peaks of Yosemite to the vast canyons of Zion, we want to help you discover it all—together.
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

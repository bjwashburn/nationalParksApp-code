<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
</script>

<template>
    <div class="container">
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

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    font-family: Arial, sans-serif;
    background: #fff;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #ddd;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    text-transform: uppercase;
}

.nav {
    display: flex;
    gap: 20px;
}

.nav a {
    text-decoration: none;
    color: #333;
    font-size: 1rem;
}

.nav a:hover {
    text-decoration: underline;
}

.main-content {
    flex: 1;
    padding: 50px 20px;
    position: relative;
}

.user-profile {
    position: absolute;
    top: 20px;
    right: 20px;
}

.profile-icon {
    width: 40px;
    height: 40px;
    background: #ccc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    cursor: pointer;
    border: 2px solid #fff;
    transition: background 0.2s;
}

.profile-icon:hover {
    background: #bbb;
}

.dropdown {
    position: absolute;
    top: 50px;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 150px;
}

.dropdown-item {
    display: block;
    width: 100%;
    padding: 10px 20px;
    background: none;
    border: none;
    text-align: left;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
}

.dropdown-item:hover {
    background: #f5f5f5;
}

.about-us-content {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.about-us-content h1 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #000;
    text-align: center;
}

.subtitle {
    font-size: 1.2rem;
    color: #666;
    text-align: center;
    margin-bottom: 20px;
}

.about-us-content h2 {
    font-size: 1.8rem;
    font-weight: bold;
    color: #000;
    margin-bottom: 10px;
}

.about-us-content p {
    font-size: 1rem;
    color: #333;
    line-height: 1.6;
}

.features-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.features-list li {
    font-size: 1rem;
    color: #333;
    line-height: 1.6;
}

.features-list li strong {
    color: #000;
}

.call-to-action {
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-top: 20px;
}

.footer {
    text-align: center;
    padding: 20px 0;
    border-top: 1px solid #ddd;
}

.footer a {
    margin: 0 10px;
    text-decoration: none;
    color: #333;
    text-transform: capitalize;
}

.footer a:hover {
    text-decoration: underline;
}
</style>

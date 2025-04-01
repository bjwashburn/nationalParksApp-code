import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import SignIn from '../views/SignIn.vue';
import CreateAccount from '../views/CreateAccount.vue';
import Main from '../views/main.vue';
import About from '../views/about.vue';
import Contact from '../views/contact.vue';
import Terms from '../views/terms.vue';
import Privacy from '../views/privacy.vue';
import ExploreParks from '../views/explore-parks.vue';
import MapView from '../views/map-view.vue';
import ConnectWithFriends from '../views/connect-with-friends.vue';
import MyTrips from '../views/my-trips.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
        },
        {
            path: '/sign-in',
            name: 'signIn',
            component: SignIn,
        },
        {
            path: '/create-account',
            name: 'createAccount',
            component: CreateAccount,
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: Main,
        },
        {
            path: '/about',
            name: 'about',
            component: About,
        },
        {
            path: '/contact',
            name: 'contact',
            component: Contact,
        },
        {
            path: '/terms',
            name: 'terms',
            component: Terms,
        },
        {
            path: '/privacy',
            name: 'privacy',
            component: Privacy,
        },
        {
            path: '/explore-parks',
            name: 'exploreParks',
            component: ExploreParks,
        },
        {
            path: '/map-view',
            name: 'mapView',
            component: MapView,
        },
        {
            path: '/connect-with-friends',
            name: 'connectWithFriends',
            component: ConnectWithFriends,
        },
        {
            path: '/my-trips',
            name: 'myTrips',
            component: MyTrips,
        },
    ],
});

export default router;

import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../stores/auth.js';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';

const routes = [
    {
        path: '/login',
        name: 'login',
        component: LoginPage,
        meta: { guest: true }
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterPage,
        meta: { guest: true }
    },
    {
        path: '/',
        name: 'home',
        meta: { requiresAuth: true }
    },
    {
        path: '/channel/:channelId',
        name: 'channel',
        meta: { requiresAuth: true }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const { isAuthenticated } = useAuth();

    if (to.meta.requiresAuth && !isAuthenticated.value) {
        next({ name: 'login' });
    } else if (to.meta.guest && isAuthenticated.value) {
        next({ name: 'home' });
    } else {
        next();
    }
});

export default router;

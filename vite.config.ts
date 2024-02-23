import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { version } from './package.json';

export default defineConfig({
    plugins: [sveltekit()],
    define: {
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
    }
});
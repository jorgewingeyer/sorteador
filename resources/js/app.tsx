import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        const segments = String(name).split('/');
        const last = segments[segments.length - 1] ?? name;
        const candidates = [
            `./pages/${name}.tsx`,
            `./pages/${name}/index.tsx`,
            `./pages/${last}.tsx`,
            `./pages/${last}/index.tsx`,
        ];

        for (const path of candidates) {
            if (path in pages) {
                return resolvePageComponent(path, pages);
            }
        }

        return resolvePageComponent(`./pages/${name}.tsx`, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

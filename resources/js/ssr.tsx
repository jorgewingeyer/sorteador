import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
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
        setup: ({ App, props }) => {
            return <App {...props} />;
        },
    }),
);

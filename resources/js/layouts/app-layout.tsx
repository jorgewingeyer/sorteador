import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    </ThemeProvider>
);

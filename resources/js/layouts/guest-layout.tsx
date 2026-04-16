import { ThemeProvider } from '@/providers/ThemeProvider';
import type { ReactNode } from 'react';

interface GuestLayoutProps {
    children: ReactNode;
}

function DecorativeOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 spin-slow" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 spin-slow" style={{ animationDelay: '3s' }} />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-400 rounded-full mix-blend-overlay filter blur-3xl opacity-10 spin-slow" style={{ animationDelay: '6s' }} />
        </div>
    );
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    return (
        <ThemeProvider storageKey="vite-ui-theme">
            <div
                className="lottery-pattern min-h-screen flex flex-col relative overflow-hidden"
                style={{
                    fontFamily: 'Montserrat, sans-serif',
                    // Color base explícito: rompe la herencia de `body { color: foreground }`
                    // y establece blanco como color local para todos los hijos.
                    color: 'white',
                    // Gradiente inline: GuestLayout es autosuficiente, no depende de welcome.css
                    background: 'linear-gradient(135deg, #063565 0%, #084B8A 25%, #042242 50%, #084B8A 75%, #063565 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 15s ease infinite',
                }}
            >
                <DecorativeOrbs />
                {children}
            </div>
        </ThemeProvider>
    );
}

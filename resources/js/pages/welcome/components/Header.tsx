import type React from 'react';
import { Link } from '@inertiajs/react';
import { ToggleTheme } from '@/layouts/app/toogle-theme';
import { dashboard, login, register } from '@/routes';

interface HeaderProps {
    isAuthenticated: boolean;
    canRegister: boolean;
}

/**
 * Header con navegación
 * Responsabilidad única: mostrar navegación superior
 */
export function Header({ isAuthenticated, canRegister }: HeaderProps) {
    return (
        <header className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <nav className="flex items-center justify-end gap-3 max-w-7xl mx-auto px-8 py-5">
                {isAuthenticated ? (
                    <>
                        <Link
                            href={dashboard()}
                            className="px-5 py-2 rounded-full text-sm font-semibold text-white border border-white/40 hover:bg-white/15 transition-all duration-200 backdrop-blur-sm"
                        >
                            Dashboard
                        </Link>
                        <div className="w-px h-5 bg-white/30" />
                        <ThemeToggle />
                    </>
                ) : (
                    <>
                        <Link
                            href={login()}
                            className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors duration-200"
                        >
                            Iniciar Sesión
                        </Link>
                        {canRegister && (
                            <Link
                                href={register()}
                                className="px-5 py-2 rounded-full text-sm font-semibold text-white border border-white/40 hover:bg-white/15 transition-all duration-200 backdrop-blur-sm"
                            >
                                Registrarse
                            </Link>
                        )}
                        <div className="w-px h-5 bg-white/30" />
                        <ThemeToggle />
                    </>
                )}
            </nav>
        </header>
    );
}

function ThemeToggle() {
    return (
        <div style={{ '--foreground': '255 255 255', color: 'white' } as React.CSSProperties}>
            <ToggleTheme />
        </div>
    );
}

import { Link } from '@inertiajs/react';
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
        <header className="absolute top-0 left-0 right-0 p-6 z-10">
            <nav className="flex items-center justify-end gap-4 max-w-7xl mx-auto">
                {isAuthenticated ? (
                    <Link
                        href={dashboard()}
                        className="glass-card px-6 py-2.5 rounded-full text-gray-800 font-semibold hover:bg-white transition-all duration-300 shadow-lg"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <>
                        <Link
                            href={login()}
                            className="px-6 py-2.5 rounded-full text-white font-semibold hover:bg-white/10 transition-all duration-300"
                        >
                            Iniciar Sesión
                        </Link>
                        {canRegister && (
                            <Link
                                href={register()}
                                className="glass-card px-6 py-2.5 rounded-full text-gray-800 font-semibold hover:bg-white transition-all duration-300 shadow-lg"
                            >
                                Registrarse
                            </Link>
                        )}
                    </>
                )}
            </nav>
        </header>
    );
}

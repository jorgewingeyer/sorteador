import { type SharedData } from '@/types';
import GuestLayout from '@/layouts/guest-layout';
import { Head, usePage } from '@inertiajs/react';
import { useRaffle } from './hooks/useRaffle';
import {
    Confetti,
    CountdownOverlay,
    DrawButton,
    WinnerCard,
    InfoCard,
    Header,
    LotteryTitle,
    Footer,
} from './components';
import './welcome.css';

interface WelcomeProps {
    canRegister?: boolean;
    instanciaSorteoId?: number | null;
    sorteoNombre?: string | null;
    instanciaNombre?: string | null;
}

export default function Welcome({ canRegister = true, instanciaSorteoId, sorteoNombre, instanciaNombre }: WelcomeProps) {
    const { auth } = usePage<SharedData>().props;
    const { isDrawing, winner, showConfetti, countdown, handleDraw, resetRaffle } = useRaffle(instanciaSorteoId);

    return (
        <GuestLayout>
            <Head title={sorteoNombre || 'Sorteo Lotería Chaqueña'}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Confetti por encima de todo, incluyendo WinnerCard */}
            <Confetti show={showConfetti} />

            {/* Cuenta regresiva: cubre la pantalla antes del sorteo */}
            <CountdownOverlay value={countdown} />

            {/* Header de navegación */}
            <Header isAuthenticated={!!auth.user} canRegister={canRegister} />

            {/* Contenido principal — oculto cuando hay ganador para no filtrarse bajo WinnerCard */}
            {!winner && (
                <main className="flex-1 flex flex-col items-center justify-center px-8 py-4 relative z-0">
                    <LotteryTitle title={sorteoNombre} subtitle={instanciaNombre} />
                    <DrawButton
                        onClick={handleDraw}
                        isDrawing={isDrawing || countdown !== null}
                        isAuthenticated={!!auth.user}
                    />
                    {!isDrawing && <InfoCard />}
                </main>
            )}

            {/* Footer */}
            <Footer />

            {/* WinnerCard: pantalla completa sobre todo el contenido */}
            {winner && <WinnerCard winner={winner} onClose={resetRaffle} />}
        </GuestLayout>
    );
}

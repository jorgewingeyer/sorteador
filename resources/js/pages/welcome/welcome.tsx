import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useRaffle } from './hooks/useRaffle';
import {
    Confetti,
    DrawButton,
    WinnerCard,
    InfoCard,
    Header,
    LotteryTitle,
    Footer
} from './components';
import './welcome.css';

interface WelcomeProps {
    canRegister?: boolean;
}

export default function Welcome({ canRegister = true }: WelcomeProps) {
    const { auth } = usePage<SharedData>().props;
    const { isDrawing, winner, showConfetti, handleDraw, resetRaffle } = useRaffle();

    return (
        <>
            <Head title="Sorteo Lotería Chaqueña">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div 
                className="lottery-gradient lottery-pattern min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" 
                style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
                {/* Decorative Background Orbs */}
                <DecorativeOrbs />

                {/* Confetti Effect */}
                <Confetti show={showConfetti} />

                {/* Header Navigation */}
                <Header isAuthenticated={!!auth.user} canRegister={canRegister} />

                {/* Main Content */}
                <main className="relative z-10 max-w-5xl w-full">
                    {/* Logo and Title */}
                    <LotteryTitle />

                    {/* Draw Button */}
                    <DrawButton onClick={handleDraw} isDrawing={isDrawing} />

                    {/* Results Section */}
                    {winner ? (
                        <WinnerCard winner={winner} onClose={resetRaffle} />
                    ) : (
                        !isDrawing && <InfoCard />
                    )}
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}

function DecorativeOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 spin-slow"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 spin-slow" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-400 rounded-full mix-blend-overlay filter blur-3xl opacity-10 spin-slow" style={{ animationDelay: '6s' }}></div>
        </div>
    );
}

import AppLayout from "@/layouts/app-layout";
import PageWrapper from "@/components/PageWrapper";
import { BreadcrumbItem } from "@/types";
import ImportCSV from "./components/importcsv";
import ParticipantesList from "./components/participantesList";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Participantes',
        href: '/participantes',
    },
];

export default function Participantes() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <PageWrapper
                title="Participantes"
                description="Mantén un registro de todos los participantes en tu sorteo."
            >
                <ImportCSV />
                <ParticipantesList />
            </PageWrapper>
        </AppLayout>
    )
}
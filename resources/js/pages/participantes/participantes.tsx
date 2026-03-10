import AppLayout from "@/layouts/app-layout";
import PageWrapper from "@/components/PageWrapper";
import { BreadcrumbItem } from "@/types";
import ImportCSV from "./components/importcsv";
import ParticipantesList from "./components/participantesList";
import { ParticipantesStats } from "./components/ParticipantesStats";
import ImportLogsList from "./components/ImportLogsList";
import { SorteoItem } from "@/types/sorteo";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Participantes',
        href: '/participantes',
    },
];

interface Props {
    sorteoId?: string | number | null;
    sorteo?: SorteoItem;
}

export default function Participantes({ sorteoId, sorteo }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <PageWrapper
                title={sorteo ? `Participantes: ${sorteo.nombre}` : "Participantes"}
                description="Mantén un registro de todos los participantes en tu sorteo."
            >
                <ParticipantesStats />
                <ImportCSV initialSorteoId={sorteoId} />
                <ImportLogsList sorteoId={sorteoId} />
                <ParticipantesList initialSorteoId={sorteoId} />
            </PageWrapper>
        </AppLayout>
    )
}

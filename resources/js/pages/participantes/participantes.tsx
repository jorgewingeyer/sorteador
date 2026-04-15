import AppLayout from "@/layouts/app-layout";
import PageWrapper from "@/components/PageWrapper";
import { BreadcrumbItem } from "@/types";
import ImportCSV from "./components/importcsv";
import ParticipantesList, { ParticipanteListResponse } from "./components/participantesList";
import ImportLogsList from "./components/ImportLogsList";
import SelectSorteo from "./components/SelectSorteo";
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
    sorteos: SorteoItem[];
    participantes?: ParticipanteListResponse;
}

export default function Participantes({ sorteoId, sorteo, sorteos, participantes }: Props) {
    if (!sorteoId) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <SelectSorteo sorteos={sorteos} />
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <PageWrapper
                title={sorteo?.nombre ? `Participantes: ${sorteo.nombre}` : "Participantes"}
                description="Mantén un registro de todos los participantes en tu sorteo."
            >
                <ImportCSV initialSorteoId={sorteoId} />
                <ImportLogsList sorteoId={sorteoId} />
                <ParticipantesList initialSorteoId={sorteoId} initialData={participantes} sorteos={sorteos} />
            </PageWrapper>
        </AppLayout>
    )
}

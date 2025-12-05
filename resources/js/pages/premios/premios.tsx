import PageWrapper from "@/components/PageWrapper";
import AppLayout from "@/layouts/app-layout";
import PremioForm from "./components/premioForm";
import PremioList from "./components/premioList";
import { BreadcrumbItem } from "@/types";
import { usePage } from "@inertiajs/react";
import type { PremioListResponse } from "@/types/premios";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Premios",
        href: "/premios",
    },
];

export default function Premios() {
    const { premios } = usePage<{ premios: PremioListResponse | null }>().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <PageWrapper title="Premios" description="Administra tus premios">
                <PremioForm />
                <PremioList premios={premios} />
            </PageWrapper>
        </AppLayout>
    );
}

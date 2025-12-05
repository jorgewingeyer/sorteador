import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import SorteoForm from "./components/sorteoForm";
import SorteoPremiosForm from "./components/sorteoPremiosForm";
import type { PremioListResponse } from "@/types/premios";
import SorteoList from "./components/sorteoList";
import PageWrapper from "@/components/PageWrapper";
import { usePage } from "@inertiajs/react";
import type { SorteoListResponse } from "@/types/sorteo";
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sorteos',
        href: '/sorteo',
    },
];
export default function Sorteo() {
  const { listSorteos, premios, createdSorteoId } = usePage<{ listSorteos: SorteoListResponse | null; premios?: PremioListResponse | null; createdSorteoId?: number | null }>().props;
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <PageWrapper title="Sorteos" description="Administra tus sorteos">
        <SorteoForm />
        {createdSorteoId ? (
          <SorteoPremiosForm sorteoId={createdSorteoId ?? undefined} premios={premios ?? null} />
        ) : null}
        <SorteoList listSorteos={listSorteos} premios={premios ?? null} />
      </PageWrapper>
    </AppLayout>
  );
}

import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import SorteoForm from "./components/sorteoForm";
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
  const { listSorteos } = usePage<{ listSorteos: SorteoListResponse | null }>().props;
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <PageWrapper title="Sorteos" description="Administra tus sorteos">
        <SorteoForm />
        <SorteoList listSorteos={listSorteos} />
      </PageWrapper>
    </AppLayout>
  );
}

import SorteoController from "@/actions/App/Http/Controllers/SorteoController";
import type { SorteoMeta, SorteoSortKey, SortDirection } from "@/types/sorteo";

export function ariaSortFor(meta: SorteoMeta | null | undefined, key: SorteoSortKey): "none" | "ascending" | "descending" {
  if (!meta) return "none";
  if (meta.sort !== key) return "none";
  return meta.direction === "asc" ? "ascending" : "descending";
}

export function isActiveSort(meta: SorteoMeta | null | undefined, key: SorteoSortKey): boolean {
  return !!meta && meta.sort === key;
}

export function nextDirection(meta: SorteoMeta | null | undefined, key: SorteoSortKey): SortDirection {
  if (!meta) return "asc";
  if (meta.sort !== key) return "asc";
  return meta.direction === "asc" ? "desc" : "asc";
}

export function buildSortHref(meta: SorteoMeta | null | undefined, key: SorteoSortKey): string {
  const perPage = meta?.per_page ?? 15;
  const direction = nextDirection(meta, key);
  return SorteoController.index.url({
    query: {
      page: 1,
      per_page: perPage,
      sort: key,
      direction,
    },
  });
}

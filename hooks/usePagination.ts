"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function usePagination<T>(items: T[], itemsPerPage: number) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const currentPage = Number(searchParams.get("page")) || 1;

  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return { currentPage, totalPages, paginatedItems, goToPage };
}

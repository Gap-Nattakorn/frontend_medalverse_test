export type PaginationItem = number | "ellipsis";

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages: PaginationItem[] = [1];
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) {
    pages.push("ellipsis");
  }
  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }
  if (endPage < totalPages - 1) {
    pages.push("ellipsis");
  }
  pages.push(totalPages);
  return pages;
}

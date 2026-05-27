import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPaginationItems } from "@/utils/getPaginationItems";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const paginationItems = getPaginationItems(currentPage, totalPages);

  return (
    <div className="mt-auto rounded-2xl border border-gray-100 bg-white px-5 py-4 grid grid-cols-[1fr_auto_1fr] items-center">
      <span className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-2 justify-self-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 text-gray-300 hover:text-gray-500 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-1">
          {paginationItems.map((item, index) => {
            if (item === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="text-gray-400 px-2 text-sm"
                >
                  ...
                </span>
              );
            }
            const isActive = item === currentPage;
            return (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${isActive ? "bg-[#EEF5FC] text-[#3C7ACB] font-medium" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {item}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 text-gray-600 hover:text-gray-800 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div />
    </div>
  );
}

import { forwardRef, SelectHTMLAttributes } from "react";

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement>;

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(function SelectInput(
  { className = "", children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-emerald-200 transition focus:ring-2 ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  );
});

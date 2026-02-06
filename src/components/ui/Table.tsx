import { type HTMLAttributes } from "react";

export function Table({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={`w-full caption-bottom text-sm ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`bg-slate-50 border-b border-slate-200 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-slate-200 ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`transition-colors hover:bg-slate-50 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-bold text-slate-700 text-xs uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`p-4 align-middle ${className}`} {...props}>
      {children}
    </td>
  );
}

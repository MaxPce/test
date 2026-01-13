import { HTMLAttributes, forwardRef } from "react";

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={`min-w-full divide-y divide-gray-200 ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = "Table";

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ children, className = "", ...props }, ref) => {
  return (
    <thead ref={ref} className={`bg-gray-50 ${className}`} {...props}>
      {children}
    </thead>
  );
});

TableHeader.displayName = "TableHeader";

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={`bg-white divide-y divide-gray-200 ${className}`}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = "TableBody";

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <tr ref={ref} className={`hover:bg-gray-50 ${className}`} {...props}>
        {children}
      </tr>
    );
  }
);

TableRow.displayName = "TableRow";

interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
        {...props}
      >
        {children}
      </th>
    );
  }
);

TableHead.displayName = "TableHead";

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = "TableCell";

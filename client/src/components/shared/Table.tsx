import { motion } from "framer-motion";

const Table = ({
  rows,
  columns,
  heading,
  rowHeight = 52,
}: {
  rows: any[];
  columns: any[];
  heading: string;
  rowHeight?: number;
}) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center px-6">
      {/* Card Container */}
      <div className="w-full h-full max-w-6xl bg-neutral-100 dark:bg-neutral-900 rounded-2xl shadow-lg p-6 overflow-hidden flex flex-col">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center text-2xl font-semibold uppercase tracking-wide text-neutral-800 dark:text-neutral-100 mb-6"
        >
          {heading}
        </motion.h2>

        {/* Table Wrapper */}
        <div className="flex-1 overflow-auto rounded-lg border border-neutral-300 dark:border-neutral-700">
          <table className="w-full text-sm text-left text-neutral-700 dark:text-neutral-300">
            {/* Table Head */}
            <thead className="bg-neutral-800 text-neutral-100">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.field}
                    style={{ width: col.width }}
                    className="px-4 py-3 font-medium text-sm uppercase tracking-wide"
                  >
                    {col.headerName}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {rows.length > 0 ? (
                rows.map((row, idx) => (
                  <motion.tr
                    key={row.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                    style={{ height: rowHeight }}
                  >
                    {columns.map((col) => (
                      <td key={col.field} className="px-4 py-2">
                        {col.renderCell
                          ? col.renderCell({ row })
                          : row[col.field]}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-6 text-neutral-500 dark:text-neutral-400"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdminTable = ({ 
  columns, 
  data, 
  loading = false, 
  pagination = null,
  onPageChange = null,
  rowActions = null,
  emptyMessage = 'No data found'
}) => {
  if (loading) {
    return (
      <div className="card flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-eco-main"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-eco-light">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              {rowActions && <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => {
                  let value = col.render ? col.render(row[col.key], row) : row[col.key];
                  
                  // Handle cases where value is an object - convert to string
                  if (typeof value === 'object' && value !== null && !React.isValidElement(value)) {
                    value = JSON.stringify(value);
                  }
                  
                  return (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {value || '-'}
                    </td>
                  );
                })}
                {rowActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {rowActions(row).map((action, i) => (
                        <button
                          key={i}
                          onClick={() => action.onClick(row)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${action.className}`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTable;

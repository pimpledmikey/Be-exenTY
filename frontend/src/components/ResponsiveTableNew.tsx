import React from 'react';

interface Column {
  key: string;
  label: string;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  stackOnMobile?: boolean;
  striped?: boolean;
  hover?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  className = "",
  stackOnMobile = false,
  striped = true,
  hover = true,
  pagination
}) => {
  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4 text-muted">
        {emptyMessage}
      </div>
    );
  }

  // Clases dinámicas para la tabla
  const tableClasses = [
    'table',
    'card-table',
    'table-vcenter',
    striped ? 'table-striped' : '',
    hover ? 'table-hover' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Vista Desktop/Tablet */}
      <div className={stackOnMobile ? "d-none d-md-block" : ""}>
        <div className="table-responsive">
          <table className={tableClasses}>
            <thead>
              <tr>
                {columns
                  .filter(col => !col.hideOnTablet)
                  .map(col => (
                    <th key={col.key} className={col.className}>
                      {col.label}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {columns
                    .filter(col => !col.hideOnTablet)
                    .map(col => (
                      <td key={col.key} className={col.className}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista Mobile - Cards cuando stackOnMobile está activo */}
      {stackOnMobile && (
        <div className="d-block d-md-none">
          {data.map((row, index) => (
            <div key={index} className="card mb-3">
              <div className="card-body">
                {columns
                  .filter(col => !col.hideOnMobile)
                  .map(col => (
                    <div key={col.key} className="row mb-2">
                      <div className="col-5 text-muted small">
                        {col.label}:
                      </div>
                      <div className="col-7">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Anterior
                </button>
              </li>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => pagination.onPageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              
              <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

export default ResponsiveTable;

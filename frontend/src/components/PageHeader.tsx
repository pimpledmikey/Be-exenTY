import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = ""
}) => {
  return (
    <div className={`page-header ${className}`}>
      <div className="container-fluid">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="row mb-2">
            <div className="col-12">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  {breadcrumbs.map((item, index) => (
                    <li 
                      key={index} 
                      className={`breadcrumb-item ${item.active ? 'active' : ''}`}
                      aria-current={item.active ? 'page' : undefined}
                    >
                      {item.href && !item.active ? (
                        <a href={item.href}>{item.label}</a>
                      ) : (
                        item.label
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        )}

        {/* Título y acciones */}
        <div className="row align-items-center">
          <div className="col">
            <h1 className="page-title mb-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted mb-0">
                {subtitle}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="col-auto ms-auto">
              <div className="btn-toolbar">
                {actions}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;

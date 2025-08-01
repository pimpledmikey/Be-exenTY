import React from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  title,
  description,
  actions,
  showBackButton = false,
  onBack
}) => {
  return (
    <div className="container-fluid p-0">
      {/* Header Section */}
      {(title || actions) && (
        <div className="card mb-3" data-bs-theme="dark">
          <div className="card-header">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                {showBackButton && (
                  <button 
                    className="btn btn-outline-secondary btn-sm d-md-none"
                    onClick={onBack}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </button>
                )}
                <div>
                  {title && (
                    <h3 className="card-title mb-0 fs-4 fs-md-3">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-muted mb-0 small d-none d-md-block">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              
              {actions && (
                <div className="card-actions d-flex flex-wrap gap-2 w-100 w-md-auto">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="card" data-bs-theme="dark">
        <div className="card-body p-0 p-md-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveLayout;

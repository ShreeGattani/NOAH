import React from 'react';

interface PageHeaderProps {
  title: string;
  tagline?: string;
  children?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  tagline,
  children,
  badge
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            {title}
          </h1>
          {badge}
        </div>
        {tagline && (
          <p className="text-sm text-slate-500 mt-1 font-sans">
            {tagline}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
};

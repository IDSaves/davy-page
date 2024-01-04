import React from 'react';

export default function Highlight({children, color}) {
  return (
    <span
      style={{
        backgroundColor: 'var(--ifm-color-primary)',
        borderRadius: '2px',
        color: 'var(--ifm-background-color)',
        padding: '1px 2px',
      }}>
      {children}
    </span>
  );
}
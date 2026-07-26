import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            fontSize: '0.9rem',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          success: {
            style: {
              background: '#059669',
              border: '1px solid #34d399',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#059669',
            },
          },
          error: {
            style: {
              background: '#dc2626',
              border: '1px solid #f87171',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#dc2626',
            },
          },
          loading: {
            style: {
              background: '#2563eb',
              border: '1px solid #60a5fa',
            },
          },
        }}
      />
    </>
  );
}


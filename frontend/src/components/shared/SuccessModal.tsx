import React from 'react';

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export default function SuccessModal({ open, title = 'Operación exitosa', message, onClose }: Props) {
  if (!open) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button onClick={onClose} style={buttonStyle}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 8,
  padding: '1.25rem',
  maxWidth: 520,
  width: '90%',
  boxShadow: '0 10px 25px rgba(0,0,0,0.12)'
};

const buttonStyle: React.CSSProperties = {
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: 6,
  cursor: 'pointer'
};

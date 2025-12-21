import React from 'react';

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export default function ValidationModal({ open, title = 'Validación requerida', message, onClose }: Readonly<Props>) {
  if (!open) return null;

  return (
    <dialog open style={dialogStyle}>
      <button 
        onClick={onClose} 
        style={overlayButtonStyle}
        aria-label="Cerrar modal"
      />
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>{title}</h3>
        </div>
        <p style={messageStyle}>{message}</p>
        <div style={actionsStyle}>
          <button onClick={onClose} style={buttonStyle}>Entendido</button>
        </div>
      </div>
    </dialog>
  );
}

const dialogStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(78, 94, 163, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  animation: 'fadeIn 0.2s ease-out',
  border: 'none',
  padding: 0,
  margin: 0,
  maxWidth: '100vw',
  maxHeight: '100vh',
};

const overlayButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'transparent',
  border: 'none',
  cursor: 'default',
  padding: 0,
  zIndex: 1,
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 0,
  maxWidth: 480,
  width: '90%',
  boxShadow: '0 10px 40px rgba(78, 94, 163, 0.25)',
  animation: 'slideUp 0.3s ease-out',
  border: '2px solid rgba(78, 94, 163, 0.2)',
  position: 'relative',
  zIndex: 2,
};

const headerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #4E5EA3 0%, #59469A 100%)',
  padding: '1.25rem 1.5rem',
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: '#fff',
  fontSize: '1.25rem',
  fontWeight: 700,
};

const messageStyle: React.CSSProperties = {
  padding: '1.5rem',
  margin: 0,
  color: '#374151',
  fontSize: '1rem',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '0 1.5rem 1.5rem',
  gap: '0.75rem',
};

const buttonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #4E5EA3 0%, #59469A 100%)',
  color: '#fff',
  border: 'none',
  padding: '0.625rem 1.5rem',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: '0.9375rem',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(78, 94, 163, 0.3)',
};

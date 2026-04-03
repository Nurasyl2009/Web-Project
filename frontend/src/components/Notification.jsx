import { useEffect, useState } from 'react';


function Notification({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible || !message) return null;

  const icon = type === 'success' ? '✅' : '❌';

  return (
    <div className={`notification notification--${type}`} role="alert">
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  );
}

export default Notification;

import { useEffect } from 'react';
import { Icon } from './Icon';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
};

export function Modal({ open, onClose, title, subtitle, children, footer, width = 'md' }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const maxWidth = width === 'sm' ? 'max-w-md' : width === 'lg' ? 'max-w-3xl' : 'max-w-xl';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-[#02060d]/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`panel-solid animate-pop relative z-10 w-full ${maxWidth} max-h-[92vh] overflow-y-auto rounded-3xl p-5 sm:p-7`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="btn-quiet -mr-2 -mt-1 shrink-0" aria-label="Chiudi">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 text-sm leading-relaxed text-ink/85">{children}</div>
        {footer ? <div className="mt-6 flex flex-wrap items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

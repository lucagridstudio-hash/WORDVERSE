import { canSpeak, speak } from '../lib/utils';
import { Icon } from './Icon';

type Props = {
  text: string;
  className?: string;
  label?: string;
  tone?: 'quiet' | 'solid';
};

/** Pronunciation via the browser's built-in speech synthesis (no external assets). */
export function SpeakButton({ text, className = '', label, tone = 'quiet' }: Props) {
  if (!canSpeak) return null;

  const base =
    tone === 'solid'
      ? 'inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-ink transition hover:bg-white/[0.12]'
      : 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-white/10 hover:text-teal-300';

  return (
    <button
      type="button"
      title={`Ascolta: ${text}`}
      aria-label={`Ascolta la pronuncia di ${text}`}
      onClick={(event) => {
        event.stopPropagation();
        speak(text);
      }}
      className={`${base} ${className}`}
    >
      <Icon name="volume" className={tone === 'solid' ? 'h-4 w-4' : 'h-4 w-4'} />
      {label ? <span>{label}</span> : null}
    </button>
  );
}

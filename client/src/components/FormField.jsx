const CONTROL =
  'mt-3 w-full rounded-tile border-2 bg-floor px-3.5 py-3 font-sans text-sm text-ink transition-colors duration-200 placeholder:text-ink-dim read-only:opacity-70'

/**
 * FormField — a labelled input or textarea with its hint and inline error.
 *
 * The error is tied to the control with aria-describedby and aria-invalid, so
 * a screen reader announces it when the field takes focus, and it is shown as
 * text beside a changed border — never by colour alone.
 */
function FormField({ id, label, error, hint, as: Control = 'input', ref, className = '', ...controlProps }) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div>
      <label htmlFor={id} className="block font-pixel text-pixel-sm uppercase tracking-hud text-hud">
        {label}
      </label>

      <Control
        ref={ref}
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
        className={`${CONTROL} ${error ? 'border-danger' : 'border-wall hover:border-glow'} ${className}`}
        {...controlProps}
      />

      {hint ? (
        <div id={hintId} className="mt-2 text-xs text-ink-dim">
          {hint}
        </div>
      ) : null}

      {error ? (
        <p id={errorId} className="mt-2 text-xs font-medium text-danger motion-safe:animate-nudge">
          <span aria-hidden="true">✕ </span>
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default FormField

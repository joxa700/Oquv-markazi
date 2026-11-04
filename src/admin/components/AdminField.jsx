export function AdminField({ label, htmlFor, error, hint, required = false, children, wide = false }) {
  return (
    <div className={`field ${wide ? 'field--full' : ''}`.trim()}>
      {label ? (
        <label htmlFor={htmlFor}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <p className="field__error">{error}</p> : hint ? <p className="field__hint">{hint}</p> : null}
      {!error && hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}

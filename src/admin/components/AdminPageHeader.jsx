export function AdminPageHeader({ title, subtitle, actions }) {
  return (
    <div className="admin-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="admin-page-header__actions">{actions}</div> : null}
    </div>
  );
}

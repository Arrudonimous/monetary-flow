export function EmptyState({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-dashed border-line-strong px-6 py-10 text-center">
      <p className="text-ink-muted">{title}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-3" aria-busy="true" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 animate-pulse bg-kla-mist" />
      ))}
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-6 border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
      Something went wrong: {message}
    </p>
  );
}

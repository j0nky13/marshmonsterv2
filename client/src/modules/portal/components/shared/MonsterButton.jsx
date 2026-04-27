export default function MonsterButton({ children, className = "", ...props }) {
  return (
    <button
      className={`rounded-2xl px-5 py-3 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
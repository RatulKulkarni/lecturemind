interface InputProps {
  label?: string;
  error?: string;
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
  pattern?: string;
}

export default function Input({ label, error, className = '', type, placeholder, value, onChange, required, minLength, pattern }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-surface-700 mb-0.5">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        pattern={pattern}
        className={`
          w-full px-4 py-3 rounded-xl border border-surface-300/50
          bg-surface-200 text-surface-900 placeholder-surface-500
          focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
          transition-all duration-200
          ${error ? 'border-red-400 focus:ring-red-400/40' : ''}
          ${className}
        `}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

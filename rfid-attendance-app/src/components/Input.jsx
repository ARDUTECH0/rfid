export default function Input({ value, onChange, placeholder }) {
  return (
    <input
      className="custom-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
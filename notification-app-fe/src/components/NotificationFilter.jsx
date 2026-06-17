import "./components.css";

const filters = ["All", "Placement", "Result", "Event"];

export function NotificationFilter({ value, onChange }) {
  const handleChange = (newValue) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  const currentValue = value || "All";

  return (
    <div className="notification-filter-group">
      {filters.map((type) => (
        <button
          key={type}
          className={`notification-filter-btn ${currentValue === type ? "active" : ""}`}
          onClick={() => handleChange(type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
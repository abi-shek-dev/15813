import "./components.css";

const TYPE_COLORS = {
  Placement: "primary",
  Result: "success",
  Event: "info",
};

const TYPE_LABELS = {
  Placement: "📍 Placement",
  Result: "🏆 Result",
  Event: "📅 Event",
};

export function NotificationCard({ notification, isViewed, onView }) {
  const handleClick = () => {
    if (!isViewed && onView) {
      onView(notification.id);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const typeColor = TYPE_COLORS[notification.notification_type] || "default";
  const typeLabel = TYPE_LABELS[notification.notification_type] || notification.notification_type;

  return (
    <div
      className={`notification-card ${!isViewed ? "unviewed" : ""}`}
      onClick={handleClick}
    >
      <div className="notification-card-header">
        <div style={{ flex: 1 }}>
          <div className="notification-badges">
            <span className={`notification-chip ${typeColor}`}>
              {typeLabel}
            </span>
            {!isViewed && (
              <svg 
                className="done-all-icon" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                title="Unviewed notification"
              >
                <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
              </svg>
            )}
          </div>

          <h3 className="notification-title">{notification.title}</h3>
          <p className="notification-message">{notification.message}</p>
        </div>
      </div>

      <span className="notification-time">
        {formatTime(notification.timestamp)}
      </span>
    </div>
  );
}

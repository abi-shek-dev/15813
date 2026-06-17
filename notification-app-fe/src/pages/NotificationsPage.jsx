import { useState } from "react";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { Log } from "../utils/logger";
import "./NotificationsPage.css";

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filterType = filter && filter !== "All" ? filter : null;

  const {
    notifications,
    totalPages,
    loading,
    error,
    unreadCount,
    viewedIds,
    markAsViewed,
  } = useNotifications(filterType, page);

  const handleFilterChange = (newFilter) => {
    Log("frontend", "INFO", "NotificationsPage", `filter changed to: ${newFilter}`);
    setFilter(newFilter);
    setPage(1); 
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    Log("frontend", "INFO", "NotificationsPage", `page changed to: ${newPage}`);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMarkViewed = (notificationId) => {
    markAsViewed(notificationId);
    Log("frontend", "INFO", "NotificationsPage", `notification viewed: ${notificationId}`);
  };

  return (
    <div className="notifications-page">
      {/* Header with notification count */}
      <div className="notifications-header">
        <div className="notifications-icon-wrapper">
          {/* Simple SVG bell icon replacing MUI NotificationsIcon */}
          <svg className="notifications-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
          </svg>
          {unreadCount > 0 && (
            <span className="notifications-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <h1 className="notifications-title">Notifications</h1>
      </div>

      <hr className="notifications-divider" />

      {/* Filter section */}
      <div className="notifications-filter-container">
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="notifications-loading">
          <div className="spinner"></div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="notifications-alert notifications-alert-error">
          Failed to load notifications: {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && notifications.length === 0 && (
        <div className="notifications-alert notifications-alert-info">
          No notifications {filter && filter !== "All" ? `of type "${filter}"` : ""}
        </div>
      )}

      {/* Notifications list */}
      {!loading && !error && notifications.length > 0 && (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              isViewed={viewedIds.has(notification.id)}
              onView={handleMarkViewed}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && notifications.length > 0 && totalPages > 1 && (
        <div className="notifications-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`pagination-btn ${p === page ? "active" : ""}`}
              onClick={() => handlePageChange(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

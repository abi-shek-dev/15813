import { useState, useEffect, useCallback } from "react";
import { fetchNotifications } from "../api/notifications";

// Logging function signature: Log("frontend", level, packageName, message)
const Log = (source, level, packageName, message) => {
  console.log(`[${source}/${packageName}] ${level}: ${message}`);
};

const ITEMS_PER_PAGE = 10;
const PRIORITY_ORDER = { Placement: 0, Result: 1, Event: 2 };

/**
 * Custom hook for managing notifications with pagination, filtering, and priority sorting
 * @param {string} filterType - Current filter (null or notification type)
 * @param {number} page - Current page (1-indexed)
 * @returns {Object} Notifications state and controls
 */
export function useNotifications(filterType = null, page = 1) {
  // All hooks must be called in the same order every render
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [hasMorePages, setHasMorePages] = useState(false);

  /**
   * Sorts notifications by priority and timestamp
   * Priority order: Placement > Result > Event
   * Within same priority: newer timestamps first
   */
  const sortNotifications = useCallback((notifs) => {
    return [...notifs].sort((a, b) => {
      const priorityA = PRIORITY_ORDER[a.notification_type] ?? 999;
      const priorityB = PRIORITY_ORDER[b.notification_type] ?? 999;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Same priority: newer first
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
  }, []);

  /**
   * Load notifications when page or filter changes
   * Uses direct dependencies to avoid circular dependency issues
   */
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        Log("frontend", "INFO", "useNotifications", "API request started");

        const data = await fetchNotifications(page, ITEMS_PER_PAGE, filterType);

        Log("frontend", "INFO", "useNotifications", "API request success");

        const sortedNotifications = sortNotifications(data.notifications);
        setNotifications(sortedNotifications);
        setTotal(data.total);
        setHasMorePages(data.hasMorePages || false);
      } catch (err) {
        const errorMessage = err?.message || "Unknown error";
        Log("frontend", "ERROR", "useNotifications", `API request failure: ${errorMessage}`);
        setError(errorMessage);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [page, filterType, sortNotifications]);

  /**
   * Mark a notification as viewed
   */
  const markAsViewed = useCallback((notificationId) => {
    setViewedIds((prev) => new Set([...prev, notificationId]));
  }, []);

  /**
   * Calculate unread count
   */
  const unreadCount = notifications.filter((n) => !viewedIds.has(n.id)).length;

  /**
   * Calculate total pages
   * If backend didn't provide total, use hasMorePages flag for open-ended pagination
   */
  const totalPages = total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : (hasMorePages ? page + 1 : page);

  /**
   * Refetch function exposed to parent components
   */
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      Log("frontend", "INFO", "useNotifications", "Manual refetch started");
      const data = await fetchNotifications(page, ITEMS_PER_PAGE, filterType);
      const sortedNotifications = sortNotifications(data.notifications);
      setNotifications(sortedNotifications);
      setTotal(data.total);
      setHasMorePages(data.hasMorePages || false);
    } catch (err) {
      const errorMessage = err?.message || "Unknown error";
      Log("frontend", "ERROR", "useNotifications", `Refetch failure: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, filterType, sortNotifications]);

  return {
    notifications,
    total,
    totalPages,
    loading,
    error,
    viewedIds,
    unreadCount,
    markAsViewed,
    refetch,
    hasMorePages,
  };
}

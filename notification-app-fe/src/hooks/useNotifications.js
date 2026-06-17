import { useState, useEffect, useCallback } from "react";
import { fetchNotifications } from "../api/notifications";

const Log = (source, level, packageName, message) => {
  console.log(`[${source}/${packageName}] ${level}: ${message}`);
};

const ITEMS_PER_PAGE = 10;
const PRIORITY_ORDER = { Placement: 0, Result: 1, Event: 2 };

export function useNotifications(filterType = null, page = 1) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [hasMorePages, setHasMorePages] = useState(false);

  /**
   * Sorts notifications by priority and timestamp
   */
  const sortNotifications = useCallback((notifs) => {
    return [...notifs].sort((a, b) => {
      const priorityA = PRIORITY_ORDER[a.notification_type] ?? 999;
      const priorityB = PRIORITY_ORDER[b.notification_type] ?? 999;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
  }, []);

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

  const unreadCount = notifications.filter((n) => !viewedIds.has(n.id)).length;

  const totalPages = total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : (hasMorePages ? page + 1 : page);

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

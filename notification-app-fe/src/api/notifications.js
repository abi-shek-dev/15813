/**
 * API layer for notifications
 * Handles all communication with the notification backend
 * Includes Bearer token authentication and query parameter support
 */

const API_BASE_URL = "http://4.224.186.213/evaluation-service";
const API_TOKEN = import.meta.env.VITE_API_TOKEN || ""; // Set via environment variable

/**
 * Normalizes API response field names to lowercase
 * API returns: ID, Type, Message, Timestamp
 * We normalize to: id, notification_type, message, timestamp
 */
function normalizeNotification(apiNotification) {
  return {
    id: apiNotification.ID || apiNotification.id || "",
    title: apiNotification.Message?.split('\n')[0] || apiNotification.message || "", // Use message as title
    message: apiNotification.Message || apiNotification.message || "",
    notification_type: apiNotification.Type || apiNotification.notification_type || "Event",
    timestamp: apiNotification.Timestamp || apiNotification.timestamp || new Date().toISOString(),
  };
}

/**
 * Fetches notifications from the API with pagination and filtering
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Number of notifications per page
 * @param {string} notificationType - Filter by notification type (optional)
 * @returns {Promise<{notifications: Array, total: number, page: number, limit: number}>}
 */
export async function fetchNotifications(page = 1, limit = 10, notificationType = null) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (notificationType && notificationType !== "All") {
      params.append("notification_type", notificationType);
    }

    console.log("📤 API Request:", {
      url: `${API_BASE_URL}/notifications?${params.toString()}`,
      tokenLength: API_TOKEN.length,
      hasToken: !!API_TOKEN,
    });

    const response = await fetch(
      `${API_BASE_URL}/notifications?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Normalize field names from API response
    const normalizedNotifications = Array.isArray(data.notifications)
      ? data.notifications.map(normalizeNotification)
      : [];

    return {
      notifications: normalizedNotifications,
      total: data.total || normalizedNotifications.length,
      page: data.page || page,
      limit: data.limit || limit,
    };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw error;
  }
}

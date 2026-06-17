const API_BASE_URL = "http://4.224.186.213/evaluation-service";
const API_TOKEN = import.meta.env.VITE_API_TOKEN || "";

function normalizeNotification(apiNotification) {
  return {
    id: apiNotification.ID || apiNotification.id || "",
    title: apiNotification.Message?.split('\n')[0] || apiNotification.message || "",
    message: apiNotification.Message || apiNotification.message || "",
    notification_type: apiNotification.Type || apiNotification.notification_type || "Event",
    timestamp: apiNotification.Timestamp || apiNotification.timestamp || new Date().toISOString(),
  };
}

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

    console.log("📥 API Response:", {
      notificationsCount: data.notifications?.length,
      total: data.total,
      page: data.page,
      limit: data.limit,
      hasTotal: !!data.total,
    });

    const normalizedNotifications = Array.isArray(data.notifications)
      ? data.notifications.map(normalizeNotification)
      : [];

    const hasMorePages = normalizedNotifications.length >= limit;
    const calculatedTotal = data.total || (hasMorePages ? (page * limit) + 1 : page * limit);

    return {
      notifications: normalizedNotifications,
      total: calculatedTotal,
      page: data.page || page,
      limit: data.limit || limit,
      hasMorePages,
    };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw error;
  }
}

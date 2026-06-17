import { useState } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";

const Log = (source, level, packageName, message) => {
  console.log(`[${source}/${packageName}] ${level}: ${message}`);
};

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  // Normalize filter: "All" means no filter
  const filterType = filter && filter !== "All" ? filter : null;

  // Fetch notifications with current filter and page
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

  const handlePageChange = (_, newPage) => {
    Log("frontend", "INFO", "NotificationsPage", `page changed to: ${newPage}`);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMarkViewed = (notificationId) => {
    markAsViewed(notificationId);
    Log("frontend", "INFO", "NotificationsPage", `notification viewed: ${notificationId}`);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      {/* Header with notification count */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Badge badgeContent={unreadCount} color="primary" max={99} overlap="circular">
          <NotificationsIcon sx={{ fontSize: 28 }} />
        </Badge>
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Filter section */}
      <Box sx={{ marginBottom: 3 }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {/* Loading state */}
      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {!loading && error && (
        <Alert severity="error">
          Failed to load notifications: {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">
          No notifications {filter && filter !== "All" ? `of type "${filter}"` : ""}
        </Alert>
      )}

      {/* Notifications list */}
      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              isViewed={viewedIds.has(notification.id)}
              onView={handleMarkViewed}
            />
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {!loading && !error && notifications.length > 0 && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}

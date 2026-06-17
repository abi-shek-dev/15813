import { Card, CardContent, Typography, Box, Chip, Stack } from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";

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
    <Card
      onClick={handleClick}
      sx={{
        cursor: !isViewed ? "pointer" : "default",
        backgroundColor: isViewed ? "background.paper" : "action.hover",
        borderLeft: !isViewed ? "4px solid" : "none",
        borderLeftColor: !isViewed ? "primary.main" : "transparent",
        transition: "all 0.2s ease",
        "&:hover": !isViewed
          ? {
              backgroundColor: "action.selected",
              boxShadow: 2,
            }
          : {},
      }}
    >
      <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1}>
          <Box flex={1}>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Chip label={typeLabel} size="small" color={typeColor} variant="outlined" />
              {!isViewed && (
                <DoneAllIcon
                  sx={{ fontSize: 16, color: "primary.main" }}
                  title="Unviewed notification"
                />
              )}
            </Stack>

            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
              {notification.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {notification.message}
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 1 }}>
          {formatTime(notification.timestamp)}
        </Typography>
      </CardContent>
    </Card>
  );
}

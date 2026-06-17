# Notification System - Implementation Guide

## Overview
Complete production-quality React + Vite + Material UI notification system with advanced features including priority-based sorting, pagination, filtering, and logging middleware integration.

---

## Architecture

### 1. **API Layer** (`src/api/notifications.js`)

#### Purpose
Centralized API communication with Bearer token authentication and query parameter support.

#### Key Features
- **Bearer Token Authentication**: Uses `VITE_API_TOKEN` environment variable
- **Query Parameters**: Supports `page`, `limit`, and `notification_type`
- **Error Handling**: Graceful error management with detailed error messages
- **Response Normalization**: Ensures consistent data structure

#### Implementation Details
```javascript
fetchNotifications(page = 1, limit = 10, notificationType = null)
```

- **Parameters**:
  - `page`: Current page (1-indexed, default: 1)
  - `limit`: Items per page (default: 10)
  - `notificationType`: Filter by type - "Placement", "Result", or "Event" (optional)

- **Returns**:
  ```javascript
  {
    notifications: Array,  // Array of notification objects
    total: number,         // Total count of notifications
    page: number,          // Current page
    limit: number          // Items per page
  }
```

- **HTTP Details**:
  - Base URL: `http://4.224.186.213/evaluation-service/notifications`
  - Method: `GET`
  - Headers: 
    - `Authorization: Bearer ${API_TOKEN}`
    - `Content-Type: application/json`

#### Environment Setup
Create `.env.local` (Vite automatically loads this):
```
VITE_API_TOKEN=your_bearer_token_here
```

---

### 2. **Custom Hook** (`src/hooks/useNotifications.js`)

#### Purpose
Manages notification state, pagination, filtering, priority sorting, and logging integration.

#### Key Features
- **Dependency Fixes**: Removed infinite loop by properly managing dependencies
- **Priority Sorting**: Implements Placement > Result > Event ordering, with newer timestamps first
- **View Tracking**: Frontend-based viewed/unviewed status management
- **Logging Integration**: Comprehensive logging for all state changes
- **Memoization**: Uses `useCallback` to prevent unnecessary re-renders

#### Function Signature
```javascript
useNotifications(filterType = null, page = 1)
```

- **Parameters**:
  - `filterType`: Current filter (null or "Placement", "Result", "Event")
  - `page`: Current page number (1-indexed)

- **Returns**:
  ```javascript
  {
    notifications: Array,           // Priority-sorted notifications
    total: number,                  // Total count
    totalPages: number,             // Calculated total pages
    loading: boolean,               // API loading state
    error: string | null,           // Error message or null
    viewedIds: Set,                 // IDs of viewed notifications
    unreadCount: number,            // Count of unviewed notifications
    markAsViewed: function,         // Function to mark notification as viewed
    refetch: function               // Manual refetch function
  }
  ```

#### Priority Sorting Algorithm
1. Sort by priority value (Placement=0, Result=1, Event=2)
2. Within same priority: sort by timestamp (newest first)

#### Logging Events
All logs follow the format: `Log("frontend", level, "useNotifications", message)`

- ✅ Page loaded
- ✅ API request started
- ✅ API request success
- ✅ API request failure
- ✅ Filter changed
- ✅ Page changed

#### Bug Fixes in Hook
| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Infinite loop | `notifications` in dependency array | Removed from deps array |
| No loading state | Missing state management | Added loading state |
| No error handling | Missing error state | Added comprehensive error handling |
| Wrong import path | Typo: `"../apis/notifications"` | Changed to `"../api/notifications"` |
| No view tracking | Missing logic | Implemented Set-based tracking |
| No pagination | Not calculating total pages | Added `Math.ceil(total / limit)` |

---

### 3. **Page Component** (`src/pages/NotificationsPage.jsx`)

#### Purpose
Main UI component displaying notifications with filtering, pagination, and user interactions.

#### Key Features
- **State Management**: Properly manages filter and page state
- **Conditional Rendering**: Correct logic for loading, error, empty, and content states
- **User Interactions**: Filter changes, pagination, mark as viewed
- **Responsive UI**: Material UI components with proper spacing and typography
- **Accessibility**: Semantic HTML with proper ARIA labels via Material UI
- **Logging Integration**: Logs all user interactions

#### State Management
```javascript
const [filter, setFilter] = useState("All");      // "All" | "Placement" | "Result" | "Event"
const [page, setPage] = useState(1);              // 1-indexed page number
```

#### Conditional Rendering Logic
```
Loading → Shows CircularProgress spinner

No Loading + Error → Shows error Alert with message

No Loading + No Error + Empty list → Shows empty state Alert

No Loading + No Error + Notifications → Shows list of NotificationCard components

Has notifications + Multiple pages → Shows Pagination controls
```

#### User Interactions
1. **Filter Change**:
   - Updates filter state
   - Resets page to 1
   - Logs interaction
   - Hook fetches new data

2. **Page Change**:
   - Updates page state
   - Logs interaction
   - Scrolls to top
   - Hook fetches new data

3. **Notification Click** (if unviewed):
   - Calls `markAsViewed()`
   - Updates UI immediately
   - Logs action

#### Bug Fixes in Component
| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Always showing loading | `{true &&}` condition | Fixed to `{loading &&}` |
| Wrong type comparison | `notifications.length == "0"` | Changed to `notifications.length === 0` |
| Empty notification cards | No component rendered in map | Added `<NotificationCard>` component |
| Page as string | `useState("1")` | Changed to `useState(1)` |
| No unread calculation | Hardcoded `unreadCount = 2` | Use hook's calculated unreadCount |
| Wrong filter logic | Filter not passed to hook | Pass `filterType` to `useNotifications()` |
| Missing dependencies | Page/filter not triggering refetch | Pass both to hook |

---

### 4. **Notification Card Component** (`src/components/NotificationCard.jsx`)

#### Purpose
Reusable component displaying individual notification with type badge and timestamp.

#### Features
- **Visual Indicators**: Badge for notification type, unviewed indicator
- **Type Styling**: Color-coded chips (Placement=primary, Result=success, Event=info)
- **Time Formatting**: Human-readable relative timestamps ("5m ago", "2h ago")
- **Interactive**: Clickable to mark as viewed
- **Responsive**: Proper spacing and overflow handling

#### Props
```javascript
{
  notification: {
    id: string,                    // Unique identifier
    title: string,                 // Notification title
    message: string,               // Notification body
    notification_type: string,     // "Placement", "Result", or "Event"
    timestamp: string              // ISO 8601 timestamp
  },
  isViewed: boolean,              // Whether user has viewed
  onView: function(id)            // Callback when marking viewed
}
```

#### Type Color Mapping
- **Placement**: Primary color (blue) with 📍 emoji
- **Result**: Success color (green) with 🏆 emoji
- **Event**: Info color (light blue) with 📅 emoji

#### Timestamp Formatting
- < 1 min: "Just now"
- < 60 min: "Xm ago"
- < 24 hours: "Xh ago"
- < 7 days: "Xd ago"
- Older: "Mon, Jun 17, 2:30 PM"

---

### 5. **Filter Component** (`src/components/NotificationFilter.jsx`)

#### Purpose
Toggle button group for filtering notifications by type.

#### Features
- **Exclusive Selection**: Only one filter can be active
- **Options**: All, Placement, Result, Event
- **Responsive**: Wraps on small screens
- **Accessible**: Material UI ToggleButtonGroup with proper event handling

#### Props
```javascript
{
  value: string,                  // Currently selected filter
  onChange: function(newFilter)   // Callback with selected filter
}
```

---

## State Flow Diagram

```
┌─────────────────┐
│ NotificationsPage
│ - filter: "All" | type
│ - page: number
└────────┬────────┘
         │
         ├─→ NotificationFilter
         │   - onChange → setFilter, setPage(1)
         │
         ├─→ useNotifications(filter, page)
         │   ├─→ API: fetchNotifications(page, limit, filter)
         │   ├─→ Sort: Priority > Timestamp
         │   ├─→ State: notifications, loading, error, viewedIds
         │   └─→ Log: All changes
         │
         └─→ NotificationCard (for each notification)
             - onClick → markAsViewed()
             - Show/hide unviewed indicator
```

---

## Logging Integration

### Log Format
```javascript
Log("frontend", level, "packageName", message)
```

### Log Levels
- `INFO`: General information (page loaded, filter changed)
- `ERROR`: Error conditions (API failures)

### Log Events

| Event | Trigger | Example |
|-------|---------|---------|
| Page Loaded | Component mounts | "page loaded" |
| API Request Started | Before fetch | "API request started" |
| API Request Success | After successful fetch | "API request success" |
| API Request Failure | On API error | "API request failure: 401 Unauthorized" |
| Filter Changed | User selects filter | "filter changed: Placement" |
| Page Changed | User clicks pagination | "page changed: 2" |
| Notification Viewed | User clicks notification | "notification viewed: notif-123" |

### Logging in the Code
```javascript
// In useNotifications.js
Log("frontend", "INFO", "useNotifications", "API request started");

// In NotificationsPage.jsx
Log("frontend", "INFO", "NotificationsPage", "filter changed to: Result");
```

---

## Environment Configuration

### Required Environment Variables
Create `.env.local` in the project root:

```
VITE_API_TOKEN=your_bearer_token_here
```

### Vite Configuration
Vite automatically loads `.env` and `.env.local` files. Access in code:
```javascript
import.meta.env.VITE_API_TOKEN
```

---

## API Response Format (Expected)

The API should return notifications in this format:

```javascript
{
  "notifications": [
    {
      "id": "notif-1",
      "title": "You have an offer!",
      "message": "Google has extended an offer for Software Engineer role",
      "notification_type": "Placement",
      "timestamp": "2024-06-17T14:30:00Z"
    },
    {
      "id": "notif-2",
      "title": "New assessment result",
      "message": "Your aptitude test results are now available",
      "notification_type": "Result",
      "timestamp": "2024-06-16T10:15:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

### Required Fields
- `notifications[].id`: Unique identifier (string)
- `notifications[].title`: Notification title (string)
- `notifications[].message`: Notification message (string)
- `notifications[].notification_type`: "Placement", "Result", or "Event"
- `notifications[].timestamp`: ISO 8601 timestamp (string)
- `total`: Total number of notifications (number)

---

## Error Handling

### API Errors
- Network failures: "Failed to fetch"
- HTTP errors: "{status} {statusText}"
- Invalid JSON: "JSON parse error"

### User Feedback
- Error state displays Alert with message
- Logging includes error details
- Graceful degradation (app doesn't crash)

---

## Performance Optimizations

1. **Memoization**: `useCallback` prevents unnecessary function recreation
2. **Dependency Management**: Carefully managed to avoid infinite loops
3. **Pagination**: Limits API load with configurable page size
4. **Lazy Rendering**: Notifications only render when not loading
5. **Set-based Lookup**: O(1) viewed ID checking vs array O(n)

---

## Accessibility Features

- **Material UI Components**: Built-in a11y support
- **Badge Counter**: Indicates unviewed notifications
- **Color + Text**: Type identification not color-alone
- **Semantic HTML**: Proper heading hierarchy
- **Focus Management**: Proper focus states on interactive elements

---

## Testing Recommendations

### Unit Tests
- `fetchNotifications()`: Test with mock API
- `useNotifications()`: Test sorting, pagination, error handling
- Priority sorting algorithm

### Integration Tests
- Filter changes trigger API calls
- Page changes reset to page 1
- Viewed state persists
- Logging fires correctly

### E2E Tests
- Load page → see notifications
- Click filter → see filtered results
- Click pagination → page changes
- Click notification → mark as viewed

---

## Production Checklist

- [ ] Set `VITE_API_TOKEN` in production environment
- [ ] Configure CORS if API is on different domain
- [ ] Test with production API endpoint
- [ ] Verify logging middleware integration
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Optimize bundle size (code splitting)
- [ ] Test on various devices/browsers
- [ ] Set up CI/CD pipeline
- [ ] Configure proper caching headers
- [ ] Add rate limiting on frontend

---

## File Summary

| File | Purpose | LOC | Key Responsibility |
|------|---------|-----|-------------------|
| `api/notifications.js` | API Layer | 40 | HTTP requests with auth |
| `hooks/useNotifications.js` | State Management | 110 | Pagination, filtering, sorting |
| `pages/NotificationsPage.jsx` | Main UI | 95 | Layout, user interactions |
| `components/NotificationCard.jsx` | Notification Display | 85 | Individual notification UI |
| `components/NotificationFilter.jsx` | Filter UI | 28 | Type filter buttons |

**Total: ~350 LOC of production-quality code**

---

## Maintenance Notes

### Future Enhancements
- [ ] Real-time notifications (WebSocket)
- [ ] Mark all as read button
- [ ] Notification archiving
- [ ] Advanced filtering (date range, read status)
- [ ] Notification preferences/settings
- [ ] Dark mode support
- [ ] Infinite scroll pagination

### Known Limitations
- Viewed state is frontend-only (not persisted to backend)
- Page size is fixed at 10 items
- No caching between pagination/filter changes

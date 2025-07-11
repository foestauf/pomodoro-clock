# OpenTelemetry Integration

This document describes the OpenTelemetry telemetry implementation in the Pomodoro Clock application.

## Overview

The application now captures comprehensive telemetry data to understand how users interact with the Pomodoro Clock. This includes timer usage patterns, user interactions, settings changes, and application performance metrics.

## Telemetry Service

The telemetry service (`src/services/telemetryService.ts`) provides a centralized way to track events and send them to an OpenTelemetry collector.

### Configuration

The telemetry service is configured with dummy endpoints and API keys that can be easily replaced with production values:

```typescript
const TELEMETRY_CONFIG = {
  serviceName: 'pomodoro-clock',
  serviceVersion: '1.1.0',
  traceEndpoint: 'https://api.dummy-otel-collector.com/v1/traces',
  metricsEndpoint: 'https://api.dummy-otel-collector.com/v1/metrics',
  apiKey: 'dummy-api-key-replace-with-real-one',
  enabled: true,
  sampleRate: 1.0,
};
```

### Event Types Tracked

1. **Timer Events**
   - Timer start/stop/reset actions
   - Session completions
   - Timer type changes (session, break, long break)

2. **User Interactions**
   - Button clicks
   - Settings adjustments
   - Menu navigation
   - Tab switches

3. **Settings Changes**
   - Session length modifications
   - Break length adjustments
   - Long break settings
   - Sessions before long break changes

4. **Session Analytics**
   - Session start/completion/interruption
   - Session duration tracking
   - Break pattern analysis

5. **Application Lifecycle**
   - App load/unload events
   - Tab focus/blur events
   - Error tracking

6. **Error Tracking**
   - JavaScript errors
   - Audio playback failures
   - Component errors via Error Boundary

## Data Format

All telemetry events follow a consistent structure:

```json
{
  "service": "pomodoro-clock",
  "version": "1.1.0",
  "timestamp": "2025-07-11T02:11:05.879Z",
  "eventType": "timer_event",
  "attributes": {
    "timer.type": "session",
    "timer.action": "start",
    "timer.duration_ms": 1500,
    "timer.session_length_minutes": 25,
    "timer.break_length_minutes": 5
  },
  "metadata": {
    "category": "timer",
    "priority": "high"
  },
  "sessionId": "session-1752199848834-4rbs401ui"
}
```

## Integration Points

### Timer Context
The `TimerContext` is instrumented to track:
- Timer state changes
- Session lifecycle events
- Settings modifications

### User Interface Components
- `TimerControls`: Start/stop/reset button interactions
- `TimerLengthControl`: Settings adjustment tracking
- `AnalyticsSidebar`: Menu and tab interactions
- `ErrorBoundary`: Error tracking

### Application Lifecycle
- `main.tsx`: App initialization and lifecycle events

## Current Implementation

The current implementation logs all telemetry data to the browser console for testing and development purposes. The data structure is already compatible with OpenTelemetry standards and can be easily switched to send to a real OTLP collector.

## Production Deployment

To deploy with real telemetry collection:

1. Replace the dummy configuration with real endpoints:
   ```typescript
   updateTelemetryConfig({
     traceEndpoint: 'https://your-otel-collector.com/v1/traces',
     apiKey: 'your-real-api-key',
   });
   ```

2. The telemetry service will automatically send data to the configured endpoint instead of logging to console.

## Privacy and Data Protection

- All telemetry data is collected anonymously
- No personally identifiable information is captured
- Session IDs are generated locally and are not linked to user accounts
- Data collection can be disabled by setting `enabled: false` in the configuration

## Benefits

This telemetry implementation provides insights into:
- User engagement patterns
- Feature usage statistics
- Performance bottlenecks
- Error rates and types
- Session completion rates
- Optimal timer configurations
- User interface interaction patterns

## Testing

The telemetry implementation has been tested with:
- Timer operations (start, stop, reset)
- Settings adjustments
- Menu navigation
- Error scenarios
- Application lifecycle events

All events are properly structured and contain relevant metadata for analysis.
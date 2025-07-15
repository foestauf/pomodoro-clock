/**
 * Telemetry Service for Pomodoro Clock
 * Tracks user interactions, timer events, and application usage patterns.
 * Currently logs to console for testing; will be enhanced to send to OTLP endpoints.
 */

// Configuration for telemetry
const TELEMETRY_CONFIG = {
  serviceName: 'pomodoro-clock',
  serviceVersion: '1.1.0',
  // Dummy OTLP endpoints - replace with real ones when provided
  traceEndpoint: 'https://api.dummy-otel-collector.com/v1/traces',
  metricsEndpoint: 'https://api.dummy-otel-collector.com/v1/metrics',
  // Dummy API key - replace with real one when provided
  apiKey: 'dummy-api-key-replace-with-real-one',
  // Enable/disable telemetry
  enabled: true,
  // Sample rate (0.0 to 1.0)
  sampleRate: 1.0,
};

let isInitialized = false;

/**
 * Initialize telemetry
 */
export function initializeTelemetry(): void {
  if (isInitialized || !TELEMETRY_CONFIG.enabled) {
    return;
  }

  console.log('Initializing telemetry service...');
  
  try {
    isInitialized = true;
    console.log('Telemetry service initialized successfully');
    
    // Log configuration (with redacted sensitive data)
    console.log('Telemetry configuration:', {
      serviceName: TELEMETRY_CONFIG.serviceName,
      serviceVersion: TELEMETRY_CONFIG.serviceVersion,
      traceEndpoint: TELEMETRY_CONFIG.traceEndpoint,
      enabled: TELEMETRY_CONFIG.enabled,
      apiKey: TELEMETRY_CONFIG.apiKey.replace(/./g, '*'),
    });
  } catch (error) {
    console.error('Failed to initialize telemetry:', error);
    TELEMETRY_CONFIG.enabled = false;
  }
}

/**
 * Send telemetry data to collector (currently logs to console)
 */
function sendTelemetryData(data: Record<string, unknown>): void {
  if (!TELEMETRY_CONFIG.enabled) return;

  // For now, log to console. In production, this would send to OTLP endpoint
  console.log('📊 Telemetry Data:', JSON.stringify(data, null, 2));
  
  // TODO: Replace with actual OTLP HTTP call
  // fetch(TELEMETRY_CONFIG.traceEndpoint, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${TELEMETRY_CONFIG.apiKey}`,
  //   },
  //   body: JSON.stringify(data),
  // }).catch(err => console.error('Failed to send telemetry:', err));
}

/**
 * Create a telemetry event
 */
function createTelemetryEvent(
  eventType: string,
  attributes: Record<string, unknown>,
  metadata?: Record<string, unknown>
): Record<string, unknown> {
  return {
    service: TELEMETRY_CONFIG.serviceName,
    version: TELEMETRY_CONFIG.serviceVersion,
    timestamp: new Date().toISOString(),
    eventType,
    attributes,
    metadata,
    sessionId: sessionStorage.getItem('telemetry-session-id') ?? generateSessionId(),
  };
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  sessionStorage.setItem('telemetry-session-id', sessionId);
  return sessionId;
}

/**
 * Track timer events
 */
export function trackTimerEvent(
  action: 'start' | 'stop' | 'reset' | 'complete',
  timerType: 'session' | 'break' | 'long_break',
  duration?: number,
  sessionLength?: number,
  breakLength?: number
): void {
  if (!TELEMETRY_CONFIG.enabled || !isInitialized) return;

  try {
    const telemetryData = createTelemetryEvent(
      'timer_event',
      {
        'timer.type': timerType,
        'timer.action': action,
        ...(duration && { 'timer.duration_ms': duration }),
        ...(sessionLength && { 'timer.session_length_minutes': sessionLength }),
        ...(breakLength && { 'timer.break_length_minutes': breakLength }),
      },
      {
        category: 'timer',
        priority: 'high',
      }
    );

    sendTelemetryData(telemetryData);
  } catch (error) {
    console.error('Failed to track timer event:', error);
  }
}

/**
 * Track user interactions
 */
export function trackUserInteraction(
  action: string,
  element: string,
  value?: string | number
): void {
  if (!TELEMETRY_CONFIG.enabled || !isInitialized) return;

  try {
    const telemetryData = createTelemetryEvent(
      'user_interaction',
      {
        'user.action': action,
        'user.element': element,
        ...(value !== undefined && { 'user.value': value.toString() }),
      },
      {
        category: 'interaction',
        priority: 'medium',
      }
    );

    sendTelemetryData(telemetryData);
  } catch (error) {
    console.error('Failed to track user interaction:', error);
  }
}

/**
 * Track settings changes
 */
export function trackSettingsChange(
  setting: string,
  oldValue: number | string,
  newValue: number | string
): void {
  if (!TELEMETRY_CONFIG.enabled || !isInitialized) return;

  try {
    const telemetryData = createTelemetryEvent(
      'settings_change',
      {
        'settings.name': setting,
        'settings.old_value': oldValue.toString(),
        'settings.new_value': newValue.toString(),
      },
      {
        category: 'settings',
        priority: 'medium',
      }
    );

    sendTelemetryData(telemetryData);
  } catch (error) {
    console.error('Failed to track settings change:', error);
  }
}

/**
 * Track session analytics
 */
export function trackSessionAnalytics(
  eventType: 'session_started' | 'session_completed' | 'session_interrupted',
  metadata?: Record<string, unknown>
): void {
  if (!TELEMETRY_CONFIG.enabled || !isInitialized) return;

  try {
    const telemetryData = createTelemetryEvent(
      'session_analytics',
      {
        'analytics.event_type': eventType,
        ...metadata,
      },
      {
        category: 'analytics',
        priority: 'high',
      }
    );

    sendTelemetryData(telemetryData);
  } catch (error) {
    console.error('Failed to track session analytics:', error);
  }
}

/**
 * Track application lifecycle events
 */
export function trackAppEvent(
  event: 'app_loaded' | 'app_unloaded' | 'tab_focus' | 'tab_blur',
  metadata?: Record<string, unknown>
): void {
  if (!TELEMETRY_CONFIG.enabled || !isInitialized) return;

  try {
    const telemetryData = createTelemetryEvent(
      'app_event',
      {
        'app.event': event,
        ...metadata,
      },
      {
        category: 'app_lifecycle',
        priority: 'low',
      }
    );

    sendTelemetryData(telemetryData);
  } catch (error) {
    console.error('Failed to track app event:', error);
  }
}

/**
 * Track errors
 */
export function trackError(
  error: Error,
  context?: string,
  metadata?: Record<string, unknown>
): void {
  if (!TELEMETRY_CONFIG.enabled || !isInitialized) return;

  try {
    const telemetryData = createTelemetryEvent(
      'error_event',
      {
        'error.name': error.name,
        'error.message': error.message,
        'error.stack': error.stack ?? '',
        ...(context && { 'error.context': context }),
        ...metadata,
      },
      {
        category: 'error',
        priority: 'critical',
      }
    );

    sendTelemetryData(telemetryData);
  } catch (trackingError) {
    console.error('Failed to track error:', trackingError);
  }
}

/**
 * Update telemetry configuration
 */
export function updateTelemetryConfig(config: Partial<typeof TELEMETRY_CONFIG>): void {
  Object.assign(TELEMETRY_CONFIG, config);
  console.log('Telemetry configuration updated');
}

/**
 * Get current telemetry configuration
 */
export function getTelemetryConfig(): typeof TELEMETRY_CONFIG {
  return { ...TELEMETRY_CONFIG };
}

/**
 * Disable telemetry
 */
export function disableTelemetry(): void {
  TELEMETRY_CONFIG.enabled = false;
  console.log('Telemetry disabled');
}

/**
 * Enable telemetry
 */
export function enableTelemetry(): void {
  TELEMETRY_CONFIG.enabled = true;
  console.log('Telemetry enabled');
}
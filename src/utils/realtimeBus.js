/**
 * Cross-tab and Cross-window Realtime Broadcast Bus for Incidents
 * Enables instant 0ms synchronization across open tabs/windows
 */

const CHANNEL_NAME = 'abc_incidents_realtime_bus';

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  broadcastChannel = null;
}

export const broadcastIncidentEvent = (type, data) => {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type, data, timestamp: Date.now() });
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }
  }
};

export const subscribeToIncidentBus = (onEvent) => {
  if (!broadcastChannel) return () => {};

  const handler = (event) => {
    if (event?.data && onEvent) {
      onEvent(event.data);
    }
  };

  broadcastChannel.addEventListener('message', handler);
  return () => {
    try {
      broadcastChannel.removeEventListener('message', handler);
    } catch {}
  };
};

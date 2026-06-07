/**
 * Backend API client — used by mobile app for alerts and health checks.
 * Live sensor data comes from Firebase (services/firebase.ts).
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type ChannelResult = {
  success: boolean;
  sid?: string;
  error?: string;
};

type AlertResult = {
  call: ChannelResult;
  sms: ChannelResult;
};

type GasReading = {
  ppm: number;
  status: 'safe' | 'danger';
  threshold: number;
  timestamp: string;
};

type ServiceInfo = {
  service: string;
  status: string;
  version?: string;
  docs?: string;
};

type Incident = {
  id: string;
  type: 'leak';
  peakPpm: number;
  startTime: string;
  endTime?: string | null;
  status: 'active' | 'resolved';
  acknowledged?: boolean;
  ackAt?: string | null;
  ackChannel?: string | null;
  escalationLevel?: number;
  channels?: Record<string, boolean>;
  notificationsSent?: { channel: string; at: string; success: boolean }[];
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error ${res.status}`);
  }

  return res.json();
}

export const api = {
  baseUrl: API_URL,

  checkHealth: (): Promise<ServiceInfo> => request('/'),

  getGas: (): Promise<GasReading> => request('/api/gas'),

  getHistory: (limit = 20) => request(`/api/history?limit=${limit}`),

  triggerTestAlert: (ppm: number): Promise<AlertResult> =>
    request('/api/test-alert', {
      method: 'POST',
      body: JSON.stringify({ ppm }),
    }),

  triggerSafeAlert: (ppm: number): Promise<{ sms: ChannelResult }> =>
    request('/api/safe-alert', {
      method: 'POST',
      body: JSON.stringify({ ppm }),
    }),

  getActiveIncident: (): Promise<Incident | null> =>
    request('/api/incidents/active'),

  getIncidents: (limit = 30): Promise<Incident[]> =>
    request(`/api/incidents?limit=${limit}`),

  acknowledgeIncident: (
    id: string,
    channel: 'app' | 'ussd' = 'app',
  ): Promise<{ success: boolean; incident: Incident }> =>
    request(`/api/incidents/${id}/ack`, {
      method: 'POST',
      body: JSON.stringify({ channel, by: 'mobile-user' }),
    }),
};

export default api;

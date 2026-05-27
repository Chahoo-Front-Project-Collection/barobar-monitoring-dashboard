export type ReplayHttpRequest = {
  method: string;
  url: string;
  status_code?: number;
  started_at?: string;
  duration_ms?: number;
};

export type ReplayDetail = {
  id: string;
  tenant_id: string;
  error_event_id: string;
  duration_ms: number;
  created_at: string;
  error: {
    message: string;
    status_code: number;
    request_url: string;
  };
  context: {
    user: {
      user_id: string;
      user_name: string;
    };
    company: {
      company_id: string;
      company_name: string;
    };
    client: {
      browser: {
        name: string;
        version: string;
        user_agent: string;
      };
      os: {
        name: string;
        version: string;
      };
      device: {
        type: string;
      };
    };
  };
  http_requests: ReplayHttpRequest[];
  events: unknown[];
};

export type ErrorGroup = {
  id: string;
  tenant_id: string;
  message: string;
  page_url: string;
  request_url: string;
  status_code: number;
  version: string;
  environment: string;
  occurrence_count: number;
  first_seen_at: string;
  last_seen_at: string;
};

export type ErrorEvent = {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  company_id: string;
  company_name: string;
  page_url: string;
  version: string;
  environment: string;
  browser_name: string;
  browser_version: string;
  os_name: string;
  os_version: string;
  device_type: string;
  occurred_at: string;
  replay_id: string;
};

export type ErrorGroupsResponse = {
  items: ErrorGroup[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
};

export type ErrorDetail = ErrorGroup & {
  stack: string;
  events: ErrorEvent[];
};

export type ErrorGroupFilters = {
  message?: string;
  environment?: string;
  version?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
};

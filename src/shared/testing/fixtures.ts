export function createErrorGroupsFixture(overrides = {}) {
  return {
    items: [
      {
        id: "error_abc123",
        tenant_id: "demo",
        message: "Request failed with status code 500",
        page_url: "https://service.example.com/orders",
        request_url: "/api/orders",
        status_code: 500,
        version: "3.2.0",
        environment: "production",
        occurrence_count: 12,
        first_seen_at: "2026-05-27T09:00:00.000Z",
        last_seen_at: "2026-05-27T10:00:00.000Z",
      },
    ],
    pagination: {
      page: 1,
      page_size: 20,
      total: 1,
      total_pages: 1,
    },
    ...overrides,
  };
}

export function createErrorDetailFixture(overrides = {}) {
  return {
    ...createErrorGroupsFixture().items[0],
    stack: "Error: Request failed\n    at OrdersPage",
    events: [
      {
        id: "event_abc123",
        session_id: "1716790000000-abc123",
        user_id: "u_123",
        user_name: "홍길동",
        company_id: "c_001",
        company_name: "고객사A",
        page_url: "https://service.example.com/orders",
        version: "3.2.0",
        environment: "production",
        browser_name: "Chrome",
        browser_version: "125.0.0.0",
        os_name: "macOS",
        os_version: "14.5",
        device_type: "Desktop",
        occurred_at: "2026-05-27T10:00:00.000Z",
        replay_id: "replay_abc123",
      },
    ],
    ...overrides,
  };
}

export function createReplayDetailFixture(overrides = {}) {
  return {
    id: "replay_abc123",
    tenant_id: "demo",
    error_event_id: "event_abc123",
    duration_ms: 120_000,
    created_at: "2026-05-27T10:00:01.000Z",
    error: {
      message: "Request failed with status code 500",
      status_code: 500,
      request_url: "/api/orders",
    },
    context: {
      user: {
        user_id: "u_123",
        user_name: "홍길동",
      },
      company: {
        company_id: "c_001",
        company_name: "고객사A",
      },
      client: {
        browser: {
          name: "Chrome",
          version: "125.0.0.0",
          user_agent: "Mozilla/5.0",
        },
        os: {
          name: "macOS",
          version: "14.5",
        },
        device: {
          type: "Desktop",
        },
      },
    },
    http_requests: [
      {
        method: "GET",
        url: "/api/orders",
        status_code: 500,
        started_at: "2026-05-27T09:59:59.500Z",
        duration_ms: 320,
      },
    ],
    events: [],
    ...overrides,
  };
}

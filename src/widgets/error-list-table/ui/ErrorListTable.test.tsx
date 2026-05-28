import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { ErrorListTable } from "@/widgets/error-list-table";
import { createErrorGroupsFixture } from "@/shared/testing";

test("renders a fallback instead of throwing when last seen is invalid", () => {
  const data = createErrorGroupsFixture();

  render(
    <MemoryRouter>
      <ErrorListTable
        data={{
          ...data,
          items: [{ ...data.items[0], last_seen_at: "" }],
        }}
        onPageChange={vi.fn()}
      />
    </MemoryRouter>,
  );

  expect(screen.getByText("Unknown")).toBeVisible();
});

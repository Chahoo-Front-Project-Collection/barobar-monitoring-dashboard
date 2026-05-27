import { render, screen } from "@testing-library/react";

import { PlaceholderPage } from "@/app/router/PlaceholderPage";

test("renders the route placeholder title", () => {
  render(<PlaceholderPage title="Error list" />);

  expect(screen.getByRole("heading", { name: "Error list" })).toBeInTheDocument();
});

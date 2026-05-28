import { Outlet } from "react-router";

import { Header, Sidebar } from "@/app/layout";

export function App() {
  return (
    <div className="min-h-screen bg-page text-text">
      <Header />
      <Sidebar />

      <main className="min-h-screen min-w-0 pt-22 pb-6 px-10 text-text sm:pr-6 lg:pl-28 lg:pr-8">
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet } from "react-router";

import { Header, Sidebar } from "@/app/layout";

export function App() {
  return (
    <div className="min-h-screen bg-page text-text">
      <Header />
      <Sidebar />

      <main className="min-h-screen min-w-0 pb-8 pl-20 pr-4 pt-20 text-text sm:pr-6 lg:pl-38 lg:pr-8">
        <Outlet />
      </main>
    </div>
  );
}

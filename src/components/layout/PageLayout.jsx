import Sidebar from "./Sidebar";
export default function PageLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      {/* Desktop: offset by sidebar width. Mobile: offset by top bar height */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 p-4 lg:p-6 min-h-screen mt-10">
        {children}
      </main>
    </div>
  );
}

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-[#121212] font-sans selection:bg-blue-500/30">
      {/* Sidebar - Sticky and Dark */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Sticky with Blur */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-350 mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

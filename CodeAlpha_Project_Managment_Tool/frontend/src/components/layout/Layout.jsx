import { useState }   from 'react';
import { Outlet }     from 'react-router-dom';
import Sidebar        from './Sidebar';
import Navbar         from './Navbar';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────── */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* ── Main Content Area ─────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-dark-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
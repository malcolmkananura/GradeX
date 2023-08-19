import React from 'react';
import LecSidebar from '../pages/Lecturer/Lecturersidebar';
import Topbar from './Topbar';
import PageContent from './PageContent';
import { tokens } from '../theme';

const LecAppLayout = () => {
  return (
    <div style={{ display: 'flex', backgroundColor: '#DAE0E6'}}>
      {/* Sidebar */}
      <div style={{ flex: 2 }}>
        <LecSidebar />
      </div>

      {/* Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 8 }}>
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <div style={{ flex: 1 }}>
          <PageContent />
        </div>
      </div>
    </div>
  );
};

export default LecAppLayout;

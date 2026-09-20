import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Overview from './pages/Overview';
import LiveThreatMap from './pages/LiveThreatMap';
import MobileUnits from './pages/MobileUnits';
import Threats from './pages/Threats';
import SensorAnalytics from './pages/SensorAnalytics';
import ThreatPassport from './pages/ThreatPassport';
import EvidenceLedger from './pages/EvidenceLedger';
import IncidentReports from './pages/IncidentReports';
import SystemHealth from './pages/SystemHealth';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Overview />} />
          <Route path="map" element={<LiveThreatMap />} />
          <Route path="units" element={<MobileUnits />} />
          <Route path="threats" element={<Threats />} />
          <Route path="sensors" element={<SensorAnalytics />} />
          <Route path="threat-passport" element={<ThreatPassport />} />
          <Route path="evidence" element={<EvidenceLedger />} />
          <Route path="reports" element={<IncidentReports />} />
          <Route path="system" element={<SystemHealth />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

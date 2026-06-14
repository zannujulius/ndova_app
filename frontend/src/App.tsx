import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import ServicesPage from "@/features/services/ServicesPage";
import AppointmentsPage from "@/features/appointments/AppointmentsPage";
import AppointmentDetailPage from "@/features/appointments/AppointmentDetailPage";
import ServiceDetails from "@/pages/ServiceDetails";
import ComingSoonPage from "@/pages/ComingSoonPage";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#006BFF",
          borderRadius: 8,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorBgContainer: "#ffffff",
        },
        components: {
          Button: { borderRadius: 8 },
          Input: { borderRadius: 8 },
          Card: { borderRadius: 12 },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route
              path="appointments/:id"
              element={<AppointmentDetailPage />}
            />
            <Route path="services" element={<ServicesPage />} />
            <Route path="service-details/:index" element={<ServiceDetails />} />
            <Route path="users" element={<ComingSoonPage title="Users" />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

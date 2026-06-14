import { Spin, Alert, Tabs, Typography } from "antd";
import type { TabsProps } from "antd";
import { useGetClientDashboardQuery } from "./dashboardApi";
import { AllServices } from "@/components/services/AllServices";

const { Title, Text } = Typography;

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "All Services",
    children: <AllServices />,
  },
  {
    key: "2",
    label: "Your Appointments",
    children: (
      <Text type="secondary" style={{ fontSize: 14 }}>
        Your appointments will appear here.
      </Text>
    ),
  },
];

export default function ClientDashboard() {
  const { isLoading, error } = useGetClientDashboardQuery();

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message="Failed to load dashboard data." showIcon />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        {/* <Title level={4} style={{ margin: 0, color: '#1A1C1E' }}>
          Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Your appointment summary
        </Text> */}
      </div>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}

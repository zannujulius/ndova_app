import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

const { Content } = Layout;

export default function AppLayout() {
  return (
    <Layout style={{ minHeight: "100vh", background: "#F4F6FA" }}>
      <Content className="container  top-0 relative bg-white mx-auto">
        <div className="absolute h-8 top-0 bg-blue-500 w-full" />
        <div className="p-10 relative z-10">
          
          <Header />
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}

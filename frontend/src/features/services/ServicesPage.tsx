import { useState } from "react";
import {
  Table,
  Button,
  Typography,
  Space,
  Popconfirm,
  Alert,
  Spin,
  message,
} from "antd";
import type { TableColumnsType } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useListServicesQuery, useDeleteServiceMutation } from "./servicesApi";
import ServiceModal from "./ServiceModal";
import { useAppSelector } from "@/app/hooks";
import type { Service } from "@/types";

const { Title, Text } = Typography;

export default function ServicesPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const isAdmin = roles.includes("ADMIN");

  const { data, isLoading, error } = useListServicesQuery();
  const [deleteService, { isLoading: deleting }] = useDeleteServiceMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id).unwrap();
      void messageApi.success("Service deleted");
    } catch {
      void messageApi.error("Failed to delete service");
    }
  };

  const baseColumns: TableColumnsType<Service> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (val: string) => <Text strong>{val}</Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (val?: string) => val ?? <Text type="secondary">—</Text>,
    },
    {
      title: "Duration",
      dataIndex: "durationMinutes",
      key: "duration",
      width: 120,
      render: (val: number) => `${val} min`,
    },
  ];

  const adminColumns: TableColumnsType<Service> = [
    ...baseColumns,
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this service?"
            description="It will be hidden from all users."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleting}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns = isAdmin ? adminColumns : baseColumns;

  return (
    <>
      {contextHolder}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, color: "#1A1C1E" }}>
            Services
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {isAdmin
              ? "Manage available services"
              : "Browse available services"}
          </Text>
        </div>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New Service
          </Button>
        )}
      </div>

      {error && (
        <Alert
          type="error"
          message="Failed to load services"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {isLoading ? (
        <div
          style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #E8EAF0",
            overflow: "hidden",
          }}
        >
          <Table<Service>
            columns={columns}
            dataSource={data?.data ?? []}
            rowKey="id"
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            locale={{ emptyText: "No services found" }}
          />
        </div>
      )}

      <ServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        service={editing}
      />
    </>
  );
}

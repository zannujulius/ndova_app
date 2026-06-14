import { useState } from "react";
import { Button, Input, Typography, Tag } from "antd";
import {
  AppstoreOutlined,
  FilterOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { ServicesCards } from "./card/ServicesCards";
import { services } from "@/utils/sampledat";
const { Title, Text } = Typography;

export const AllServices = () => {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = services.filter((s) =>
    s.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <Title level={4} style={{ margin: 0, color: "#1A1C1E" }}>
            All Services
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Browse services available in Kigali
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<AppstoreOutlined />}
            type={view === "grid" ? "primary" : "default"}
            onClick={() => setView("grid")}
            size=""
          />
          <Button
            icon={<UnorderedListOutlined />}
            type={view === "list" ? "primary" : "default"}
            onClick={() => setView("list")}
            size=""
          />
          <Button
            className="flex items-center gap-2"
            icon={<FilterOutlined />}
            size=""
          >
            Filter
          </Button>
          <Input.Search
            placeholder="Search services"
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
            size=""
          />
        </div>
      </div>

      {/* Service pills — horizontal scroll */}
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {filtered.map((s) => {
          const isActive = selected === s.label;
          return (
            <Tag
              key={s.label}
              onClick={() => setSelected(isActive ? null : s.label)}
              color={isActive ? "blue" : "default"}
              style={{
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: "nowrap",
                border: `1.5px solid ${isActive ? "#006BFF" : "#E8EAF0"}`,
                background: isActive ? "#EEF4FF" : "#fff",
                color: isActive ? "#006BFF" : "#1A1C1E",
                userSelect: "none",
              }}
            >
              {s.emoji} {s.label}
            </Tag>
          );
        })}
      </div>
      {/* Services grid */}
      <div
        className={"grid mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"}
      >
        {[...Array(10)].map((_, idx) => (
          <ServicesCards key={idx} index={idx} />
        ))}
      </div>
    </div>
  );
};

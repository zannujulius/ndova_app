import { Rate, Tag, Typography } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { mockProviders } from "@/data/mockProviders";

const { Text } = Typography;

interface ServiceCardProps {
  index?: number;
}

export const ServicesCards = ({ index = 0 }: ServiceCardProps) => {
  const navigate = useNavigate();
  const provider = mockProviders[index % mockProviders.length];

  return (
    <div
      className="relative h-70 rounded-xl overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/service-details/${index}`)}
    >
      {/* Cover image */}
      <img
        src={provider.image}
        alt={provider.serviceType}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Gradient overlay — bottom to top */}
      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/60 to-transparent" />

      {/* Top-right badge */}
      {provider.badge && (
        <div className="absolute top-3 right-3">
          <Tag
            color={provider.badge === "Top Rated" ? "gold" : "blue"}
            className="text-[11px] rounded-full m-0"
          >
            {provider.badge}
          </Tag>
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* Stars + review count */}
        <div className="flex items-center gap-2 mb-1">
          <Rate
            disabled
            defaultValue={provider.rating}
            style={{ fontSize: 12, color: "#FADB14" }}
          />
          <Text className="text-white/75! text-[11px]">
            {provider.rating} ({provider.reviews})
          </Text>
        </div>

        {/* Service type */}
        <Text className="text-white/65! text-[11px] uppercase tracking-wider block">
          {provider.serviceType}
        </Text>

        {/* Provider name */}
        <Text strong className="text-white! text-[15px] block mt-0.5">
          {provider.providerName}
        </Text>

        {/* Location */}
        <div className="flex items-center gap-1 mt-2">
          <EnvironmentOutlined className="text-white/50! text-[11px]" />
          <Text className="text-white/50! text-[11px]">{provider.location}</Text>
        </div>
      </div>
    </div>
  );
};

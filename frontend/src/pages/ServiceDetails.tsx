import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Rate, Tag, Calendar } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { mockProviders } from "@/data/mockProviders";
import BookingConfirmModal from "@/components/services/modal/BookingConfirmModal";

const { Title, Text } = Typography;

function generateSlots(date: Dayjs): { label: string; preferred: boolean }[] {
  if (date.day() === 0 || date.day() === 6) return [];
  const slots: { label: string; preferred: boolean }[] = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (const min of [0, 30]) {
      if (hour === 17 && min === 30) continue;
      const h12 = hour % 12 || 12;
      const ampm = hour < 12 ? "am" : "pm";
      const label = `${h12}:${min === 0 ? "00" : "30"}${ampm}`;
      const preferred = (hour + min + date.date()) % 3 === 0;
      slots.push({ label, preferred });
    }
  }
  return slots;
}

export default function ServiceDetails() {
  const { index } = useParams<{ index: string }>();
  const navigate = useNavigate();

  const providerIndex = parseInt(index ?? "0", 10);
  const provider = mockProviders[providerIndex % mockProviders.length];

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const slots = selectedDate ? generateSlots(selectedDate) : [];

  const handleDateSelect = (date: Dayjs) => {
    if (date.isBefore(dayjs(), "day") || date.day() === 0 || date.day() === 6)
      return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    navigate("/appointments");
  };

  const badgeColor = provider.badge === "Top Rated" ? "gold" : "blue";

  return (
    <div className="-m-10 mt-6 grid grid-cols-4 border-t border-gray-200 bg-white">
      {/* ── LEFT: Provider details ─────────────────────────────── */}
      <div className="col-span-1 border-r border-gray-200 p-8 flex flex-col gap-4 overflow-y-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm mb-2 cursor-pointer bg-transparent border-none p-0"
        >
          <ArrowLeftOutlined className="text-xs" />
          Back
        </button>

        <img
          src={provider.image}
          alt={provider.providerName}
          className="w-20 h-20 rounded-full object-cover"
        />

        {provider.badge && (
          <Tag color={badgeColor} className="w-fit text-[11px] rounded-full">
            {provider.badge}
          </Tag>
        )}

        <div>
          <Text type="secondary" className="text-xs uppercase tracking-wider block mb-1">
            {provider.serviceType}
          </Text>
          <Title level={4} className="!m-0 !text-gray-900">
            {provider.providerName}
          </Title>
        </div>

        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-gray-400 text-sm" />
          <Text className="text-gray-600 text-sm">{provider.durationMinutes} min</Text>
        </div>

        <div className="flex items-center gap-2">
          <EnvironmentOutlined className="text-gray-400 text-sm" />
          <Text className="text-gray-600 text-sm">{provider.location}</Text>
        </div>

        <div className="flex items-center gap-2">
          <Rate disabled defaultValue={provider.rating} style={{ fontSize: 12, color: "#FADB14" }} />
          <Text className="text-gray-500 text-xs">
            {provider.rating} ({provider.reviews} reviews)
          </Text>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <Text className="text-gray-500 text-sm leading-relaxed">
            {provider.description}
          </Text>
        </div>
      </div>

      {/* ── MIDDLE: Calendar ───────────────────────────────────── */}
      <div className="col-span-2 border-r border-gray-200 p-8">
        <Title level={5} className="!mb-6 !text-gray-900">
          Select a Date &amp; Time
        </Title>

        <Calendar
          fullscreen={true}
          value={selectedDate ?? dayjs()}
          onSelect={handleDateSelect}
          disabledDate={(d) =>
            d.isBefore(dayjs(), "day") || d.day() === 0 || d.day() === 6
          }
          style={{ borderRadius: 8 }}
        />

        <div className="mt-6 flex items-center gap-2">
          <GlobalOutlined className="text-gray-400" />
          <Text className="text-gray-400 text-sm">
            East Africa Time — GMT+3 (Kigali)
          </Text>
        </div>
      </div>

      {/* ── RIGHT: Time slots ──────────────────────────────────── */}
      <div className="col-span-1 p-8 overflow-y-auto">
        {!selectedDate ? (
          <div className="flex items-center justify-center h-full">
            <Text type="secondary" className="text-sm text-center">
              Select a date on the calendar to see available times
            </Text>
          </div>
        ) : (
          <>
            <Title level={5} className="!mb-1 !text-gray-900">
              {selectedDate.format("dddd, MMMM D")}
            </Title>

            <div className="flex items-center gap-1 mb-5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              <Text className="text-gray-400 text-xs">times available</Text>
            </div>

            {slots.length === 0 ? (
              <Text type="secondary" className="text-sm">
                No availability on weekends.
              </Text>
            ) : (
              <div className="flex flex-col gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.label}
                    onClick={() => handleTimeClick(slot.label)}
                    className={`
                      w-full flex items-center justify-center gap-2 py-2.5 px-4
                      rounded-lg border text-sm font-medium cursor-pointer
                      transition-all duration-150
                      ${selectedTime === slot.label
                        ? "bg-primary border-primary text-white"
                        : "bg-white border-gray-200 text-primary hover:border-primary hover:bg-blue-50"
                      }
                    `}
                  >
                    {slot.preferred && selectedTime !== slot.label && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    )}
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Booking modal (moved to components/services/modal) ─── */}
      <BookingConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        providerName={provider.providerName}
        serviceType={provider.serviceType}
        durationMinutes={provider.durationMinutes}
      />
    </div>
  );
}

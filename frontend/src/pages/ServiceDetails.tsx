import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Calendar, Rate, Spin, Typography, message } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  ArrowLeftOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import BookingConfirmModal from "@/components/services/modal/BookingConfirmModal";
import { useGetProviderServiceQuery } from "@/features/provider-services/providerServicesApi";
import { useCreateAppointmentMutation } from "@/features/appointments/appointmentsApi";

const { Title, Text } = Typography;

function generateSlots(
  date: Dayjs,
): { label: string; value: string; preferred: boolean }[] {
  if (date.day() === 0 || date.day() === 6) return [];
  const slots: { label: string; value: string; preferred: boolean }[] = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (const min of [0, 30]) {
      if (hour === 17 && min === 30) continue;
      const h12 = hour % 12 || 12;
      const ampm = hour < 12 ? "am" : "pm";
      const label = `${h12}:${min === 0 ? "00" : "30"}${ampm}`;
      const preferred = (hour + min + date.date()) % 3 === 0;
      slots.push({
        label,
        value: `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
        preferred,
      });
    }
  }
  return slots;
}

export default function ServiceDetails() {
  const { index } = useParams<{ index: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const {
    data,
    isLoading,
    error,
  } = useGetProviderServiceQuery(index ?? "", { skip: !index });
  const [createAppointment, { isLoading: isBooking }] =
    useCreateAppointmentMutation();
  const providerService = data?.data;

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

  const handleConfirm = async (discussion?: string) => {
    if (!providerService || !selectedDate || !selectedTime) return;
    try {
      await createAppointment({
        serviceId: providerService.serviceId,
        providerId: providerService.providerId,
        requestedDate: selectedDate.format("YYYY-MM-DD"),
        requestedTime: selectedTime,
        reason: discussion,
      }).unwrap();
      setConfirmOpen(false);
      void messageApi.success("Appointment created");
      navigate("/appointments");
    } catch {
      void messageApi.error("Failed to create appointment");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-24"><Spin size="large" /></div>;
  }

  if (error || !providerService) {
    return <Alert type="error" showIcon message="Provider service not found" />;
  }

  const providerName = `${providerService.provider.firstName} ${providerService.provider.lastName}`;
  const initials = `${providerService.provider.firstName[0] ?? ""}${providerService.provider.lastName[0] ?? ""}`;

  return (
    <>
      {contextHolder}
      <div className="-m-10 mt-2 grid grid-cols-4">
      {/* ── LEFT: Provider details ─────────────────────────────── */}
      <div className="col-span-1 border-r border-gray-200 p-8 flex flex-col gap-4 overflow-y-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm mb-2 cursor-pointer bg-transparent border-none p-0"
        >
          <ArrowLeftOutlined className="text-xs" />
          Back
        </button>

        {providerService.imageUrl ? (
          <img
            src={providerService.imageUrl}
            alt={providerService.service.name}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>
        )}

        <div>
          <Text
            type="secondary"
            className="text-xs uppercase tracking-wider block mb-1"
          >
            {providerService.service.name}
          </Text>
          <Title level={4} className="!m-0 !text-gray-900">
            {providerName}
          </Title>
        </div>

        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-gray-400 text-sm" />
          <Text className="text-gray-600 text-sm">
            {providerService.durationMinutes} min
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <EnvironmentOutlined className="text-gray-400 text-sm" />
          <Text className="text-gray-600 text-sm">{providerService.location}</Text>
        </div>

        <div className="flex items-center gap-2">
          <Rate
            disabled
            value={providerService.stars}
            style={{ fontSize: 12, color: "#FADB14" }}
          />
          <Text className="text-gray-500 text-xs">
            {providerService.stars.toFixed(1)}
          </Text>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <Text className="text-gray-500 text-sm leading-relaxed">
            {providerService.description}
          </Text>
        </div>

        {providerService.meetingLink && (
          <a
            href={providerService.meetingLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-primary text-sm"
          >
            <LinkOutlined />
            Online meeting available
          </a>
        )}
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
                    onClick={() => handleTimeClick(slot.value)}
                    className={`
                      w-full flex items-center justify-center gap-2 py-2.5 px-4
                      rounded-lg border text-sm font-medium cursor-pointer
                      transition-all duration-150
                      ${
                        selectedTime === slot.value
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-200 text-primary hover:border-primary hover:bg-blue-50"
                      }
                    `}
                  >
                    {slot.preferred && selectedTime !== slot.value && (
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
        providerName={providerName}
        serviceType={providerService.service.name}
        durationMinutes={providerService.durationMinutes}
        isLoading={isBooking}
      />
      </div>
    </>
  );
}

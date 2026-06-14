import { Modal, Form, Input, Radio, Typography, Divider } from "antd";
import { useEffect } from "react";
import type { Dayjs } from "dayjs";
import {
  UserOutlined,
  MailOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "@/app/hooks";

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedDate: Dayjs | null;
  selectedTime: string | null;
  providerName: string;
  serviceType: string;
  durationMinutes: number;
}

interface BookingFormValues {
  fullName: string;
  email: string;
  sessionType: "in-person" | "online";
  location?: string;
  meetingLink?: string;
  discussion?: string;
}

export default function BookingConfirmModal({
  open,
  onClose,
  onConfirm,
  selectedDate,
  selectedTime,
  providerName,
  serviceType,
  durationMinutes,
}: Props) {
  const [form] = Form.useForm<BookingFormValues>();
  const user = useAppSelector((s) => s.auth.user);

  const sessionType = Form.useWatch("sessionType", form);

  // Pre-fill user details whenever the modal opens
  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        sessionType: "in-person",
      });
    }
    if (!open) form.resetFields();
  }, [open, user, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then(() => {
        onConfirm();
        form.resetFields();
      })
      .catch(() => {
        // validation errors shown inline
      });
  };

  return (
    <Modal
      title="Confirm your booking"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Confirm booking"
      okButtonProps={{ size: "large" }}
      cancelButtonProps={{ size: "large" }}
      width={520}
      centered
      destroyOnHide
    >
      {/* Booking summary */}
      <div className="bg-blue-50 rounded-lg px-4 py-3 mb-5 flex flex-col gap-1">
        <Text strong className="text-gray-800">
          {serviceType} — {providerName}
        </Text>
        <Text className="text-gray-500 text-sm">
          {selectedDate?.format("ddd, MMM D, YYYY")} &middot; {selectedTime} &middot;{" "}
          {durationMinutes} min
        </Text>
      </div>

      <Form form={form} layout="vertical" requiredMark={false}>
        {/* Full name */}
        <Form.Item
          label="Full name"
          name="fullName"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input prefix={<UserOutlined className="text-gray-400" />} />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input prefix={<MailOutlined className="text-gray-400" />} />
        </Form.Item>

        <Divider className="my-4" />

        {/* Session type toggle */}
        <Form.Item label="Session type" name="sessionType">
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="in-person">In Person</Radio.Button>
            <Radio.Button value="online">Online</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Conditional: In-person location */}
        {sessionType === "in-person" && (
          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Please enter a meeting location" }]}
          >
            <Input
              prefix={<EnvironmentOutlined className="text-gray-400" />}
              placeholder="e.g. Kacyiru Health Centre, Kigali"
            />
          </Form.Item>
        )}

        {/* Conditional: Online meeting link */}
        {sessionType === "online" && (
          <Form.Item
            label="Meeting link"
            name="meetingLink"
            rules={[{ required: true, message: "Please provide a meeting link" }]}
          >
            <Input
              prefix={<LinkOutlined className="text-gray-400" />}
              placeholder="https://zoom.us/j/... or meet.google.com/..."
            />
          </Form.Item>
        )}

        {/* Discussion brief */}
        <Form.Item label="What would you like to discuss?" name="discussion">
          <Input.TextArea
            rows={3}
            placeholder="Briefly describe your reason for booking this appointment…"
            prefix={<MessageOutlined />}
            style={{ resize: "none" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

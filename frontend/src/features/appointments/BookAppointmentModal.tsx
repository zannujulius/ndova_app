import { Modal, Form, Select, DatePicker, TimePicker, Input, Alert, Button } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { useCreateAppointmentMutation } from './appointmentsApi';
import { useListServicesQuery } from '@/features/services/servicesApi';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  serviceId: string;
  requestedDate: Dayjs;
  requestedTime: Dayjs;
  reason?: string;
}

export default function BookAppointmentModal({ open, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [create, { isLoading, error }] = useCreateAppointmentMutation();
  const { data: servicesData } = useListServicesQuery();

  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

  const onFinish = async (values: FormValues) => {
    try {
      await create({
        serviceId: values.serviceId,
        requestedDate: values.requestedDate.format('YYYY-MM-DD'),
        requestedTime: values.requestedTime.format('HH:mm'),
        reason: values.reason,
      }).unwrap();
      onClose();
    } catch {
      // error shown via error state
    }
  };

  const apiError =
    error && 'data' in error
      ? (error.data as { message?: string }).message
      : undefined;

  const serviceOptions = (servicesData?.data ?? []).map((s) => ({
    value: s.id,
    label: `${s.name} (${s.durationMinutes} min)`,
  }));

  return (
    <Modal title="Book Appointment" open={open} onCancel={onClose} footer={null} destroyOnHide>
      {apiError && (
        <Alert message={apiError} type="error" showIcon style={{ marginBottom: 16 }} />
      )}

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          label="Service"
          name="serviceId"
          rules={[{ required: true, message: 'Please select a service' }]}
        >
          <Select
            placeholder="Select a service"
            options={serviceOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Preferred Date"
          name="requestedDate"
          rules={[{ required: true, message: 'Please pick a date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="MMM D, YYYY"
            disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
          />
        </Form.Item>

        <Form.Item
          label="Preferred Time"
          name="requestedTime"
          rules={[{ required: true, message: 'Please pick a time' }]}
        >
          <TimePicker
            style={{ width: '100%' }}
            format="HH:mm"
            minuteStep={15}
          />
        </Form.Item>

        <Form.Item label="Reason (optional)" name="reason">
          <Input.TextArea
            rows={3}
            placeholder="Describe why you need this appointment…"
            style={{ resize: 'none' }}
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Book appointment
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

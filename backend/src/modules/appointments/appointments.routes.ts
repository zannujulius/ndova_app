import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createAppointmentSchema,
  approveAppointmentSchema,
  rejectAppointmentSchema,
  cancelAppointmentSchema,
  completeAppointmentSchema,
} from "./appointments.validation";
import * as appointmentsController from "./appointments.controller";

const router = Router();

// All appointment routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create appointment request (CLIENT only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceId, providerId, scheduledAt]
 *             properties:
 *               serviceId:
 *                 type: string
 *                 format: uuid
 *               providerId:
 *                 type: string
 *                 format: uuid
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden (not client)
 */
router.post(
  "/",
  authorize("CLIENT"),
  validate(createAppointmentSchema),
  appointmentsController.createAppointment,
);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: List appointments (role-scoped)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments visible to user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 */
router.get("/", appointmentsController.listAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment details
 *       403:
 *         description: Forbidden (not authorized to view)
 *       404:
 *         description: Appointment not found
 */
router.get("/:id", appointmentsController.getAppointmentById);

/**
 * @swagger
 * /appointments/{id}/history:
 *   get:
 *     summary: Get appointment status change history
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Status change history
 *       404:
 *         description: Appointment not found
 */
router.get("/:id/history", appointmentsController.getAppointmentHistory);

/**
 * @swagger
 * /appointments/{id}/approve:
 *   patch:
 *     summary: Approve appointment (PROVIDER/ADMIN only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment approved
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Forbidden
 */
router.patch(
  "/:id/approve",
  authorize("ADMIN", "PROVIDER"),
  validate(approveAppointmentSchema),
  appointmentsController.approveAppointment,
);

/**
 * @swagger
 * /appointments/{id}/reject:
 *   patch:
 *     summary: Reject appointment (PROVIDER/ADMIN only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment rejected
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Forbidden
 */
router.patch(
  "/:id/reject",
  authorize("ADMIN", "PROVIDER"),
  validate(rejectAppointmentSchema),
  appointmentsController.rejectAppointment,
);

/**
 * @swagger
 * /appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Forbidden
 */
router.patch(
  "/:id/cancel",
  validate(cancelAppointmentSchema),
  appointmentsController.cancelAppointment,
);

/**
 * @swagger
 * /appointments/{id}/complete:
 *   patch:
 *     summary: Mark appointment as completed (PROVIDER/ADMIN only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment marked completed
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Forbidden
 */
router.patch(
  "/:id/complete",
  authorize("ADMIN", "PROVIDER"),
  validate(completeAppointmentSchema),
  appointmentsController.completeAppointment,
);

export default router;

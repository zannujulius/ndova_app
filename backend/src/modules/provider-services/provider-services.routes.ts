import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as controller from './provider-services.controller';
import {
  createProviderServiceSchema,
  updateProviderServiceSchema,
} from './provider-services.validation';

const router = Router();

router.get('/', controller.listProviderServices);
router.get('/mine', authenticate, authorize('PROVIDER'), controller.listMyProviderServices);
router.get('/:id', controller.getProviderServiceById);
router.post(
  '/',
  authenticate,
  authorize('PROVIDER'),
  validate(createProviderServiceSchema),
  controller.createProviderService
);
router.patch(
  '/:id',
  authenticate,
  authorize('PROVIDER'),
  validate(updateProviderServiceSchema),
  controller.updateProviderService
);
router.delete(
  '/:id',
  authenticate,
  authorize('PROVIDER'),
  controller.deleteProviderService
);

export default router;

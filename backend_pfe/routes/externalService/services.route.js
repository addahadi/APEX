import express from 'express';
import { getAllServices, getServiceFormulas, addService, updateService, deleteService } from '../../controllers/externalService/service.controller.js';
import authenticate from '../../middlewares/authenticate.js';
import { requireRole } from '../../middlewares/requireRole.js';

const router = express.Router();

// Public read — services needed for estimation previews
router.get('/', getAllServices);

// Formulas that can be linked to services (admin dropdown)
router.get('/service-formulas', authenticate, requireRole('ADMIN'), getServiceFormulas);

// Admin only — manage labor/installation service catalog
router.post('/', authenticate, requireRole('ADMIN'), addService);
router.put('/:id', authenticate, requireRole('ADMIN'), updateService);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteService);

export default router;

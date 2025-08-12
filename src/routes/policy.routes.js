import express from 'express';
import { createOrUpdatePolicy, getPolicyByReferenceWebsite } from '../controller/policy.controller.js';

const router = express.Router();

// Route to create or update a policy
router.post('/', createOrUpdatePolicy);

// Route to get policy by reference website
router.get('/:referenceWebsite', getPolicyByReferenceWebsite);

export default router;

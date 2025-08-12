import express from 'express'
import { VendorController } from '../controller/vendor.controller.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { verifyToken } from '../middleware/verifyToken.js';

const routes = express.Router();

routes.route("/vendor-request").patch(verifyToken, VendorController.VendorRequest);

routes.route("/update-vendor-request/:userId").patch(isAdmin, VendorController.AcceptVendorRequest);

routes.route("/incoming-vendor-requests").get(isAdmin, VendorController.incomingVendorRequests);

export default routes;
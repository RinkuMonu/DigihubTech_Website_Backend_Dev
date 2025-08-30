import express from "express";
import { createOrder, getOrdersByReferenceWebsite, getOrdersByUser, getOrder, updateOrderStatus, deleteOrder, getSalesOverview } from "../controller/order.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";

const orderRoutes = express.Router();

orderRoutes.post("/order", verifyToken, createOrder);
orderRoutes.get("/orders", verifyToken, getOrdersByUser);
orderRoutes.get("/orders/:id", getOrder);
orderRoutes.put("/orders/:id/status", updateOrderStatus);
orderRoutes.delete("/orders/:id", isAdmin, deleteOrder);
orderRoutes.get("/allorders", isAdmin, getOrdersByReferenceWebsite)
orderRoutes.get("/", isAdmin, getSalesOverview);


export default orderRoutes;

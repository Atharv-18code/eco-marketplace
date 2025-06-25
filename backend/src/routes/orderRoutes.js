// server/src/routes/orderRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// Create Order (Buyer Only)
router.post("/", authenticate, async (req, res) => {
  const { products, shippingMethod, roundUpDonation } = req.body;

  // Calculate carbon offset (example: 200g per product)
  const carbonOffset = products.length * 200;

  const order = await prisma.order.create({
    data: {
      buyerId: req.user.id,
      products: JSON.stringify(products),
      carbonOffset,
      shippingMethod,
      roundUpDonation,
    },
  });

  // Update user's green points
  await prisma.user.update({
    where: { id: req.user.id },
    data: { greenPoints: { increment: 10 } }, // +10 points per order
  });

  res.status(201).json(order);
});

export default router;
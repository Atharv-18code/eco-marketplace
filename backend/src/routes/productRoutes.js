// server/src/routes/productRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get All Products (Public)
router.get("/", async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isApproved: true },
    include: { seller: { select: { name: true } } },
  });
  res.json(products);
});

// Create Product (Seller Only)
router.post("/", authenticate, authorize(["seller"]), async (req, res) => {
  const { name, description, price, carbonScore, tags } = req.body;
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      carbonScore,
      tags,
      sellerId: req.user.id,
    },
  });
  res.status(201).json(product);
});

// Approve Product (Admin Only)
router.patch("/:id/approve", authenticate, authorize(["admin"]), async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { isApproved: true },
  });
  res.json(product);
});

export default router;
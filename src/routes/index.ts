import { Router } from "express";
import RoutesRegistry from "./registry";

const router = Router();

router.use("/auth", RoutesRegistry.AuthRoutes);
router.use("/attendance", RoutesRegistry.AttendanceRoutes);

export default router;

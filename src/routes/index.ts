import { Router } from "express";
import RoutesRegistry from "./registry";

const router = Router();

router.use("/auth", RoutesRegistry.AuthRoutes);
router.use("/attendance", RoutesRegistry.AttendanceRoutes);
router.use("/users", RoutesRegistry.UserRoutes);
router.use("/books", RoutesRegistry.BookRoutes);
router.use("/profile", RoutesRegistry.ProfileRoutes);

export default router;

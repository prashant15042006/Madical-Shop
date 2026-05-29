import { Router, type IRouter } from "express";
import healthRouter from "./health";
import shopRouter from "./shop";
import medicinesRouter from "./medicines";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(shopRouter);
router.use(medicinesRouter);
router.use(ordersRouter);

export default router;

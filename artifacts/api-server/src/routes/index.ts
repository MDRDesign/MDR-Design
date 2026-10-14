import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inquiriesRouter from "./inquiries";
import studioMediaRouter from "./studioMedia";

const router: IRouter = Router();

router.use(healthRouter);
router.use(inquiriesRouter);
router.use(studioMediaRouter);

export default router;

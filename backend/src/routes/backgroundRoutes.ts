import express from "express";
import { getBackgroundByFilename, getBackgroundImageByFilename } from "../controllers/backgroundController";

const router = express.Router();

router.get("/filename/:filename", getBackgroundByFilename);
router.get("/filename/:filename/image", getBackgroundImageByFilename);

export default router;
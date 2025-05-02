import express from "express";
import { getRaceByNameAndGender, getRaceImageByNameAndGender } from "../controllers/raceController";

const router = express.Router();

router.get("/name/:name/gender/:gender", getRaceByNameAndGender);
router.get("/name/:name/gender/:gender/image", getRaceImageByNameAndGender);

export default router;
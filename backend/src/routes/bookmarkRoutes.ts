import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
} from "../controllers/bookmarkController";

const router = Router();
router.use(verifyToken);

router.post("/", addBookmark);
router.delete("/:jobId", removeBookmark);
router.get("/", getBookmarks);

export default router;

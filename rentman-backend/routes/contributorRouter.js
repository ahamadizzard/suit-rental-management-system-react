import express from "express";
import {
  createContributor,
  deleteContributor,
  getContributor,
  getContributorById,
  updateContributor,
} from "../controllers/inventory/contributorController.js";

const contributorRouter = express.Router();

contributorRouter.get("/", getContributor);
contributorRouter.post("/", createContributor);
contributorRouter.get("/:id", getContributorById);
contributorRouter.put("/:id", updateContributor);
contributorRouter.delete("/:id", deleteContributor);

export default contributorRouter;

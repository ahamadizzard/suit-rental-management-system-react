import express from "express";
import { getCompanyInfo } from "../controllers/companyInfoController.js";

const companyInfoRouter = express.Router();

companyInfoRouter.get("/companyInfo", getCompanyInfo);

export default companyInfoRouter;

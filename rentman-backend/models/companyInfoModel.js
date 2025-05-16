import mongoose from "mongoose";

const companyInfoSchema = new mongoose.Schema({
  id: { type: Number },
  companyName: { type: String, required: true },
  companyAddress: { type: String, required: true },
  companyTel1: { type: String, required: true },
  companyTel2: { type: String },
  companyEmail: { type: String, required: true },
  companyLogo: { type: String },
  companyRegNo: { type: String },
  companyTaxNo: { type: String },
  companyBankName: { type: String },
  companyBankBranch: { type: String },
  companyBankAccountNo: { type: String },
  companyWebsite: { type: String },
  companyFacebook: { type: String },
  companyInstagram: { type: String },

  companyWhatsApp: { type: String },
  companySlogan: { type: String },
  footerText1: { type: String },
  footerText2: { type: String },
  footerText3: { type: String },
  greetingText: { type: String }, // for the welcome page
});

const CompanyInfo = mongoose.model("companyinfo", companyInfoSchema);

export default CompanyInfo;

import CompanyInfo from "../../models/companyInfoModel.js";

// Controller functions for CompanyInfo
exports.getCompanyInfo = async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.find();
    res.status(200).json(companyInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCompanyInfo = async (req, res) => {
  try {
    const newCompanyInfo = new CompanyInfo(req.body);
    await newCompanyInfo.save();
    res.status(201).json(newCompanyInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

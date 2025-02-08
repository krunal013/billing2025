const Company = require('../models/companyModel');

exports.getCompanies = async (req, res) => {
    const companies = await Company.find();
    res.json(companies);
};

exports.addCompany = async (req, res) => {
    const { name, address, contact } = req.body;
    const newCompany = new Company({ name, address, contact });
    await newCompany.save();
    res.status(201).json(newCompany);
};

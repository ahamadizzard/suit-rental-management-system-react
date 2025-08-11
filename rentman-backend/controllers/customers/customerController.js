import CustomerMaster from "../../models/customers/customersModel.js";

// create customer
export const createCustomer = async (req, res) => {
  try {
    const {
      customerName,
      customerAddress,
      customerEmail,
      customerTel1,
      customerTel2,
      customerJoinedDate,
    } = req.body;
    const customer = await CustomerMaster.create({
      customerName,
      customerAddress,
      customerEmail,
      customerTel1,
      customerTel2,
      customerJoinedDate,
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await CustomerMaster.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get customer by id
export const getCustomerById = async (req, res) => {
  try {
    const customer = await CustomerMaster.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update customer
export const updateCustomer = async (req, res) => {
  try {
    const customer = await CustomerMaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await CustomerMaster.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get customer by name
export const getCustomerByName = async (req, res) => {
  try {
    const customer = await CustomerMaster.findOne({
      customerName: req.params.name,
    });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get customer by email
export const getCustomerByEmail = async (req, res) => {
  try {
    const customer = await CustomerMaster.findOne({
      customerEmail: req.params.email,
    });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get customer by telephone
export const getCustomerByTele = async (req, res) => {
  try {
    const customer = await CustomerMaster.findOne({
      // if customerTele1 is not found, then search for customerTele2
      $or: [
        { customerTele1: req.params.tele },
        { customerTele2: req.params.tele },
      ],
    });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get customer by isBlocked
export const getCustomerByIsBlocked = async (req, res) => {
  try {
    const customer = await CustomerMaster.findOne({
      isBlocked: req.params.isBlocked,
    });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export async function searchCustomers(req, res) {
  const searchQuery = req.params.query;
  try {
    const customers = await CustomerMaster.find({
      $or: [
        { customerName: { $regex: searchQuery, $options: "i" } },
        { customerEmail: { $regex: searchQuery, $options: "i" } },
        { customerAddress: { $regex: searchQuery, $options: "i" } },
        { customerTel1: { $regex: searchQuery, $options: "i" } },
        { customerTel2: { $regex: searchQuery, $options: "i" } },
      ],
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

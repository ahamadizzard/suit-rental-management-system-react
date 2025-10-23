import Employees from "../../models/employee/employeesModel.js";

export async function createEmployee(req, res) {
  try {
    const employee = new Employees({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      nic: req.body.nic,
      telephone1: req.body.telephone1,
      telephone2: req.body.telephone2,
      address: req.body.address,
      joinedDate: req.body.joinedDate,
      salary: req.body.salary,
      imgURL: req.body.imgURL,
      department: req.body.department,
      designation: req.body.designation,
      status: req.body.status,
    });
    await employee.save();

    res.status(201).json({ message: "Employee created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create employee" });
  }
}
export async function getAllEmployees(req, res) {
  try {
    const employees = await Employees.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
}

// get employee by id
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employees.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update employee
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employees.findOneAndUpdate(
      { employeeId: req.params.id },
      req.body,
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employees.findOneAndDelete({
      employeeId: req.params.id,
    });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get employee by name
export const getEmployeeByName = async (req, res) => {
  try {
    const employee = await Employees.findOne({
      $or: [{ firstName: req.params.name }, { lastName: req.params.name }],
    });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get employee by email
export const getEmployeeByEmail = async (req, res) => {
  try {
    const employee = await Employees.findOne({
      email: req.params.email,
    });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get employee by telephone
export const getEmployeeByTele = async (req, res) => {
  try {
    const employee = await Employees.findOne({
      // if customerTele1 is not found, then search for customerTele2
      $or: [{ telephone1: req.params.tele }, { telephone2: req.params.tele }],
    });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get customer by isBlocked
// export const getCustomerByIsBlocked = async (req, res) => {
//   try {
//     const customer = await CustomerMaster.findOne({
//       isBlocked: req.params.isBlocked,
//     });
//     if (!customer) {
//       return res.status(404).json({ error: "Customer not found" });
//     }
//     res.status(200).json(customer);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

export async function searchEmployees(req, res) {
  const searchQuery = req.params.query;
  try {
    const employees = await Employees.find({
      $or: [
        { firstName: { $regex: searchQuery, $options: "i" } },
        { lastName: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
        { address: { $regex: searchQuery, $options: "i" } },
        { telephone1: { $regex: searchQuery, $options: "i" } },
        { telephone2: { $regex: searchQuery, $options: "i" } },
      ],
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

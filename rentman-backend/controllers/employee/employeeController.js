import Employees from "../../models/employee/employeesModel";

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

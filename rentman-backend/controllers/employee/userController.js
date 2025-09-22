import User from "../../models/employee/usersModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function isAdmin(req) {
  if (req.user == null) {
    return false;
  }
  // Check if the user is authenticated and has the role of admin
  if (req.user.role != "admin") {
    return false;
  }
  return true;
}

export function createUser(req, res) {
  if (req.body.role == "admin") {
    if (req.user != null) {
      if (req.user.role != "admin") {
        res.status(403).json({
          message:
            "You are not authorized to create an admin account, please login as an admin",
        });
        return;
      }
    } else {
      res.status(403).json({
        message:
          "You are not authorized to create an admin account, please login first",
      });
      return;
    }
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const user = new User({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hashedPassword,
    role: req.body.role, // "admin" , "cashier" or "manager"
    imgURL: req.body.imgURL,
  });
  user
    .save()
    .then(() => {
      res.status(201).json({ message: "User created successfully" });
    })
    .catch((error) => {
      res.status(400).json({ error: error.message });
      console.log(error);
    });
}

export function loginUser(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then((user) => {
    if (user == null) {
      res.status(404).json({ message: "User not found" });
    } else {
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (isPasswordValid) {
        // generate token and send it to the client
        const token = jwt.sign(
          {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            imgURL: user.imgURL,
          },
          process.env.JWT_TOKEN_SECRET
        );
        res.json({
          message: "Login Successfull",
          token: token,
          role: user.role,
          firstName: user.firstName,
          user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            imgURL: user.imgURL,
          },
        });
        // res.status(200).json({ message: "Login successful" });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    }
  });
}

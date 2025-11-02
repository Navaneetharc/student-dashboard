import express from "express";
import { StudentController } from "../controllers/student.controller";
import { StudentService } from "../services/student.service";
import { isStudentAuthenticated } from "../middlewares/auth";

const router = express.Router();
const studentService = new StudentService();
const studentController = new StudentController(studentService);

router.get("/signin", studentController.renderSignin.bind(studentController));
router.post("/signin", studentController.handleSignin.bind(studentController));

router.get("/signup", studentController.renderSignup.bind(studentController));
router.post("/signup", studentController.handleSignup.bind(studentController));

router.get("/home", isStudentAuthenticated, studentController.renderHome.bind(studentController));
router.get("/logout", isStudentAuthenticated, studentController.logout.bind(studentController));


export default router;
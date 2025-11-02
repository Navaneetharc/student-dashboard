
import { Request, Response } from "express";
import { StudentService } from "../services/student.service";
import { CreateStudentRequest } from "../types/student.types";
import { studentSignupSchema } from "../validations/student.validation";
import bcrypt from "bcryptjs";
import { title } from "process";
import { error } from "console";


export class StudentController {
  constructor(private studentService: StudentService) {}

  renderSignin(req: Request, res: Response) {
    if((req.session as any)?.student){
      return res.redirect("/home");
    }
    res.setHeader("Cache-Control", "no-store");
    res.render("student/signin", { title: "Student Sign In", error: null, message: null });
  }

  renderSignup(req: Request, res: Response) {
    if((req.session as any)?.student){
      return res.redirect("/home");
    }
    res.setHeader("Cache-Control", "no-store");
    res.render("student/signup", { title: "Student Sign Up", error: null, message: null });
  }

  async handleSignup(req: Request<{}, {}, CreateStudentRequest>,res: Response): Promise<void> {

  const parsed = studentSignupSchema.safeParse(req.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues?.[0]?.message || "Invalid input.";
    console.log("Validation error:", parsed.error.issues);
    res.status(400).render("student/signup", {
      title: "Student Sign Up",
      error: firstError,
      message: null,
    });
    return;
  }

  try {
    const { fullName, email, password, dob, gender } = parsed.data;

    const student = await this.studentService.create({
      fullName,
      email,
      password,
      dob: new Date(dob),
      gender,
    });

    (req.session as any).student = {
      id: student._id,
      fullName: student.fullName,
      email: student.email,
    };


    res.render("student/signup",{
      title: "Student Sign up",
      message: "Account created successfully",
      error: null,
    });

  } catch (error: any) {
    console.error("Signup error:", error);

    res.status(400).render("student/signup", {
      title: "Student Sign Up",
      error: error.message || "Something went wrong",
      message: null,
    });
    return; 
  }
}


 async handleSignin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const student = await this.studentService.findByEmail(email);
    if (!student) {
      return res.status(400).render("student/signin", {
        title: "Student Sign In",
        error: "Invalid email or password",
        message: null,
      });
    }

    if(student.isBlocked){
      return res.status(403).render("student/signin",{
        title: "Student Sign In",
        error: "Your account has been blocked. May unblock after few days but not sure.",
        message: null,
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).render("student/signin", {
        title: "Student Sign In",
        error: "Invalid email or password",
        message: null,
      });
    }

    (req.session as any).student = {
      id: student._id,
      fullName: student.fullName,
      email: student.email,
    };

    return res.render("student/signin",{
      title: "Student Sign In",
      message: `Welcome back, ${student.fullName}!`,
      error: null,
    })
    

  } catch (error: any) {
    console.error("Signin error:", error.message);
    return res.status(500).render("student/signin", {
      title: "Student Sign In",
      error: "Something went wrong. Please try again.",
      message: null,
    });
  }
}

  logout(req: Request, res: Response) {
    delete (req.session as any).student;
  
    req.session.save((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).send("Logout failed");
      }
    
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma","no-cache");
    res.setHeader("Expires","0");

    res.clearCookie('connect.sid');

    return res.redirect("/signin");
    });
  }

  renderHome(req: Request, res: Response) {
    const student = (req.session as any).student;
    if (!student) return res.redirect("/signin");

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.render("student/home", { title: "Home", student });
  }
}

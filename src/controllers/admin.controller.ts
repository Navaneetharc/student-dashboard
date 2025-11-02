import { Request,Response } from "express";
import { StudentService } from "../services/student.service";
import { studentSignupSchema } from "../validations/student.validation";
import { CreateStudentRequest } from "../types/student.types";
import dotenv from "dotenv";
import Student from "../models/student.model";



dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const studentService = new StudentService();
export class AdminController{
    async handleAdminSignin(req: Request, res: Response): Promise<void> {
        try {
            const {email, password} = req.body;

            if(email === ADMIN_EMAIL && password === ADMIN_PASSWORD){
                (req.session as any).admin = {
                    id: "admin",
                    email: ADMIN_EMAIL,
                };
                return res.render("admin/login",{
                    title: "Admin Log In",
                    message: "Welcom back, BOSS",
                    error: null,
                })
                }else{
                    return res.status(400).render("admin/login",{
                        title: "Admin Log In",
                        error: "Invalid email or password",
                        message: null,
                    });
                }
        } catch (error:any) {
            console.error("Admin login error: ",error.message);
            return res.status(500).render("admin/login",{
                title: "Admin Log In",
                error: "Something went wrong. Please try again.",
                message: null,
            });
        }
    }

    logout(req: Request, res: Response){

       delete (req.session as any).admin;
  
        req.session.save((err) => {
            if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Logout failed");
            }

            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
            res.setHeader("Pragma","no-cache");
            res.setHeader("Expires","0");

            res.clearCookie('connect.sid');

            return res.redirect("/admin/login");
        });
    }

    async renderDashboard(req: Request, res: Response) {
        try {
            const admin = (req.session as any).admin;
            if (!admin) return res.redirect("/admin/login");

            const students = await Student.find().sort({createdAt: -1}).lean();

            const totalStudents = students.length;
            const blockedCount = students.filter((s) => s.isBlocked).length;
            const activeCount = totalStudents - blockedCount;

            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");

            res.render("admin/dashboard", { 
                title: "Admin dashboard", 
                admin,
                students,
                stats: {
                    total: totalStudents,
                    active: activeCount,
                    blocked: blockedCount,
                },
             });
        } catch (error) {
            console.error("Error loading dashboard:",error);
            res.status(500).send("Error loading dashboard");
        }
    }

    async addNewStudent(req: Request<{},{}, CreateStudentRequest>,res: Response): Promise<void> {
        const parsed = studentSignupSchema.safeParse(req.body);
        console.log("Incoming student data:", req.body);
        if(!parsed.success){
            const firstError = parsed.error.issues?.[0]?.message || "Invalid input.";
            console.log("Validation error:", parsed.error.issues);

            const students = await Student.find().sort({ createdAt: -1 }).lean();
            const totalStudents = students.length;
            const blockedCount = students.filter((s) => s.isBlocked).length;
            const activeCount = totalStudents - blockedCount;

            res.status(400).json({
            success: false,
            error: firstError
            });
            return;
        }

        try {
            const {fullName, email, password, dob, gender} = parsed.data;

            const existingStudent = await Student.findOne({ email });
            if (existingStudent) {
                res.status(400).json({
                success: false,
                error: "A student with this email already exists."
            });
            return;
            }

            const student = await studentService.create({
                fullName,
                email,
                password,
                dob: new Date(dob),
                gender,
            })

            console.log("New student added by admin:", student.email);

            res.status(200).json({
            success: true,
            message: "Student added successfully 🎉",
            student: {
                id: student._id,
                fullName: student.fullName,
                email: student.email
            }
        });
        } catch (error: any) {
            console.error("Add Student Error:", error);
            res.status(500).render("admin/dashboard", {
            title: "Admin Dashboard",
            admin: (req.session as any).admin,
            error: "Internal server error. Please try again.",
            message: null,
            students: [],
            stats: { total: 0, active: 0, blocked: 0 },
            });
        }
    }

    async toggleStudentStatus(req: Request, res: Response): Promise<void> {
        try {
            const {studentId} = req.params;

            const student = await Student.findById(studentId);

            if(!student){
                res.status(404).json({ success: false, message: "Student not found" });
                return;
            }
            student.isBlocked = !student.isBlocked;
            await student.save();

            console.log("Student status updated:", student.isBlocked);

            res.status(200).json({
            success: true,
            message: `Student ${student.isBlocked ? "blocked" : "unblocked"} successfully`,
            newStatus: student.isBlocked,
            });
            return;

        } catch (error) {
            console.error("Toggle status error:",error);
            res.status(500).json({success: false, message: "internally server error"});
        }
    }

    async getStudent(req: Request, res: Response): Promise<void> {
        try {
            const { studentId } = req.params;
            if (!studentId) {
                    res.status(400).json({
                        success: false,
                        error: "Student ID is required"
                    });
                    return;
                }
            const student = await studentService.findById(studentId);

            if (!student) {
                res.status(404).json({
                    success: false,
                    error: "Student not found"
                });
                return;
            }

            res.status(200).json({
                success: true,
                student: {
                    _id: student._id,
                    fullName: student.fullName,
                    email: student.email,
                    dob: student.dob,
                    gender: student.gender,
                    isBlocked: student.isBlocked
                }
            });
        } catch (error: any) {
            console.error("Get Student Error:", error);
            res.status(500).json({
                success: false,
                error: "Internal server error"
            });
        }
    }


    async updateStudent(req: Request, res: Response): Promise<void> {
        const parsed = studentSignupSchema.safeParse(req.body);
        
        if (!parsed.success) {
            const firstError = parsed.error.issues?.[0]?.message || "Invalid input.";
            console.log("Validation error:", parsed.error.issues);
            
            res.status(400).json({
                success: false,
                error: firstError
            });
            return;
        }

        try {
            const { studentId } = req.params;
            
            if (!studentId) {
                res.status(400).json({
                    success: false,
                    error: "Student ID is required"
                });
                return;
            }

            const { fullName, email, password, dob, gender } = parsed.data;

            const student = await studentService.findById(studentId);
            
            if (!student) {
                res.status(404).json({ 
                    success: false, 
                    error: "Student not found" 
                });
                return;
            }

            if (email !== student.email) {
                const existingStudent = await studentService.findByEmail(email);
                if (existingStudent) {
                    res.status(400).json({
                        success: false,
                        error: "A student with this email already exists."
                    });
                    return;
                }
            }

            const updatedStudent = await studentService.update(studentId, {
                fullName,
                email,
                password,
                dob: new Date(dob),
                gender,
            });

            console.log("Student updated by admin:", updatedStudent?.email);

            res.status(200).json({
                success: true,
                message: "Student updated successfully ✨",
                student: {
                    id: updatedStudent?._id,
                    fullName: updatedStudent?.fullName,
                    email: updatedStudent?.email,
                    dob: updatedStudent?.dob,
                    gender: updatedStudent?.gender
                }
            });
        } catch (error: any) {
            console.error("Update Student Error:", error);
            res.status(500).json({
                success: false,
                error: "Internal server error. Please try again."
            });
        }
    }
    async deleteStudent(req: Request, res: Response): Promise<void> {
        try {
            const { studentId } = req.params;

            if (!studentId) {
                res.status(400).json({
                    success: false,
                    error: "Student ID is required"
                });
                return;
            }

            const student = await studentService.findById(studentId);

            if (!student) {
                res.status(404).json({
                    success: false,
                    error: "Student not found"
                });
                return;
            }

            await studentService.delete(studentId);

            console.log("Student deleted by admin:", student.email);

            res.status(200).json({
                success: true,
                message: `Student "${student.fullName}" deleted successfully`
            });
        } catch (error: any) {
            console.error("Delete Student Error:", error);
            res.status(500).json({
                success: false,
                error: "Internal server error. Please try again."
            });
        }
    }
}

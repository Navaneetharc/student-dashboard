import express from "express";
import { AdminController} from "../controllers/admin.controller";
import { isAdminAuthenticated } from "../middlewares/auth";



const router = express.Router();
const adminController = new AdminController();

router.get("/login",(req,res)=>{
    if((req.session as any)?.admin) {
        return res.redirect("/admin/dashboard");
    }
    res.setHeader("Cache-Control", "no-store");
    res.render("admin/login",{
        title: "Admin Login",
        error: null,
        message: null
    });
});

router.post("/login", adminController.handleAdminSignin.bind(adminController));

router.get("/dashboard", isAdminAuthenticated, adminController.renderDashboard.bind(adminController));
router.get("/logout", isAdminAuthenticated, adminController.logout.bind(adminController));

router.get("/check-session", (req, res) => {
    const admin = (req.session as any)?.admin;
    if(admin){
        res.status(200).json({ valid: true });
    }else{
        res.status(401).json({ valid: false });
    }
});



router.post("/dashboard", isAdminAuthenticated, adminController.addNewStudent.bind(adminController));
router.patch("/students/:studentId/toggle", isAdminAuthenticated, adminController.toggleStudentStatus.bind(adminController));

router.get('/students/:studentId', adminController.getStudent.bind(adminController));

router.put('/students/:studentId', adminController.updateStudent.bind(adminController));

router.delete('/students/:studentId', adminController.deleteStudent.bind(adminController));

export default router;
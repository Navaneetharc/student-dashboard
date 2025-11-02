import { Request,Response,NextFunction } from "express";

export const isStudentAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if((req.session as any)?.student){
        return next();
    }
    return res.redirect("/signin");
};

export const isAdminAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if((req.session as any)?.admin){
        return next();
    }
    return res.redirect("/admin/login");
};


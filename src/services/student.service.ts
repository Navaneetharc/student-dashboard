import { BaseService } from "./base.service";
import Student, { IStudent } from "../models/student.model";
import bcrypt from "bcryptjs";

export class StudentService extends BaseService<IStudent>{
    async create(data: Partial<IStudent>): Promise<IStudent> {
        const existing = await Student.findOne({ email: data.email });
        if (existing) throw new Error("Email already exists");

        const hashedPassword = await bcrypt.hash(data.password!, 10);

        const newStudent = new Student({ ...data, password: hashedPassword });
        return await newStudent.save();
    }

    async findAll(): Promise<IStudent[]> {
        return await Student.find();
    }

    async update(id: string, updates: Partial<IStudent>): Promise<IStudent | null> {
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        return await Student.findByIdAndUpdate(id, updates, { new: true });
    }

    async delete(id: string): Promise<IStudent | null> {
        return await Student.findByIdAndDelete(id);
    }
    async findByEmail(email: string): Promise<IStudent | null>{
        return await Student.findOne({email});
    }
    async findById(id: string): Promise<IStudent | null> {
        return await Student.findById(id);
    }
}

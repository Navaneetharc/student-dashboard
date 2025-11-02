import Student, {IStudent} from "../models/student.model";

export class studentRepository {
    async create(studentData: Partial<IStudent>): Promise<IStudent>{
        const student = new Student(studentData);
        return student.save();
    }

    async findEmail(email: string): Promise<IStudent | null> {
        return Student.findOne({email});
    }

    async findById(id: string): Promise<IStudent | null > {
        return Student.findById(id);
    }

    async update(id: string, updateData: Partial<IStudent>): Promise<IStudent | null> {
        return Student.findByIdAndUpdate(id,updateData, {new: true});
    }

    async findAll(): Promise<IStudent[]> {
        return Student.find();
    }
}
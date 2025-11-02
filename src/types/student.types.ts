export interface CreateStudentRequest {
    fullName: string;
    email: string;
    password: string;
    dob: Date | string;
    gender: "Male" | "Female";
}

export interface StudentResponse {
    id: string;
    fullName: string;
    email: string;
    dob: Date;
    gender: "Male" | "Female";
    age: number;
}
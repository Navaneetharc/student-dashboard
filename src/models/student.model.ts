import mongoose, {Schema,Document, VirtualType} from "mongoose";

export interface IStudent extends Document {
    fullName: string;
    email: string;
    password: string;
    dob: Date;
    gender: "Male" | "Female";
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    age?: number;
}

const studentSchema: Schema<IStudent> = new Schema(
    {
        fullName: {
            type: String,
            required: [true,"Full name is required"],
            trim: true,
        },
        email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
        ],
    },
    password: {
        type: String,
        required: [true,"Password is required"],
        minLenght: [8,"Password must be at least 8 charcters long"],
    },
    dob: {
        type: Date,
        required: [true,"Date of birth is required"],
    },
    gender: {
        type: String,
        enum: ["Male","Female"],
        required: [true, "Gender is required"],
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    },
    {
        timestamps: true,
    }
);

studentSchema.virtual("age").get (function (this:IStudent){
    const today = new Date;
    const birthDate = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if(m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

studentSchema.set("toJSON",{virtuals: true});
studentSchema.set("toObject", {virtuals:true})

const Student = mongoose.model<IStudent>("Student",studentSchema);
export default Student;


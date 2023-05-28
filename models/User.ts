import mongoose, { Schema, Document } from 'mongoose';

enum UserRole {
  SHIPOWNER = 'SHIPOWNER',
  CHARTERER = 'CHARTERER',
  ARBITER = 'ARBITER',
}

interface IUser extends Document {
  walletAddress: string;
  role: UserRole;
  createdAt: Date;
}

let UserModel: mongoose.Model<IUser>;

if (mongoose.models.User) {
  UserModel = mongoose.models.User as mongoose.Model<IUser>;
} else {
  const userSchema: Schema = new Schema({
    walletAddress: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
  });

  UserModel = mongoose.model<IUser>('User', userSchema);
}

export default UserModel;

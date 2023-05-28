import mongoose, { Schema, Document } from 'mongoose';

interface IContractParties extends Document {
    contractAddress: string;
    shipwonerAddress: string;
    chartererAddress: string;
    arbitersAddresses: string[];
}

let ContractPartiesModel: mongoose.Model<IContractParties>;

if (mongoose.models.ContractParties) {
  ContractPartiesModel = mongoose.models.ContractParties as mongoose.Model<IContractParties>;
} else {
  const contractPartiesSchema: Schema = new Schema({
    contractAddress: {
      type: String,
      required: true,
    },
    shipwonerAddress: {
        type: String,
        required: true,
    },
    chartererAddress: {
        type: String,
        required: true,
    },
    arbitersAddresses: {
        type: [String], 
        required: true,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
  });

  ContractPartiesModel = mongoose.model<IContractParties>('ContractParties', contractPartiesSchema);
}

export default ContractPartiesModel;

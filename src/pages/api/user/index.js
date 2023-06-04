import User from "../../../../models/User"
import mongoose from "mongoose";
const connection = {}
// import dbConnection from "../../../../services/dbConnection"


export default async function handler(req, res){
    async function dbConnection() {
        if (connection.isConnected) return
    
        mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
        })
        .then(() => {
            console.log('Connection established with MongoDB');
          })
          .catch((error) => {
            console.error('Error connecting to MongoDB:', error);
          });
    }
    
    dbConnection();
    const {method} = req

    switch(method){
        case "GET":
            try {
                const users = await User.find({})
                res.status(200).json({ success: true, data: users })
            } catch (error) {
                console.error(error)
                res.status(500).json({ success: false, error })
            }
            break;

        case "POST":
            try {
                let walletAddress = ''
                let role = ''
                if (typeof req.body === 'string') {
                    const body = JSON.parse(req.body)
                    walletAddress = body.walletAddress
                    role = body.role
                } else {
                    walletAddress = req.body.walletAddress
                    role = req.body.role
                }
                if (!walletAddress) throw "invalid wallet address"
                if (!role) throw "invalid role"
                const user = await User.create({walletAddress, role})
                res.status(201).json({ success: true, data: user })
            } catch (error) {
                console.error(error)
                res.status(500).json({ success: false, error })
            }
            break;
    }
}
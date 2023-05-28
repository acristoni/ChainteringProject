import User from "../../../../models/User"
import dbConnection from "../../../../services/dbConnection"

dbConnection();

export default async function handler(req, res){
    const {method} = req
    const {UserAddress} = req.query

    switch(method){
        case "GET":
            try {
                const user = await User.findOne({walletAddress: UserAddress})
                res.status(200).json({ success: true, data: user })
            } catch (error) {
                console.error(error)
                res.status(500).json({ success: false, error })
            }
            break;
    }
}
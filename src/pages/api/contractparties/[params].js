import ContractParties from "../../../../models/ContractParties"
import dbConnection from "../../../../services/dbConnection"

dbConnection();

export default async function handler(req, res){
    const params = req.query
    const address = params.address
    const role = params.params

    switch(role){
        case "arbiter":
            try {
                const contracts = await ContractParties.find({
                    arbitersAddresses: { $in: [address] }
                })
                res.status(200).json({ success: true, data: contracts })
            } catch (error) {
                console.error(error)
                res.status(500).json({ success: false, error })
            }
            break;
        case "shipowner":
            try {
                const contracts = await ContractParties.find({shipwonerAddress: address})
                res.status(200).json({ success: true, data: contracts })
            } catch (error) {
                console.error(error)
                res.status(500).json({ success: false, error })
            }
            break;
        case "charterer":
            try {
                const contracts = await ContractParties.find({chartererAddress: address})
                res.status(200).json({ success: true, data: contracts })
            } catch (error) {
                console.error(error)
                res.status(500).json({ success: false, error })
            }
            break;
    }
}
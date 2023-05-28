import ContractParties from "../../../../models/ContractParties"
import dbConnection from "../../../../services/dbConnection"

dbConnection();

export default async function handler(req, res){
    const {method} = req

    switch(method){
        case "GET":
            try {
                const contractParties = await ContractParties.find({})
                res.status(200).json({ success: true, data: contractParties })
            } catch (error) {
                console.error(error)
                res.status(500).json({ success: false, error })
            }
            break;

        case "POST":
            try {
                let contractAddress = ''
                let shipwonerAddress = ''
                let chartererAddress = ''
                let arbitersAddresses = ['','','']
                if (typeof req.body === 'string') {
                    const body = JSON.parse(req.body)
                    contractAddress = body.contractAddress
                    shipwonerAddress = body.shipwonerAddress
                    chartererAddress = body.chartererAddress
                    arbitersAddresses = body.arbitersAddresses
                } else {
                    contractAddress = req.body.contractAddress
                    shipwonerAddress = req.body.shipwonerAddress
                    chartererAddress = req.body.chartererAddress
                    arbitersAddresses = req.body.arbitersAddresses
                }
                if (!contractAddress) throw "invalid contract address"
                if (!shipwonerAddress) throw "invalid shipwoner address"
                if (!chartererAddress) throw "invalid charterer address"
                if (!arbitersAddresses) throw "invalid arbiters addresses"
                
                const contractParties = await ContractParties.create({
                    contractAddress, 
                    shipwonerAddress,
                    chartererAddress,
                    arbitersAddresses
                })
                res.status(201).json({ success: true, data: contractParties })
            } catch (error) {
                console.error(error)
                res.status(500).json({ success: false, error })
            }
            break;
    }
}
import { ContractStatus } from "@/interfaces/ContractStatus.interface";
import { Text } from "@chakra-ui/react"

interface Props {
    contractAddress: string;
    contractStatus: ContractStatus
}

export default function ContractInfo({ contractAddress, contractStatus }: Props) {
    return (
        <>
            <Text as='b' style={{margin: 0}}>Contract Address:</Text>
            <Text style={{margin: 0}}>{contractAddress}</Text>
            <Text as='b' style={{margin: 0, marginTop: 4}}>Vessel IMO number:</Text>
            <Text style={{margin: 0}} textAlign="center">{contractStatus.IMOnumber}</Text>
        </>
    )
}
import BigNumber from 'bignumber.js';
import { ContractStatus } from "@/interfaces/ContractStatus.interface";
import { Text } from "@chakra-ui/react"

interface Props {
    contractAddress: string;
    contractStatus: ContractStatus
}

export default function ContractInfo({ contractAddress, contractStatus }: Props) {
    const bigNumber = new BigNumber(contractStatus.totalAmountDueToPay);
    const floatValue = bigNumber.toNumber();

    return (
        <>
            <Text as='b' style={{margin: 0}}>Contract Address:</Text>
            <Text style={{margin: 0}}>{contractAddress}</Text>
            <Text as='b' style={{margin: 0, marginTop: 4}}>Vessel IMO number:</Text>
            <Text style={{margin: 0}} textAlign="center">{contractStatus.IMOnumber}</Text>
            <Text as='b' style={{margin: 0, marginTop: 4}}>Total amount due shipowner:</Text>
            <Text style={{margin: 0}} textAlign="center">{floatValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Text>
        </>
    )
}

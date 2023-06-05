import BigNumber from 'bignumber.js';
import { HStack, Text } from "@chakra-ui/react"
import ContractPayment from './ContractPayment';
import { PropsContractChildren } from '@/interfaces/PropsContractChildren.interface';

export default function ContractInfo({ contractAddress, contractStatus }: PropsContractChildren) {
    const bigNumber = new BigNumber(contractStatus.totalAmountDueToPay);
    const floatValue = bigNumber.toNumber();

    const handleRedirectContract = () => {
        const url =  `https://mumbai.polygonscan.com/address/${contractAddress}`
        window.open(url, '_blank')
    };

    const handleRedirectVessel = () => {
        const url =  `https://www.marinetraffic.com/en/ais/details/ships/imo:${contractStatus.IMOnumber}`
        window.open(url, '_blank')
    };

    return (
        <>
            <Text as='b' style={{margin: 0}}>Contract Address:</Text>
            <Text 
                style={{margin: 0}}
                _hover={{
                    cursor: 'pointer',
                    color: 'blue',
                    textDecoration: 'underline'
                }}
                _active={{
                    color: 'gray'
                }}
                onClick={handleRedirectContract}
            >
                {contractAddress}
            </Text>
            <Text as='b' style={{margin: 0, marginTop: 4}}>Vessel IMO number:</Text>
            <Text 
                style={{margin: 0}}
                _hover={{
                    cursor: 'pointer',
                    color: 'blue',
                    textDecoration: 'underline'
                }}
                _active={{
                    color: 'gray'
                }}
                onClick={handleRedirectVessel}
            >
                {contractStatus.IMOnumber}
            </Text>
            <Text as='b' style={{margin: 0, marginTop: 4}}>Total amount due shipowner:</Text>
            <HStack>
                <Text style={{margin: 0}} textAlign="center">{floatValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Text>
                {
                    contractStatus.isStarted && contractStatus.roleUser === "CHARTERER" &&
                    <ContractPayment contractAddress={contractAddress} />
                }
            </HStack>
            <Text as='b' style={{margin: 0, marginTop: 4}}>Total oil consumed during the term of the contract:</Text>
            <Text style={{margin: 0}} textAlign="center">{contractStatus.oilTotalConsuption} tons</Text>
        </>
    )
}

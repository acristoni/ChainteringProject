import { useEffect, useState } from "react";
import { HStack, Text, Spinner } from "@chakra-ui/react";
import { ContractStatus } from "@/interfaces/ContractStatus.interface";
import Button from "@/components/Button";
import getLinkTokenBalance from "@/utils/contractInteractions/getLinkTokenBalance";
import contractArtifact from "../../../../artifacts/contracts/Truflation.sol/Truflation.json"
import depositLinkToken from "@/utils/contractInteractions/depositLinkToken";

export default function TruflationInfo ({ contractStatus }: { contractStatus: ContractStatus }) {
    const [truflationBalance, setTruflationBalance] = useState<number>(0)
    const [updateBalance, setUpdateBalance] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true)
    const contractAbi = contractArtifact.abi

    useEffect(()=>{
        setIsLoading(false)
        if (contractStatus.truflationContract) {
            const getTruflationBalance = async() => {
                const responseBalance = await getLinkTokenBalance(contractStatus.truflationContract);
                if (responseBalance 
                    && responseBalance !== true
                    && responseBalance.length) {
                    setTruflationBalance(parseFloat(responseBalance))
                } else {
                    alert("We encountered an issue while try to do your request. Please try again later or contact us for assistance.")
                }
                setIsLoadingBalance(false)
            }
            getTruflationBalance()
        }
    },[contractStatus, updateBalance])

    const depositLinkTruflation = async() => {
        setIsLoading(true)
        const responseDeposit = await depositLinkToken(contractStatus.truflationContract, contractAbi)
        if (responseDeposit) {
            setUpdateBalance(!updateBalance)
        } else {
            alert("We encountered an issue while try to do your request. Please try again later or contact us for assistance.")
        }
    }
        
    return (
        <>
            <Text as='b' style={{margin: 0, marginTop: 4}}>Search Data Contract (barril oil price, weather broadcast, Haversine formula):</Text>
            <HStack>
                <HStack color={truflationBalance < 0.3 ? 'red' : 'black'}>
                    <Text style={{margin: 0}}>LINK token balance:</Text>
                    {
                        isLoadingBalance ?
                        <Spinner
                            thickness='2px'
                            speed='0.65s'
                            emptyColor='gray.200'
                            color='blue.500'
                            size='sm'
                        /> :
                        <Text style={{margin: 0, marginLeft: '5px'}}>{truflationBalance}</Text>
                    }
                </HStack>
                <Button
                    onClick={depositLinkTruflation}
                    isLoading={isLoading}
                >
                    <Text>
                        Deposit Link
                    </Text>
                </Button>
            </HStack>
        </>
    )
}
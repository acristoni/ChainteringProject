import { useEffect, useState } from "react";
import { HStack, Text, Spinner } from "@chakra-ui/react";
import { ContractStatus } from "@/interfaces/ContractStatus.interface";
import Button from "@/components/Button";
import getLinkTokenBalance from "@/utils/contractInteractions/getLinkTokenBalance";
import depositLinkToken from "@/utils/contractInteractions/depositLinkToken";
import contractArtifact from "../../../../artifacts/contracts/PriceMaticUSD.sol/PriceMaticUSD.json"

export default function MaticInfo ({ contractStatus }: { contractStatus: ContractStatus }) {
    const [maticBalance, setMaticBalance] = useState<number>(0)
    const [updateBalance, setUpdateBalance] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true)
    const contractAbi = contractArtifact.abi

    useEffect(()=>{
        setIsLoading(false)
        if (contractStatus.maticContract) {
            const getMaticBalance = async() => {
                const responseBalance = await getLinkTokenBalance(contractStatus.maticContract);
                if (responseBalance 
                    && responseBalance !== true
                    && responseBalance.length) {
                    setMaticBalance(parseFloat(responseBalance))
                } else {
                    alert("We encountered an issue while try to do your request. Please try again later or contact us for assistance.")
                }
                setIsLoadingBalance(false)
            }
            getMaticBalance()
        }
    },[contractStatus, updateBalance])

    const depositLinkMatic = async() => {
        setIsLoading(true)
        const responseDeposit = await depositLinkToken(contractStatus.maticContract, contractAbi)
        if (responseDeposit) {
            setUpdateBalance(!updateBalance)
        } else {
            alert("We encountered an issue while try to do your request. Please try again later or contact us for assistance.")
        }
    }
    
    return (
        <>
            <Text as='b' style={{margin: 0, marginTop: 4}}>Search Price Matic / USD Contract:</Text>
            <HStack>
                <HStack color={maticBalance < 0.3 ? 'red' : 'black'}>
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
                        <Text style={{margin: 0, marginLeft: '5px'}}>{maticBalance}</Text>
                    }
                </HStack>
                <Button
                    onClick={depositLinkMatic}
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
import { useEffect, useState } from "react";
import { HStack, Text } from "@chakra-ui/react";
import { ContractStatus } from "@/interfaces/ContractStatus.interface";
import Button from "@/components/Button";
import getLinkTokenBalance from "@/utils/getLinkTokenBalance";
import contractArtifact from "../../../../artifacts/contracts/Truflation.sol/Truflation.json"
import depositLinkToken from "@/utils/depositLinkToken";

export default function TruflationInfo ({ contractStatus }: { contractStatus: ContractStatus }) {
    const [truflationBalance, setTruflationBalance] = useState<number>(0)
    const [updateBalance, setUpdateBalance] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const contractAbi = contractArtifact.abi

    useEffect(()=>{
        setIsLoading(false)
        if (contractStatus.truflationContract) {
            const getTruflationBalance = async() => {
                const responseBalance = await getLinkTokenBalance(contractStatus.truflationContract);
                if (responseBalance && responseBalance.length) {
                    setTruflationBalance(parseFloat(responseBalance))
                }
            }
            getTruflationBalance()
        }
    },[contractStatus, updateBalance])

    const depositLinkTruflation = async() => {
        setIsLoading(true)
        const responseDeposit = await depositLinkToken(contractStatus.truflationContract, contractAbi)
        if (responseDeposit) {
            setUpdateBalance(!updateBalance)
        }
    }
        
    return (
        <>
            <Text as='b' style={{margin: 0, marginTop: 4}}>Search Data Contract (barril oil price, weather broadcast, Haversine formula):</Text>
            <HStack>
                <HStack color={truflationBalance < 0.3 ? 'red' : 'black'}>
                    <Text style={{margin: 0}}>LINK token balance:</Text>
                    <Text style={{margin: 0, marginLeft: '5px'}}>{truflationBalance}</Text>
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
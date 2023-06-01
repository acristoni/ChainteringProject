import { useEffect, useState } from "react";
import { HStack, Text } from "@chakra-ui/react";
import { ContractStatus } from "@/interfaces/ContractStatus.interface";
import Button from "@/components/Button";
import getLinkTokenBalance from "@/utils/getLinkTokenBalance";

export default function TruflationInfo ({ contractStatus }: { contractStatus: ContractStatus }) {
    const [truflationBalance, setTruflationBalance] = useState<number>(0)

    useEffect(()=>{
        if (contractStatus.truflationContract) {
            const getTruflationBalance = async() => {
                const responseBalance = await getLinkTokenBalance(contractStatus.truflationContract);
                if (responseBalance && responseBalance.length) {
                    setTruflationBalance(parseFloat(responseBalance))
                }
            }
            getTruflationBalance()
        }
    },[contractStatus])
    
    return (
        <>
            <Text as='b' style={{margin: 0, marginTop: 4}}>Search Data Contract (barril oil price, weather broadcast, Haversine formula):</Text>
            <HStack>
                <HStack color={truflationBalance < 0.3 ? 'red' : 'black'}>
                    <Text style={{margin: 0}}>LINK token balance:</Text>
                    <Text style={{margin: 0, marginLeft: '5px'}}>{truflationBalance}</Text>
                </HStack>
                <Button
                    onClick={()=>console.log(contractStatus.truflationContract)}
                >
                    <Text>
                        Deposit Link
                    </Text>
                </Button>
            </HStack>
        </>
    )
}
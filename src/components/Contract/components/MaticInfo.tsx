import { useEffect, useState } from "react";
import { HStack, Text } from "@chakra-ui/react";
import { ContractStatus } from "@/interfaces/ContractStatus.interface";
import Button from "@/components/Button";
import getLinkTokenBalance from "@/utils/getLinkTokenBalance";

export default function MaticInfo ({ contractStatus }: { contractStatus: ContractStatus }) {
    const [maticBalance, setMaticBalance] = useState<number>(0)

    useEffect(()=>{
        if (contractStatus.maticContract) {
            const getMaticBalance = async() => {
                const responseBalance = await getLinkTokenBalance(contractStatus.maticContract);
                if (responseBalance && responseBalance.length) {
                    setMaticBalance(parseFloat(responseBalance))
                }
            }
            getMaticBalance()
        }
    },[contractStatus])
    
    return (
        <>
            <Text as='b' style={{margin: 0, marginTop: 4}}>Search Price Matic / USD Contract:</Text>
            <HStack>
                <HStack color={maticBalance < 0.3 ? 'red' : 'black'}>
                    <Text style={{margin: 0}}>LINK token balance:</Text>
                    <Text style={{margin: 0, marginLeft: '5px'}}>{maticBalance}</Text>
                </HStack>
                <Button
                    onClick={()=>console.log(contractStatus.maticContract)}
                >
                    <Text>
                        Deposit Link
                    </Text>
                </Button>
            </HStack>         
        </>
    )
}
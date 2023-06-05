import { PropsContractChildren } from "@/interfaces/PropsContractChildren.interface"
import getAllDisputes from "@/utils/contractInteractions/getAllDisputes"
import { useEffect, useState } from "react"
import { Divider, HStack, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { Dispute } from "@/interfaces/Dispute.interface"
import Button from "@/components/Button"
import OpenDisputeForm from "./OpenDisputeForm"
import DisputeInfo from "./DisputeInfo"

export default function Disputes({ contractStatus, contractAddress }: PropsContractChildren) {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const [disputes, setDisputes] = useState<Dispute[]>([])
    
    useEffect(()=>{
        const getAllContractDisputes = async() => {
            const responseDisputes = await getAllDisputes(contractAddress)
            if (responseDisputes 
                && responseDisputes !== true
                && responseDisputes.length) {
                setDisputes(responseDisputes)
            } else {
                alert("There was an issue while attempting to get all disputes on your contract. Please try again later or contact us.")
            }
        }
        getAllContractDisputes()
    },[])
    
    return (
        <VStack w="100%" align="center" pt={contractStatus.roleUser === "SHIPOWNER" ? 4 : 0}>
            <Divider w="100%" style={{marginBottom: "7px"}}/>
            <OpenDisputeForm 
                isOpen={isOpen} 
                onClose={onClose} 
                contractAddress={contractAddress} 
                contractStatus={contractStatus} 
            />
            {
                !disputes.length ?
                <Text as="b">
                    There&apos;s no disputes on this contract
                    
                </Text> :
                <VStack w="80%" pb={4}>
                    <Text as="b">
                        All contract disputes:
                    </Text>
                    <HStack
                        w="100%"
                        wrap="wrap"
                        justify="center"
                    >
                        {
                            disputes.map(dispute => 
                                <DisputeInfo 
                                    key={dispute.id} 
                                    disputeInfo={dispute}
                                    userRole={contractStatus.roleUser}
                                    contractAddress={contractAddress}
                                />
                            )
                        }                    
                    </HStack>
                </VStack>
            }
            {
                 contractStatus.isStarted && 
                 (contractStatus.roleUser === "SHIPOWNER" ||
                 contractStatus.roleUser === "CHARTERER") &&
                 <Button onClick={onOpen}>
                    <Text>Open New Dispute</Text>
                 </Button>
            }
        </VStack>
    )
}
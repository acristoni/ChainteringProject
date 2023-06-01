import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { ContractStatus } from "@/interfaces/ContractStatus.interface";
import { HStack, Text, useDisclosure } from "@chakra-ui/react";
import StartForm from "./StartForm";

interface Props {
    contractAddress: string;
    contractStatus: ContractStatus
}

export default function StartManagement({ contractAddress, contractStatus }: Props) {
    const [isStated, setIsStarted] = useState<boolean>(false)
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(()=>{
        if (contractStatus.isStated) {
            setIsStarted(true)
        }
    },[contractStatus])
    
    return (
        <>
            <StartForm 
                isOpen={isOpen} 
                onClose={onClose} 
                contractAddress={contractAddress}
                setIsStarted={setIsStarted}
            />
            {
                !isStated && 
                contractStatus.roleUser === "CHARTERER" ?
                <HStack
                    w="100%"
                    justify="end"
                >
                    <Button 
                        onClick={onOpen}
                    >
                        <Text>Start Contract</Text>
                    </Button>
                </HStack> : 
                !isStated && 
                <Text as="b" color="red.700">
                    Contract has not commenced yet, only the charterer can initiate the charter period of the vessel.
                </Text>
            }
        </>
    )
}
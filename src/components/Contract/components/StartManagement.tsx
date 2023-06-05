import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { PropsContractChildren } from "@/interfaces/PropsContractChildren.interface";
import { HStack, Text, useDisclosure } from "@chakra-ui/react";
import StartForm from "./StartForm";

export default function StartManagement({ contractAddress, contractStatus }: PropsContractChildren) {
    const [isStarted, setIsStarted] = useState<boolean>(false)
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(()=>{
        if (contractStatus.isStarted) {
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
                !isStarted && 
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
                !isStarted && 
                <Text as="b" color="red.700">
                    Contract has not commenced yet, only the charterer can initiate the charter period of the vessel.
                </Text>
            }
        </>
    )
}
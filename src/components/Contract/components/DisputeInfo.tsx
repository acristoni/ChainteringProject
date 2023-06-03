import { Dispute } from "@/interfaces/Dispute.interface";
import Button from "@/components/Button"
import { Text, useDisclosure } from "@chakra-ui/react"


interface Props {
    disputeInfo: Dispute
}

export default function DisputeInfo({ disputeInfo }: Props) {
    const {isOpen, onOpen, onClose} = useDisclosure()
    
    return (
        <>
            
            <Button
                onClick={onOpen}
            >
                <Text>
                    Dispute - nº:{disputeInfo.id}
                </Text>
            </Button>
        </>
    )
}   
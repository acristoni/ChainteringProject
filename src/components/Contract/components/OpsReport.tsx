import Button from "@/components/Button"
import { PropsContractChildren } from "@/interfaces/PropsContractChildren.interface"
import { Box, Text, useDisclosure } from "@chakra-ui/react"
import OpsForm from "./OpsForm"

export default function OpsReport({ contractStatus, contractAddress }: PropsContractChildren) {
    const {isOpen, onOpen, onClose} = useDisclosure()
    
    return (
        <Box 
            pt={contractStatus.roleUser === "SHIPOWNER" ? 4 : 0} 
            style={{
                margin: 0,
                marginTop: "-10px"
            }}
        >
            <OpsForm 
                isOpen={isOpen}
                onClose={onClose}
                contractAddress={contractAddress}
            />
            {
                contractStatus.isStarted && contractStatus.roleUser === "SHIPOWNER" &&
                <Button
                    onClick={onOpen}
                >
                    <Text>
                        Send Operation Report
                    </Text>
                </Button>
            }
        </Box>
    )
}
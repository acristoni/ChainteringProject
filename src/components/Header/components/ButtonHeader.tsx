import { ChakraProps, useDisclosure, Text, HStack } from "@chakra-ui/react"
import { useRouter } from 'next/router'
import ModalConnectWallet from "./ModalConnectWallet"
import Button from "@/components/Button"

interface Props extends ChakraProps  {
    title: string,
    onClick: ()=>{}
}

export default function ButtonHeader({title, onClick}: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const router = useRouter()

    return ( 
        <HStack px={3}>
            <Button
                onClick={onClick}
            >
                <Text>
                    {title}
                </Text>
            </Button>
            <ModalConnectWallet 
                isOpen={isOpen} 
                onClose={onClose} 
                ConnectWalletHandleButton={()=>{}} 
            />
        </HStack> 
    )
}
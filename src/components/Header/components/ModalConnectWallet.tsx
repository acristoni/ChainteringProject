import { 
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton} from "@chakra-ui/react"

type Props = {
    isOpen: boolean
    onClose: () => void
    ConnectWalletHandleButton: () => void
}

export default function ModalConnectWallet({ isOpen, onClose, ConnectWalletHandleButton }: Props) {
    return (
        <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
            <ModalHeader>Logar na página</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
                Você ainda não logou na página, gostaria de fazê-lo?
            </ModalBody>

            <ModalFooter>
                <Button colorScheme='red' mr={3} onClick={ConnectWalletHandleButton}>
                    Logar
                </Button>
                <Button onClick={onClose}>Cancelar</Button>
            </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
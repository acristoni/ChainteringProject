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
            <ModalHeader>Log In</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
                You haven&apos;t logged into the page yet, would you like to do so?
            </ModalBody>

            <ModalFooter>
                <Button colorScheme='red' mr={3} onClick={ConnectWalletHandleButton}>
                    Log In
                </Button>
                <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
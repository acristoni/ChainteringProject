import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button as ChakraButton,
    Text,
    Input,
} from '@chakra-ui/react'
import startCharter from '@/utils/contractInteractions/startCharter';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    contractAddress: string;
    setIsStarted: (value: boolean) => void
}

export default function StartForm({ isOpen, onClose, contractAddress, setIsStarted }: Props) {
    const [chartersTimeMonths, setChartersTimeMonths] = useState<number>(0)
    const [invalidValue, setInvalidValue] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [responseMessage, setResponseMessage] = useState<string>("")

    const handleStartButton = async() => {
        if (chartersTimeMonths) {
            setIsLoading(true)
            const responseStart = await startCharter(contractAddress, chartersTimeMonths)
            if (responseStart 
                && responseStart !== true
                && responseStart.hash 
                && responseStart.hash.length) {
                setIsStarted(true)
                setResponseMessage("Congratulations, your contract for the charter period of the vessel has just started.")
            } else {
                setResponseMessage("There was an issue while attempting to process your request. Please try again later or contact us.")
            }
            setIsLoading(false)
        } else {
            setInvalidValue(true)
        }
    }

    useEffect(()=>{
        if (chartersTimeMonths) {
            setInvalidValue(false)
        }
    },[chartersTimeMonths])

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent fontFamily="EB Garamond">
          <ModalHeader>Start Contract</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {
                responseMessage && responseMessage.length ?
                <Text as="b">{responseMessage}</Text> :
                <>
                    <Text as="b">
                        Fill out below to initiate your charter contract.
                    </Text>
                    <Text pt={4}>
                        Charter time in months:
                    </Text>
                    {
                        invalidValue &&
                        <Text as="b" color="red">
                            The contract must have a minimum duration of 1 month.
                        </Text>
                    }
                    <Input 
                        type='number'
                        placeholder='Charter time in months.' 
                        value={chartersTimeMonths}
                        onChange={e=>setChartersTimeMonths(e.target.valueAsNumber)}
                    />
                </>
            }
          </ModalBody>

          <ModalFooter>
            <ChakraButton variant='ghost' mr={3} onClick={onClose}>
              Close
            </ChakraButton>
            {
                responseMessage.length === 0 &&
                <Button
                    onClick={handleStartButton}
                    isLoading={isLoading}
                >
                    <Text>
                        Start Contract
                    </Text>
                </Button>
            }
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
}
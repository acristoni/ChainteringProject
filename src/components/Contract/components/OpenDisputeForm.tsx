import { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/Button';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Spinner,
    Button as ChakraButton,
    Text,
    Input,
    Divider,
    Select,
    VStack,
} from '@chakra-ui/react'
import convertToEvmTimestamp from '@/utils/convertToEvmTimestamp'
import { OpenDispute } from '@/interfaces/OpenDispute.interface';
import { ContractStatus } from '@/interfaces/ContractStatus.interface';
import openDispute from '@/utils/openDispute';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    contractAddress: string;
    contractStatus: ContractStatus
}

export default function OpenDisputeForm({ isOpen, onClose, contractAddress, contractStatus }: Props) {
    const router = useRouter();
    const [openDisputeData, setOpenDisputeData] = useState<OpenDispute>({
        startTime: 0,
        endTime: 0,
        reason: "",
        value: 0,
        partie: 0
    })
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [responseMessage, setResponseMessage] = useState<string>("")
    const [loadingMessage, setLoadingMessage] = useState<string>("")

    const handleOpenDisputeButton = async() => {
        setIsLoading(true)
        setLoadingMessage("We are opening your dispute on charter smart contract")
        const sendOpsReport = async() => {
            const responseReport = await openDispute(contractAddress, openDisputeData)
            if (responseReport && responseReport.hash && responseReport.hash.length) {
                setResponseMessage("Congratulations, you open a dispute!")
            } else {
                setResponseMessage("There was an issue while attempting to process your request. Please try again later or contact us.")
            }
            setIsLoading(false)  
        }
        sendOpsReport()     
    }

    useEffect(()=>{
        if (contractStatus.roleUser === "SHIPOWNER") {
            setOpenDisputeData({
                ...openDisputeData,
                partie: 0
            })
        }
        if (contractStatus.roleUser === "CHARTERER") {
            setOpenDisputeData({
                ...openDisputeData,
                partie: 1
            })
        }
    },[contractStatus])

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent fontFamily="EB Garamond">
          <ModalHeader>Open Dispute</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {
                isLoading ?
                <VStack>
                    <Text as="b">{loadingMessage}</Text>
                    <Spinner
                        thickness='4px'
                        speed='0.65s'
                        emptyColor='gray.200'
                        color='blue.500'
                        size='xl'
                    />
                </VStack> :
                responseMessage && responseMessage.length ?
                <Text as="b">{responseMessage}</Text> :
                <>
                    <Text as="b">
                        Fill out below to open a dispute.
                    </Text>
                    <Divider pt={3}/>
                    <Text pt={3}>
                        Date and hour start the issue to judge - GMT:
                    </Text>
                    <Input
                        placeholder="Select Date and Time"
                        size="md"
                        type="datetime-local"
                        onChange={(event: ChangeEvent<HTMLInputElement>)=>
                            setOpenDisputeData({
                                ...openDisputeData,
                                startTime: convertToEvmTimestamp(event.target.value)
                            })
                        }
                    />
                    <Text pt={3}>
                        Date and hour finished the issue to jugde - GMT:
                    </Text>
                    <Input
                        placeholder="Select Date and Time"
                        size="md"
                        type="datetime-local"
                        onChange={(event: ChangeEvent<HTMLInputElement>)=>
                            setOpenDisputeData({
                                ...openDisputeData,
                                endTime: convertToEvmTimestamp(event.target.value)
                            })
                        }
                    />
                    <Text pt={3}>
                        Reason for the problem, summarized:
                    </Text>
                    <Input
                        placeholder="Reason"
                        size="md"
                        onChange={(event: ChangeEvent<HTMLInputElement>)=>
                            setOpenDisputeData({
                                ...openDisputeData,
                                reason: event.target.value
                            })
                        }
                    />
                    <Text pt={3}>
                        Amount required by the party:
                    </Text>
                    <Input
                        placeholder="Amount"
                        size="md"
                        type='number'
                        onChange={(event: ChangeEvent<HTMLInputElement>)=>
                            setOpenDisputeData({
                                ...openDisputeData,
                                value: event.target.valueAsNumber
                            })
                        }
                    />
                </>
            }
          </ModalBody>

          <ModalFooter>
            <ChakraButton variant='ghost' mr={3} onClick={()=>{
                        if (responseMessage.length) {
                            router.reload();
                        } else {
                            onClose()
                        }
            }}>
                Close
            </ChakraButton>
            {
                responseMessage.length === 0 &&
                <Button
                    onClick={handleOpenDisputeButton}
                    isLoading={isLoading}
                >
                    <Text>
                        Open Dispute
                    </Text>
                </Button>
            }
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
}
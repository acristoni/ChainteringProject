import { Dispute } from "@/interfaces/Dispute.interface";
import Button from "@/components/Button"
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
    useDisclosure,
    Divider,
    Box,
    HStack,
    VStack,
    Spinner,
} from '@chakra-ui/react'
import { DisputeParties } from "@/enum/DisputeParties.enum";
import formatDateIsoToNormal from "@/utils/convertFunctions/formatDateIsoToNormal";
import sendVote from "@/utils/contractInteractions/sendVote";
import { useState } from "react";


interface Props {
    disputeInfo: Dispute;
    userRole: string;
    contractAddress: string;
}

export default function DisputeInfo({ disputeInfo, userRole, contractAddress }: Props) {
    const {isOpen, onOpen, onClose} = useDisclosure()

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [responseMessage, setResponseMessage] = useState<string>("")

    const handleVote = async(vote: boolean) => {
        setIsLoading(true)   
        const responseVote = await sendVote(contractAddress, disputeInfo.id, vote)
        if (responseVote && responseVote.hash && responseVote.hash.length) {
            setResponseMessage("Your vote was send successfully")
        } else {
            setResponseMessage("There was an issue while attempting to process your request. Please try again later or contact us.")
        }   
        setIsLoading(false)
    }
    
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent fontFamily="EB Garamond">
                <ModalHeader>Operation Report</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {
                        isLoading ?
                        <VStack>
                            <Text as="b">We are processing your vote on blockchain</Text>
                            <Spinner
                                thickness='4px'
                                speed='0.65s'
                                emptyColor='gray.200'
                                color='blue.500'
                                size='xl'
                            />
                        </VStack> :
                        responseMessage.length ?
                        <Text as="b">{responseMessage}</Text> :
                        <>
                            <Text as="b">
                                Informations of the dispute number {disputeInfo.id} {!disputeInfo.isClose && 'to be'} judged
                            </Text>
                            <Divider pt={4}/>
                            <Text pt={4} as="b">Start date</Text>
                            <Text>{formatDateIsoToNormal(disputeInfo.startTime)}</Text>
                            <Text pt={4} as="b">Finish date</Text>
                            <Text>{formatDateIsoToNormal(disputeInfo.endTime)}</Text>
                            <Text pt={4} as="b">Reason</Text>
                            <Text>{disputeInfo.reason}</Text>
                            <Text pt={4} as="b">Party who opened the dispute</Text>
                            <Text>{
                                disputeInfo.partOpenDispute === DisputeParties.charterer ?
                                "Charterer" :
                                "Ship Owner"
                            }</Text>
                            <Text pt={4} as="b">Amount value</Text>
                            <Text>{disputeInfo.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Text>
                            {
                                disputeInfo.isClose ?
                                <Box pt={4}>
                                    <Divider />
                                    <Text as="b" pt={4}>Party who win the dispute</Text>
                                    <Text>{
                                    disputeInfo.winningPart === DisputeParties.charterer ?
                                    "Charterer" :
                                    "Ship Owner"
                                    }</Text>
                                </Box> :
                                <HStack pt={4} w="100%" justify="center">
                                    <Text as="b" color="red">Dispute is not close yet</Text>
                                </HStack>

                            }
                            {
                                userRole === "ARBITER" && 
                                !disputeInfo.isClose &&
                                <HStack
                                    w="100%"
                                    justify="space-around"
                                    pt={6}
                                >
                                    <Button onClick={()=>handleVote(true)}>
                                        <Text>It&apos;s reasonable</Text>
                                    </Button>
                                    <Button onClick={()=>handleVote(false)}>
                                        <Text>It&apos;s NOT reasonable</Text>
                                    </Button>
                                </HStack>
                            }
                        </>
                    }
                </ModalBody>
                <ModalFooter>
                    <ChakraButton variant='ghost' mr={3} onClick={onClose}>
                        Close
                    </ChakraButton>
                </ModalFooter>
                </ModalContent>
            </Modal>
            
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
import { ChangeEvent, useEffect, useState } from "react"
import { useRouter } from 'next/router';
import Button from "@/components/Button"
import { ContractStatus } from "@/interfaces/ContractStatus.interface"
import informBadWeather from "@/utils/contractInteractions/informBadWeather"
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
    useDisclosure,
    Box,
    VStack,
    Divider,
    Input,
    HStack,
} from '@chakra-ui/react'
import { FuelSupplyData } from "@/interfaces/FuelSupplyData.interface";
import fuelSupplyReport from "@/utils/contractInteractions/fuelSupplyReport";
import convertToEvmTimestamp from "@/utils/convertFunctions/convertToEvmTimestamp";

interface Props {
    contractStatus: ContractStatus
    contractAddress: string
}

export default function FuelSupplyReport({ contractStatus, contractAddress }: Props) {
    const [fuelSupplyData, setFuelSupplyData] = useState<FuelSupplyData>({
        dateOfSupply: 0,
        quantity: 0
    })
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [responseMessage, setResponseMessage] = useState<string>("")
    const {isOpen, onOpen, onClose} = useDisclosure()
    const router = useRouter();

    const handleSendFuelSupplyReport = async() => {
        setIsLoading(true)        

        const responseBadWeather = await fuelSupplyReport(
            contractAddress,
            fuelSupplyData
        )

        if (responseBadWeather && responseBadWeather.hash && responseBadWeather.hash.length) {
            setResponseMessage("You reported your vessel fuel supply successfully")
        } else {
            setResponseMessage("There was an issue while attempting to process your request. Please try again later or contact us.")
        }   
        setIsLoading(false)
    }

    return (
        <VStack w="100%" align="center" pt={2}>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent fontFamily="EB Garamond">
                <ModalHeader>Fuel Supply Report</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {
                        isLoading ?
                        <VStack>
                            <Text as="b">We are processing your request on blockchain</Text>
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
                                Fill out the form below to inform the oil supply:
                            </Text>
                            <Divider pt={3}/>
                            <Text pt={3}>
                                Date and time of supply:
                            </Text>
                            <Input
                                placeholder="Select Date and Time"
                                size="md"
                                type="datetime-local"
                                onChange={(event: ChangeEvent<HTMLInputElement>)=>
                                    setFuelSupplyData({
                                        ...fuelSupplyData,
                                        dateOfSupply: convertToEvmTimestamp(event.target.value)
                                    })
                                }
                            />
                            <Text pt={3}>
                                Quantity - in tons:
                            </Text>
                            <Input 
                                type='number'
                                placeholder='Oil quantity.' 
                                onChange={(event: ChangeEvent<HTMLInputElement>)=>
                                    setFuelSupplyData({
                                        ...fuelSupplyData,
                                        quantity: event.target.valueAsNumber
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
                            onClick={handleSendFuelSupplyReport}
                            isLoading={isLoading}
                        >
                            <Text>
                                Send Report
                            </Text>
                        </Button>
                    }
                </ModalFooter>
                </ModalContent>
            </Modal>
            {
                contractStatus.isStarted && contractStatus.roleUser === "SHIPOWNER" &&
                <Button onClick={onOpen} >
                    <Text>Fuel Supply Report</Text>
                </Button>
            }        
        </VStack>
    )
}
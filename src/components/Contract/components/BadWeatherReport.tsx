import { ChangeEvent, useEffect, useState } from "react"
import { useRouter } from 'next/router';
import Button from "@/components/Button"
import { ContractStatus } from "@/interfaces/ContractStatus.interface"
import informBadWeather from "@/utils/informBadWeather"
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
import checkVesselUnderBadWeather from "@/utils/checkVesselUnderBadWeather";

interface Props {
    contractStatus: ContractStatus
    contractAddress: string
}

export default function BadWeatherReport({ contractStatus, contractAddress }: Props) {
    const [isUnderBadWeather, setIsUnderBadWeather] = useState<boolean>() 
    const [position, setPosition] = useState<{latitude: number, longitude: number}>({
        latitude: 0,
        longitude: 0
    })
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [responseMessage, setResponseMessage] = useState<string>("")
    const {isOpen, onOpen, onClose} = useDisclosure()
    const router = useRouter();

    const handleSendBadWeatherReport = async() => {
        setIsLoading(true)        

        const responseBadWeather = await informBadWeather(
            contractAddress,
            String(position.latitude),
            String(position.longitude)
        )

        if (responseBadWeather && responseBadWeather.hash && responseBadWeather.hash.length) {
            setResponseMessage("You reported your vessel under bad weather conditions successfully")
        } else {
            setResponseMessage("There was an issue while attempting to process your request. Please try again later or contact us.")
        }   
        setIsLoading(false)
    }

    useEffect(()=>{
        const checkVesselWeatherCondition = async() => {
            const responseWeatherCondition = await checkVesselUnderBadWeather(contractAddress)
            if (responseWeatherCondition) {
                setIsUnderBadWeather(true)
            } else {
                setIsUnderBadWeather(false)
            }
        }   
        checkVesselWeatherCondition()
    },[contractAddress])
    
    return (
        <VStack w="100%" align="center">
            <Divider w="100%" style={{marginBottom: "7px"}}/>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent fontFamily="EB Garamond">
                <ModalHeader>Operation Report</ModalHeader>
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
                                Fill out your current position to send a bad weather report.
                            </Text>
                            <Divider pt={3}/>
                            <Text pt={3}>
                                Latitude - degrees:
                            </Text>
                            <Input 
                                type='number'
                                placeholder='Latitude departure.' 
                                onChange={(event: ChangeEvent<HTMLInputElement>)=>
                                    setPosition({
                                        ...position,
                                        latitude: event.target.valueAsNumber
                                    })
                                }
                            />
                            <Text pt={3}>
                                Longitude - degrees:
                            </Text>
                            <Input 
                                type='number'
                                placeholder='Latitude departure.' 
                                onChange={(event: ChangeEvent<HTMLInputElement>)=>
                                    setPosition({
                                        ...position,
                                        longitude: event.target.valueAsNumber
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
                            onClick={handleSendBadWeatherReport}
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
                isUnderBadWeather ?
                <Text as="b" color="red">
                    Vessel under bad weather condition, reported by ship owner
                </Text> :
                contractStatus.isStarted && contractStatus.roleUser === "SHIPOWNER" &&
                <Button onClick={onOpen} >
                    <Text>Bad Weather Report</Text>
                </Button>
            }
        </VStack>
    )
}
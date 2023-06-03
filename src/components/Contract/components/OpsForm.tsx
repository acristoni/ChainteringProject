import { ChangeEvent, useEffect, useState } from 'react';
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
import convertToEvmTimestamp from '@/utils/convertToEvmTimestamp';
import { OpsReport } from '@/interfaces/OpsReport.interface';
import newOperationReport from '@/utils/newOperationReport';
import requestHaversineDistance from '@/utils/requestHaversineDist';
import requestCrudeOilPrice from '@/utils/requestCrudeOilPrice';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    contractAddress: string
}

export default function OpsForm({ isOpen, onClose, contractAddress }: Props) {
    const [opsReportData, setOpsReposrtData] = useState<OpsReport>({
        dateDeparture: 0,
        dateArrival: 0,
        latitudeDeparture: 0,
        longitudeDerparture: 0,
        latitudeArrival: 0,
        longitudeArrival: 0,
        oilConsuption: 0,
        operationCode: 0
    })
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [responseMessage, setResponseMessage] = useState<string>("")
    const [isDistanceCalculated, setIsDistanceCalculated] = useState<boolean>(false)
    const [isOilPriceUpdated, setIsOilPriceUpdated] = useState<boolean>(false)
    const [loadingMessage, setLoadingMessage] = useState<string>("")

    const handleSendReportButton = async() => {
        setLoadingMessage("We are request your distance, using Havesine formula on smart contract")
        setIsLoading(true)
        const responseDistance = await requestHaversineDistance(contractAddress, opsReportData)
        if (responseDistance && responseDistance.hash && responseDistance.hash.length) {
            setIsDistanceCalculated(true)
        } else {
            setResponseMessage("There was an issue while attempting to process your request. Please try again later or contact us.")
        }            
    }

    useEffect(()=>{
        if (isDistanceCalculated) {
            setLoadingMessage("Now, We are updating your contract hourly pay rate, by crude oil price inflaction")
            const updateOilPrice = async() => {
                const responseOil = await requestCrudeOilPrice(contractAddress)
                if (responseOil && responseOil.hash && responseOil.hash.length) {
                    setIsOilPriceUpdated(true)
                } else {
                    setResponseMessage("There was an issue while attempting to process your request. Please try again later or contact us.")
                }     
            }
            updateOilPrice()
        }
    },[isDistanceCalculated])

    useEffect(()=>{
        if (isOilPriceUpdated) {
            setLoadingMessage("Last by not least, We are recording your operation report on your smart contract")
            const sendOpsReport = async() => {
                const responseReport = await newOperationReport(contractAddress, opsReportData)
                if (responseReport && responseReport.hash && responseReport.hash.length) {
                    setResponseMessage("Congratulations, your operation report send is completed!")
                } else {
                    setResponseMessage("There was an issue while attempting to process your request. Please try again later or contact us.")
                }
                setIsDistanceCalculated(false)
                setIsOilPriceUpdated(false)
                setIsLoading(false)  
            }
            sendOpsReport()
        }
    },[isOilPriceUpdated])

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent fontFamily="EB Garamond">
          <ModalHeader>Operation Report</ModalHeader>
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
                        Fill out below to send a operational report.
                    </Text>
                    <Divider pt={3}/>
                    <Text pt={3}>
                        Date and hour operation departure - GMT:
                    </Text>
                    <Input
                        placeholder="Select Date and Time"
                        size="md"
                        type="datetime-local"
                        onChange={(event: ChangeEvent<HTMLInputElement>)=>
                            setOpsReposrtData({
                                ...opsReportData,
                                dateDeparture: convertToEvmTimestamp(event.target.value)
                            })
                        }
                    />
                    <Text pt={3}>
                        Latitude departure - degrees:
                    </Text>
                    <Input 
                        type='number'
                        placeholder='Latitude departure.' 
                        onChange={(event: ChangeEvent<HTMLInputElement>)=>
                            setOpsReposrtData({
                                ...opsReportData,
                                latitudeDeparture: event.target.valueAsNumber
                            })
                        }
                    />
                     <Text pt={3}>
                        Longitude departure - degrees:
                    </Text>
                    <Input 
                        type='number'
                        placeholder='Latitude departure.' 
                        onChange={(event: ChangeEvent<HTMLInputElement>)=>
                            setOpsReposrtData({
                                ...opsReportData,
                                longitudeDerparture: event.target.valueAsNumber
                            })
                        }
                    />                   
                    <Divider pt={3}/>
                    <Text pt={3}>
                        Date and hour operation arrival - GMT:
                    </Text>
                    <Input
                        placeholder="Select Date and Time"
                        size="md"
                        type="datetime-local"
                        onChange={(event: ChangeEvent<HTMLInputElement>)=>
                            setOpsReposrtData({
                                ...opsReportData,
                                dateArrival: convertToEvmTimestamp(event.target.value)
                            })
                        }
                    />
                    <Text pt={3}>
                        Latitude arrival - degrees:
                    </Text>
                    <Input 
                        type='number'
                        placeholder='Latitude departure.' 
                        onChange={(event: ChangeEvent<HTMLInputElement>)=>
                            setOpsReposrtData({
                                ...opsReportData,
                                latitudeArrival: event.target.valueAsNumber
                            })
                        }
                    />
                    <Text pt={3}>
                        Longitude arrival - degrees:
                    </Text>
                    <Input 
                        type='number'
                        placeholder='Latitude departure.' 
                        onChange={(event: ChangeEvent<HTMLInputElement>)=>
                            setOpsReposrtData({
                                ...opsReportData,
                                longitudeArrival: event.target.valueAsNumber
                            })
                        }
                    />
                    <Divider pt={3} />
                    <Text pt={3}>
                        Oil Consuption - during all operation, in tons:
                    </Text>
                    <Input 
                        type='number'
                        placeholder='Oil Consuption.' 
                        onChange={(event: ChangeEvent<HTMLInputElement>)=>
                            setOpsReposrtData({
                                ...opsReportData,
                                oilConsuption: event.target.valueAsNumber
                            })
                        }
                    />
                    <Divider pt={3} />
                    <Text pt={3}>
                        Operation code:
                    </Text>
                    <Select 
                        placeholder="Choose a proper code:"
                        onChange={(event: ChangeEvent<HTMLSelectElement>)=>
                            setOpsReposrtData({
                                ...opsReportData,
                                operationCode: parseInt(event.target.value)
                            })
                        }
                    >
                        <option value="0">StandBy</option>
                        <option value="1">At Operation</option>
                        <option value="2">Under Way</option>
                        <option value="3">Waiting Orders</option>
                        <option value="4">Off Hire</option>
                        <option value="5">At Anchor</option>
                        <option value="6">Suppling</option>
                    </Select>
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
                    onClick={handleSendReportButton}
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
    )
}
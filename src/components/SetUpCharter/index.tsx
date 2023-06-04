import { useState } from "react";
import { VStack, Text, Input, Box, Spinner } from "@chakra-ui/react";
import Button from "../Button";
import { SetUpCharterData } from "@/interfaces/SetUpCharterData.interface";
import setUpCharter from "@/utils/contractInteractions/setUpCharter";

export default function SetUpCharter({ setStep }: { setStep: (value: number) => void }) {
    const [isLoading, setisLoading] = useState<boolean>(false)
    const [setUpCharterData, setSetUpCharterData] = useState<SetUpCharterData>({
        charterPerHour: 0,
        chainteringServicePayPerHour: 0,
        minimumCruisingSpeed: 0,
        vesselIMOnumber: 0,
        penaltyPerHour: 0,
        consuptionstandBy: 0,
        consuptionAtOperation: 0,
        consuptionUnderWay: 0,
    })

    const setUpCharterContract = async() => {
        setisLoading(true)  
        const charterContractAddress = sessionStorage.getItem("@NEWCHARTER")    
        if (charterContractAddress) {
            const responseSetUpContract = await setUpCharter(charterContractAddress, setUpCharterData);
            if (responseSetUpContract && responseSetUpContract.hash && responseSetUpContract.hash.length) {
                setisLoading(false) 
                setStep(5)
            } else {
                setisLoading(false)  
                alert("We encountered an issue while trying to set up your contract. Please contact us for assistance.")
            }
        } else {
            alert("We didn't find any new contract to set up. Please try to start the process to create a new contract from beginning or contact us for assistance.")
        }
    }

    return (
        <VStack 
            w="100%"
            maxW={['90%', '90%', '680px', '680px', '680px']}
            pt={7}
        >
            {
                isLoading ?
                <>
                    <Text 
                        as='b'
                        fontSize={['xl','xl','2xl','2xl','2xl']}
                    >
                        We are currently working on set up your contract.    
                    </Text>
                    <Spinner
                        thickness='4px'
                        speed='0.65s'
                        emptyColor='gray.200'
                        color='blue.500'
                        size='xl'
                    />
                </> :
                <>
                    <Text 
                        as='b'
                        fontSize={['xl','xl','2xl','2xl','2xl']}
                        textAlign="center"
                    >
                        Congratulations, you have just deployed your ship charter contract. Now, we need to establish some crucial information that will be essential throughout the entire duration of the vessel charter.
                    </Text>
                    <Text pt={7}>
                        The hourly charter rate of the vessel, in US Dolar.
                    </Text>
                    <Input 
                        type="number"
                        placeholder='The hourly charter rate of the vessel.' 
                        value={setUpCharterData.charterPerHour}
                        onChange={e=>setSetUpCharterData({...setUpCharterData, charterPerHour:e.target.valueAsNumber})}
                    />
                    <Text pt={4}>
                        The hourly rate for the services provided by Chaintering, in US Dolar.
                    </Text>
                    <Input 
                        type="number"
                        placeholder='The hourly rate for the services provided by Chaintering.' 
                        value={setUpCharterData.chainteringServicePayPerHour}
                        onChange={e=>setSetUpCharterData({...setUpCharterData, chainteringServicePayPerHour:e.target.valueAsNumber})}
                    />
                    <Text pt={4}>
                        The minimum cruising speed that the vessel is capable of achieving as per the contract, in Nautical Miles.
                    </Text>
                    <Input 
                        type="number"
                        placeholder='The minimum cruising speed.' 
                        value={setUpCharterData.minimumCruisingSpeed}
                        onChange={e=>setSetUpCharterData({...setUpCharterData, minimumCruisingSpeed:e.target.valueAsNumber})}
                    />
                    <Text pt={4}>
                        The vessel&apos;s IMO number of the contract&apos;s vessel.
                    </Text>
                    <Input 
                        type="number"
                        placeholder='IMO Number.' 
                        value={setUpCharterData.vesselIMOnumber}
                        onChange={e=>setSetUpCharterData({...setUpCharterData, vesselIMOnumber:e.target.valueAsNumber})}
                    />
                    <Text pt={4}>
                        The monetary value in United States dollars per hour of a potential contractual fine.
                    </Text>
                    <Input 
                        type="number"
                        placeholder='Penalty per hour' 
                        value={setUpCharterData.penaltyPerHour}
                        onChange={e=>setSetUpCharterData({...setUpCharterData, penaltyPerHour:e.target.valueAsNumber})}
                    />
                    <Text pt={4}>
                        Vessel consumption in tons per hour while in standby.
                    </Text>
                    <Input 
                        type="number"
                        placeholder='Vessel consumption in tons per hour while in standby.' 
                        value={setUpCharterData.consuptionstandBy}
                        onChange={e=>setSetUpCharterData({...setUpCharterData, consuptionstandBy:e.target.valueAsNumber})}
                    />
                    <Text pt={4}>
                        Vessel consumption in tons per hour when it is in operation.
                    </Text>
                    <Input 
                        type="number"
                        placeholder='Vessel consumption in tons per hour when it is in operation.' 
                        value={setUpCharterData.consuptionAtOperation}
                        onChange={e=>setSetUpCharterData({...setUpCharterData, consuptionAtOperation:e.target.valueAsNumber})}
                    />
                    <Text pt={4}>
                        Vessel consumption rate in tons per hour while underway.
                    </Text>
                    <Input 
                        type="number"
                        placeholder='Vessel consumption rate in tons per hour while underway.' 
                        value={setUpCharterData.consuptionUnderWay}
                        onChange={e=>setSetUpCharterData({...setUpCharterData, consuptionUnderWay:e.target.valueAsNumber})}
                    />
                   
                    <Box py={5}>
                        <Button
                            onClick={setUpCharterContract}
                        >
                            <Text>
                                Set Up Contract
                            </Text>
                        </Button>
                    </Box>
                </>
            }
        </VStack>
    )
}
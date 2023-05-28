import { Parties } from "@/interfaces/Parties.interface";
import { VStack, Text, Input, Box, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import Button from "../Button";
import shipCharter from "../../../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json"
import deployContract from "@/utils/deployContract";

export default function DeployCharter({ setStep }: { setStep: (value: number) => void }) {
    const [isLoading, setisLoading] = useState<boolean>(false)
    const [contractParties, setContractParties] = useState<Parties>({
        shipOwner: '',
        charterer: '',
        arbiter_1: '',
        arbiter_2: '',
        arbiter_3: ''
    })

    const deployCharterContract = async() => {
        setisLoading(true)
        const truflationContractAddress = sessionStorage.getItem("@TRUFLATION")
        const priceMAticContractAddress = sessionStorage.getItem("@MATIC_CONTRACT")
        const contractArguments: any[] = [
            contractParties.shipOwner,
            contractParties.charterer,
            contractParties.arbiter_1,
            contractParties.arbiter_2,
            contractParties.arbiter_3,
            '0x34Fa067B75A0d16aab9855E3cD360c95afaE3eC4',
            truflationContractAddress,
            priceMAticContractAddress
        ]        
        const response = await deployContract(shipCharter.bytecode, shipCharter.abi, contractArguments);
        if (response) {
            setStep(4)
            sessionStorage.setItem("@NEWCHARTER", response);

            setisLoading(false)
        } else {
            setisLoading(false)
            alert("We encountered an issue while trying to deploy your contract. Please try again later or contact us for assistance.")
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
                        We are currently working on deploying your contract.    
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
                        One more step, Please fill out the form below to deploy a new ship charter contract.
                    </Text>
                    <Text pt={7}>
                        Ship Owner public wallet address
                    </Text>
                    <Input 
                        placeholder='Ship Owner public wallet address' 
                        value={contractParties.shipOwner}
                        onChange={e=>setContractParties({...contractParties, shipOwner:e.target.value})}
                    />
                    <Text pt={4}>
                        Charterer public wallet address
                    </Text>
                    <Input 
                        placeholder='Charterer public wallet address' 
                        value={contractParties.charterer}
                        onChange={e=>setContractParties({...contractParties, charterer:e.target.value})}
                    />
                    <Text pt={4}>
                        First arbiter public wallet address
                    </Text>
                    <Input 
                        placeholder='First arbiter wallet address' 
                        value={contractParties.arbiter_1}
                        onChange={e=>setContractParties({...contractParties, arbiter_1:e.target.value})}
                    />
                    <Text pt={4}>
                        Second arbiter public wallet address
                    </Text>
                    <Input 
                        placeholder='Second arbiter wallet address' 
                        value={contractParties.arbiter_2}
                        onChange={e=>setContractParties({...contractParties, arbiter_2:e.target.value})}
                    />
                    <Text pt={4}>
                        Third arbiter public wallet address
                    </Text>
                    <Input 
                        placeholder='Third arbiter wallet address' 
                        value={contractParties.arbiter_3}
                        onChange={e=>setContractParties({...contractParties, arbiter_3:e.target.value})}
                    />
                    <Box pt={5}>
                        <Button
                            onClick={deployCharterContract}
                        >
                            <Text>
                                Deploy Contract
                            </Text>
                        </Button>
                    </Box>
                </>
            }
        </VStack>
    )
}
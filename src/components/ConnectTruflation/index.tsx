import { useState, useRef, useEffect } from "react";
import { VStack, Text, Box, Spinner } from "@chakra-ui/react";
import Button from "../Button";
import truflation from "../../../artifacts/contracts/Truflation.sol/Truflation.json"
import deployContract from "@/utils/deployContract";

export default function ConnectTruflation({ setStep }: { setStep: (value: number) => void }) {
    const truflationContractAddress = useRef(sessionStorage.getItem("@TRUFLATION"))
    const [isLoading, setisLoading] = useState<boolean>(false)

    const deployTruflationContract = async() => {
        setisLoading(true)
        const response = await deployContract(truflation.bytecode, truflation.abi);
        if (response) {
            sessionStorage.setItem("@TRUFLATION", response)
            setStep(2)
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
                    >
                        First, you need to deploy the contract that will handle interactions with Truflation, in ChainLink oracle, so we can synchronize our contract with the price of a barrel of oil, the wind speed given a position, and utilize the Haversine formula on the blockchain.
                    </Text>
                    <Box pt={5}>
                        <Button
                            onClick={deployTruflationContract}
                        >
                            <Text>
                                Deploy Truflation Contract
                            </Text>
                        </Button>
                    </Box>
                </>
            }
        </VStack>
    )
}
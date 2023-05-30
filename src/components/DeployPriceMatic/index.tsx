import { useState, useRef, useEffect } from "react";
import { VStack, Text, Box, Spinner } from "@chakra-ui/react";
import Button from "../Button";
import priceMatic from "../../../artifacts/contracts/PriceMaticUSD.sol/PriceMaticUSD.json"
import deployContract from "@/utils/deployContract";

export default function DeployPriceMatic({ setStep }: { setStep: (value: number) => void }) {
    const maticContractAddress = useRef(sessionStorage.getItem("@MATIC_CONTRACT"))
    const [isLoading, setisLoading] = useState<boolean>(false)

    useEffect(()=>{
        if (maticContractAddress.current && maticContractAddress.current.length) {
            setStep(3)
        }
    },[maticContractAddress.current])

    const deployPriceMaticUSDContract = async() => {
        setisLoading(true)
        const response = await deployContract(priceMatic.bytecode, priceMatic.abi);
        if (response) {
            sessionStorage.setItem("@MATIC_CONTRACT", response)
            setStep(3)
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
                        Well Done!
                    </Text>
                    <Text 
                        as='b'
                        fontSize={['xl','xl','2xl','2xl','2xl']}
                    >
                        Second, you need to deploy the contract that will get the Matic price in US Dolar, from ChainLink oracle.
                    </Text>
                    <Box pt={5}>
                        <Button
                            onClick={deployPriceMaticUSDContract}
                        >
                            <Text>
                                Deploy Price Matic/USD Contract
                            </Text>
                        </Button>
                    </Box>
                </>
            }
        </VStack>
    )
}
import { useState } from "react";
import { VStack, Text, Box, Spinner } from "@chakra-ui/react";
import Button from "../Button";
import connectToShipChartering from "@/utils/connectToShipChartering";
import contractArtifact from "../../../artifacts/contracts/Truflation.sol/Truflation.json"

export default function ConnectMaticPrice({ setStep }: { setStep: (value: number) => void }) {
    const [isLoading, setisLoading] = useState<boolean>(false)
    
    const connectTruflationContract = async() => {
        setisLoading(true)
        const truflationContractAddress = sessionStorage.getItem("@TRUFLATION")
        const charterContractAddress = sessionStorage.getItem("@NEWCHARTER")    
        const contractAbi = contractArtifact.abi
        if (truflationContractAddress && charterContractAddress) {
            const responseConnect = await connectToShipChartering(truflationContractAddress, charterContractAddress, contractAbi);
            if (responseConnect && responseConnect.hash && responseConnect.hash.length) {
                setStep(6)
                setisLoading(false)
            } else {
                setisLoading(false)
                alert("We encountered an issue while trying to deploy your contract. Please try again later or contact us for assistance.")
            }
        } else {
            alert("We didn't find any new contract to connect. Please try to start the process to create a new contract from beginning or contact us for assistance.")
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
                        We are currently working on connect your contract, with most real-world data, with your vessel charter agreement.    
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
                        Now we need to connect your contract,  with most real-world data, the price of a barrel of oil, the wind speed given a position, and the Haversine formula on the blockchain, with your vessel charter agreement.
                    </Text>
                    <Box pt={5}>
                        <Button
                            onClick={connectTruflationContract}
                        >
                            <Text>
                                Connect Truflation Contract
                            </Text>
                        </Button>
                    </Box>
                </>
            }
        </VStack>
    )
}
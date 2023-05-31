import { useState } from "react";
import { VStack, Text, Box, Spinner } from "@chakra-ui/react";
import Button from "../Button";
import connectToShipChartering from "@/utils/connectToShipChartering";
import contractArtifact from "../../../artifacts/contracts/PriceMaticUSD.sol/PriceMaticUSD.json"

export default function ConnectMaticPrice({ setStep }: { setStep: (value: number) => void }) {
    const [isLoading, setisLoading] = useState<boolean>(false)
    
    const connectMaticContract = async() => {
        setisLoading(true)
        const maticContractAddress = sessionStorage.getItem("@MATIC_CONTRACT")
        const charterContractAddress = sessionStorage.getItem("@NEWCHARTER")    
        const contractAbi = contractArtifact.abi
        if (maticContractAddress && charterContractAddress) {
            const responseConnect = await connectToShipChartering(maticContractAddress, charterContractAddress, contractAbi);
            if (responseConnect && responseConnect.hash && responseConnect.hash.length) {
                setStep(8)
                setisLoading(false)
            } else {
                setisLoading(false)
                alert("We encountered an issue while trying to connect your contract. Please try again later or contact us for assistance.")
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
                        We are currently working on connect your contract, with price Matic/USD, with your vessel charter agreement.    
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
                        Penultimate step. Please, connect your charter contract to the contract responsible for updating the Matic quote in US dollars.
                    </Text>
                    <Box pt={5}>
                        <Button
                            onClick={connectMaticContract}
                        >
                            <Text>
                                Connect Price Matic Contract
                            </Text>
                        </Button>
                    </Box>
                </>
            }
        </VStack>
    )
}
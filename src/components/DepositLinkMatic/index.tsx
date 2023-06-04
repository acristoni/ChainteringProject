import { useState } from "react";
import { VStack, Text, Box, Spinner } from "@chakra-ui/react";
import Button from "../Button";
import contractArtifact from "../../../artifacts/contracts/PriceMaticUSD.sol/PriceMaticUSD.json"
import depositLinkToken from "@/utils/contractInteractions/depositLinkToken";

export default function DepositLinkMatic({ setStep }: { setStep: (value: number) => void }) {
    const [isLoading, setisLoading] = useState<boolean>(false)
    
    const depositLinkTokenInMatic = async() => {
        setisLoading(true)
        const maticContractAddress = sessionStorage.getItem("@MATIC_CONTRACT")
        const contractAbi = contractArtifact.abi
        if (maticContractAddress) {
            const responseDeposit = await depositLinkToken(maticContractAddress, contractAbi);
            if (responseDeposit 
                && responseDeposit !== true
                && responseDeposit.hash 
                && responseDeposit.hash.length) {
                setStep(9)
                setisLoading(false)
            } else {
                setisLoading(false)
                alert("We encountered an issue while trying to deposit LINK in your contract. Please try again later or contact us for assistance.")
            }
        } else {
            alert("We didn't find any contract to deposit. Please try again later or contact us for assistance.")
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
                        We are currently working on deposit LINK in your contract.
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
                        Last step. Now, please proceed with depositing 1 LINK token into the recently connected contract. This token will serve as payment for each query to update Matic/USD price.
                    </Text>
                    <Box pt={5}>
                        <Button
                            onClick={depositLinkTokenInMatic}
                        >
                            <Text>
                                Deposit Link Token
                            </Text>
                        </Button>
                    </Box>
                </>
            }
        </VStack>
    )
}
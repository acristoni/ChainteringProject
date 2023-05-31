import { useState } from "react";
import { VStack, Text, Box, Spinner } from "@chakra-ui/react";
import Button from "../Button";
import contractArtifact from "../../../artifacts/contracts/Truflation.sol/Truflation.json"
import depositLinkToken from "@/utils/depositLinkToken";

export default function DepositLinkMatic({ setStep }: { setStep: (value: number) => void }) {
    const [isLoading, setisLoading] = useState<boolean>(false)
    
    const depositLinkTokenInTruflation = async() => {
        setisLoading(true)
        const truflationContractAddress = sessionStorage.getItem("@TRUFLATION")
        const contractAbi = contractArtifact.abi
        if (truflationContractAddress) {
            const responseDeposit = await depositLinkToken(truflationContractAddress, contractAbi);
            if (responseDeposit && responseDeposit.hash && responseDeposit.hash.length) {
                setStep(7)
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
                        We are almost finished. Now, please proceed with depositing 1 LINK token into the recently connected contract. This token will serve as payment for each query of your real-world data charter contract.
                    </Text>
                    <Box pt={5}>
                        <Button
                            onClick={depositLinkTokenInTruflation}
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
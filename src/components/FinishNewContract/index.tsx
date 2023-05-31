import { useState } from "react";
import { VStack, Text, Box, HStack } from "@chakra-ui/react";
import Button from "../Button";
import { useRouter } from 'next/router';

export default function FinishNewContract() {
    const [isLoading, setisLoading] = useState<boolean>(false)
    const router = useRouter();
    
    const handleButton = () => {
        setisLoading(true)
        sessionStorage.removeItem("@NEWCHARTER")
        sessionStorage.removeItem("@TRUFLATION")
        sessionStorage.removeItem("@MATIC_CONTRACT")
        router.reload();
    }

    return (
        <VStack 
            w="100%"
            maxW={['90%', '90%', '680px', '680px', '680px']}
            pt={7}
        >
            <Text 
                as='b'
                fontSize={['xl','xl','2xl','2xl','2xl']}
            >
                Congratulations, you have just prepared your time charter party contract for a vessel. Now, the charterer is responsible for initiating the duration of the contract for this vessel. We, at Chaintering, are available here to address any further inquiries or clarifications you may have.
            </Text>
            <HStack
                background="blue.800"
                color="white"
                p={4}
                rounded="md"
                shadow="2xl"
                m={4}
            >
                <Text 
                    as='b'
                    fontSize={['xl','xl','2xl','2xl','2xl']}
                >
                    Fair Winds and Following Seas.
                </Text>
            </HStack>
            
            <Box pt={5}>
                <Button
                    onClick={handleButton}
                    isLoading={isLoading}
                >
                    <Text>
                        Go to Dashboard
                    </Text>
                </Button>
            </Box>
        </VStack>
    )
}
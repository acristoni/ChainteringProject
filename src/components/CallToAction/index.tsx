import { useState } from "react";
import { VStack, Text, Stack, HStack } from "@chakra-ui/react";
import Card from "../Card";
import { Files, Wallet } from "@phosphor-icons/react";
import { useRouter } from "next/router";
import handleConnectButton from "@/utils/userInteractions/handleConnectButton";
import handleDocumentationButton from "@/utils/userInteractions/handleDocumentationButton";

export default function CallToAction() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter()

    return (
        <HStack
            w="100%"
            bgColor="blue.800"
            justify="center"
            pt={7}
        >
            <VStack 
                w={["90%", "90%", "80%", "70%", "50%"]}
                align="center"
            >
                <Text
                    fontFamily="EB Garamond"
                    fontSize={['lg', 'lg', 'xl', '2xl', '3xl']}
                    as="b"
                    color="white"
                >
                    Ready for seamless vessel chartering? Explore our documentation to learn how our dApp simplifies the process. Connect your wallet to initiate a contract or access your dashboard if you already have contracts associated with your wallet address. Start chartering with ease today!
                </Text>
                <Stack
                    h="100%"
                    w="100%"
                    flexDir={['column', 'row', 'row', 'row', 'row']}
                    justify='space-between'
                    align={["center", "end", "end", "end", "end"]}
                    px={[10, '1vw', '12vw', '15vw', '8vw']}
                    py={7}
                >
                    <Card 
                        title="Documention" 
                        icon={<Files size={96} weight="thin" />}
                        onClick={handleDocumentationButton}
                    />
                    <Card 
                        title="Connect" 
                        icon={<Wallet size={96} weight="thin" />}
                        onClick={()=>handleConnectButton(setIsLoading, router)}
                        isLoading={isLoading}
                    />
                </Stack>
            </VStack>
        </HStack>
    )
}
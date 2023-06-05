import { HStack, Stack, Text } from "@chakra-ui/react";
import Logo from "../Logo";

export default function MainBanner() {
    return (
        <Stack
            minH="15vh"
            h="100%"
            w="100%"
            flexDir={['column', 'column', 'column', 'column', 'row']}
            justify={['center', 'center', 'center', 'center', 'space-between']}
            align="center"
            p={[10, 7, 7, 7, '5vw']}
            shadow="2xl"
        >
            <Logo main/>
            <HStack
                w={['85%', '85%', '85%', '85%', '40%']}
                pt={7}
            >
                <Text
                    fontFamily="EB Garamond"
                    fontSize={['lg', 'lg', 'xl', 'xl', '2xl']}
                    as="b"
                    color="blue.800"
                >
                    Blockchain-Powered Vessel Charter Contracts: Experience the future of vessel chartering with our dApp, leveraging the power of blockchain technology. Say goodbye to traditional contracts and embrace the transparency and security of smart contracts.
                </Text>
            </HStack>
        </Stack>
    )
}
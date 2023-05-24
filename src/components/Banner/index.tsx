import { HStack, Stack, Text } from "@chakra-ui/react";
import Image from 'next/image';

type Props = {
    text: string
    reverse?: boolean
    imgSrc: string
    imgAlt: string
}

export default function Banner({ text, reverse, imgSrc, imgAlt }: Props) {
    return (
        <Stack
            minH="15vh"
            h="100%"
            w="100%"
            flexDir={['column', 'column', 'column', 'column', `${reverse ? 'row-reverse' : 'row'}`]}
            justify={['center', 'center', 'center', 'center', 'space-between']}
            align="center"
            p={[10, 7, 7, 7, '5vw']}
            px={[10, 10, 10, 10, '20vw']}
        >
            <Image src={imgSrc} alt={imgAlt} width={320} height={250} />
            <HStack
                w={['85%', '85%', '85%', '85%', '40%']}
                backgroundColor={reverse ? 'blue.800' : 'white'}
                p={7}
            >
                <Text
                    fontFamily="EB Garamond"
                    fontSize={['md', 'md', 'lg', 'lg', 'xl']}
                    as="b"
                    color={reverse ? "white" : "blue.800"}
                >
                    {text}
                </Text>
            </HStack>
        </Stack>
    )
}
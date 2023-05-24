import { VStack, Text, Box } from "@chakra-ui/react";
import Image from 'next/image';
import { ReactElement } from "react";

type Props = {
    title: string
    icon: ReactElement
}

export default function Card({ title, icon }: Props) {
    return (
        <VStack
            rounded="md"
            p={2}
            bg="white"
            w="200px"
            h="150px"
            align="center"
            justify="center"
            _hover={{
                color: 'black',
                background: 'white',
                transition: '0.1s ease-out',
                transform: 'translateY(-1px)',
                boxShadow: "5px 5px 5px 5px #cccccc",
                cursor: 'pointer'
            }}
            _active={{
                transition: '0.1s ease-out',
                transform: 'scale(0.98)',
                boxShadow: "1px 1px 1px 1px #cccccc",
            }}
        >
            <Box maxW='200px' maxH='200px' >
                {icon}
            </Box>
            <Text
                textAlign="center"
                fontFamily="EB Garamond"
                fontSize={['md', 'md', 'md', 'lg', '2xl']}
                as="b"
                color="blue.800"
            >
                {title}
            </Text>
        </VStack>
    )
}
import { VStack, Text, Spinner, HStack } from "@chakra-ui/react";
import { ReactElement } from "react";

type Props = {
    title: string
    icon: ReactElement
    onClick: ()=>{}
    isLoading?: boolean
}

export default function Card({ title, icon, onClick, isLoading }: Props) {
    return (
        <VStack
            onClick={onClick}
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
            <HStack 
                maxW='200px' 
                maxH='200px' 
                justify='center'
                align='center'
            >
                {
                    isLoading ?
                    <Spinner
                        thickness='4px'
                        speed='0.65s'
                        emptyColor='gray.200'
                        color='blue.500'
                        size='xl'
                    /> :
                    icon
                }
            </HStack>
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
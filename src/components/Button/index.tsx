import { ChakraProps, Button as ButtonChakra, background } from "@chakra-ui/react";
import { ReactElement } from "react";

interface Props extends ChakraProps {
    children: ReactElement,
    onClick: ()=>void
}

export default function Button ({ children, onClick }: Props) {

    return <ButtonChakra
        bg="blue.800"
        color="white"
        onClick={onClick}
        _hover={{
            color: 'black',
            background: 'white',
            transition: '0.1s ease-out',
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
        }}
        _active={{
            transition: '0.1s ease-out',
            transform: 'scale(0.98)',
            boxShadow: 'base',
        }}
    >
        {children}
    </ButtonChakra>
}
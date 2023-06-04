import { VStack, Text, Box } from "@chakra-ui/react";
import createUser from "../../../services/createUser"
import { useRouter } from "next/router";
import getUserAddress from "@/utils/userInteractions/getUserAddress";

type Props = {
    title: string
    // icon: ReactElement,
    role: string
}

export default function CardRole({ title, role }: Props)  {
    const router = useRouter()

    const handleCardRoleClick = async() => {
        const mainAccount = await getUserAddress();
        const response = await createUser(role, mainAccount)
        if (response.success) {
            sessionStorage.setItem("@ROLE", role)
            sessionStorage.setItem("@WALLET", mainAccount)
            router.push('/dashboard')
            alert('Your wallet has been successfully associated with the chosen role. Enjoy now our Contracts Dashboard.')
        } else {
            alert("We encountered an issue while trying to register a role for the connected wallet. Please try again later or get in touch with us.")
        }
    }

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
            onClick={handleCardRoleClick}
        >
            {/* <Box maxW='200px' maxH='200px' >
                {icon}
            </Box> */}
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

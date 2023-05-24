import { HStack, Text } from "@chakra-ui/react";
import Link from "next/link";


export default function Logo({footer}: {footer?: boolean}) {
    return (
        <Link href="/">
            <HStack
                cursor="pointer"
            >
                <Text
                    as='b'
                    color="blue.800"
                    fontSize={footer ? 25 : 40}
                    style={{
                        margin: 0
                    }}
                    fontFamily="Lobster"
                >
                    Chaintering
                </Text>
            </HStack>
        </Link>
    )
}
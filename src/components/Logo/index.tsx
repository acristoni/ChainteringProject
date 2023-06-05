import { HStack, Text } from "@chakra-ui/react";
import Link from "next/link";


export default function Logo({main}: {main?: boolean}) {
    return (
        <Link href="/">
            <HStack
                cursor="pointer"
            >
                <Text
                    as='b'
                    color="blue.800"
                    fontSize={main ? [60, 80, 100, 120, 130] : 40}
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
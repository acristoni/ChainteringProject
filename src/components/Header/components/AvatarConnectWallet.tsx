import { Avatar, HStack } from "@chakra-ui/react";
import ButtonHeader from "./ButtonHeader";

export default function AvatarConnectWallet({ avatarName, onOpen }:{avatarName: string, onOpen: () => void}) {
    return (
        <HStack>
            {
                avatarName ?
                <Avatar name={avatarName} cursor="pointer" onClick={onOpen}/> :
                <ButtonHeader title="ConnectWallet" href="/connectWallet"/>
            }
        </HStack>
    )
}
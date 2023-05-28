import { Avatar, HStack } from "@chakra-ui/react";
import ButtonHeader from "./ButtonHeader";
import connectWallet from "../../../../utils/connectWallet";
import { useRouter } from 'next/router';

export default function AvatarConnectWallet({ avatarName, onOpen }:{avatarName: string, onOpen: () => void}) {
    const router = useRouter();
    
    const handleConnectButton = async() => {
        const responseConnection = await connectWallet()
        if (typeof responseConnection === 'string') {
            if (responseConnection === "registeredUser") {
                router.push('/dashboard');
            }
            if (responseConnection === "choseRole") {
                router.push('/chooserole');
            }
        }
    }
    
    
    return (
        <HStack>
            {
                avatarName ?
                <Avatar name={avatarName} cursor="pointer" onClick={onOpen}/> :
                <ButtonHeader title="ConnectWallet" onClick={handleConnectButton}/>
            }
        </HStack>
    )
} 
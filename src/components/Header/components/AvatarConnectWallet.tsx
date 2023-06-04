import { Avatar, HStack } from "@chakra-ui/react";
import { useRouter } from 'next/router';
import ButtonHeader from "./ButtonHeader";
import connectWallet from "@/utils/userInteractions/connectWallet";
import checkNetwork from "@/utils/userInteractions/checkNetwork"

export default function AvatarConnectWallet({ avatarName, onOpen }:{avatarName: string, onOpen: () => void}) {
    const router = useRouter();
    
    const handleConnectButton = async() => {
        const isOnMumbai = await checkNetwork().catch(error => {
            console.error('Ocorreu um erro:', error);
        });
        
        if (isOnMumbai) {
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

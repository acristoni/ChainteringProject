import { useState } from "react";
import { Avatar, HStack } from "@chakra-ui/react";
import { useRouter } from 'next/router';
import ButtonHeader from "./ButtonHeader";
import connectWallet from "@/utils/userInteractions/connectWallet";
import checkNetwork from "@/utils/userInteractions/checkNetwork"

export default function AvatarConnectWallet({ avatarName, onOpen }:{avatarName: string, onOpen: () => void}) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter();
    
    const handleConnectButton = async() => {
        setIsLoading(true)
        const isOnMumbai = await checkNetwork().catch(error => {
            console.error('Ocorreu um erro:', error);
            setIsLoading(false)
        });
        
        if (isOnMumbai) {
            const responseConnection = await connectWallet()
            if (typeof responseConnection === 'string') {
                if (responseConnection === "registeredUser") {
                    router.push('/dashboard');
                    setIsLoading(false)
                }
                if (responseConnection === "choseRole") {
                    router.push('/chooserole');
                    setIsLoading(false)
                }
            }
        }
    }    
    
    return (
        <HStack>
            {
                avatarName ?
                <Avatar name={avatarName} cursor="pointer" onClick={onOpen}/> :
                <ButtonHeader 
                    title="ConnectWallet" 
                    onClick={handleConnectButton} 
                    isLoading={isLoading}
                />
            }
        </HStack>
    )
} 

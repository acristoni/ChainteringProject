import { useEffect, useState } from "react"
import { useRouter } from 'next/router'
import { 
    HStack, 
    IconButton, 
    useDisclosure,
    useMediaQuery,
    VStack} from "@chakra-ui/react"
import GroupButtonsHeader from "./components/GroupButtonsHeader"
import AvatarConnectWallet from "./components/AvatarConnectWallet"
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import Logo from "../Logo"
import ButtonHeader from "./components/ButtonHeader"

export default function Header() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [avatarName, setAvatarName] = useState('')
    const [showMenu, setShowMenu] = useState(false)
    const router = useRouter()
    const [isMobile] = useMediaQuery('(max-width: 900px)')

    return (
        <>
            <HStack
                justify="space-between"
                h={isMobile ? "25%" : "8vh"}
                w="100%"
                bg="gray.50"
                align="center"
                p={3}
                shadow="2xl"
                position={!isMobile ? "fixed" : "inherit"}
            >
                {
                    isMobile ?
                    <VStack
                        w="100%"    
                    >
                        <HStack
                            w="100%"
                            justify="space-between"
                            align="center"
                        >
                            <Logo />
                            <IconButton 
                                aria-label='Menu Mobile' 
                                icon={showMenu ? <CloseIcon /> : <HamburgerIcon />} 
                                onClick={()=>setShowMenu(!showMenu)}
                            />
                        </HStack>
                        <VStack
                            w="100%"
                            align="end"    
                            display={showMenu ? "flex" : "none"}
                        >
                            <GroupButtonsHeader />
                            <AvatarConnectWallet 
                                avatarName={avatarName} 
                                onOpen={onOpen}                
                            />
                        </VStack>
                    </VStack> :
                    <HStack
                        w="100%"
                        justify="space-between"
                        align="center"
                    >
                        <HStack>
                            <Logo />
                        </HStack>
                        <HStack>
                            <ButtonHeader 
                                title="Documentation" 
                                href="/documentation"
                            />
                            <AvatarConnectWallet 
                                avatarName={avatarName} 
                                onOpen={onOpen}                
                            />
                        </HStack>
                    </HStack>
                }
            </HStack>
        </>
    )
}
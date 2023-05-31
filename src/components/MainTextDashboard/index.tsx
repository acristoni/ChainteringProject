import { Text } from "@chakra-ui/react"

export default function MainTextDashboard({ mainText }: { mainText: string }) {
    return  <Text 
    as='b'
    fontSize={['xl','xl','2xl','2xl','2xl']}
    w="100%"
    padding={5}
    rounded="md"
    boxShadow="base"
    background="blue.800"
    color="white"
    mt={10}
    mb={4}
    textAlign="center"
  >
    {mainText}
  </Text>
}
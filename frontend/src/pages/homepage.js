import { Container, Box, Text, Tabs, Tab, TabList,TabPanel, TabPanels } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import Login from '../component/Auth/login';
import Signup from '../component/Auth/signup';
import { useHistory } from 'react-router-dom';

const Homepage = () => {
     const history=useHistory();
     useEffect(()=>{
      const user=JSON.parse(localStorage.getItem("userInfo"));
      if(user) history.push("/chats");
     },[history])
  return (
    <>
    <Container maxW='xl' centerContent>
<Box
d="flex"
justifyContent={"center"}
p={3}
bg="linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.5))"
color={"white"}
w="100%"
m="40px 0 15px 0"
borderRadius="lg"
borderWidth="1px"
textAlign={"center"}
>
  <Text fontSize="3xl" fontFamily="Lato, sans-serif">Live Chat Application</Text>
</Box>
<Box bg="linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.5))" w="100%" p={4} borderRadius="lg" borderWidth="1px" >
<Tabs variant='soft-rounded' colorScheme='blue'>
  <TabList md="1em">
    <Tab color="white" w="50%">Login</Tab>
    <Tab color="white" w="50%">SignUp</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>
  <Login />
    </TabPanel>
    <TabPanel>
  <Signup />
    </TabPanel>
  </TabPanels>
</Tabs>
</Box>
    </Container>
    </>
  )
}

export default Homepage
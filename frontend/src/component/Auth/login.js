import React, { useState } from 'react'
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react';
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import {useHistory}  from "react-router-dom";
import { ChatState } from '../../Context/chatProvider';
const Login = () => {
      const [show,setshow]=useState(false);
       const [email,setemail]=useState();
       const [password,setpassword]=useState();
       const [loading,setLoading] = useState(false);
       const toast=useToast();
       const history=useHistory();
        const { setUser } = ChatState();

       const handleClick=()=>setshow(!show); 
       const submitHandler=async () =>{
        setLoading(true);
        if(!email || !password)
        {
          toast({
              title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
          });
          setLoading(false);
          return;
        }
        
        try{
          const config={
            headers:{
              "Content-type": "application/json",
            },
          };
         const {data} = await axios.post(
          "/api/user/login",
          {email,password},
          config
         );
    toast({
              title: "Login SuccessFully!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
          });
           setUser(data);
         const ee= localStorage.setItem("userInfo",JSON.stringify(data));
         console.log(ee);
          setLoading(false);
           history.push("/chats");
        }catch(error)
        {
             toast({
              title: "Error Occured!",
              description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
          });
          setLoading(false);
        }

       };

  return (
    <>
    <VStack spacing="5px" color="white">
    <FormControl id='email' isRequired>
        <FormLabel>Email</FormLabel>
        <Input 
        placeholder='Enter Your Email' value={email} onChange={(e)=>setemail(e.target.value)}
        />
    </FormControl>
    <InputGroup>
    <FormControl id='password' isRequired>
        <FormLabel>Password</FormLabel>
        <Input 
        type={show ? "text":"password"}
        placeholder='Enter Your Password' value={password} onChange={(e)=>setpassword(e.target.value)}
        />
        <InputRightElement width="4.5rem" mt={"8"}>
        <Button h="1.75rem" size="sm" onClick={handleClick}>
          {show ? "Hide": "Show"}
        </Button>
        </InputRightElement>
    </FormControl>
    </InputGroup>

    <Button bg="rgba(0, 0, 255, 0.5)" color="white" borderRadius={30} width={"100%"} style={{marginTop:15}} onClick={submitHandler} isLoading={loading}>
    Login
    </Button>
    <p>------------- or ----------------</p>
    <Button variant={"solid"} borderRadius={30} bg="rgba(255, 0, 0, 0.5)" color="white" width={"100%"} onClick={()=>{setemail("guest@example.com"); setpassword("123456")}}>
    Get Guest User Credentials
    </Button>
     </VStack>
    </>
  )
}

export default Login;
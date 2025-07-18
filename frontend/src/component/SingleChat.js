import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/chatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModel from './miscellaneous/ProfileModel';
import UpadteGroupChatModel from './miscellaneous/UpadteGroupChatModel';
import axios from 'axios';
import "./style.css";
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

const ENDPOINT = window.location.origin;
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setsoketConnected] = useState(false);
  const [typing, setTyping]= useState(false);
  const [isTyping, setIsTyping]= useState(false);

  const defaultOptions={
    loop:true,
    autoplay: true,
    animationData: animationData,
    rendererSettings:{
      preserveAspectRatio: "xMidYMid slice",
    }
  }

    const toast = useToast();
 const { selectedChat, setSelectedChat, user, notification, setnotification} =ChatState();


    const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
    
      setMessages(data);
      setLoading(false);
      socket.emit('join chat', selectedChat._id);  


    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

    useEffect(() => {
  socket = io(ENDPOINT);

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socket.emit("setup", user);
  socket.on("connected", () => setsoketConnected(true));
  socket.on("typing", () => setIsTyping(true));
  socket.on("stop typing", () => setIsTyping(false));
}, []);
  
  useEffect(() => {
    fetchMessages();
    selectedChatCompare= selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);


    useEffect(()=>{
      socket.on("message recieved",(newMessageRecieved)=>{
        if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id)
        {
           if(!notification.includes(newMessageRecieved)){
            setnotification([newMessageRecieved,...notification]);
            setFetchAgain(!fetchAgain);
           }
        }
        else
        {
          setMessages([...messages,newMessageRecieved])
        }
      });
    })

const sendMessage = async (event) => {
  socket.emit("stop typing", selectedChat._id);
    if (event.key === "Enter" && newMessage) {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post("/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };





const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if(!socketConnected) return;
       
       if(!typing)
       {
        setTyping(true)
        socket.emit("typing", selectedChat._id);
       }
       let lastTypingTime = new Date().getTime();
       var timerLength = 3000;
       setTimeout(()=>{
          var timeNow= new Date().getTime();
          var timeDiff= timeNow - lastTypingTime;
          if(timeDiff >= timerLength && typing)
          {
            socket.emit('stop Typing', selectedChat._id);
            setTyping(false); 
          }
       },timerLength);
  };

  return (
    <>
    {
        selectedChat?(
            <>
            <Text 
            fontSize={{ base: "28px", md: "30px"}}
            pb={3}
            px={2}
            width="100%"
            fontFamily="Work Sans"
            display="flex"
            justifyContent={{base:"space-between"}}
            alignItems="center"
            >
               <IconButton 
               display={{ base: "flex", md: "none"}}
               icon={<ArrowBackIcon />}
               onClick={()=>setSelectedChat("")}
               />
               {!selectedChat.isGroupChat ?(
                <>
                {getSender(user, selectedChat.users)}
                <ProfileModel user={getSenderFull(user, selectedChat.users)} />
                </>
               ):(
                <>{selectedChat.chatName.toUpperCase()}
             <UpadteGroupChatModel 
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
                fetchMessages={fetchMessages}
                /> 
                </>
               ) }
            </Text>
            <Box  
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            width="100%"
            height="100%"
            borderRadius="lg"
            overflowY="hidden"
            >
               {loading ? (
                  <Spinner  
                  size="xl"
                  w={20}
                  h={20}
                  alignSelf="center"
                  margin="auto"      
                  />
               ):(
                 <div className='messages'>
                 <ScrollableChat messages={messages} />
                 </div>
               )
                  }
                  <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                    {isTyping ? <div>
                      <Lottie
                      options={defaultOptions}
                        width={70}
                        style={{marginLeft: 0, marginBottom: 15}}
                        />
                    </div>:(<></>)}
                      <Input
                      variant="filled"
                      bg="#E0E0E0"
                      placeholder='Enter a message...'
                      onChange={typingHandler}
                      value={newMessage}
                      />
                  </FormControl>
            </Box>
            </>
        ):(
            <Box
            display="flex" alignItems="center" justifyContent="center" height="100%">
              <Text fontSize="3xl" pb={3} fontFamily="Work sans" >
                   Click on a user to start chatting
              </Text>
            </Box>
        )
    }
    </>
  )
}

export default SingleChat

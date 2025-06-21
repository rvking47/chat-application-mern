import { Box, Button, Tooltip, Text, Menu, MenuItem, MenuList, MenuButton, Avatar, MenuDivider, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, position, useToast, Spinner, IconButton, Badge } from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/hooks';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import React, { useState } from 'react'
import { ChatState } from '../../Context/chatProvider';
import ProfileModel from './ProfileModel';
import { model } from 'mongoose';
import { useHistory } from 'react-router-dom';
import axios from "axios";
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';


const SlideDrawer=()=> {
  const [search, setSearch]= useState("");
  const [searchResult, setSearchResult]= useState([]);
  const [loading, setLoading]= useState();
  const [loadingChat, setLoadingChat]= useState();
const { user, setSelectedChat, chats, setChats, notification, setnotification } =  ChatState(); 
const toast=useToast();
  const { isOpen, onOpen, onClose } = useDisclosure()
  const history=useHistory();

const logoutHandler =()=>{
  localStorage.removeItem("userInfo");
  history.push("/")
};

const handleSearch=async ()=>{
  if(!search){
    toast({
      title:"Please Enter something in search",
      status:"warning",
      duration:5000,
      isClosable:true,
      position:"top-left",
    });
   return;
  }
  try{
    setLoading(true)

    const config={
      headers:{
      Authorization:`Bearer ${user.token}`,
      },
    };
    const {data} = await axios.get(`/api/user?search=${search}`,config)
    setLoading(false);
    setSearchResult(data)
  }
  catch (error){
    toast({
    title:"Error Occured!",
    description: "Faild to load the search reaults",
    status:"error",
    duration:5000,
    isClosable:true,
    position:"bottom-left",
    });
  }
}
const accessChat = async (userId)=>{
  try{
  setLoadingChat(true)
     const config={
      headers:{
      "Content-type":"application/json",
      Authorization:`Bearer ${user.token}`,
      },
    };
    const {data}= await axios.post('/api/chat',{userId}, config);
      if(!chats.find((c)=>c._id===data._id)) setChats([data,...chats]) ;
    setSelectedChat(data);
    setLoadingChat(false);
    onClose();
  }
  catch (error){
    toast({
      title:"Error fetching the chat",
      description:error.message,
      status:"error",
      duration:5000,
      isClosable:true,
      position:"bottom-left",
    });
  }
}
   const uniqueNotificationsMap = new Map();

  notification.forEach((notif) => {
    const chatId = notif.chat._id;
    if (!uniqueNotificationsMap.has(chatId)) {
      uniqueNotificationsMap.set(chatId, notif);
    }
  });

  const uniqueNotifications = Array.from(uniqueNotificationsMap.values());
  return (
    <>
    <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    bg="white"
    w="100%"
    p="5px 10px 5px 10px"
    borderWidth="5px"
    >
      <Tooltip label="Search Users to Chat" hasArrow placement='bottom-end'>
      <Button variant="ghost" onClick={onOpen}>
        <i className="fas fa-search"></i>
        <Text display={{base:"none", md:"flex"}} px="4">
          Search User
        </Text>
      </Button>
      </Tooltip>
      <Text fontSize="2xl" fontFamily="Work sans">
        Chat Application
      </Text>
      <div>
        
  <Menu>
      <Box position="relative" display="inline-block">
        <MenuButton
          as={IconButton}
          icon={<BellIcon />}
          variant="ghost"
          fontSize="2xl"
        />
        {uniqueNotifications.length > 0 && (
          <Badge
          backgroundColor="red"
            color="white"
            borderRadius="full"
            position="absolute"
            top="-1"
            right="0"
            px={2}
            fontSize="0.8em"
          >
            {uniqueNotifications.length}
          </Badge>
        )}
      </Box>

      <MenuList pl={2}>
        {uniqueNotifications.length === 0 && "No New Messages"}
        {uniqueNotifications.map((notif) => (
          <MenuItem
            key={notif._id}
            onClick={() => {
              setSelectedChat(notif.chat);
              setnotification(notification.filter((n) => n.chat._id !== notif.chat._id));
            }}
          >
            {notif.chat.isGroupChat
              ? `New Message in ${notif.chat.chatName}`
              : `New Message from ${getSender(user, notif.chat.users)}`}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
       <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
   <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
  </MenuButton>
  <MenuList>
    <ProfileModel user={user}>
    <MenuItem>My Profile</MenuItem>
    </ProfileModel>
    <MenuDivider />
    <MenuItem onClick={logoutHandler}>Logout</MenuItem>
  </MenuList>
        </Menu> 
      </div>
    </Box>
    <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
     <DrawerOverlay />
     <DrawerContent>
      <DrawerHeader borderBottomWidth="1px">Search User</DrawerHeader>
           <DrawerBody>
      <Box display="flex" paddingBottom={2}>
<Input 
placeholder='Search By Name Or Email'
mr={2}
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>
<Button
onClick={handleSearch}
>Go</Button>
      </Box>
      {loading ?(
          <ChatLoading />
      ):(
    searchResult?.map(user=>(
      <UserListItem key={user._id}
      user={user}
      handleFunction={()=>accessChat(user._id)}
      />
    ))
      )}
      {loadingChat && <Spinner ml="auto" display="flex" />}
     </DrawerBody>
     </DrawerContent>
    </Drawer>
    </>
  )
}

export default SlideDrawer
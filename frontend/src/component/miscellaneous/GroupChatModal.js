import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../Context/chatProvider';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';

const GroupChatModal = ({children}) => {
      const { isOpen, onOpen, onClose } = useDisclosure()
      const [groupChatName, setGroupChatName]= useState();
      const [selectedUsers, setSelectedUsers]= useState([]);
      const [search, setSearch]= useState("");
      const [searchReasult, setSearchReasult]= useState([]);
      const [loading, setloading]= useState(false);
      const toast=useToast();
      const {user,chats,setChats}= ChatState();
    const handleSearch= async (query)=>{
        setSearch(query)
        if(!query)
        {
            return;
        }
        try{
              setloading(true)
               const config={
      headers:{
      Authorization:`Bearer ${user.token}`,
      },
    };
    const {data}= await axios.get(`/api/user?search=${search}`, config);
    setloading(false);
    setSearchReasult(data);
        }
        catch (error)
        {
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
 const handleSubmit=async ()=>{
if(!groupChatName || !selectedUsers)
{
              toast({
    title:"Please fill all the feilds",
    status:"warning",
    duration:5000,
    isClosable:true,
    position:"top",
    });  
    return; 
}
try{
            const config={
      headers:{
      Authorization:`Bearer ${user.token}`,
      },
    };
    const {data}= await axios.post('/api/chat/group',{
        name:groupChatName,
        users:JSON.stringify(selectedUsers.map((u)=>u._id)),
    }, config);
    setChats([data,...chats])
    onClose();
                toast({
    title:"New Group Chats Created!",
    status:"success",
    duration:5000,
    isClosable:true,
    position:"bottom",
    });  
}
catch (error)
{
            toast({
    title:"Faild to Create the Chat",
    description:error.message,
    status:"error",
    duration:5000,
    isClosable:true,
    position:"bottom",
    });  
}
    }
 const handleDelete=(delUser)=>{
   setSelectedUsers(selectedUsers.filter((sel)=>sel._id !== delUser._id))

    }
     const handlGroup=(userToAdd)=>{
        if(selectedUsers.includes(userToAdd)){   
                toast({
    title:"User already added",
    status:"warning",
    duration:5000,
    isClosable:true,
    position:"top",
    }); 
    return;
            }
       setSelectedUsers([...selectedUsers,userToAdd])
     }
  return (
 <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
          fontSize="35px"
          fontFamily="Work sans"
          display="flex"
          justifyContent="center"
          >Create Group Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody  display="flex" flexDir="column" alignItems="center">
          <FormControl>
            <Input placeholder="Chat Name" mb={3} onChange={(e)=> setGroupChatName(e.target.value)} />
          </FormControl>
            <FormControl>
            <Input placeholder="Add User eg: Rahul, Abhishek, Vipin" mb={1} onChange={(e)=> handleSearch(e.target.value)} />
          </FormControl>
          <Box w={"100%"} display="flex" flexWrap="wrap">
         {selectedUsers.map(u=>(
            <UserBadgeItem key={user._id} user={u}
            handleFunction={()=>handleDelete(u)}
            />
         ))}
         </Box>
        {loading?<div>--Loading--</div> : (
            searchReasult?.slice(0,4).map(user=>(
                <UserListItem key={user._id} user={user} handleFunction={()=>handlGroup(user)} />
            ))
        )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' onClick={handleSubmit}>
              Create Chat
            </Button>

          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default GroupChatModal
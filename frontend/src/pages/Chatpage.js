import { Box } from "@chakra-ui/react";
import { ChatState } from "../Context/chatProvider"
import SlideDrawer from "../component/miscellaneous/SlideDrawer";
import MyChats from "../component/MyChats";
import ChatBox from "../component/ChatBox";
import { useState } from "react";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain]= useState(false)
  const { user } =  ChatState(); 
  
  return <div style={{width:"100%"}}>
    { user && <SlideDrawer /> }
    <Box
    display="flex"
    justifyContent="space-between"
    width="100%"
    height="91.5vh"
    padding="10px"
    >
      {user &&( <MyChats fetchAgain={fetchAgain} />
    )}
      {user && (<ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      )}
    </Box>
  </div>
}

export default Chatpage
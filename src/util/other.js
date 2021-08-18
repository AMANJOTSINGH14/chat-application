const generateTime=(username,message)=>{
    return{
        username,
        text:message,
        createdAt:new Date().getTime()
    }
}

const generateLocation=(username,url)=>{
    return{
        username,
        url,
        createdAt:new Date().getTime()
    }
}
module.exports={
    generateTime,
    generateLocation
}
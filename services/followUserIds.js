const Follow = require("../Models/follower")

const followUserIds = async(identityUserId)=> {
    try{
        let following = await Follow.find({"user": identityUserId})
        .select({"_id":0, "followed": 1})
                
        let followers = await Follow.find({"followed": identityUserId})
        .select({"user":1, "_id": 0});


        let CleanArrayFollowing = [];
        
        following.forEach(follow => {
            CleanArrayFollowing.push(follow.followed)
        })
        let FollowersCleanArray = [];

        followers.forEach(seguir => {
            FollowersCleanArray.push(seguir.user)
        })
return {
following: CleanArrayFollowing,
followers : FollowersCleanArray
}
    } catch(error){
        return {}
    }
  
}

const followThisUser = async(identityUserId, profileUserId)=> {

    let following = await Follow.find({"user": identityUserId, "followed": profileUserId})
                
    let followers = await Follow.find({"followed": identityUserId, "user": profileUserId})

        return {
            following,
            followers
        }
        
}

module.exports ={
    followUserIds,
    followThisUser
}
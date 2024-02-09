const jwt = require("jwt-simple");
const moment = require("moment");

const secret = "This_is_my_secret_social_password";

const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(15, "days").unix(),
  };
  return jwt.encode(payload, secret);
};

module.exports = {
  createToken,
  secret,
};

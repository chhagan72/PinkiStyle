module.exports = {
JWT_SECRET: process.env.JWT_SECRET || 'devsecret',
ADMIN_EMAILS: (process.env.ADMIN_EMAILS || 'chhagankumarkumawat1212@gmail.com').split(','),
ADMIN_MOBILES: (process.env.ADMIN_MOBILES || '7232083504').split(','),
};
const Dev = require('../models/Dev');

module.exports = {
    async index(req, res){
        const { user } = req.headers;

        const loggedDev = await Dev.findById(user);

        if(!loggedDev){
            return res.status(400).json({
                error: 'Usuário inexistente.'
            });
        }

        const users = await Dev.find({
            $and: [
                { _id: { $ne: user } },
                { _id: { $in: loggedDev.likes } },
            ],
        });

        return res.json(users);
    },

    async store(req, res){
        const { user } = req.headers;
        const { devId } = req.params;
        
        const loggedDev = await Dev.findById(user);
        const targetDev = await Dev.findById(devId);

        if(!targetDev){
            return res.status(400).json({
                error: 'Usuário inesistente.'
            });
        }

        if(targetDev.likes.includes(loggedDev._id)){
            const loggedSocket = req.connectedUsers[user];
            const targetSocket = req.connectedUsers[devId];

            if(loggedSocket){
                req.io.to(loggedSocket).emit('match', targetDev);
            }

            if(targetSocket){
                req.io.to(targetSocket).emit('match', loggedDev);
            }

            loggedDev.matchs.push(targetDev._id);
            targetDev.matchs.push(loggedDev._id);
        }

        loggedDev.likes.push(targetDev._id);

        await loggedDev.save();
        await targetDev.save();

        return res.json(loggedDev);
    },

    async delete(req, res){
        const { user } = req.headers;
        const { devId } = req.params;

        const loggedDev = await Dev.findById(user);
        const targetDev = await Dev.findById(devId);

        if(!targetDev){
            return res.status(400).json({
                error: 'Usuário inesistente.'
            });
        }

        
        loggedDev.matchs.remove(targetDev._id);
        targetDev.matchs.remove(loggedDev._id);       
        
        loggedDev.likes.remove(targetDev._id);

        await loggedDev.save();
        await targetDev.save();

        return res.json(loggedDev);
    }
}
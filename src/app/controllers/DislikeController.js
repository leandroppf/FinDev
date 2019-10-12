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
                { _id: { $in: loggedDev.dislikes } },
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

        loggedDev.dislikes.push(targetDev._id);

        await loggedDev.save();

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

        loggedDev.dislikes.remove(targetDev._id);
        
        await loggedDev.save();

        return res.json(loggedDev);
    }
}
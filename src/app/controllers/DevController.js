const axios = require('axios');
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
                { _id: { $nin: loggedDev.likes } },
                { _id: { $nin: loggedDev.dislikes } },
            ],
        });

        return res.json(users);
    },

    async store(req, res){
        const { username, password, email } = req.body;

        if(password.length < 6 || password.length > 16){
            return res.status(400).json({
                msg: 'A senha não atende aos requisitos de tamanho: Entre 6 e 16 caracteres.'
            });
        }

        if(email.length > 56){
            return res.status(400).json({
                msg: 'O E-mail inserido é muito longo, deve conter no máximo 56 caracteres.'
            });
        }

        const userExists = await Dev.findOne({ user: username });

        if(userExists){
            return res.status(400).json({
                msg: 'Usuário já cadastrado.'
            });
        }
        
        const response = await axios.get(`https://api.github.com/users/${username}`).catch(error => {
            return res.status(400).json({
                msg: 'Ocorreu um erro ao buscar o usuário informado no Github. Verifique se digitou corretamente e tente mais uma vez.'
            });
        });

        const { name, bio, avatar_url: avatar } = response.data;

        const dev = await Dev.create({
            name: name ? name : username,
            user: username,
            email: email,
            password: password,
            bio: bio ? bio : 'sem bio',
            avatar
        });

        return res.json(dev);
    },

    async changePass(req, res){
        const { user, email, password } = req.body;

        const userFind = await Dev.findOne({ user });

        if(!userFind){
            return res.status(400).json({
                msg: 'Usuário não encontrado.'
            });
        }

        if(userFind.email !== email){
            return res.status(400).json({
                msg: 'E-mail incorreto.'
            });
        }

        if(password.length < 6 || password.length > 16){
            return res.status(400).json({
                msg: 'A senha não atende aos requisitos de tamanho: Entre 6 e 16 caracteres.'
            });
        }

        userFind.password = password;

        userFind.save();

        return res.json(userFind);
    },

    async auth(req, res){
        const { user, password } = req.body;

        const account = await Dev.findOne({ user });

        if(!account){
            return res.status(400).json({
                error: "Usuário não encontrado."
            });
        }

        if(!(await account.compareHash(password))){
            return res.status(400).json({
                error: "Senha incorreta."
            });
        }

        const response = await axios.get(`https://api.github.com/users/${user}`).catch(error => {
            return res.status(400).json({
                msg: 'Ocorreu um erro ao buscar o usuário informado no Github. Verifique se digitou corretamente e tente mais uma vez.'
            });
        });

        const { name, bio, avatar_url: avatar } = response.data;

        account.name = name;
        account.bio = bio;
        account.avatar = avatar;

        account.save();

        return res.json({ account, token: Dev.generateToken(account) });
    },

    async getMatchs(req, res){
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
                { _id: { $in: loggedDev.matchs } },
            ],
        });

        return res.json(users);
    }
};
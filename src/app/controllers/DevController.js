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
            })
        }

        if(email.length > 56){
            return res.status(400).json({
                msg: 'O E-mail inserido é muito longo, deve conter no máximo 56 caracteres.'
            })
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
            })
        });

        const { name, bio, avatar_url: avatar } = response.data;

        const dev = await Dev.create({
            name: name ? name : username,
            user: username,
            email: email,
            password: password,
            bio: bio ? bio : 'sem bio',
            avatar
        })

        return res.json(dev);
    },

    async comparePass(req, res){
        const { user, password } = req.headers;

        const userFind = await Dev.findById(user);

        if(userFind){
            var resp = await userFind.compareHash(password);

            return res.json(resp);
        }else{
            return res.status(400).json({
                msg: 'Usuário não encontrado.'
            })
        }
    },

    async auth(req, res){
        const { user, password } = req.body;

        const account = await Dev.findOne({ user })

        if(!user){
            return res.status(400).json({
                error: "Usuário não encontrado."
            })
        }

        if(!(await account.compareHash(password))){
            return res.status(400).json({
                error: "Senha incorreta."
            })
        }

        return res.json({ account, token: Dev.generateToken(account) })
    }
};
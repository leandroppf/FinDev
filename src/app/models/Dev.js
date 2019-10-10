const { Schema, model} = require('mongoose');
const bcrypt = require('../../bcryptjs/dist/bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

const DevSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: String,
    avatar: {
        type: String,
        required: true,
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'Dev',
    }],
    dislikes: [{
        type: Schema.Types.ObjectId,
        ref: 'Dev',
    }],
}, {
    timestamps: true
});

DevSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        next()
    }
    
    this.password = await bcrypt.hash(this.password, 8, this.email);
});

DevSchema.methods = {
    compareHash(password){
        return bcrypt.compareSync(password, this.password, this.email);
    }
}

DevSchema.statics = {
    generateToken ({ id }) {
        return jwt.sign({ id }, authConfig.secret, {
            expiresIn: authConfig.ttl
        });
    }
}

module.exports = model('Dev', DevSchema);

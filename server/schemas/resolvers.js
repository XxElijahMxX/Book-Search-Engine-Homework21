const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        
        // this gets a user by their username
        me: async (parent, args, context) => {

            if(context.user) {
                const userData = await User.findOne({})
                .select('-__v -password')
                .populate('books')
                return userData;
            }

            throw new AuthenticationError('Please login!')
        },
    },

    Mutation: {

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const sToken = signToken(user);

            return {sToken, user};
        },

        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if(!user) {
                throw new AuthenticationError('The login info you entered is incorrect!');
            }

            const okPW = await user.isCorrectPassword(password);

            if(!okPW) {
                throw new AuthenticationError('The login info you entered is incorrect!')
            }

            const sToken = signToken(user);
            return {sToken, user};
        },

        saveBook: async (parent, args, context) => {
            if (context.user) {
                const updateAUser = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    {$addToSet: {savedBooks: args.input}},
                    {new: true}
                );

                return updateAUser;
            }

            throw new AuthenticationError('You are not logged in!');
        },

        removeBook: async (parent, args, context) => {
            if(context.user) {
                const updateAUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {savedBooks: {bookId: args.bookId}}},
                    {new: true}
                );

                return updateAUser;
            }

            throw new AuthenticationError('You are not logged in!');
        }
    }
};

module.exports = resolvers;
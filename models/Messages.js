let messages = [];

class Messages {
    constructor(name, message){
        this.name = name;
        this.message = message
    }

    static addMessage(newMessage){
        messages.push(newMessage);
    }

    static getMessages(){
        return messages;
    }

    static clearMessages(){
        messages = [];
    }
}

module.exports = Messages;
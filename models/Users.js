let allusers = [];

class Users{

    constructor(name, hand){
        this.name = name;
        this.active = false;
        this.hand = hand;
    }

    static addUser(user){
        allusers.push(user);
    }

    static setHand(username, hand){
        let user = allusers.filter(user => user.name === username)[0];
        user.hand = hand;
    }

    static getHand(username){
        let user = allusers.filter(user => user.name === username)[0];
        return user.hand;
    }

    static getAllInactive(){
        return allusers.filter(user => user.active === false);
    }

    static deleteUser(username){
        let user = allusers.filter(user => user.name === username)[0];
        let index = allusers.indexOf(user);
        allusers.splice(index,1);
    }

    static activate(username){
        let user = allusers.filter(user => user.name === username)[0];
        user.active = true;
    }

    static deactivate(username){
        let user = allusers.filter(user => user.name === username)[0];
        user.active = false;
    }

    static endGame(){
        allusers = [];
    }

    static emptyHands(){
        for (let i = 0; i < allusers.length; i++){
            let u = allusers[i];
            u.hand = [];
        }
    }
}

module.exports = Users;

let allusers = [];

class Users{

    constructor(name){
        this.name = name;
        this.active = false
    }

    static addUser(user){
        allusers.push(user);
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
}

module.exports = Users;

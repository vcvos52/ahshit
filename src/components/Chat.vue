<template>
    <div class="chat">
        <ul>
            <li v-for="(message, i) in messages" v-bind:key="i" v-bind:class="getMessageClass(message)">
                <span>{{message.message}}</span><br>
                <span>From: {{message.name}}</span>
            </li>
        </ul>
    <form @submit.prevent="postMessage" class="send-message">
        <label for="mes">Enter Message</label><input class="textarea" id="mes" type="text" v-model="message"/>
        <input class="button" type="submit" value="Send Message"/>
    </form>
    </div>
</template>

<script>

import axios from "axios";
import {socket, eventBus} from "../main";


export default {
    name: 'Table',
    data(){
        return{
            messages: [],
            message: "",
        }
    },

    props: {
        username: "",
        all: [],
    },

    created: function(){
        axios.get('/api/online/messages')
            .then(res => {
                this.messages = res.data;
            })
            .catch(err => console.log(err));
    },

    mounted(){
        eventBus.$on('message-posted', data => {
            console.log("in eventbus on", data);
            if (!this.checkInAll(data.name)){
                return;
            }
            this.messages.push(data);
            console.log(this.messages);
            });
    },

    methods: {
        postMessage: function(message){
            let data = {'name':this.username, 'message':this.message}
            axios.post('/api/online/messages', data)
                .then(res => {
                    console.log("Before socket emit", data);
                    socket.emit('message-posted', data);
                    this.message = "";
                });
            
        }, 

        getMessageClass: function(message){
            return {
                'my-message': message.name === this.username,
                'other-message': message.name !== this.username
            }
        },

        checkInAll: function(user){
            for (let i = 0; i < this.all.length; i++){
                let person = this.all[i];
                if (person['name'] === user){
                    return true;
                }
            }
            return false;
        },
    }

    
}
</script>

<style scoped>
@import url(https://fonts.googleapis.com/css?family=Lato:400,700);


*, *:before, *:after {
  box-sizing: border-box;
}

body {
  background: #C5DDEB;
  font: 14px/20px "Lato", Arial, sans-serif;
  padding: 40px 0;
  color: white;
}

.container {
  margin: 0 auto;
  width: 750px;
  background: #444753;
  border-radius: 5px;
}

.chat {
  width: 33%;
  float:left;
  background: #e8f6ffd1;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  
  color: #434651;
  
}

.send-message{
    position: absolute;
    bottom: 5%;
    width:100%;
    display: flex;
    align-content: center;
    justify-content: center;
}

.message {      
    color: white;
    padding: 18px 20px;
    line-height: 26px;
    font-size: 16px;
    border-radius: 7px;
    margin-bottom: 30px;
    width: 90%;
    position: relative;

}

.my-message {
    color: white;
    padding: 18px 20px;
    line-height: 26px;
    font-size: 16px;
    border-radius: 7px;
    margin-bottom: 30px;
    width: 90%;
    position: relative;
    background: rgb(96, 109, 91);
    text-align: right;
}

.other-message {
    background: rgb(130, 151, 170);
    color: white;
    padding: 18px 20px;
    line-height: 26px;
    font-size: 16px;
    border-radius: 7px;
    margin-bottom: 30px;
    width: 90%;
    position: relative;
}

li {
    padding-bottom: 20px;
}


</style>
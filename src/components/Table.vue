<template>
    <table style="width:100%">

          <thead>
            <col style="width:auto; height:100%" v-for="(_, i) in this.headers" v-bind:key="i">
            <tr>
              <th v-for="(h, index) in this.headers" v-bind:key="index">{{h}}</th>
            </tr>
          </thead>

          <tbody>

            <tr v-for="(d, ind) of this.tableData" v-bind:key="ind">
              <td>
                <div style="margin:auto; width:2em; background:transparent; border:none; color:white">{{cardsPerRound[d['round']]}}</div>
              </td>

              <td v-for="(key, index) of Object.keys(d).slice(1)" v-bind:key="index">
                <span v-bind:class="{ won: (roundResults[ind][key]===1) , lost: (roundResults[ind][key]===-1) }" style="width:2em; background:transparent; border:none; color:white" type="number" maxlength="3">{{d[key]}}</span>
              </td>

            </tr>

          </tbody>
          
        </table>
</template>

<script>
export default {
    name: 'Table',
    data(){
        return{
        }
    },

    props: {
        tableData: [],
        roundResults: [],
        headers: [],
        cardsPerRound: []


    },

    created: function(){

    },

    
}
</script>

<style scoped>
.won{
  color:green !important
}

.lost{
  color:red !important
}
</style>
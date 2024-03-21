<template>
  <div class="bg-background flex justify-center items-center h-screen xl:scale-100 lg:scale-90 md:scale-[70%] sm:scale-50 scale-[30%]">
    <div class="relative scale-110 -top-[5vh]" :class="[ opened ? 'cursor-default' : 'cursor-pointer',]" @click="openDex">
      
      <p :class="{ 'hidden': selected == null }" class="number anim absolute w-[10vh] h-[6vh] overflow-y-auto top-[13vh] left-[34.7vh] z-20 text-[3vh] text-center font-bold">
        {{ pkmnMap[selected] }}
      </p>

      <AutoComplete class="autoC absolute z-10 top-[21vh] left-[20.5vh] text-[2.2vh]" 
        v-model="textValue" 
        :suggestions="filtered"
        :placeholder="'Pokemon name'"
        forceSelection  
        @complete="search" 
        @item-select="onSelect"
        @keyup.enter="searchOnEnter"
      />
      <ToggleButton v-show="selected" class="absolute toggle z-50 top-[31.9vh] left-[9.8vh] h-[3vh] w-[7vh]" v-model="checked" onLabel="Shiny" offLabel="Regular" />
      <div class="buttons absolute z-10 top-[63vh] left-[38.5vh] scale-110">
        <img 
          :class="[ pkmnMap[selected] === 1 || selected === null ? 'opacity-50 cursor-default' : 'opacity-100 cursor-pointer']" 
          class="top h-[3vh]" 
          ref="top" 
          alt="top arrow" 
          src="./assets/topArrow.png" 
          @click="move('up')"
        >
        <img 
          :class="[ pkmnMap[selected] == 151 || selected === null ? 'opacity-50 cursor-default' : 'opacity-100 cursor-pointer']" 
          class="bottom mt-[1vh] h-[3vh]" 
          ref="bottom" 
          alt="bottom arrow" 
          src="./assets/bottomArrow.png" 
          @click="move('down')"
        >
      </div>
      <p class="desc anim absolute text-[1.7vh] w-[27vh] h-[8vh] overflow-y-auto top-[62.6vh] left-[8vh] z-20">
        {{ flavorText }}
      </p>
      <div class="absolute top-[30.6vh] left-[8.7vh] h-[21.5vh] w-[33.5vh] z-20">
        <div class="flex items-center justify-center w-full h-full opac">
          <img
            v-show="!checked"
            :class="[ selected === null ? 'cursor-default' : 'cursor-pointer' ]"
            class="img anim opacity-0"
            @load="onImgLoad(false)"
            @click="playCry"
            :src="pokemonImage"
          >
          <img
            v-show="checked"
            :class="[ selected === null ? 'cursor-default' : 'cursor-pointer' ]"
            class="img anim opacity-0"
            @load="onImgLoad(true)"
            @click="playCry"
            :src="pokemonImageShiny"
          >
        </div>
      </div>

      <PokeType v-show="types.length == 1" :class="{ 'hidden': selected == null }" class="anim absolute justify-center z-50 top-[49.8vh] w-[31.5vh] left-[9.6vh]" :type="types[0]?.type.name" />
      
      <PokeType v-show="types.length == 2" :class="{ 'hidden': selected == null }" class="anim absolute justify-center z-50 top-[49.8vh] w-[15.5vh] left-[9.6vh]" :type="types[0]?.type.name" />
      <PokeType v-show="types.length == 2" :class="{ 'hidden': selected == null }" class="anim absolute justify-center z-50 top-[49.8vh] w-[15.5vh] left-[25.75vh]" :type="types[1]?.type.name" />
      

      <div 
        :class="{ 'hidden': selected == null }"
        class="anim absolute flex flex-col items-center top-[23.5vh] left-[55.5vh] h-[47.4vh] w-[37vh] z-50 justify-around">
        <Radar :data="datachart" :options="chartOptions" :key="sum" />
        <div class="flex flex-row w-[35vh] justify-around text-[2vh]" style="color:white">
          <p>Height: <span style="color:#E15F80">{{ extraStats.height/10 }}m</span></p>
          <p>Weight: <span style="color:#E15F80">{{ extraStats.weight/10 }}kg</span></p>
        </div>
        
      </div>
      

      <div class="flex flex-row w-max">
        <img class="h-[70vh] left" ref="left" alt="Pokedex image" src="./assets/leftSide.png">
        <div class="relative mt-auto -mb-[0.2vh] -ml-[0.7vh] right w-full z-40">
          <img class="h-[67vh] rightF" ref="rightFront" alt="Pokedex image" src="./assets/rightSide.png">
          <img class="h-[67vh] rightB mt-auto absolute top-0 -z-10" ref="rightBack" alt="Pokedex image" src="./assets/rightBack.png">
        </div>
      </div> 
    </div>
  </div>
  
</template>

<script setup>
import AutoComplete from 'primevue/autocomplete'
import ToggleButton from 'primevue/togglebutton'
import {
  Chart,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { Radar } from 'vue-chartjs'
import { onMounted, ref, computed,  } from 'vue'
import PokeType from './components/PokeType.vue'


Chart.register(RadialLinearScale,PointElement,LineElement,Filler,Tooltip,Legend);

let gsap = window.gsap
let tl = gsap.timeline()

const textValue = ref('')
const pokemonList = ref([])
const filtered = ref([])
const opened = ref(false)
const selected = ref(null)
const flavorText = ref('')
const pkmnMap = ref({})
const types = ref([])
const cry = ref('')
const sum = ref(0)
const checked = ref(false)
const extraStats = ref({ 
  height: 0,
  weight: 0,
})
const firstLoad = ref(true)

const chartOptions = ref({
  plugins:{
    legend:{
      labels:{
        color: 'rgb(255, 99, 132)'
      } 
    },
  },
  scales: {
      r: {
        beginAtZero: true,
        max: 255,
        min: 0,
        pointLabels:{
          color: 'rgb(255, 255, 255)'
        },
        ticks:{
          color: 'rgba(255, 255, 255,0.5)',
          backdropColor: 'rgba(0,0,0,0)'
        }
      }
  },
})

const dataPoints = ref([0,0,0,0,0,0])

const fadeOut = () => {
  tl.to('.anim',{ opacity: 0, duration:0.3 })
}

const fadeIn = () => {
  tl.to('.anim',{ opacity: 1, duration:0.3 })
  if(firstLoad.value){
    tl.to('.toggle',{ opacity: 1, duration:0.3 },'<')
    firstLoad.value = false
  }  
}

const move = (direction) => {
  if(selected.value == null)
    return
  if(direction === 'up'){
    if(pkmnMap.value[selected.value] == 1)
      return
    textValue.value = pokemonList.value[pkmnMap.value[selected.value]-2].name
    onSelect()
  }
  else{
    if(pkmnMap.value[selected.value] == 151)
      return
    textValue.value = pokemonList.value[pkmnMap.value[selected.value]].name
    onSelect()
  }

}

const searchOnEnter = () => {
  if( pokemonNames.value.find(poke => poke.toLowerCase() === textValue.value)){
    onSelect()
  }
  return
}

const playCry = () => {
  let beat = new Audio(cry.value)
  beat.play()
}

const search = ({query}) => {
  filtered.value = pokemonNames.value.filter(poke => poke.toLowerCase().startsWith(query.toLowerCase()))
}

const onSelect = () => {
  fadeOut()
  setTimeout(() => {
    selected.value = textValue.value
    
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${pkmnMap.value[selected.value]}/`).then(async resp => {
      let response = await resp.json()
      flavorText.value = response.flavor_text_entries.filter(entry => entry.language.name == 'en')[0].flavor_text.replace(/\s+/g,' ')
    })
    fetch(`https://pokeapi.co/api/v2/pokemon/${selected.value}/`).then(async resp => {
      let response = await resp.json()
      types.value = response.types
      extraStats.value.weight = response.weight
      extraStats.value.height = response.height
      dataPoints.value = response.stats.map( stat => stat.base_stat )
      cry.value = response.cries['latest']
    })
  }, 300);
}

const onImgLoad = (isShiny) => {
  if(isShiny == checked.value)
    fadeIn()
}


onMounted(() => {
  fetch('https://pokeapi.co/api/v2/pokemon?limit=151').then(async (res) => {
    let response = await res.json()
    pokemonList.value = response.results
    pokemonList.value.map((pkmn,index) => {
      pkmnMap.value[pkmn.name] = index+1
    })
  })
  tl.to('.left',{ x: '50%', duration: 0 })
  tl.to('.right',{ x: '-48%', scaleX:1.18 , duration: 0 })
  tl.to('.rightF',{ x: '105%', y:'-0.5vh', duration: 0 })
  tl.to('.autoC',{ x: '69%', opacity: 0, duration: 0 })
  tl.to('.buttons',{ x: '280%' , opacity: 0, duration: 0 })
  tl.to('.toggle',{ opacity: 0, duration: 0 })
})

const openDex = () => {
  if(opened.value){
    return
  }
  opened.value = true
  tl.to('.left',{ x: '0', duration: 2 })
  tl.to('.right',{ x:'0' , scale:1, duration: 2 }, '<')
  tl.to('.rightB',{ x:'-92%', duration: 2, rotationY:180 }, '<')
  tl.to('.rightF',{ x:'0', duration: 2, rotationY:0 }, '<')
  tl.to('.autoC',{ opacity:1, duration:0.3 }, 0.3)
  tl.to('.autoC',{ x:'0', duration:1.6 }, 0.4)
  tl.to('.buttons',{ opacity:1, duration:0.3 }, 0.5)
  tl.to('.buttons',{ x:'0', duration:1.5 }, 0.5)
}

const pokemonNames = computed(() => {
  return pokemonList.value.map(pkmn => pkmn.name)
})

const pokemonImage = computed(() => {
  if(selected.value == null)
    return ''
  return selected.value.includes('mime') ?  
  `https://projectpokemon.org/images/normal-sprite/${selected.value.replace('-','.')}.gif` : 
  `https://projectpokemon.org/images/normal-sprite/${selected.value.replace('-','_')}.gif`
})

const pokemonImageShiny = computed(() => {
  if(selected.value == null)
    return ''
  return selected.value.includes('mime') ?  
  `https://projectpokemon.org/images/shiny-sprite/${selected.value.replace('-','.')}.gif` : 
  `https://projectpokemon.org/images/shiny-sprite/${selected.value.replace('-','_')}.gif`
})

const datachart = computed(() => {
  return {
    labels: [
      'HP',
      'Attack',
      'Defense',
      'Sp. Atk',
      'Sp. Def',
      'Speed',
    ],
    datasets: [{
      label: 'Stats',
      data: dataPoints.value,
      fill: true,
      backgroundColor: 'rgba(255, 99, 132, 0.4)',
      borderColor: 'rgb(255, 99, 132)',
      pointBackgroundColor: 'rgb(255, 255, 255)',
      pointBorderColor: 'rgb(186, 9, 50)',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(255, 99, 132)'
    }]
  }
})


</script>

<style>
@import './index.css';

body{
  background-color: #2F2F2F;
}

.rightF{
  transform-origin: 0% 50%;
}

.rightB{
  transform-origin: 100% 0%;
}

.rightF, .rightB{
  backface-visibility: hidden;
  transform-style: preserve-3d;
  
}

.rightF {
  transform: rotateY(180deg);
}

.autoC input{
  width: 24vh;
  border: solid 2px black;
  height: 5vh;
  padding: 0px 5px;
}

.autoC input:focus{
  outline: 5px solid #890625;
}

.desc{
  scrollbar-color: #890625 #D30A40;
  scrollbar-width: thin;
}

.p-autocomplete-item.p-focus{
  background-color: #ffa3b1;
  color: white;
}

.toggle .p-button-label{
  font-size: 1.5vh;
}

.p-button{
  padding: 0;
  transition-duration: 300ms;
}

.toggle .p-button{
  opacity: 0.7;
  color: white;
  background-color: #414F6B;
  box-shadow: 0 2px 5px darkslategray;
}

.p-highlight .p-button{
  background-color: #DB3E68;
  box-shadow: 
    inset 3px 3px 7px 0 #890625, 
    inset 0 0 1px 1px #890625
}
</style>

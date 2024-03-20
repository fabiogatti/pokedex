<template>
    <div class="type rounded border-2 text-[1.7vh] pl-1 pr-2 flex" :style="{ 'background-color':background, 'border-color':border }">
        <img class="w-[2vh] mr-2" :src="image" :alt="type+' type logo'">
        <p>{{ type.charAt(0).toUpperCase() + type.slice(1) }}</p>
    </div>
</template>

<script setup>
import { defineProps, ref, computed } from 'vue'

const props = defineProps({
    type:{
        type: String,
        default: 'fire'
    }
})

const colors = ref({
    'grass': '#429F30',
    'fire': '#F07F2F',
    'water': '#437DED',
    'electric': '#F5BF1E',
    'flying': '#86B4EE',
    'normal': '#A9A878',
    'ground': '#E0C069',
    'rock': '#B7A038',
    'psychic': '#F85888',
    'bug': '#A8B821',
    'poison': '#A040A1',
    'fighting': '#C03028',
    'ice': '#98D8D8',
    'ghost': '#705798',
    'dark': '#54463B',
    'steel': '#B8B8D0',
    'dragon': '#7038F9',
    'fairy': '#FFA3B1',
})

const image = computed(() => require(`../assets/${props.type}.svg`))

const background = computed(() => colors.value[props.type]+'90')

const border = computed(() => colors.value[props.type])

</script>

<style>
.type{
    color: #fff;
}
</style>
const tr = 'techreborn:'
const mi = 'modern_industrialization:'

events.listen('recipes', function (event) {
    event.shapeless('ftbquests:book', ['minecraft:book', 'minecraft:iron_ingot'])
    
    function merge(from, to) {
        event.replaceOutput({}, from, to)
        event.replaceInput({}, from, to)
    }

    function mergeRemove(from, to) {
        event.replaceInput({}, from, to)
        event.remove({output: from})
    }

    mergeRemove(tr+'electronic_circuit', mi+'lv_circuit')
    mergeRemove(tr+'advanced_circuit', mi+'electronic_circuit')
    mergeRemove(tr+'industrial_circuit', mi+'digital_circuit')
    mergeRemove(tr+'basic_machine_frame', mi+'lv_machine_hull')
    mergeRemove(tr+'advanced_machine_frame', mi+'advanced_machine_hull')
    mergeRemove(tr+'industrial_machine_frame', mi+'turbo_machine_hull')
    mergeRemove(tr+'electric_furnace', mi+'lv_furnace')
    merge(tr+'rubber', mi+'rubber_sheet')
    //merge transformers (maybe)
    
    //explain pipes
    //superconductor
    //liquid storage
    //quarry ores
    //compressor and macerator
    //simple drawers

    //go through everything - rewards, descriptions, names
    console.info('Tweaked recipes')
})
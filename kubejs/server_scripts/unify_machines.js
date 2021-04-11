events.listen('recipes', function (event) {
    var id = 1;
    function createMIRecipe(type, eu, duration, item_inputs, item_outputs, fluid_inputs, fluid_outputs) {
        event.custom({
            id: id,
            type: type,
            eu: eu,
            duration: duration,
            item_inputs: item_inputs,
            item_outputs: item_outputs,
            fluid_inputs: fluid_inputs,
            fluid_outputs: fluid_outputs
        })
        id++;
    }


    function getItem(obj) {
        var single = obj.isJsonObject() ? obj : obj.getAsJsonArray().get(0)
        return single.has('item') ? single.get('item').getAsString() : '#'+single.get('tag').getAsString();
    }

    function deleteDuplicateRecipes(trSerialiser, miSerialiser) {
        event.forEachRecipe({type: mi+miSerialiser}, function (recipe) {
            var json = recipe.json
            event.remove({
                type: tr+trSerialiser,
                input: getItem(json.get('item_inputs')),
                output: getItem(json.get('item_outputs'))
            })
        })
        console.info('Removed recipes from ' + tr+trSerialiser + ' that duplicate recipes from ' + mi+miSerialiser)
    }

    //deleteDuplicateRecipes('compressor', 'compressor')
    deleteDuplicateRecipes('grinder', 'macerator')


    function remapTRRecipeToMIMachine(recipeJson, miSerialiser) {
        //TODO: copy NBT
        var input_items = utils.newList()
        var input_fluids = utils.newList()
        recipeJson.get('ingredients').forEach(function (input) {
            var count = input.has('count') ? input.get('count') : 1
            if (input.has('item')) {
                if ((input.get('item').getAsString() == 'techreborn:cell') && input.has('nbt')) {
                    if (input.get('nbt').isJsonObject()) {
                        if (input.get('nbt').has('fluid')) {
                            input_fluids.add({fluid: input.get('nbt').get('fluid'), amount: count*1000})
                        }
                    }
                } else {
                    input_items.add({item: input.get('item'), amount: count}) 
                }
            } else if (input.has('tag')) {
                input_items.add({tag: input.get('tag'), amount: count})
            } else if (input.has('fluid')) {
                input_fluids.add({fluid: input.get('fluid'), amount: count*1000})
            }
        })

        var output_items = utils.newList()
        var output_fluids = utils.newList()
        recipeJson.get('results').forEach(function (output) {
            var count = output.has('count') ? output.get('count') : 1
            if (output.get('item').getAsString() == 'techreborn:cell') {
                if (output.has('nbt')) {
                    output_fluids.add({fluid: output.get('nbt').get('fluid'), amount: count*1000})
                }
            } else {
                output_items.add({item: output.get('item'), amount: count})
            }
        })

        createMIRecipe(
            mi+miSerialiser,
            recipeJson.get('power'), //TODO: find more suitable conversion
            recipeJson.get('time'),
            input_items,
            output_items,
            input_fluids,
            output_fluids
        )
    }

    function remapToMIMachine(trSerialiser, miSerialiser, trMachine, miMachine) {
        var recipeCount = 0
        event.forEachRecipe({type: tr+trSerialiser}, function (recipe) {
            remapTRRecipeToMIMachine(recipe.json, miSerialiser)
            recipeCount++
        })
        event.replaceInput({}, tr+trMachine, mi+miMachine)
        event.remove({output: tr+trMachine})
        event.remove({type: tr+trSerialiser})
        console.info('Remapped ' + recipeCount + ' recipes from ' + tr+trSerialiser + ' to ' + mi+miSerialiser)
    }

    remapToMIMachine('chemical_reactor', 'chemical_reactor', 'chemical_reactor', 'lv_chemical_reactor')
    remapToMIMachine('centrifuge', 'centrifuge', 'industrial_centrifuge', 'lv_centrifuge')
    remapToMIMachine('wire_mill', 'wiremill', 'wire_mill', 'lv_wiremill')
    remapToMIMachine('vacuum_freezer', 'vacuum_freezer', 'vacuum_freezer', 'vacuum_freezer')
    remapToMIMachine('industrial_electrolyzer', 'electrolyzer', 'industrial_electrolyzer', 'lv_electrolyzer')
    remapToMIMachine('compressor', 'compressor', 'compressor', 'lv_compressor')
    //remapToMIMachine('grinder', 'macerator', 'grinder', 'lv_macerator')


    function unifyFluid(fluid1, fluid2) {
        //TODO: make less temporary solution
        //TODO: add cell and bucket conversion
        createMIRecipe(
            mi+'distillery', 1, 20, [], [],
            [{fluid: fluid1, amount: 1000}],
            [{fluid: fluid2, amount: 1000}]
        )
        createMIRecipe(
            mi+'distillery', 1, 20, [], [],
            [{fluid: fluid2, amount: 1000}],
            [{fluid: fluid1, amount: 1000}]
        )
        console.info('Unified ' + fluid1 + ' and ' + fluid2)
    }

    unifyFluid(tr+'diesel', mi+'diesel')
})
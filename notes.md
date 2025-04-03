# IMPLEMENTED FEATURES

✅ Option to rotate pieces with R and shift R (right and left)

✅ Next to the shapes icon a hand icon(quick button is '4') for select mode here you can drag to select multiple pieces, then you ca ctrl+c and ctrl+v to copy and paste, (also add a ctrl+z to undo all actions and ctrl+y to redo them), make sure you can rotate the selection as a whole properly around it's center
✅ - you can click ctrl and click other piecies to add them to the selecion or remove them from the selection
✅ - you can do ctrl+g to group a selection, so when you select a single piece in the group all are selected

✅ when you are in the load menu next to the cancel button is a 'new canvas' button to give you a empty new canvas, [maybe promt the user for a name]

✅ to the left of the save and load button add a cogg icon for a settings modal, here are the following settings
✅ - toggle fief outline, this is a single darker outline around the center that is 5x5 (it does not repeat)
✅ - toggle advanced fief grid, this shows a darker outline grid that is 10x10 (it repeats)
✅     - They can't both be on at once

There are a couple features that can be improved
✅ improve the styling of the fief toggle button to be more inline with other buttons when one is selected it should have a checkmark icon

✅ Disable the browser keybinds for ctrl+z as now it does that instead of the app keybind


# TODO

you are our top most senior dev tasked with adding a new feature to the muadib aaplication, I need a new command named 'search' but this command does nothing on it's own it's a prefix to search trough the wiki

I want the wiki to be it's own folder within data there is the index.json Contaning a list of catagories like:

- Vhichles
- Resources
- Npc's
- Enemies
- Poi's
- Quests
For each of those there is a folder where those types of pages are located

The index.json would look 
{[ {
    type: Vhichles, 
    discription: information about vhicles
    pages : [{
        name: orinthopter
        discription: short text
    },
    {
        name: name
        discription: discription
    }] 

},
{
    type: Resources, 
    pages : [] 
}]}

Folder structure would be like:
> data (folder)
>> wiki (folder)
>> index.json
>>> Vhichles (folder)
>>>> orinthopter.json

Now for the command logic i want the user to be able to type 'search' and only then the list of searchable items show up, the suggested commands should be sorted on type, for example typing 'search o' should show (see how the search part of the suggestion does not show up as its uneeded)
> Vhichles - discription (this is a catagory tag so it can be clicked but has a line on the left of the name)
> Ornithopter - discription (normal ty)
> Difrent catagory
> item apart of that catagory starting with an o

When clicking on an option it should put it in the search par with the search prefix so if you would click Ornithopter it would be 'search Ornithopter'

When you run a search command it will send you to the wiki.html page within the git is the catagory and item name

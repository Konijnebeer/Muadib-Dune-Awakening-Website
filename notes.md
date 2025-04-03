# IMPLEMENTED FEATURES

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

# Database rescue

I have an application where I lost the database. Data, Schema, everything.  

I’d like to try to recreate the database structure using the artifacts I have which includes documentation, code, some db backups, migrations, data seeds and data backups. I will describe the different artifacts, what they represent as well as any other details. 

Note that this application was built iteratively with the help of AI over the last month and so some of the documentation may be outdated and some of the data may not represent the final data schema. There have also been a couple of failed attempts to resuce the db that didn't work. I'm not sure if this left any bad artifacts around. (I tried to clean up)  

There is a database in place currenlty from a failed rescue attmept. This is not working and should not be trusted as a source or truth or for creating a target schema. It can be deleted if you want as it is of no use to me.

The local supabase instance can also be wiped or re-created if that is an easier path. 

The application is using a local instance of Supabase for it's database. There is not a remote version. Everything is local

## Artificts (broken out by root folder)

### Docs (Docmentation)
There is a lot of documentation about the system in the ./docs directory
Specifically - the api, architecture, product, and operations folders. A lot of this was created during major code review and cleanup on 02-09-2026.
There are a lot of docs in archive, and development that describe phases/interations of the development effort.
All docs have file dates which should help you have a reasonable concept of when they were used, and more valid.


### Backups
There is a ./backup folder with several db backups (sql). They are dated. I cannot speak to the quality of the backups, but they could be useful
Under this folder is a dataBackups folder that has several json exports made by the systems admin dashboard

### Seeds/source data
There is a db/seeds folder. I WOULD NOT CONSIDER THESE FILES TO BE A SOURCE OF TRUTH FOR DATA.  However, they may be instructional about what the early states of the database looked. These are old and should be depreciated. Around for reference only

There is an ./externalData folder that is important as it contains an example of the content_cache.json file. This file is a source of truth for much of the data in the database. It comes from a game that the application is built to help manage. New content_cache files arrive occasionally with updated/added info. There a a function on the admin dashboard that imports the content_cache file. This process is very important and does a lot of the data seeding so should help a lot when reverse engineering. 
There is a processed folder under this - I'm not sure what this is. I think a process may have broken up the content_cache at one point to help it be easier to understand. These are likely deprecated. 

There is also a ./globalContent folder that looks to have some broken out data from the content_cache. I would guess these are similar to the ./externalData/processed files

### Scripts
A lot of the scripts seem to be about dealing with data - either loading, deleting, seeding, etc.  I don't know which are still valid and which are deprecated, but there could be some valuable logic about the database here

### SRC 
Application code - likely some valuable info in the code itself.  Content_cache management especially

### Supabase
I can't speak to anything in this folder as I'm unsure how it's been used. I would suspect the migrations folder to be very valuable for db structure. 
I'm not sure how much you can trust the seed files, although they may have some info about db structure. 


## Application
The application allows a user to manage assets from a game that are collected in the game by the user. It allows the do data entry, to sort and compare and to build setups, etc to help them when playing the game. All assets base data comes from content cache (I call this global data)  The user then has thier own data to describe this (what lvl of assets, how many they own, etc.)  See the docs for more info


# GP Guide

## New page/section for the F1 Resource Manager

### General
There are GPs every week where players compete in different tiers which limit the drivers and parts you can use. (We've already defined these in our track guides but I'll list them here again for clarity)
- Junior Series 1-3  
- Challenger Series 1-6
- Contender Series 1-9
- Champion Series 1-12 (all)

Each week consists of 4 qualifying races on specific tracks as well as 8 tracks that are used for both the opening and final rounds of the GP. (held Sat and Sun). Other than the specific tracks in the GP there are some other things to consider.
1. Every GP will have certain drivers and/or parts that are given boosted stats. There is already functionality on the drivers and parts pages that allows us to consider this bonus stat. 
2. Every GP has special rewards a player can earn per race if they use certain drivers or parts. For example: if you use Norris rare lvl3+ as one of your drivers you automatically score an extra 5 race points. (race points are what you score at the end of a race based on how well you did in the race 1-47). The reward is not always Race points, it could be gold, or reputation points or other. This is important as Race Points are a huge advantage when they the reward.

### Design
- There will be a GP guides section that will list any guides created and allow for view/edit
- The individual GP Guide will have some top level fields
  - Name
  - Start Date
  - Boosted Assets
  - Reward Bonus Req & reward (type and amount)
  - Qualifying tracks - Race # and name (4 races)
  - Weekend tracks - Race # and name (these are the same for Openening round and Final round)
    - 8 races each day (sat and sun)

Then the user will plan their strategy track by track. The general flow would be for them to be able to import in a Track guide (if one exists) and then they can override anything they wish for the GP (for example: If Norris gives 5 extra Race Points then we may decide to use him even if he is not the best driver choice. Or with the Boosted assets, we may decide to pick a different driver or asset because it's boosted stats make it a better choice) Use may also want to change the boost choice (maybe they are low and want to pick differenly, etc.)  Tire Strategy may also change, as Well as car setup notes. So pretty much any part of the track guide should be able to be overwritten for the GP guide. These changes should NOT change the original track guide. They are only for this GP.  

Lastly - there should be a place for the user to take notes on their results per track. Example. A user may race on the same track multiple times over Qualification, Opening and Final Rounds, but we would like to have the same notes field for all.

The user should also have a Condensed view of their GP guide. Something like
1. TrackName for race 1 - # Laps - TrackStats
    Setup name - setup notes
    Driver 1 name - boost - tyre strat
    Driver 2 name - boost - tyre strat
2. TrackName for race 2 - # Laps - TrackStats
    Setup name - setup notes
    Driver 1 name - boost - tyre strat
    Driver 2 name - boost - tyre strat    
etc.

# Content Cache changes for FY26

There have been some changes to the game and to the data file we get from the game that this app helps track. This document goes over the changes to the data file and lists some areas I think will need to change because of this. I need you to review this and then review the app and make a plan that accomodates the changes to the data file.  Ask me any questions you have. 

## structural changes

### Boosts object:
- added 3 fields: 
    powerBoostImpactTier
    powerBoostDurationTier
    powerBoostRechargeRateTier
- Removed fields
    DrsTier

### carParts object:

- removed DRS field
- added 3 fields
    powerBoostImpact
    powerBoostDuration
    powerBoostRechargeRate
- There is a new carPartType=6 named "Battery" - need to add new section on car parts and support all 7 car part types anywhere we are showing car setups/loads

### series object:

- added new field called nextTrackRotationTime (would like to capture this, but I'm unsure what it's used for at this point)

- removed fields/objects called (are these used in app anywhere today)
    botLoadout
    aiCarLoadouts

## general plan

Data changes
- Add new carPartType=7 named Battery to data
- remove Boosts:DrsTier (it was never used so will not hurt to remove). 
- add 3 new Boosts fields.
- CarParts: DRS there is no need to remove this from data, but it needs to be optional because it will not be in any new content_cache loads, but it should stay because there is season 6 data that references it. 
- add 3 new fields to carParts
- add new field to series
- If 2 removed fields for series are used anywhere, then they need to be made optional, and/or depricated. 

Import/upload changes - areas to make changes:
- content cache upload
- System data import/export
- admin users import/export
- profile user import/export

UI changes:
- boosts now have 3 new stats that need to display (use dummy icons for now)
- There is a new calculated field for Car parts called Overtake. The value of this will be a combination of the 3 powerboost fields.
- Car parts input/listing:
  - need to add a new section for Battery car part type
  - Need to remove the DRS field from display
  - For battery type, need to add 3 new powerboost fields as well as the Overtake (total of these 3)
- Car setups
  - need to now show 7 parts instead of 6. probably a 4 item first row/3 second (instead of 3/3)
  - the stats summary on a car setup should now show Overtake instead of DRS. (don't show the 3 powerboost fields, only the overtake)
  - setup suggest needs to account for new part type  
  - The modal for car part select should show powerboost and overtake fields if the part type is battery (only for battery)




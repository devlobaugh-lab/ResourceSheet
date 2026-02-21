# Refactor Car Setups page

## Summary
The current Car Setups page works and allows the user to create a car setup, however it could be done better. 

## Comments about existing

I like the look of the card that displays the setup. Don't really want to change that card. 

## Things to add or change

- [x] I don't like the dropdown nature when selecting a part. It's visually dull and doesn't allow the user to compare the parts when selecting. I'd much prefer a modal selection that allows comparison similar to what we are doing on the Track Guides select Driver. At a minimum we could just show the grid section for that part like we are showing on the Car Parts page
- [x] I don't like that we edit the setup on the left and then view on the right. It seems like we should be able to edit the Setup Card in place. 
- [x] Would be nice if you could have 2 setups loded side by side for comparison
- [x] Need to add a small notes section to bottom of setup card for free text user notes. 2 row height would be plenty
- [x] Would be really nice if we could created suggested setups. The user would pick Max Series and then the style of setup they want and we could do the math and suggest a setup that works and that they can edit
  - [x] Types are [Speed, Cornering, Power Unit, Speed + Quali, Cornering + Quali, PU + Quali, Speed + Cornering, Speed + Cornering + Quali]
  - [x] User should be able to use exisiting card levels or highest updated card leve (similar to how we do in Driver page)
  - [x] Would be good if user could indicate if any parts have Bonuses so we could take that into account
    - [x] I'm unsure the best way to capture this but we are doing it elsewhere
  
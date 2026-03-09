import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get all Rarity-5 drivers with their collection information
    const { data: rarity5Drivers, error: driversError } = await supabase
      .from('drivers')
      .select('id, name, rarity, collection_id, collection_sub_name')
      .eq('rarity', 5)
      .not('collection_id', 'is', null)

    if (driversError) {
      console.error('Error fetching Rarity-5 drivers:', driversError)
      return NextResponse.json({ error: 'Failed to fetch Rarity-5 drivers' }, { status: 500 })
    }

    // Get collection data for Rarity-5 drivers
    const collectionIds = rarity5Drivers?.map(d => d.collection_id).filter(Boolean) || []
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id, theme, ordinal')
      .in('id', collectionIds)

    if (collectionsError) {
      console.error('Error fetching collections:', collectionsError)
    }

    // Create a map of collection_id to collection data
    const collectionMap = new Map()
    if (collections) {
      collections.forEach(collection => {
        collectionMap.set(collection.id, collection)
      })
    }

    // Process Rarity-5 drivers to get unique collection variants
    const rarity5Variants = new Map<string, { rarity: number; display: string; collectionId: string | null; value: string }>()

    if (rarity5Drivers) {
      rarity5Drivers.forEach(driver => {
        const collection = collectionMap.get(driver.collection_id)
        const baseTheme = collection?.theme || 'Special Edition'
        const subName = driver.collection_sub_name || ''
        
        // Create a unique key for this variant
        let variantKey = baseTheme
        if (subName) {
          // For HotProspects, extract just the last character (number) from the subName
          if (baseTheme === 'HotProspects') {
            const lastChar = subName.charAt(subName.length - 1)
            variantKey = `${baseTheme}-${lastChar}`
          } else {
            variantKey = `${baseTheme}-${subName}`
          }
        }
        
        // Create a unique value for the dropdown (use collectionId + subName if available, otherwise use display name)
        const uniqueValue = driver.collection_id
          ? (subName ? `${driver.collection_id}-${subName}` : driver.collection_id)
          : variantKey
        
        // Only add if we haven't seen this variant yet
        if (!rarity5Variants.has(variantKey)) {
          rarity5Variants.set(variantKey, {
            rarity: 5,
            display: variantKey,
            collectionId: driver.collection_id,
            value: uniqueValue
          })
        }
      })
    }

    // Get all Rarity-5 drivers without collection_id (fallback)
    const { data: rarity5NoCollection, error: noCollectionError } = await supabase
      .from('drivers')
      .select('id, name, rarity')
      .eq('rarity', 5)
      .is('collection_id', null)

    if (noCollectionError) {
      console.error('Error fetching Rarity-5 drivers without collection:', noCollectionError)
    }

    // Only add "Special Edition" if there are Rarity-5 drivers without collection data AND no collection-based variants
    let shouldAddSpecialEdition = false
    if (rarity5NoCollection && rarity5NoCollection.length > 0) {
      // Only add Special Edition if we have no collection-based variants
      shouldAddSpecialEdition = rarity5Variants.size === 0
    }

    if (shouldAddSpecialEdition) {
      rarity5Variants.set('Special Edition', {
        rarity: 5,
        display: 'Special Edition',
        collectionId: null,
        value: 'special-edition'
      })
    }

    // Define basic rarities (1-4) with explicit value property
    const basicRarities = [
      { rarity: 1, display: 'Common', value: '1' },
      { rarity: 2, display: 'Rare', value: '2' },
      { rarity: 3, display: 'Epic', value: '3' },
      { rarity: 4, display: 'Legendary', value: '4' }
    ]

    // Combine all rarities
    const allRarities = [
      ...basicRarities,
      ...Array.from(rarity5Variants.values())
    ]

    // Sort by rarity number, then by display name for Rarity-5
    allRarities.sort((a, b) => {
      if (a.rarity !== b.rarity) {
        return a.rarity - b.rarity
      }
      return a.display.localeCompare(b.display)
    })

    return NextResponse.json({
      rarities: allRarities
    })

  } catch (error) {
    console.error('Error in rarity-options API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

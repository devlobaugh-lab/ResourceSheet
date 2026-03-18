import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase'

// GET /api/export-user-data - Export ALL current user's data
export async function GET(request: NextRequest) {
  console.log('📤 Export user data API called')
  try {
    const supabase = await createAuthenticatedSupabaseClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const userId = user.id

    // Build data object
    const data: Record<string, unknown[]> = {}

    // 1. User Drivers - include driver name for readability
    const { data: userDriversRaw, error: driversError } = await supabaseAdmin
      .from('user_drivers')
      .select('driver_id, level, card_count')
      .eq('user_id', userId)

    let userDrivers = userDriversRaw || []
    if (userDrivers.length > 0) {
      // Get driver details
      const driverIds = userDrivers.map(d => d.driver_id)
      const { data: driverDetails } = await supabaseAdmin
        .from('drivers')
        .select('id, name, rarity, collection_id')
        .in('id', driverIds)
      
      // Get collection themes for naming
      const collectionIds = Array.from(new Set((driverDetails || []).map(d => d.collection_id).filter(Boolean) as string[]))
      let collections: Record<string, string> = {}
      if (collectionIds.length > 0) {
        const { data: collectionData } = await supabaseAdmin
          .from('collections')
          .select('id, theme')
          .in('id', collectionIds)
        ;(collectionData || []).forEach(c => {
          collections[c.id] = c.theme || ''
        })
      }

      const driverMap = new Map((driverDetails || []).map(d => [d.id, d]))
      userDrivers = userDrivers.map(ud => {
        const driver = driverMap.get(ud.driver_id)
        return {
          driver_id: ud.driver_id,
          name: driver?.name || 'Unknown',
          rarity: driver?.rarity || 0,
          collection: driver?.collection_id ? collections[driver.collection_id] || '' : '',
          level: ud.level,
          card_count: ud.card_count
        }
      })
    }
    if (driversError) console.warn('Error exporting user_drivers:', driversError)
    data.userDrivers = userDrivers
    console.log(`  ✅ user_drivers: ${userDrivers.length} records`)

    // 2. User Car Parts - include part name for readability
    const { data: userCarPartsRaw, error: carPartsError } = await supabaseAdmin
      .from('user_car_parts')
      .select('car_part_id, level, card_count')
      .eq('user_id', userId)

    let userCarParts = userCarPartsRaw || []
    if (userCarParts.length > 0) {
      const carPartIds = userCarParts.map(p => p.car_part_id)
      const { data: carPartDetails } = await supabaseAdmin
        .from('car_parts')
        .select('id, name, rarity, car_part_type, collection_id')
        .in('id', carPartIds)

      // Get collection themes
      const collectionIds = Array.from(new Set((carPartDetails || []).map(p => p.collection_id).filter(Boolean) as string[]))
      let collections: Record<string, string> = {}
      if (collectionIds.length > 0) {
        const { data: collectionData } = await supabaseAdmin
          .from('collections')
          .select('id, theme')
          .in('id', collectionIds)
        ;(collectionData || []).forEach(c => {
          collections[c.id] = c.theme || ''
        })
      }

      const partTypeNames = ['Brake', 'Gearbox', 'Rear Wing', 'Front Wing', 'Suspension', 'Engine']
      const partMap = new Map((carPartDetails || []).map(p => [p.id, p]))
      userCarParts = userCarParts.map(up => {
        const part = partMap.get(up.car_part_id)
        return {
          car_part_id: up.car_part_id,
          name: part?.name || 'Unknown',
          rarity: part?.rarity || 0,
          type: part?.car_part_type !== undefined ? partTypeNames[part.car_part_type] || 'Unknown' : 'Unknown',
          collection: part?.collection_id ? collections[part.collection_id] || '' : '',
          level: up.level,
          card_count: up.card_count
        }
      })
    }
    if (carPartsError) console.warn('Error exporting user_car_parts:', carPartsError)
    data.userCarParts = userCarParts
    console.log(`  ✅ user_car_parts: ${userCarParts.length} records`)

    // 3. User Boosts - include boost name for readability
    const { data: userBoostsRaw, error: boostsError } = await supabaseAdmin
      .from('user_boosts')
      .select('boost_id, level, count')
      .eq('user_id', userId)

    let userBoosts = userBoostsRaw || []
    if (userBoosts.length > 0) {
      const boostIds = userBoosts.map(b => b.boost_id)
      const { data: boostDetails } = await supabaseAdmin
        .from('boosts')
        .select('id, name, icon')
        .in('id', boostIds)

      const { data: iconData } = await supabaseAdmin
        .from('boost_icon_data')
        .select('icon_name, is_free')

      const iconDataMap = new Map((iconData ?? []).map(d => [d.icon_name, d]))
      const boostMap = new Map((boostDetails || []).map(b => [b.id, b]))
      userBoosts = userBoosts.map(ub => {
        const boost = boostMap.get(ub.boost_id)
        return {
          boost_id: ub.boost_id,
          name: boost?.name || 'Unknown',
          is_free: iconDataMap.get(boost?.icon ?? '')?.is_free ?? false,
          level: ub.level,
          count: ub.count
        }
      })
    }
    if (boostsError) console.warn('Error exporting user_boosts:', boostsError)
    data.userBoosts = userBoosts
    console.log(`  ✅ user_boosts: ${userBoosts.length} records`)

    // 4. User Track Guides
    const { data: userTrackGuides, error: trackGuidesError } = await supabase
      .from('user_track_guides')
      .select('*')

    if (trackGuidesError) console.warn('Error exporting user_track_guides:', trackGuidesError)
    data.userTrackGuides = userTrackGuides || []
    console.log(`  ✅ user_track_guides: ${userTrackGuides?.length || 0} records`)

    // 5. User Track Guide Drivers
    if (userTrackGuides && userTrackGuides.length > 0) {
      const trackGuideIds = userTrackGuides.map(g => g.id)
      const { data: userTrackGuideDrivers, error: guideDriversError } = await supabase
        .from('user_track_guide_drivers')
        .select('*')
        .in('track_guide_id', trackGuideIds)

      if (guideDriversError) console.warn('Error exporting user_track_guide_drivers:', guideDriversError)
      data.userTrackGuideDrivers = userTrackGuideDrivers || []
      console.log(`  ✅ user_track_guide_drivers: ${userTrackGuideDrivers?.length || 0} records`)
    } else {
      data.userTrackGuideDrivers = []
    }

    // 6. User GP Guides - need to include id for mapping tracks during import
    const { data: userGpGuides, error: gpGuidesError } = await supabase
      .from('user_gp_guides')
      .select('*')

    if (gpGuidesError) console.warn('Error exporting user_gp_guides:', gpGuidesError)
    data.userGpGuides = userGpGuides || []
    console.log(`  ✅ user_gp_guides: ${userGpGuides?.length || 0} records (includes id for import mapping)`)

    // 7. User GP Guide Tracks
    if (userGpGuides && userGpGuides.length > 0) {
      const gpGuideIds = userGpGuides.map(g => g.id)
      const { data: userGpGuideTracks, error: gpTracksError } = await supabase
        .from('user_gp_guide_tracks')
        .select('*')
        .in('gp_guide_id', gpGuideIds)

      if (gpTracksError) console.warn('Error exporting user_gp_guide_tracks:', gpTracksError)
      data.userGpGuideTracks = userGpGuideTracks || []
      console.log(`  ✅ user_gp_guide_tracks: ${userGpGuideTracks?.length || 0} records`)

      // 8. User GP Guide Results
      const { data: userGpGuideResults, error: gpResultsError } = await supabase
        .from('user_gp_guide_results')
        .select('*')
        .in('gp_guide_id', gpGuideIds)

      if (gpResultsError) console.warn('Error exporting user_gp_guide_results:', gpResultsError)
      data.userGpGuideResults = userGpGuideResults || []
      console.log(`  ✅ user_gp_guide_results: ${userGpGuideResults?.length || 0} records`)
    } else {
      data.userGpGuideTracks = []
      data.userGpGuideResults = []
    }

    // 9. User Car Setups
    const { data: userCarSetups, error: setupsError } = await supabase
      .from('user_car_setups')
      .select('*')

    if (setupsError) console.warn('Error exporting user_car_setups:', setupsError)
    data.userCarSetups = userCarSetups || []
    console.log(`  ✅ user_car_setups: ${userCarSetups?.length || 0} records`)

    // 10. User Custom Drivers
    const { data: userCustomDrivers, error: customDriversError } = await supabase
      .from('user_custom_drivers')
      .select('*')

    if (customDriversError) console.warn('Error exporting user_custom_drivers:', customDriversError)
    data.userCustomDrivers = userCustomDrivers || []
    console.log(`  ✅ user_custom_drivers: ${userCustomDrivers?.length || 0} records`)

    // 11. Profile metadata
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('username, active_season_id')
      .eq('id', userId)
      .single()

    // Build final export
    const exportData = {
      version: '2.0',
      exportType: 'userData',
      exportedAt: new Date().toISOString(),
      user: {
        id: userId,
        email: user.email,
        username: profileData?.username ?? null,
        active_season_id: profileData?.active_season_id ?? null,
      },
      data
    }

    console.log('📤 Export complete')
    return NextResponse.json(exportData)

  } catch (error) {
    console.error('Export user data error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
import { useMemo } from 'react'
import { DriverView } from '@/types/database'

interface UseDriverLookupProps {
  selectedDriverDetails: DriverView[]
  availableDrivers: DriverView[]
}

interface DriverLookupResult {
  findDriver: (driverId: string) => DriverView | undefined
  getDriverById: (driverId: string) => DriverView | undefined
}

export function useDriverLookup({ selectedDriverDetails, availableDrivers }: UseDriverLookupProps): DriverLookupResult {
  // Create a memoized lookup map for better performance
  const driverMap = useMemo(() => {
    const map = new Map<string, DriverView>()
    
    // Priority: selectedDriverDetails first, then availableDrivers
    selectedDriverDetails.forEach(driver => map.set(driver.id, driver))
    availableDrivers.forEach(driver => {
      if (!map.has(driver.id)) {
        map.set(driver.id, driver)
      }
    })
    
    return map
  }, [selectedDriverDetails, availableDrivers])

  const findDriver = (driverId: string): DriverView | undefined => {
    return driverMap.get(driverId)
  }

  const getDriverById = (driverId: string): DriverView | undefined => {
    return driverMap.get(driverId)
  }

  return {
    findDriver,
    getDriverById
  }
}
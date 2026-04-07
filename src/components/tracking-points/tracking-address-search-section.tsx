'use client';

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { deliveryPointApi, type DeliveryPointInRadiusItem } from '@/lib/api/delivery-point';
import { geocodingApi, type GeocodingResult } from '@/lib/api/geocoding';
import { Loader2, MapPin, Search } from 'lucide-react';
import { useDebouncedCallback } from '@/hooks/use-debounce';
import { GEOCODING } from '@/lib/constants';
import { toast } from 'sonner';

export interface TrackingAddressSearchSectionProps {
  existingPointIds: Set<number>;
  onPointAdded: (point: DeliveryPointInRadiusItem['delivery_point']) => void | Promise<void>;
  onSearchLocation?: (lat: number, lon: number) => void;
}

function TrackingAddressSearchSectionComponent({
  existingPointIds,
  onPointAdded,
  onSearchLocation,
}: TrackingAddressSearchSectionProps) {
  const t = useTranslations('TrackingOnboarding');
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [addressResults, setAddressResults] = useState<GeocodingResult[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showAddressResults, setShowAddressResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [foundPoints, setFoundPoints] = useState<DeliveryPointInRadiusItem[]>([]);
  const [isSearchingPoints, setIsSearchingPoints] = useState(false);
  const [addingPointIds, setAddingPointIds] = useState<Set<number>>(new Set());
  const [locallyAddedPoints, setLocallyAddedPoints] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowAddressResults(false);
      }
    };
    if (showAddressResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAddressResults]);

  const searchAddresses = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < GEOCODING.MIN_SEARCH_LENGTH) {
        setAddressResults([]);
        setShowAddressResults(false);
        return;
      }

      setIsSearchingAddress(true);
      try {
        const results = await geocodingApi.searchAddress(
          searchQuery,
          GEOCODING.DEFAULT_COUNTRY,
          locale
        );
        setAddressResults(results);
        setShowAddressResults(results.length > 0);
      } catch {
        setAddressResults([]);
      } finally {
        setIsSearchingAddress(false);
      }
    },
    [locale]
  );

  const debouncedSearch = useDebouncedCallback(searchAddresses, GEOCODING.DEBOUNCE_MS);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSelectAddress = async (result: GeocodingResult) => {
    const displayParts = result.address.split(',');
    const shortAddress = displayParts.slice(0, Math.min(3, displayParts.length)).join(', ');

    setQuery(shortAddress);
    setSelectedAddress(shortAddress);
    setShowAddressResults(false);
    setAddressResults([]);
    setLocallyAddedPoints(new Set());
    setIsSearchingPoints(true);
    try {
      const points = await deliveryPointApi.findPointsInRadius({
        lat: result.latitude,
        lon: result.longitude,
        radius: 300,
      });
      setFoundPoints(points);
      onSearchLocation?.(result.latitude, result.longitude);
    } catch {
      toast.error(t('addressErrorSearching'));
      setFoundPoints([]);
    } finally {
      setIsSearchingPoints(false);
    }
  };

  const handleAddPoint = async (pointId: number, dp: DeliveryPointInRadiusItem['delivery_point']) => {
    if (addingPointIds.has(pointId) || locallyAddedPoints.has(pointId) || existingPointIds.has(pointId)) {
      return;
    }

    setAddingPointIds((prev) => new Set(prev).add(pointId));
    try {
      await Promise.resolve(onPointAdded(dp));
      setLocallyAddedPoints((prev) => new Set(prev).add(pointId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('addressErrorAdding');
      toast.error(msg);
    } finally {
      setAddingPointIds((prev) => {
        const next = new Set(prev);
        next.delete(pointId);
        return next;
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-6 border border-border">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('addressSectionTitle')}</h2>
      <p className="text-sm text-gray-600 mb-4">{t('addressSectionDescription')}</p>

      <div ref={containerRef} className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => addressResults.length > 0 && setShowAddressResults(true)}
            placeholder={t('addressPlaceholder')}
            className="pl-9 pr-9"
          />
          {isSearchingAddress && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>

        {query.length > 0 && query.length < GEOCODING.MIN_SEARCH_LENGTH && (
          <p className="text-xs text-gray-500 mt-1">{t('addressMinChars')}</p>
        )}

        {showAddressResults && addressResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto">
            {addressResults.map((result, index) => (
              <button
                key={`${result.latitude}-${result.longitude}-${index}`}
                type="button"
                onClick={() => handleSelectAddress(result)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-start gap-2 border-b last:border-b-0"
              >
                <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                <span className="line-clamp-2 text-gray-700">{result.address}</span>
              </button>
            ))}
          </div>
        )}

        {showAddressResults &&
          addressResults.length === 0 &&
          query.length >= GEOCODING.MIN_SEARCH_LENGTH &&
          !isSearchingAddress && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-3">
              <p className="text-sm text-gray-500 text-center">{t('addressNoResults')}</p>
            </div>
          )}
      </div>

      {isSearchingPoints && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">{t('addressSearchingPoints')}</span>
        </div>
      )}

      {!isSearchingPoints && selectedAddress && foundPoints.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            {t('addressFoundPoints', { count: foundPoints.length })}
          </p>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {foundPoints.map((point) => {
              const id = point.delivery_point.id;
              const isInList =
                existingPointIds.has(id) || locallyAddedPoints.has(id);
              const isAdding = addingPointIds.has(id);

              return (
                <div
                  key={id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{point.delivery_point.name}</h3>
                      {point.delivery_point.title && (
                        <p className="text-xs text-gray-600 mt-1">{point.delivery_point.title}</p>
                      )}
                      {point.delivery_point.address && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {point.delivery_point.address}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {t('addressDistanceMeters', { meters: point.distance_meters.toFixed(0) })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => handleAddPoint(id, point.delivery_point)}
                      disabled={isInList || isAdding}
                      className={isInList ? 'bg-gray-400' : ''}
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          {t('addressAddButton')}…
                        </>
                      ) : isInList ? (
                        t('addressAlreadyInList')
                      ) : (
                        t('addressAddButton')
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isSearchingPoints && selectedAddress && foundPoints.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm text-gray-600">{t('addressNoPointsFound')}</p>
        </div>
      )}
    </div>
  );
}

export const TrackingAddressSearchSection = memo(TrackingAddressSearchSectionComponent);
